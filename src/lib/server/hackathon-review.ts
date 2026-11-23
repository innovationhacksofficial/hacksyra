import "server-only";
import { adminDb, FieldValue, Timestamp } from "@/lib/firebase/admin";
import { COLLECTIONS, DOCS } from "@/lib/firebase/collections";
import { canTransition, computeLiveStatus, isLive } from "@/lib/domain/status";
import { nextStatusOnApprove } from "@/lib/domain/admin-logic";
import { getListingFeePaise } from "@/lib/server/payments";
import { Errors } from "@/lib/server/api";
import { audit } from "@/lib/server/audit";
import { notify } from "@/lib/server/notify";
import { sendEmail } from "@/lib/email/send";
import { renderEmail, escapeHtml } from "@/lib/email/layout";
import type { AdminActor, ReviewActionResult } from "@/types/admin";
import type { Hackathon } from "@/types";

export async function approveHackathon(hid: string, actor: AdminActor): Promise<ReviewActionResult> {
  const db = adminDb();
  const hRef = db.collection(COLLECTIONS.HACKATHONS).doc(hid);
  const feeRequired = await getListingFeePaise();

  const res = await db.runTransaction(async (tx) => {
    const snap = await tx.get(hRef);
    if (!snap.exists) throw Errors.notFound("Hackathon not found.");
    const h = snap.data() as Hackathon;

    if (isLive(h.status)) {
      return { changed: false, status: h.status, isListed: Boolean(h.isListed), h };
    }
    if (!canTransition(h.status, "approved")) {
      throw Errors.conflict(`Cannot approve hackathon from status "${h.status}".`);
    }
    if (feeRequired > 0 && !h.listingFee?.paid) {
      throw Errors.conflict("Organizer has not paid the platform listing fee yet.");
    }

    const { status, isListed } = nextStatusOnApprove(h);
    const now = FieldValue.serverTimestamp();
    const nowTs = Timestamp.now();

    const tiersSnap = await tx.get(db.collection(COLLECTIONS.TICKET_TIERS).where("hackathonId", "==", hid));
    tiersSnap.docs.forEach((d) => tx.update(d.ref, { isPublic: true, updatedAt: now }));

    if (h.slug) {
      tx.set(db.collection(COLLECTIONS.SLUGS).doc(h.slug), { hackathonId: hid, updatedAt: now }, { merge: true });
    }

    tx.update(hRef, {
      status,
      isListed,
      approvedBy: actor.uid,
      approvedAt: now,
      publicationDate: h.publicationDate ?? now,
      rejectionReason: FieldValue.delete(),
      "review.reviewedAt": now,
      "review.reviewedBy": actor.uid,
      "review.decision": "approved",
      "review.message": FieldValue.delete(),
      "review.history": FieldValue.arrayUnion({
        at: nowTs,
        by: actor.uid,
        byEmail: actor.email ?? null,
        decision: "approved",
        fromStatus: h.status,
        toStatus: status,
      }),
      updatedAt: now,
    });

    if (isListed) {
      tx.set(
        db.collection(COLLECTIONS.STATS).doc(DOCS.PLATFORM_STATS),
        {
          liveHackathons: FieldValue.increment(1),
          totalHackathons: FieldValue.increment(1),
          totalPrizePoolInPaise: FieldValue.increment(h.totalPrizeInPaise ?? 0),
          updatedAt: now,
        },
        { merge: true }
      );
    }

    return { changed: true, status, isListed, h };
  });

  if (res.changed) {
    await audit({
      actorId: actor.uid,
      actorEmail: actor.email ?? undefined,
      action: "hackathon.approved",
      resource: "hackathons",
      resourceId: hid,
      changes: { status: { before: res.h.status, after: res.status } },
    });

    await notify({
      userId: res.h.organizerId,
      type: "announcement",
      title: `🎉 Your hackathon "${res.h.name}" is now live!`,
      message: `Approved by HACKSYRA admins and ${res.isListed ? "published on the discovery feed" : "live via direct link"}.`,
      linkUrl: `/hackathons/${res.h.slug}`,
      hackathonId: hid,
      email: {
        subject: `Approved & live: ${res.h.name}`,
        layout: {
          bodyHtml: `<p>Great news! <strong>${escapeHtml(res.h.name)}</strong> has been approved and is now live on HACKSYRA.</p><p>Share your link, manage registrations, and publish announcements from your Organizer Console.</p>`,
          cta: { label: "View your hackathon", url: `/hackathons/${res.h.slug}` },
        },
      },
    });

    // Email any invited judges
    for (const j of res.h.judgeInvites ?? []) {
      if (j.status === "invited" && j.email) {
        await sendEmail({
          to: j.email,
          subject: `Judge Invitation: ${res.h.name}`,
          tag: "judge_invitation",
          html: renderEmail({
            title: `You're invited to judge ${res.h.name}`,
            bodyHtml: `<p>Hi ${escapeHtml(j.name || "Judge")},</p><p><strong>${escapeHtml(res.h.organizerName || "The organizer")}</strong> invited you to join the judging panel for <strong>${escapeHtml(res.h.name)}</strong> on HACKSYRA.</p>`,
            cta: { label: "Open Judge Portal", url: "/judge" },
          }),
        });
      }
    }
  }

  return { ok: true, changed: res.changed, status: res.status, isListed: res.isListed };
}

export async function rejectHackathon(hid: string, actor: AdminActor, reason: string): Promise<ReviewActionResult> {
  const db = adminDb();
  const hRef = db.collection(COLLECTIONS.HACKATHONS).doc(hid);

  const res = await db.runTransaction(async (tx) => {
    const snap = await tx.get(hRef);
    if (!snap.exists) throw Errors.notFound("Hackathon not found.");
    const h = snap.data() as Hackathon;
    if (h.status === "rejected") return { changed: false, h };
    if (!canTransition(h.status, "rejected")) throw Errors.conflict(`Cannot reject from "${h.status}".`);

    const now = FieldValue.serverTimestamp();
    tx.update(hRef, {
      status: "rejected",
      isListed: false,
      rejectionReason: reason,
      "review.reviewedAt": now,
      "review.reviewedBy": actor.uid,
      "review.decision": "rejected",
      "review.message": reason,
      "review.history": FieldValue.arrayUnion({
        at: Timestamp.now(),
        by: actor.uid,
        byEmail: actor.email ?? null,
        decision: "rejected",
        message: reason,
        fromStatus: h.status,
        toStatus: "rejected",
      }),
      updatedAt: now,
    });
    return { changed: true, h };
  });

  if (res.changed) {
    await audit({ actorId: actor.uid, actorEmail: actor.email ?? undefined, action: "hackathon.rejected", resource: "hackathons", resourceId: hid, notes: reason });
    await notify({
      userId: res.h.organizerId,
      type: "revision_requested",
      title: `Action needed: "${res.h.name}" was not approved`,
      message: `Reason: ${reason}`,
      linkUrl: `/organizer/create?id=${hid}`,
      hackathonId: hid,
      email: {
        subject: `Review update for ${res.h.name}`,
        layout: {
          bodyHtml: `<p>Your hackathon <strong>${escapeHtml(res.h.name)}</strong> was not approved in its current state.</p><p><strong>Reviewer note:</strong> ${escapeHtml(reason)}</p><p>You can edit the draft and re-submit at no extra listing fee.</p>`,
          cta: { label: "Edit & Resubmit", url: `/organizer/create?id=${hid}` },
        },
      },
    });
  }
  return { ok: true, changed: res.changed, status: "rejected", isListed: false };
}

export async function requestInfoHackathon(hid: string, actor: AdminActor, message: string): Promise<ReviewActionResult> {
  const db = adminDb();
  const hRef = db.collection(COLLECTIONS.HACKATHONS).doc(hid);

  const res = await db.runTransaction(async (tx) => {
    const snap = await tx.get(hRef);
    if (!snap.exists) throw Errors.notFound("Hackathon not found.");
    const h = snap.data() as Hackathon;
    if (!canTransition(h.status, "more_info_required")) throw Errors.conflict(`Cannot request info from "${h.status}".`);

    const now = FieldValue.serverTimestamp();
    tx.update(hRef, {
      status: "more_info_required",
      isListed: false,
      "review.reviewedAt": now,
      "review.reviewedBy": actor.uid,
      "review.decision": "more_info_required",
      "review.message": message,
      "review.history": FieldValue.arrayUnion({
        at: Timestamp.now(),
        by: actor.uid,
        byEmail: actor.email ?? null,
        decision: "more_info_required",
        message,
        fromStatus: h.status,
        toStatus: "more_info_required",
      }),
      updatedAt: now,
    });
    return { h };
  });

  await audit({ actorId: actor.uid, actorEmail: actor.email ?? undefined, action: "hackathon.info_requested", resource: "hackathons", resourceId: hid, notes: message });
  await notify({
    userId: res.h.organizerId,
    type: "revision_requested",
    title: `More information requested for "${res.h.name}"`,
    message,
    linkUrl: `/organizer/create?id=${hid}`,
    hackathonId: hid,
    email: {
      subject: `More info requested: ${res.h.name}`,
      layout: {
        bodyHtml: `<p>A reviewer asked for clarification on <strong>${escapeHtml(res.h.name)}</strong>:</p><blockquote>${escapeHtml(message)}</blockquote>`,
        cta: { label: "Update & Resubmit", url: `/organizer/create?id=${hid}` },
      },
    },
  });
  return { ok: true, changed: true, status: "more_info_required", isListed: false };
}

export async function suspendHackathon(hid: string, actor: AdminActor, reason: string): Promise<ReviewActionResult> {
  const db = adminDb();
  const hRef = db.collection(COLLECTIONS.HACKATHONS).doc(hid);

  const res = await db.runTransaction(async (tx) => {
    const snap = await tx.get(hRef);
    if (!snap.exists) throw Errors.notFound("Hackathon not found.");
    const h = snap.data() as Hackathon;
    if (h.status === "suspended") return { changed: false, h };
    const wasListed = Boolean(h.isListed);
    const now = FieldValue.serverTimestamp();
    tx.update(hRef, {
      status: "suspended",
      isListed: false,
      rejectionReason: reason,
      "review.decision": "suspended",
      "review.message": reason,
      "review.history": FieldValue.arrayUnion({
        at: Timestamp.now(),
        by: actor.uid,
        byEmail: actor.email ?? null,
        decision: "suspended",
        message: reason,
        fromStatus: h.status,
        toStatus: "suspended",
      }),
      updatedAt: now,
    });
    if (wasListed) {
      tx.set(db.collection(COLLECTIONS.STATS).doc(DOCS.PLATFORM_STATS), { liveHackathons: FieldValue.increment(-1), updatedAt: now }, { merge: true });
    }
    return { changed: true, h };
  });

  if (res.changed) {
    await audit({ actorId: actor.uid, actorEmail: actor.email ?? undefined, action: "hackathon.suspended", resource: "hackathons", resourceId: hid, notes: reason });
    await notify({
      userId: res.h.organizerId,
      type: "system",
      title: `Hackathon suspended: ${res.h.name}`,
      message: reason,
      linkUrl: `/organizer/events`,
      hackathonId: hid,
      email: { subject: `Notice: ${res.h.name} has been suspended` },
    });
  }
  return { ok: true, changed: res.changed, status: "suspended", isListed: false };
}

export async function unsuspendHackathon(hid: string, actor: AdminActor): Promise<ReviewActionResult> {
  const db = adminDb();
  const hRef = db.collection(COLLECTIONS.HACKATHONS).doc(hid);

  const res = await db.runTransaction(async (tx) => {
    const snap = await tx.get(hRef);
    if (!snap.exists) throw Errors.notFound("Hackathon not found.");
    const h = snap.data() as Hackathon;
    if (h.status !== "suspended") return { changed: false, status: h.status, isListed: Boolean(h.isListed), h };

    const nextStatus = computeLiveStatus(h);
    const isListed = h.visibility === "public";
    const now = FieldValue.serverTimestamp();
    tx.update(hRef, {
      status: nextStatus,
      isListed,
      rejectionReason: FieldValue.delete(),
      "review.history": FieldValue.arrayUnion({
        at: Timestamp.now(),
        by: actor.uid,
        byEmail: actor.email ?? null,
        decision: "unsuspended",
        fromStatus: "suspended",
        toStatus: nextStatus,
      }),
      updatedAt: now,
    });
    if (isListed) {
      tx.set(db.collection(COLLECTIONS.STATS).doc(DOCS.PLATFORM_STATS), { liveHackathons: FieldValue.increment(1), updatedAt: now }, { merge: true });
    }
    return { changed: true, status: nextStatus, isListed, h };
  });

  if (res.changed) {
    await audit({ actorId: actor.uid, actorEmail: actor.email ?? undefined, action: "hackathon.unsuspended", resource: "hackathons", resourceId: hid });
  }
  return { ok: true, changed: res.changed, status: res.status, isListed: res.isListed };
}

