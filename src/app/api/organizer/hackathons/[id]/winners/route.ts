import { z } from "zod";
import { nanoid } from "nanoid";
import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { isAdminRole } from "@/lib/auth/roles";
import { audit } from "@/lib/server/audit";
import { notify } from "@/lib/server/notify";
import { route, Errors } from "@/lib/server/api";
import type { Hackathon } from "@/types";

const Body = z.object({
  winners: z
    .array(
      z.object({
        submissionId: z.string().min(4),
        prizeId: z.string().optional(),
        prizeName: z.string().min(1),
        rank: z.number().int().positive().optional(),
      })
    )
    .min(1, "Select at least one winner."),
});

export const POST = route<z.infer<typeof Body>, { id: string }>(
  { auth: "required", body: Body, rateLimit: { limit: 15, windowSec: 60, name: "org-winners" } },
  async ({ user, body, params, req }) => {
    const db = adminDb();
    const hRef = db.collection(COLLECTIONS.HACKATHONS).doc(params.id);
    const hSnap = await hRef.get();
    if (!hSnap.exists) throw Errors.notFound("Hackathon not found.");
    const h = hSnap.data() as Hackathon;
    if (!isAdminRole(user!.role) && h.organizerId !== user!.uid) throw Errors.forbidden();

    const now = FieldValue.serverTimestamp();
    const batch = db.batch();

    // Clear prior winners for idempotency
    const prev = await db.collection(COLLECTIONS.WINNERS).where("hackathonId", "==", params.id).get();
    prev.docs.forEach((d) => batch.delete(d.ref));

    const winnerUserIds = new Set<string>();
    for (const w of body.winners) {
      const subRef = db.collection(COLLECTIONS.SUBMISSIONS).doc(w.submissionId);
      const subSnap = await subRef.get();
      if (!subSnap.exists) continue;
      const sub = subSnap.data()!;
      const wid = `win_${nanoid(10)}`;
      batch.set(db.collection(COLLECTIONS.WINNERS).doc(wid), {
        id: wid,
        hackathonId: params.id,
        hackathonName: h.name,
        hackathonSlug: h.slug,
        submissionId: w.submissionId,
        projectId: sub.projectId,
        projectTitle: sub.projectTitle,
        teamName: sub.teamName ?? null,
        memberIds: sub.memberIds ?? [],
        prizeId: w.prizeId ?? null,
        prizeName: w.prizeName,
        rank: w.rank ?? null,
        finalScore: sub.finalScore ?? null,
        announcedAt: now,
      });
      batch.update(subRef, { status: "winner", rank: w.rank ?? null, updatedAt: now });
      (sub.memberIds as string[] | undefined)?.forEach((u) => winnerUserIds.add(u));
    }

    batch.update(hRef, { resultsPublished: true, status: "results_announced", updatedAt: now });
    await batch.commit();

    await audit({ actorId: user!.uid, action: "hackathon.results_published", resource: "hackathons", resourceId: params.id, metadata: { count: body.winners.length }, req });

    // Notify registrants
    const regs = await db.collection(COLLECTIONS.REGISTRATIONS).where("hackathonId", "==", params.id).where("status", "in", ["confirmed", "checked_in"]).limit(500).get();
    for (const r of regs.docs) {
      const uid = (r.data() as { userId: string }).userId;
      await notify({
        userId: uid,
        type: "results_published",
        title: winnerUserIds.has(uid) ? `🏆 Congratulations! You won at ${h.name}!` : `Results announced for ${h.name}`,
        message: "Check out the winning projects and leaderboard.",
        linkUrl: `/hackathons/${h.slug}`,
        hackathonId: params.id,
        email: { subject: `Results are out: ${h.name}` },
      });
    }

    return { ok: true, count: body.winners.length };
  }
);

