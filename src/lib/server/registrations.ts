import "server-only";
import { nanoid } from "nanoid";
import { adminAuth, adminDb, FieldValue, Timestamp } from "@/lib/firebase/admin";
import { COLLECTIONS, DOCS } from "@/lib/firebase/collections";
import { isRazorpayServerConfigured, serverEnv } from "@/lib/env";
import { razorpay, signTicket, verifyTicketCode } from "@/lib/payments/razorpay";
import { computeRegistrationPricing } from "@/lib/payments/pricing";
import { isLive, isRegistrationOpenAt } from "@/lib/domain/status";
import { toMillis } from "@/lib/domain/dates";
import { formatMoney } from "@/lib/domain/money";
import { Errors } from "@/lib/server/api";
import { audit } from "@/lib/server/audit";
import { notify } from "@/lib/server/notify";
import { RESERVATION_MS, refundPayment } from "@/lib/server/payments";
import type { Hackathon, RegistrationQuestion } from "@/types";
import type { OrderDoc } from "@/types/commerce";

/** Releases expired seat reservations and expires their pending orders + registrations. */
export async function releaseExpiredReservations(max = 25): Promise<number> {
  const db = adminDb();
  const nowTs = Timestamp.now();
  const snap = await db
    .collection(COLLECTIONS.SEAT_RESERVATIONS)
    .where("status", "==", "active")
    .where("expiresAt", "<=", nowTs)
    .limit(max)
    .get();

  let released = 0;
  for (const doc of snap.docs) {
    const r = doc.data() as { hackathonId: string; userId: string; tierId?: string; orderId?: string };
    await db.runTransaction(async (tx) => {
      const fresh = await tx.get(doc.ref);
      if (!fresh.exists || fresh.data()?.status !== "active") return;
      const now = FieldValue.serverTimestamp();
      tx.update(doc.ref, { status: "expired", expiredAt: now });
      if (r.tierId) {
        tx.update(db.collection(COLLECTIONS.TICKET_TIERS).doc(r.tierId), {
          reserved: FieldValue.increment(-1),
          updatedAt: now,
        });
      }
      if (r.orderId) {
        tx.update(db.collection(COLLECTIONS.ORDERS).doc(r.orderId), { status: "expired", updatedAt: now });
      }
      const regRef = db.collection(COLLECTIONS.REGISTRATIONS).doc(`${r.hackathonId}_${r.userId}`);
      const regSnap = await tx.get(regRef);
      if (regSnap.exists && regSnap.data()?.status === "awaiting_payment") {
        tx.update(regRef, {
          status: "cancelled",
          cancellationReason: "Reservation expired before payment",
          cancelledAt: now,
          updatedAt: now,
        });
      }
      released += 1;
    });
  }
  return released;
}

export async function createOrRetryRegistration(params: {
  uid: string;
  email?: string;
  name?: string;
  hackathonId: string;
  tierId?: string;
  couponCode?: string;
  inviteCode?: string;
  trackId?: string;
  answers?: Record<string, string>;
  age?: number;
}) {
  await releaseExpiredReservations(10).catch(() => {});

  const db = adminDb();
  const hRef = db.collection(COLLECTIONS.HACKATHONS).doc(params.hackathonId);
  const hSnap = await hRef.get();
  if (!hSnap.exists) throw Errors.notFound("Hackathon not found.");
  const h = hSnap.data() as Hackathon;

  // Visibility + live status check
  if (!isLive(h.status)) throw Errors.forbidden("This hackathon is not open for registration.");
  if (h.visibility === "private") throw Errors.forbidden("This hackathon is private.");
  if (h.visibility === "invite_only" && h.inviteCode && params.inviteCode?.trim() !== h.inviteCode) {
    throw Errors.forbidden("A valid invite code is required to register for this hackathon.");
  }

  // Strict server-side deadline check
  if (!isRegistrationOpenAt(h)) {
    throw Errors.gone("Registration has closed for this hackathon.");
  }

  // Eligibility checks
  if (h.emailDomainRestrictions?.length) {
    const email = (params.email ?? "").toLowerCase();
    const domain = email.split("@")[1] ?? "";
    const ok = h.emailDomainRestrictions.some((d) => domain === d.toLowerCase().replace(/^@/, ""));
    if (!ok) {
      throw Errors.forbidden(`Only ${h.emailDomainRestrictions.join(", ")} email addresses are eligible.`);
    }
  }
  if (h.minAge && params.age != null && params.age < h.minAge) {
    throw Errors.forbidden(`You must be at least ${h.minAge} years old to participate.`);
  }

  // Required custom questions
  const answers = params.answers ?? {};
  for (const q of (h.registrationQuestions ?? []) as RegistrationQuestion[]) {
    if (q.required && !String(answers[q.id] ?? "").trim()) {
      throw Errors.badRequest(`Please answer required question: "${q.label}".`);
    }
  }

  const regId = `${params.hackathonId}_${params.uid}`;
  const regRef = db.collection(COLLECTIONS.REGISTRATIONS).doc(regId);
  const existingReg = await regRef.get();
  if (existingReg.exists) {
    const st = existingReg.data()?.status;
    if (st === "confirmed" || st === "checked_in" || st === "pending_approval" || st === "waitlisted") {
      throw Errors.conflict("You are already registered for this hackathon.", { status: st });
    }
    // If awaiting_payment, allow retrying existing order if still pending
    if (st === "awaiting_payment" && existingReg.data()?.orderId) {
      const oSnap = await db.collection(COLLECTIONS.ORDERS).doc(existingReg.data()!.orderId).get();
      if (oSnap.exists) {
        const o = oSnap.data() as OrderDoc;
        if (o.status === "pending" && (o.expiresAt?.toMillis() ?? 0) > Date.now() + 60_000) {
          return {
            requiresPayment: true,
            orderId: o.id,
            razorpayOrderId: o.razorpayOrderId!,
            amount: o.total,
            currency: o.currency,
            keyId: isRazorpayServerConfigured() ? serverEnv.razorpayKeyId : "",
            devBypass: o.paymentProvider === "dev",
            status: "awaiting_payment",
          };
        }
      }
    }
  }

  const userSnap = await db.collection(COLLECTIONS.USERS).doc(params.uid).get();
  const userName = params.name || userSnap.data()?.displayName || params.email || "Builder";
  const userEmail = params.email || userSnap.data()?.email || "";

  // Determine tier & pricing
  let tierData: Record<string, unknown> | null = null;
  if (!h.isFree) {
    if (!params.tierId) throw Errors.badRequest("Select a ticket tier to register.");
    const tSnap = await db.collection(COLLECTIONS.TICKET_TIERS).doc(params.tierId).get();
    if (!tSnap.exists || tSnap.data()?.hackathonId !== params.hackathonId) {
      throw Errors.notFound("Selected ticket tier not found.");
    }
    tierData = tSnap.data()!;
  } else if (params.tierId) {
    const tSnap = await db.collection(COLLECTIONS.TICKET_TIERS).doc(params.tierId).get();
    if (tSnap.exists && tSnap.data()?.hackathonId === params.hackathonId) tierData = tSnap.data()!;
  }

  // Validate coupon if provided
  let couponDoc: (Record<string, unknown> & { id: string }) | null = null;
  if (params.couponCode?.trim()) {
    const code = params.couponCode.trim().toUpperCase();
    const cQ = await db
      .collection(COLLECTIONS.COUPONS)
      .where("hackathonId", "==", params.hackathonId)
      .where("code", "==", code)
      .limit(1)
      .get();
    if (cQ.empty) throw Errors.badRequest("Invalid coupon code.");
    couponDoc = { id: cQ.docs[0].id, ...cQ.docs[0].data() };
  }

  const priceCheck = tierData
    ? computeRegistrationPricing(
        {
          id: String(tierData.id ?? params.tierId),
          price: Number(tierData.price ?? 0),
          capacity: tierData.capacity as number | undefined,
          sold: Number(tierData.sold ?? 0),
          reserved: Number(tierData.reserved ?? 0),
          isActive: tierData.isActive !== false,
          saleStartDate: toMillis(tierData.saleStartDate as never),
          saleEndDate: toMillis(tierData.saleEndDate as never),
        },
        couponDoc
          ? {
              id: couponDoc.id,
              code: String(couponDoc.code),
              type: couponDoc.type as "percentage" | "fixed",
              value: Number(couponDoc.value),
              isActive: couponDoc.isActive !== false,
              usageLimit: couponDoc.usageLimit as number | undefined,
              usedCount: Number(couponDoc.usedCount ?? 0),
              minOrderAmount: couponDoc.minOrderAmount as number | undefined,
              validFrom: toMillis(couponDoc.validFrom as never),
              validUntil: toMillis(couponDoc.validUntil as never),
              applicableTierIds: couponDoc.applicableTierIds as string[] | undefined,
            }
          : null
      )
    : { ok: true as const, subtotal: 0, discount: 0, total: 0 };

  if (!priceCheck.ok) throw Errors.badRequest(priceCheck.reason);

  // ── FREE OR 100%-COUPON PATH ──
  if (priceCheck.total === 0) {
    const ticketId = `tkt_${nanoid(12)}`;
    let qrCode: string | null = null;
    try {
      if (serverEnv.ticketQrSecret) qrCode = signTicket(ticketId);
    } catch {
      /* optional */
    }

    const finalStatus = await db.runTransaction(async (tx) => {
      const freshH = await tx.get(hRef);
      const hd = freshH.data() as Hackathon;
      const cap = hd.registrationCapacity;
      const count = hd.registrationCount ?? 0;

      let regStatus: "confirmed" | "pending_approval" | "waitlisted" = hd.requiresApproval ? "pending_approval" : "confirmed";
      if (cap != null && count >= cap) {
        if (hd.hasWaitlist) regStatus = "waitlisted";
        else throw Errors.conflict("This hackathon has reached capacity.");
      }

      if (tierData && params.tierId) {
        const tierRef = db.collection(COLLECTIONS.TICKET_TIERS).doc(params.tierId);
        const tFresh = await tx.get(tierRef);
        const td = tFresh.data()!;
        if (td.capacity != null && (td.sold ?? 0) + (td.reserved ?? 0) >= td.capacity) {
          throw Errors.conflict("This ticket tier is sold out.");
        }
        tx.update(tierRef, { sold: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() });
      }

      const now = FieldValue.serverTimestamp();
      tx.set(regRef, {
        id: regId,
        hackathonId: params.hackathonId,
        hackathonName: hd.name,
        hackathonSlug: hd.slug,
        organizerId: hd.organizerId,
        userId: params.uid,
        userName,
        userEmail,
        trackId: params.trackId ?? null,
        tierId: params.tierId ?? null,
        status: regStatus,
        registrationType: "individual",
        ticketId: regStatus === "confirmed" ? ticketId : null,
        answers,
        statusHistory: [{ status: regStatus, timestamp: Timestamp.now(), note: couponDoc ? `100% coupon ${couponDoc.code}` : "Free registration" }],
        createdAt: now,
        updatedAt: now,
      });

      if (regStatus === "confirmed") {
        tx.set(db.collection(COLLECTIONS.TICKETS).doc(ticketId), {
          id: ticketId,
          ticketNumber: `TKT-${Date.now().toString(36).toUpperCase()}-${nanoid(4).toUpperCase()}`,
          registrationId: regId,
          hackathonId: params.hackathonId,
          hackathonName: hd.name,
          hackathonSlug: hd.slug,
          organizerId: hd.organizerId,
          userId: params.uid,
          attendeeName: userName,
          attendeeEmail: userEmail,
          tierId: params.tierId ?? null,
          tierName: String(tierData?.name ?? "Free Pass"),
          status: "active",
          qrCode,
          createdAt: now,
          updatedAt: now,
        });
        tx.update(hRef, { registrationCount: FieldValue.increment(1), updatedAt: now });
        tx.update(db.collection(COLLECTIONS.USERS).doc(params.uid), { hackathonsJoined: FieldValue.increment(1), updatedAt: now });
        tx.set(db.collection(COLLECTIONS.STATS).doc(DOCS.PLATFORM_STATS), { totalRegistrations: FieldValue.increment(1), updatedAt: now }, { merge: true });
      }
      if (couponDoc) {
        tx.update(db.collection(COLLECTIONS.COUPONS).doc(couponDoc.id), { usedCount: FieldValue.increment(1), updatedAt: now });
      }
      return regStatus;
    });

    await notify({
      userId: params.uid,
      type: "registration_confirmed",
      title: finalStatus === "confirmed" ? `Registered for ${h.name}!` : finalStatus === "waitlisted" ? `Waitlisted for ${h.name}` : `Application received for ${h.name}`,
      message:
        finalStatus === "confirmed"
          ? "Your spot and QR ticket are ready."
          : finalStatus === "waitlisted"
            ? "Capacity is full — we'll notify you if a spot opens."
            : "The organizer will review your application shortly.",
      linkUrl: finalStatus === "confirmed" ? "/dashboard/tickets" : "/dashboard/hackathons",
      hackathonId: params.hackathonId,
      email: { subject: `Registration update: ${h.name}` },
    });

    await audit({ actorId: params.uid, actorEmail: userEmail, action: "registration.created", resource: "registrations", resourceId: regId, metadata: { status: finalStatus, free: true } });

    return {
      requiresPayment: false,
      status: finalStatus,
      registrationId: regId,
      ticketId: finalStatus === "confirmed" ? ticketId : undefined,
    };
  }

  // ── PAID PATH: RESERVE SEAT + RAZORPAY ORDER ──
  const rzpReady = isRazorpayServerConfigured();
  const devBypass = !rzpReady && serverEnv.paymentsDevBypass;
  if (!rzpReady && !devBypass) throw Errors.notConfigured("Payments (Razorpay)");

  const orderId = `ord_${nanoid(14)}`;
  const paymentId = `paydoc_${nanoid(14)}`;
  const reservationId = `res_${nanoid(12)}`;
  const orderNumber = `HS-${Date.now().toString(36).toUpperCase()}`;

  let rzpOrderId = `order_dev_${nanoid(12)}`;
  if (rzpReady) {
    const rzpOrder = await razorpay().orders.create({
      amount: priceCheck.total,
      currency: "INR",
      receipt: orderId,
      notes: { kind: "registration", hackathonId: params.hackathonId, tierId: params.tierId!, orderId, uid: params.uid },
    });
    rzpOrderId = rzpOrder.id;
  }

  const tierRef = db.collection(COLLECTIONS.TICKET_TIERS).doc(params.tierId!);
  await db.runTransaction(async (tx) => {
    const tSnap = await tx.get(tierRef);
    const td = tSnap.data()!;
    if (td.capacity != null && (td.sold ?? 0) + (td.reserved ?? 0) >= td.capacity) {
      throw Errors.conflict("This ticket tier just sold out.");
    }
    const now = FieldValue.serverTimestamp();
    const expiresAt = Timestamp.fromMillis(Date.now() + RESERVATION_MS);

    tx.update(tierRef, { reserved: FieldValue.increment(1), updatedAt: now });
    tx.set(db.collection(COLLECTIONS.SEAT_RESERVATIONS).doc(reservationId), {
      id: reservationId,
      hackathonId: params.hackathonId,
      tierId: params.tierId,
      userId: params.uid,
      orderId,
      status: "active",
      expiresAt,
      createdAt: now,
    });

    tx.set(regRef, {
      id: regId,
      hackathonId: params.hackathonId,
      hackathonName: h.name,
      hackathonSlug: h.slug,
      organizerId: h.organizerId,
      userId: params.uid,
      userName,
      userEmail,
      trackId: params.trackId ?? null,
      tierId: params.tierId,
      orderId,
      status: "awaiting_payment",
      registrationType: "individual",
      answers,
      statusHistory: [{ status: "awaiting_payment", timestamp: Timestamp.now(), note: "Seat reserved for 15 minutes" }],
      createdAt: now,
      updatedAt: now,
    });

    tx.set(db.collection(COLLECTIONS.ORDERS).doc(orderId), {
      id: orderId,
      orderNumber,
      kind: "registration",
      hackathonId: params.hackathonId,
      hackathonName: h.name,
      hackathonSlug: h.slug,
      userId: params.uid,
      userEmail,
      userName,
      organizerId: h.organizerId,
      tierId: params.tierId,
      tierName: String(td.name ?? "Ticket"),
      reservationId,
      couponCode: couponDoc ? String(couponDoc.code) : undefined,
      couponId: couponDoc?.id,
      subtotal: priceCheck.subtotal,
      discountAmount: priceCheck.discount,
      total: priceCheck.total,
      currency: "INR",
      status: "pending",
      paymentProvider: devBypass ? "dev" : "razorpay",
      razorpayOrderId: rzpOrderId,
      idempotencyKey: `reg_${params.hackathonId}_${params.uid}_${Date.now()}`,
      expiresAt,
      createdAt: now,
      updatedAt: now,
    });

    tx.set(db.collection(COLLECTIONS.PAYMENTS).doc(paymentId), {
      id: paymentId,
      orderId,
      kind: "registration",
      hackathonId: params.hackathonId,
      userId: params.uid,
      organizerId: h.organizerId,
      provider: devBypass ? "dev" : "razorpay",
      providerOrderId: rzpOrderId,
      amount: priceCheck.total,
      currency: "INR",
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });
  });

  return {
    requiresPayment: true,
    orderId,
    razorpayOrderId: rzpOrderId,
    amount: priceCheck.total,
    discount: priceCheck.discount,
    subtotal: priceCheck.subtotal,
    currency: "INR",
    keyId: rzpReady ? serverEnv.razorpayKeyId : "",
    devBypass,
    status: "awaiting_payment",
  };
}

export async function cancelRegistration(params: { registrationId: string; uid: string; email?: string; reason?: string }) {
  const db = adminDb();
  const regRef = db.collection(COLLECTIONS.REGISTRATIONS).doc(params.registrationId);
  const regSnap = await regRef.get();
  if (!regSnap.exists) throw Errors.notFound("Registration not found.");
  const reg = regSnap.data()!;
  if (reg.userId !== params.uid) throw Errors.forbidden();

  const hSnap = await db.collection(COLLECTIONS.HACKATHONS).doc(reg.hackathonId).get();
  const h = hSnap.data() as Hackathon | undefined;
  const startMs = toMillis(h?.startDate);
  if (startMs && Date.now() >= startMs) {
    throw Errors.gone("Registrations can't be cancelled after the hackathon starts.");
  }

  // Refund if an order was paid
  if (reg.orderId) {
    const payQ = await db.collection(COLLECTIONS.PAYMENTS).where("orderId", "==", reg.orderId).where("status", "==", "captured").limit(1).get();
    if (!payQ.empty) {
      await refundPayment({
        paymentId: payQ.docs[0].id,
        actorId: params.uid,
        actorEmail: params.email,
        isAdmin: true, // self-cancellation before start triggers refund
        reason: params.reason || "Participant cancelled before event start",
      });
    }
  }

  const wasConfirmed = reg.status === "confirmed";
  const now = FieldValue.serverTimestamp();
  const batch = db.batch();
  batch.update(regRef, {
    status: "cancelled",
    cancellationReason: params.reason || "Cancelled by participant",
    cancelledAt: now,
    statusHistory: FieldValue.arrayUnion({ status: "cancelled", timestamp: Timestamp.now(), actorId: params.uid }),
    updatedAt: now,
  });
  if (reg.ticketId) {
    batch.update(db.collection(COLLECTIONS.TICKETS).doc(reg.ticketId), { status: "cancelled", updatedAt: now });
  }
  if (wasConfirmed && h) {
    batch.update(hSnap!.ref, { registrationCount: FieldValue.increment(-1), updatedAt: now });
  }
  await batch.commit();
  await audit({ actorId: params.uid, actorEmail: params.email, action: "registration.cancelled", resource: "registrations", resourceId: params.registrationId });
  return { ok: true };
}

export async function decideRegistration(params: {
  registrationId: string;
  actorId: string;
  actorEmail?: string;
  isAdmin: boolean;
  decision: "approve" | "reject";
  reason?: string;
}) {
  const db = adminDb();
  const regRef = db.collection(COLLECTIONS.REGISTRATIONS).doc(params.registrationId);
  const regSnap = await regRef.get();
  if (!regSnap.exists) throw Errors.notFound("Registration not found.");
  const reg = regSnap.data()!;
  if (!params.isAdmin && reg.organizerId !== params.actorId) throw Errors.forbidden();

  const hSnap = await db.collection(COLLECTIONS.HACKATHONS).doc(reg.hackathonId).get();
  const h = hSnap.data() as Hackathon;

  const now = FieldValue.serverTimestamp();
  if (params.decision === "reject") {
    await regRef.update({
      status: "rejected",
      rejectionReason: params.reason ?? "Application not selected",
      statusHistory: FieldValue.arrayUnion({ status: "rejected", timestamp: Timestamp.now(), actorId: params.actorId, note: params.reason }),
      updatedAt: now,
    });
    await notify({
      userId: reg.userId,
      type: "event_update",
      title: `Application update for ${h.name}`,
      message: params.reason ? `Your registration wasn't approved: ${params.reason}` : "Your registration application wasn't selected.",
      linkUrl: `/hackathons/${h.slug}`,
      hackathonId: h.id,
      email: { subject: `Application update: ${h.name}` },
    });
    return { status: "rejected" };
  }

  // Approve application
  const ticketId = reg.ticketId || `tkt_${nanoid(12)}`;
  let qrCode: string | null = null;
  try {
    if (serverEnv.ticketQrSecret) qrCode = signTicket(ticketId);
  } catch {
    /* optional */
  }

  const batch = db.batch();
  batch.update(regRef, {
    status: "confirmed",
    ticketId,
    approvedBy: params.actorId,
    approvedAt: now,
    statusHistory: FieldValue.arrayUnion({ status: "confirmed", timestamp: Timestamp.now(), actorId: params.actorId }),
    updatedAt: now,
  });
  batch.set(db.collection(COLLECTIONS.TICKETS).doc(ticketId), {
    id: ticketId,
    ticketNumber: `TKT-${Date.now().toString(36).toUpperCase()}-${nanoid(4).toUpperCase()}`,
    registrationId: regRef.id,
    hackathonId: h.id,
    hackathonName: h.name,
    hackathonSlug: h.slug,
    organizerId: h.organizerId,
    userId: reg.userId,
    attendeeName: reg.userName ?? "",
    attendeeEmail: reg.userEmail ?? "",
    tierName: "Approved Pass",
    status: "active",
    qrCode,
    createdAt: now,
    updatedAt: now,
  });
  batch.update(hSnap.ref, { registrationCount: FieldValue.increment(1), updatedAt: now });
  await batch.commit();

  await notify({
    userId: reg.userId,
    type: "registration_confirmed",
    title: `Approved for ${h.name}!`,
    message: "Your registration is confirmed and your QR ticket is ready.",
    linkUrl: "/dashboard/tickets",
    hackathonId: h.id,
    email: { subject: `You're in: ${h.name}` },
  });
  return { status: "confirmed", ticketId };
}

export async function checkInTicketByCode(params: { code: string; actorId: string; isAdmin: boolean }) {
  const db = adminDb();
  let ticketId = verifyTicketCode(params.code.trim());

  // Allow manual check-in by ticketNumber (e.g. TKT-...)
  if (!ticketId) {
    const byNum = await db.collection(COLLECTIONS.TICKETS).where("ticketNumber", "==", params.code.trim().toUpperCase()).limit(1).get();
    if (!byNum.empty) ticketId = byNum.docs[0].id;
  }
  if (!ticketId) throw Errors.badRequest("Invalid or unrecognized ticket QR code.");

  const tRef = db.collection(COLLECTIONS.TICKETS).doc(ticketId);
  const tSnap = await tRef.get();
  if (!tSnap.exists) throw Errors.notFound("Ticket not found.");
  const ticket = tSnap.data()!;

  if (!params.isAdmin && ticket.organizerId !== params.actorId) {
    throw Errors.forbidden("You can only check in attendees for your own hackathon.");
  }
  if (ticket.status === "cancelled" || ticket.status === "refunded") {
    throw Errors.conflict(`This ticket is ${ticket.status}.`);
  }
  if (ticket.status === "used") {
    return { ok: true, alreadyCheckedIn: true, attendeeName: ticket.attendeeName, ticketNumber: ticket.ticketNumber };
  }

  const now = FieldValue.serverTimestamp();
  const batch = db.batch();
  batch.update(tRef, { status: "used", checkedInAt: now, checkedInBy: params.actorId, updatedAt: now });
  batch.update(db.collection(COLLECTIONS.REGISTRATIONS).doc(ticket.registrationId), {
    status: "checked_in",
    checkedInAt: now,
    checkedInBy: params.actorId,
    statusHistory: FieldValue.arrayUnion({ status: "checked_in", timestamp: Timestamp.now(), actorId: params.actorId }),
    updatedAt: now,
  });
  await batch.commit();

  await audit({ actorId: params.actorId, action: "ticket.checked_in", resource: "tickets", resourceId: ticketId });
  return { ok: true, alreadyCheckedIn: false, attendeeName: ticket.attendeeName, ticketNumber: ticket.ticketNumber, amountCheck: formatMoney(0) };
}

export async function isOrganizerRole(uid: string): Promise<boolean> {
  const rec = await adminAuth().getUser(uid);
  return ["organizer", "admin", "super_admin"].includes(String(rec.customClaims?.role ?? ""));
}

