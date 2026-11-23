import { NextResponse, type NextRequest } from "next/server";
import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { COLLECTIONS, DOCS } from "@/lib/firebase/collections";
import { serverEnv } from "@/lib/env";
import { computeLiveStatus, LIVE_STATUSES } from "@/lib/domain/status";
import { toMillis } from "@/lib/domain/dates";
import { pickReminderWindow } from "@/lib/domain/reminders";
import { releaseExpiredReservations } from "@/lib/server/registrations";
import { notify } from "@/lib/server/notify";
import { audit } from "@/lib/server/audit";
import type { Hackathon } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!serverEnv.cronSecret || auth !== `Bearer ${serverEnv.cronSecret}`) {
    return NextResponse.json({ error: { code: "unauthorized", message: "Invalid cron secret." } }, { status: 401 });
  }

  const db = adminDb();
  const now = Date.now();
  const releasedReservations = await releaseExpiredReservations(50).catch(() => 0);

  const liveSnap = await db
    .collection(COLLECTIONS.HACKATHONS)
    .where("status", "in", LIVE_STATUSES)
    .limit(200)
    .get();

  let statusTransitions = 0;
  let remindersSent = 0;

  for (const doc of liveSnap.docs) {
    const h = doc.data() as Hackathon;
    const expected = computeLiveStatus(h, now);

    if (expected !== h.status) {
      await doc.ref.update({ status: expected, updatedAt: FieldValue.serverTimestamp() });
      if (expected === "completed" && h.isListed) {
        await db
          .collection(COLLECTIONS.STATS)
          .doc(DOCS.PLATFORM_STATS)
          .set({ liveHackathons: FieldValue.increment(-1), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      }
      await audit({
        actorId: "cron",
        action: "hackathon.status_auto_transition",
        resource: "hackathons",
        resourceId: doc.id,
        changes: { status: { before: h.status, after: expected } },
      });
      statusTransitions += 1;
    }

    // Deadline reminders: registrationCloseDate, startDate, submissionCloseDate
    const checks: { event: string; label: string; targetMs: number | null }[] = [
      { event: "reg_close", label: "Registration closes", targetMs: toMillis(h.registrationCloseDate) },
      { event: "start", label: "Hackathon begins", targetMs: toMillis(h.startDate) },
      { event: "sub_close", label: "Submissions close", targetMs: toMillis(h.submissionCloseDate) },
    ];

    for (const c of checks) {
      const win = pickReminderWindow(c.targetMs, now);
      if (!win) continue;
      const logId = `${doc.id}_${c.event}_${win.kind}`;
      const logRef = db.collection(COLLECTIONS.REMINDER_LOG).doc(logId);
      const created = await db.runTransaction(async (tx) => {
        const s = await tx.get(logRef);
        if (s.exists) return false;
        tx.set(logRef, { hackathonId: doc.id, event: c.event, window: win.kind, sentAt: FieldValue.serverTimestamp() });
        return true;
      });
      if (!created) continue;

      const regsSnap = await db
        .collection(COLLECTIONS.REGISTRATIONS)
        .where("hackathonId", "==", doc.id)
        .where("status", "in", ["confirmed", "checked_in"])
        .limit(500)
        .get();

      for (const r of regsSnap.docs) {
        const uid = (r.data() as { userId: string }).userId;
        await notify({
          userId: uid,
          type: "deadline_reminder",
          title: `Reminder: ${c.label} in ${win.label} — ${h.name}`,
          message: `${c.label} soon for ${h.name}. Make sure your team and project are ready.`,
          linkUrl: `/hackathons/${h.slug}`,
          hackathonId: doc.id,
          email: { subject: `Reminder (${win.label}): ${h.name}` },
        });
        remindersSent += 1;
      }
    }
  }

  return NextResponse.json({
    ok: true,
    checked: liveSnap.size,
    releasedReservations,
    statusTransitions,
    remindersSent,
  });
}

