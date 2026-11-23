import { nanoid } from "nanoid";
import { adminDb, FieldValue, Timestamp } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { validateAllWizardSteps } from "@/lib/domain/hackathon-schema";
import { buildSearchKeywords, slugify } from "@/lib/domain/slug";
import { canTransition } from "@/lib/domain/status";
import { route, Errors } from "@/lib/server/api";
import { audit } from "@/lib/server/audit";
import { notifyAdmins } from "@/lib/server/notify";
import { getListingFeePaise } from "@/lib/server/payments";
import type { HackathonPricingDraft } from "@/types";

export const POST = route<{ id: string } extends never ? never : undefined, { id: string }>(
  { auth: "required", rateLimit: { limit: 15, windowSec: 60, name: "hackathon-submit" } },
  async ({ user, params, req }) => {
    const hid = params.id;
    const db = adminDb();
    const hRef = db.collection(COLLECTIONS.HACKATHONS).doc(hid);
    const hSnap = await hRef.get();
    if (!hSnap.exists) throw Errors.notFound("Hackathon draft not found.");
    const h = hSnap.data()!;

    if (h.organizerId !== user!.uid && user!.role !== "admin" && user!.role !== "super_admin") {
      throw Errors.forbidden("Only the organizer can submit this hackathon.");
    }

    const allowedFrom = ["draft", "payment_pending", "more_info_required", "rejected"];
    if (!allowedFrom.includes(h.status)) {
      throw Errors.conflict(`Hackathon is already "${h.status}".`);
    }

    // Re-validate every step server-side
    const stepIssues = validateAllWizardSteps(h, { requireFutureDates: true });
    if (stepIssues.length > 0) {
      throw Errors.badRequest(stepIssues[0].errors[0] || "Please finish all required steps.", { steps: stepIssues });
    }

    const desiredSlug = slugify(String(h.slug));
    const pricing: HackathonPricingDraft = h.pricingDraft ?? { isFree: true, currency: "INR", tiers: [], coupons: [] };
    const totalPrizeInPaise = ((h.prizes as { type?: string; cashAmount?: number; winnersCount?: number }[]) ?? []).reduce(
      (sum, p) => sum + (p.type === "cash" && p.cashAmount ? Math.round(p.cashAmount * (p.winnersCount ?? 1) * 100) : 0),
      0
    );
    const lowestTicketPriceInPaise = pricing.isFree
      ? 0
      : Math.min(...(pricing.tiers.length ? pricing.tiers.map((t) => t.price) : [0]));

    const feePaise = await getListingFeePaise();
    const alreadyPaid = Boolean(h.listingFee?.paid) || feePaise === 0;
    const nextStatus = alreadyPaid ? "pending_review" : "payment_pending";
    if (!canTransition(h.status, nextStatus)) {
      throw Errors.conflict(`Cannot transition from ${h.status} to ${nextStatus}.`);
    }

    const searchKeywords = buildSearchKeywords(
      h.name,
      h.tagline,
      h.category,
      h.city,
      h.themes ?? [],
      h.technologies ?? []
    );

    // Reserve slug atomically & write tiers/coupons cleanly
    await db.runTransaction(async (tx) => {
      const slugRef = db.collection(COLLECTIONS.SLUGS).doc(desiredSlug);
      const slugSnap = await tx.get(slugRef);
      if (slugSnap.exists && slugSnap.data()?.hackathonId !== hid) {
        throw Errors.conflict("That URL slug was just claimed by another hackathon. Choose a different slug in Step 1.");
      }
      // release previous slug if renamed
      const oldSlug = h.reservedSlug as string | undefined;
      if (oldSlug && oldSlug !== desiredSlug) {
        const oldRef = db.collection(COLLECTIONS.SLUGS).doc(oldSlug);
        const oldSnap = await tx.get(oldRef);
        if (oldSnap.exists && oldSnap.data()?.hackathonId === hid) tx.delete(oldRef);
      }
      tx.set(slugRef, { hackathonId: hid, updatedAt: FieldValue.serverTimestamp() });

      const now = FieldValue.serverTimestamp();
      // Materialize ticket tiers (isPublic=false until admin approves)
      const prevTiers = await tx.get(db.collection(COLLECTIONS.TICKET_TIERS).where("hackathonId", "==", hid));
      prevTiers.docs.forEach((d) => tx.delete(d.ref));

      if (!pricing.isFree) {
        pricing.tiers.forEach((t, idx) => {
          const tid = t.id || `tier_${nanoid(10)}`;
          tx.set(db.collection(COLLECTIONS.TICKET_TIERS).doc(tid), {
            id: tid,
            hackathonId: hid,
            organizerId: h.organizerId,
            name: t.name,
            description: t.description ?? "",
            type: t.type ?? "standard",
            price: t.price,
            currency: pricing.currency || "INR",
            capacity: t.capacity ?? null,
            sold: 0,
            reserved: 0,
            saleStartDate: t.saleStartDate ? Timestamp.fromDate(new Date(t.saleStartDate)) : null,
            saleEndDate: t.saleEndDate ? Timestamp.fromDate(new Date(t.saleEndDate)) : null,
            perPersonLimit: t.perPersonLimit ?? 1,
            isActive: true,
            isPublic: false,
            order: idx,
            createdAt: now,
            updatedAt: now,
          });
        });
      }

      // Materialize coupons in server-only collection; clear coupons from public hackathon doc
      const prevCoupons = await tx.get(db.collection(COLLECTIONS.COUPONS).where("hackathonId", "==", hid));
      prevCoupons.docs.forEach((d) => tx.delete(d.ref));
      for (const c of pricing.coupons ?? []) {
        const cid = c.id || `cpn_${nanoid(10)}`;
        tx.set(db.collection(COLLECTIONS.COUPONS).doc(cid), {
          id: cid,
          hackathonId: hid,
          organizerId: h.organizerId,
          code: c.code.trim().toUpperCase(),
          type: c.type,
          value: c.value,
          currency: "INR",
          usageLimit: c.usageLimit ?? null,
          usedCount: 0,
          perUserLimit: 1,
          validUntil: c.validUntil ? Timestamp.fromDate(new Date(c.validUntil)) : null,
          isActive: true,
          createdBy: user!.uid,
          createdAt: now,
          updatedAt: now,
        });
      }

      tx.update(hRef, {
        slug: desiredSlug,
        reservedSlug: desiredSlug,
        isFree: pricing.isFree,
        currency: pricing.currency || "INR",
        totalPrizeInPaise,
        lowestTicketPriceInPaise,
        searchKeywords,
        status: nextStatus,
        isListed: false,
        completionPercentage: 100,
        completedSteps: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        "pricingDraft.coupons": [],
        ...(nextStatus === "pending_review" ? { "review.submittedAt": now } : {}),
        ...(feePaise === 0 && !h.listingFee?.paid
          ? { listingFee: { amountInPaise: 0, paid: true, paidAt: now, provider: "dev" } }
          : {}),
        updatedAt: now,
      });
    });

    await audit({
      actorId: user!.uid,
      actorEmail: user!.email,
      action: "hackathon.submitted",
      resource: "hackathons",
      resourceId: hid,
      metadata: { nextStatus, listingFeeInPaise: feePaise },
      req,
    });

    if (nextStatus === "pending_review") {
      await notifyAdmins({
        type: "system",
        title: "Hackathon submitted for review",
        message: `${h.name} is ready for admin review.`,
        linkUrl: `/admin/reviews/${hid}`,
        hackathonId: hid,
      });
    }

    return { status: nextStatus, listingFeeInPaise: feePaise, slug: desiredSlug };
  }
);

