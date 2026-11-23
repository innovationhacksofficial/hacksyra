import "server-only";
import { nanoid } from "nanoid";
import { adminDb, FieldValue, Timestamp } from "@/lib/firebase/admin";
import { COLLECTIONS, DOCS } from "@/lib/firebase/collections";
import { isRazorpayServerConfigured, serverEnv } from "@/lib/env";
import { razorpay, signTicket } from "@/lib/payments/razorpay";
import { Errors } from "@/lib/server/api";
import { audit } from "@/lib/server/audit";
import { notify, notifyAdmins } from "@/lib/server/notify";
import { renderEmail, escapeHtml } from "@/lib/email/layout";
import { formatMoney } from "@/lib/domain/money";
import type { OrderDoc, PaymentDoc } from "@/types/commerce";

const DEFAULT_LISTING_FEE_PAISE = 300;
const RESERVATION_MS = 15 * 60_000;

export async function nextInvoiceNumber(): Promise<string> {
  const db = adminDb();
  const ref = db.collection(COLLECTIONS.STATS).doc("counters");
  const seq = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const next = ((snap.data()?.invoiceSeq as number | undefined) ?? 0) + 1;
    tx.set(ref, { invoiceSeq: next }, { merge: true });
    return next;
  });
  return `HS-${new Date().getFullYear()}-${String(seq).padStart(6, "0")}`;
}

export async function getListingFeePaise(): Promise<number> {
  const snap = await adminDb().collection(COLLECTIONS.PLATFORM_SETTINGS).doc(DOCS.PLATFORM_SETTINGS).get();
  const v = snap.data()?.listingFeeInPaise;
  return typeof v === "number" && v >= 0 ? v : DEFAULT_LISTING_FEE_PAISE;
}

export async function createListingFeeOrder(params: { uid: string; email?: string; name?: string; hackathonId: string }) {
  const db = adminDb();
  const hRef = db.collection(COLLECTIONS.HACKATHONS).doc(params.hackathonId);
  const hSnap = await hRef.get();
  if (!hSnap.exists) throw Errors.notFound("Hackathon not found.");
  const h = hSnap.data()!;
  if (h.organizerId !== params.uid) throw Errors.forbidden("Only the hackathon organizer can pay the listing fee.");
  if (h.status !== "payment_pending") {
    throw Errors.conflict(`Listing fee order is only created when status is awaiting payment (currently "${h.status}").`);
  }

  const amount = await getListingFeePaise();
  if (amount === 0) {
    throw Errors.conflict("Listing fee is currently ₹0. Re-submit the hackathon to move straight to review.");
  }
  if (amount < 100) throw Errors.badRequest("Platform listing fee must be ₹0 or at least ₹1.");

  const idempotencyKey = `listing_${params.hackathonId}`;
  const existingSnap = await db
    .collection(COLLECTIONS.ORDERS)
    .where("idempotencyKey", "==", idempotencyKey)
    .where("status", "==", "pending")
    .limit(1)
    .get();

  if (!existingSnap.empty) {
    const o = existingSnap.docs[0].data() as OrderDoc;
    const expMs = o.expiresAt?.toMillis() ?? 0;
    if (expMs > Date.now() + 60_000 && o.total === amount) {
      return {
        orderId: existingSnap.docs[0].id,
        razorpayOrderId: o.razorpayOrderId!,
        amount: o.total,
        currency: o.currency,
        keyId: serverEnv.razorpayKeyId,
        devBypass: o.paymentProvider === "dev",
      };
    }
  }

  const rzpReady = isRazorpayServerConfigured();
  const devBypass = !rzpReady && serverEnv.paymentsDevBypass;
  if (!rzpReady && !devBypass) {
    throw Errors.notConfigured("Payments (Razorpay)");
  }

  const orderId = `ord_${nanoid(14)}`;
  const paymentId = `paydoc_${nanoid(14)}`;
  const orderNumber = `HS-${Date.now().toString(36).toUpperCase()}`;

  let rzpOrderId = `order_dev_${nanoid(12)}`;
  if (rzpReady) {
    const rzpOrder = await razorpay().orders.create({
      amount,
      currency: "INR",
      receipt: orderId,
      notes: { kind: "listing_fee", hackathonId: params.hackathonId, orderId, uid: params.uid },
    });
    rzpOrderId = rzpOrder.id;
  }

  const now = FieldValue.serverTimestamp();
  const expiresAt = Timestamp.fromMillis(Date.now() + 30 * 60_000);
  const batch = db.batch();

  batch.set(db.collection(COLLECTIONS.ORDERS).doc(orderId), {
    id: orderId,
    orderNumber,
    kind: "listing_fee",
    hackathonId: params.hackathonId,
    hackathonName: h.name,
    hackathonSlug: h.slug,
    userId: params.uid,
    userEmail: params.email ?? h.contactEmail,
    userName: params.name ?? h.organizerName,
    organizerId: params.uid,
    subtotal: amount,
    discountAmount: 0,
    total: amount,
    currency: "INR",
    status: "pending",
    paymentProvider: devBypass ? "dev" : "razorpay",
    razorpayOrderId: rzpOrderId,
    idempotencyKey,
    expiresAt,
    createdAt: now,
    updatedAt: now,
  });

  batch.set(db.collection(COLLECTIONS.PAYMENTS).doc(paymentId), {
    id: paymentId,
    orderId,
    kind: "listing_fee",
    hackathonId: params.hackathonId,
    userId: params.uid,
    organizerId: params.uid,
    provider: devBypass ? "dev" : "razorpay",
    providerOrderId: rzpOrderId,
    amount,
    currency: "INR",
    status: "pending",
    createdAt: now,
    updatedAt: now,
  });

  await batch.commit();

  return {
    orderId,
    razorpayOrderId: rzpOrderId,
    amount,
    currency: "INR",
    keyId: rzpReady ? serverEnv.razorpayKeyId : "",
    devBypass,
  };
}

/**
 * Idempotently marks an order & payment captured and runs kind-specific side effects
 * (listing fee → pending_review; registration → confirmed + ticket + QR + counters + invoice).
 */
export async function finalizeCapturedPayment(params: {
  orderId?: string;
  providerOrderId?: string;
  providerPaymentId: string;
  method?: string;
  provider: "razorpay" | "dev";
}): Promise<{ ok: true; alreadyProcessed: boolean; orderId: string; kind: string; hackathonId: string; ticketId?: string }> {
  const db = adminDb();

  let orderId = params.orderId;
  if (!orderId && params.providerOrderId) {
    const q = await db.collection(COLLECTIONS.ORDERS).where("razorpayOrderId", "==", params.providerOrderId).limit(1).get();
    if (q.empty) throw Errors.notFound("Order not found for Razorpay order ID.");
    orderId = q.docs[0].id;
  }
  if (!orderId) throw Errors.badRequest("Order identifier missing.");

  const orderRef = db.collection(COLLECTIONS.ORDERS).doc(orderId);
  const payQuery = await db.collection(COLLECTIONS.PAYMENTS).where("orderId", "==", orderId).limit(1).get();
  const payRef = payQuery.empty ? null : payQuery.docs[0].ref;
  const invNum = await nextInvoiceNumber();

  const txResult = await db.runTransaction(async (tx) => {
    const oSnap = await tx.get(orderRef);
    if (!oSnap.exists) throw Errors.notFound("Order not found.");
    const order = oSnap.data() as OrderDoc;

    if (order.status === "paid") {
      return {
        alreadyProcessed: true,
        order,
        ticketId: undefined as string | undefined,
      };
    }
    if (order.status === "refunded") {
      throw Errors.conflict("Order was already refunded.");
    }

    const now = FieldValue.serverTimestamp();
    tx.update(orderRef, {
      status: "paid",
      paymentProvider: params.provider,
      razorpayPaymentId: params.providerPaymentId,
      paidAt: now,
      updatedAt: now,
    });

    if (payRef) {
      tx.update(payRef, {
        status: "captured",
        provider: params.provider,
        providerPaymentId: params.providerPaymentId,
        method: params.method ?? (params.provider === "dev" ? "dev" : "razorpay"),
        capturedAt: now,
        updatedAt: now,
      });
    }

    const invoiceId = `inv_${nanoid(12)}`;
    tx.set(db.collection(COLLECTIONS.INVOICES).doc(invoiceId), {
      id: invoiceId,
      invoiceNumber: invNum,
      orderId,
      paymentId: payRef?.id ?? params.providerPaymentId,
      userId: order.userId,
      hackathonId: order.hackathonId,
      kind: order.kind,
      amount: order.total,
      currency: order.currency,
      lineItems: [
        {
          description:
            order.kind === "listing_fee"
              ? `Hackathon listing fee — ${order.hackathonName ?? order.hackathonId}`
              : `${order.tierName ?? "Ticket"} — ${order.hackathonName ?? order.hackathonId}`,
          amount: order.total,
        },
      ],
      billedTo: { name: order.userName ?? "User", email: order.userEmail ?? "" },
      createdAt: now,
      updatedAt: now,
    });

    let ticketId: string | undefined;

    if (order.kind === "listing_fee") {
      const hRef = db.collection(COLLECTIONS.HACKATHONS).doc(order.hackathonId);
      const hSnap = await tx.get(hRef);
      if (hSnap.exists) {
        const h = hSnap.data()!;
        const updates: Record<string, unknown> = {
          listingFee: {
            amountInPaise: order.total,
            orderId,
            paymentId: params.providerPaymentId,
            paid: true,
            paidAt: now,
            provider: params.provider,
          },
          updatedAt: now,
        };
        if (h.status === "payment_pending" || h.status === "draft") {
          updates.status = "pending_review";
          updates["review.submittedAt"] = now;
        }
        tx.update(hRef, updates);
      }
      tx.set(
        db.collection(COLLECTIONS.STATS).doc(DOCS.PLATFORM_STATS),
        { listingFeeRevenueInPaise: FieldValue.increment(order.total), updatedAt: now },
        { merge: true }
      );
    } else {
      // Registration payment
      const regId = `${order.hackathonId}_${order.userId}`;
      const regRef = db.collection(COLLECTIONS.REGISTRATIONS).doc(regId);
      const regSnap = await tx.get(regRef);
      const hRef = db.collection(COLLECTIONS.HACKATHONS).doc(order.hackathonId);

      ticketId = `tkt_${nanoid(12)}`;
      let qrCode: string | null = null;
      try {
        if (serverEnv.ticketQrSecret) qrCode = signTicket(ticketId);
      } catch (e) {
        console.warn("[ticket] QR signing skipped:", e);
      }

      if (order.tierId) {
        const tierRef = db.collection(COLLECTIONS.TICKET_TIERS).doc(order.tierId);
        tx.update(tierRef, {
          sold: FieldValue.increment(1),
          reserved: FieldValue.increment(-1),
          updatedAt: now,
        });
      }

      if (order.reservationId) {
        tx.update(db.collection(COLLECTIONS.SEAT_RESERVATIONS).doc(order.reservationId), {
          status: "consumed",
          consumedAt: now,
        });
      }

      if (order.couponId) {
        tx.update(db.collection(COLLECTIONS.COUPONS).doc(order.couponId), {
          usedCount: FieldValue.increment(1),
          updatedAt: now,
        });
        const redId = `${order.couponId}_${order.userId}`;
        tx.set(db.collection(COLLECTIONS.COUPON_REDEMPTIONS).doc(redId), {
          couponId: order.couponId,
          userId: order.userId,
          orderId,
          hackathonId: order.hackathonId,
          discountAmount: order.discountAmount,
          createdAt: now,
        });
      }

      tx.set(db.collection(COLLECTIONS.TICKETS).doc(ticketId), {
        id: ticketId,
        ticketNumber: `TKT-${Date.now().toString(36).toUpperCase()}-${nanoid(4).toUpperCase()}`,
        orderId,
        registrationId: regId,
        hackathonId: order.hackathonId,
        hackathonName: order.hackathonName ?? "",
        hackathonSlug: order.hackathonSlug ?? "",
        organizerId: order.organizerId,
        userId: order.userId,
        attendeeName: order.userName ?? "",
        attendeeEmail: order.userEmail ?? "",
        tierId: order.tierId ?? null,
        tierName: order.tierName ?? "Standard",
        status: "active",
        qrCode,
        createdAt: now,
        updatedAt: now,
      });

      if (regSnap.exists) {
        tx.update(regRef, {
          status: "confirmed",
          ticketId,
          orderId,
          statusHistory: FieldValue.arrayUnion({
            status: "confirmed",
            timestamp: Timestamp.now(),
            note: `Payment captured (${params.provider})`,
          }),
          updatedAt: now,
        });
      }

      tx.update(hRef, { registrationCount: FieldValue.increment(1), updatedAt: now });
      tx.update(db.collection(COLLECTIONS.USERS).doc(order.userId), {
        hackathonsJoined: FieldValue.increment(1),
        updatedAt: now,
      });
      tx.set(
        db.collection(COLLECTIONS.STATS).doc(DOCS.PLATFORM_STATS),
        { totalRegistrations: FieldValue.increment(1), updatedAt: now },
        { merge: true }
      );
      tx.set(
        db.collection(COLLECTIONS.PAYOUTS).doc(order.organizerId),
        {
          organizerId: order.organizerId,
          grossRevenueInPaise: FieldValue.increment(order.total),
          ticketsSold: FieldValue.increment(1),
          updatedAt: now,
        },
        { merge: true }
      );
    }

    return { alreadyProcessed: false, order, ticketId };
  });

  if (!txResult.alreadyProcessed) {
    const o = txResult.order;
    await audit({
      actorId: o.userId,
      actorEmail: o.userEmail,
      action: o.kind === "listing_fee" ? "payment.listing_fee_captured" : "payment.registration_captured",
      resource: "orders",
      resourceId: orderId,
      metadata: { amount: o.total, provider: params.provider, hackathonId: o.hackathonId },
    });

    if (o.kind === "listing_fee") {
      await Promise.all([
        notify({
          userId: o.userId,
          type: "payment_success",
          title: "Listing fee paid — submitted for review!",
          message: `${o.hackathonName ?? "Your hackathon"} is now in the admin review queue. We'll notify you as soon as it goes live.`,
          linkUrl: `/organizer/events`,
          hackathonId: o.hackathonId,
          email: {
            subject: `Receipt & submission confirmation: ${o.hackathonName}`,
            layout: {
              bodyHtml: `<p>Thanks! We received your listing fee of <strong>${escapeHtml(formatMoney(o.total))}</strong> (Order ${escapeHtml(o.orderNumber)}).</p><p><strong>${escapeHtml(o.hackathonName ?? "Your hackathon")}</strong> is now pending admin review and will go live right after approval.</p>`,
              cta: { label: "View your events", url: "/organizer/events" },
            },
          },
        }),
        notifyAdmins({
          type: "system",
          title: "New hackathon awaiting review",
          message: `${o.hackathonName ?? "A hackathon"} paid the ${formatMoney(o.total)} listing fee and is ready for approval.`,
          linkUrl: `/admin/reviews/${o.hackathonId}`,
          hackathonId: o.hackathonId,
        }),
      ]);
    } else {
      await notify({
        userId: o.userId,
        type: "registration_confirmed",
        title: `You're registered for ${o.hackathonName ?? "the hackathon"}!`,
        message: `Payment of ${formatMoney(o.total)} confirmed. Your QR ticket is ready in your dashboard.`,
        linkUrl: `/dashboard/tickets`,
        hackathonId: o.hackathonId,
        email: {
          subject: `Ticket confirmed: ${o.hackathonName}`,
          layout: {
            bodyHtml: `<p>Your registration for <strong>${escapeHtml(o.hackathonName ?? "")}</strong> (${escapeHtml(o.tierName ?? "Ticket")}) is confirmed!</p><p>Amount paid: <strong>${escapeHtml(formatMoney(o.total))}</strong> · Order <code>${escapeHtml(o.orderNumber)}</code>.</p>`,
            cta: { label: "View your QR ticket", url: "/dashboard/tickets" },
          },
        },
      });
    }
  }

  return {
    ok: true,
    alreadyProcessed: txResult.alreadyProcessed,
    orderId,
    kind: txResult.order.kind,
    hackathonId: txResult.order.hackathonId,
    ticketId: txResult.ticketId,
  };
}

export async function markPaymentFailed(params: { providerOrderId?: string; orderId?: string; code?: string; message?: string }) {
  const db = adminDb();
  let orderId = params.orderId;
  if (!orderId && params.providerOrderId) {
    const q = await db.collection(COLLECTIONS.ORDERS).where("razorpayOrderId", "==", params.providerOrderId).limit(1).get();
    if (q.empty) return;
    orderId = q.docs[0].id;
  }
  if (!orderId) return;

  const orderSnap = await db.collection(COLLECTIONS.ORDERS).doc(orderId).get();
  const order = orderSnap.data() as OrderDoc | undefined;
  if (!order || order.status === "paid") return;

  const payQ = await db.collection(COLLECTIONS.PAYMENTS).where("orderId", "==", orderId).limit(1).get();
  const now = FieldValue.serverTimestamp();
  const batch = db.batch();
  batch.update(orderSnap.ref, { status: "failed", updatedAt: now });
  if (!payQ.empty) {
    batch.update(payQ.docs[0].ref, {
      status: "failed",
      failureCode: params.code ?? "payment_failed",
      failureMessage: params.message ?? "Payment failed",
      updatedAt: now,
    });
  }
  await batch.commit();

  await notify({
    userId: order.userId,
    type: "payment_failed",
    title: "Payment could not be completed",
    message: params.message || "Your payment didn't go through. You can safely retry from Payments.",
    linkUrl: order.kind === "listing_fee" ? `/organizer/create?id=${order.hackathonId}` : `/hackathons/${order.hackathonSlug ?? ""}/register`,
    hackathonId: order.hackathonId,
    email: { subject: `Payment failed for ${order.hackathonName ?? "HACKSYRA"}` },
  });
}

export async function refundPayment(params: {
  paymentId: string;
  actorId: string;
  actorEmail?: string;
  isAdmin: boolean;
  amountInPaise?: number;
  reason: string;
}) {
  const db = adminDb();
  const payRef = db.collection(COLLECTIONS.PAYMENTS).doc(params.paymentId);
  const paySnap = await payRef.get();
  if (!paySnap.exists) throw Errors.notFound("Payment not found.");
  const payment = paySnap.data() as PaymentDoc;

  if (!params.isAdmin && payment.organizerId !== params.actorId) {
    throw Errors.forbidden("Only the event organizer or an admin can issue a refund.");
  }
  if (payment.status !== "captured") {
    throw Errors.conflict(`Cannot refund payment in status "${payment.status}".`);
  }

  const refundAmount = params.amountInPaise ?? payment.amount;
  if (refundAmount <= 0 || refundAmount > payment.amount) {
    throw Errors.badRequest("Invalid refund amount.");
  }

  let providerRefundId = `rfnd_dev_${nanoid(12)}`;
  if (payment.provider === "razorpay") {
    if (!isRazorpayServerConfigured()) throw Errors.notConfigured("Razorpay");
    if (!payment.providerPaymentId) throw Errors.badRequest("Razorpay payment ID missing.");
    const r = await razorpay().payments.refund(payment.providerPaymentId, {
      amount: refundAmount,
      notes: { reason: params.reason, orderId: payment.orderId },
    });
    providerRefundId = r.id;
  }

  const refundId = `rfnd_${nanoid(12)}`;
  const now = FieldValue.serverTimestamp();
  const isDev = payment.provider === "dev";

  const batch = db.batch();
  batch.set(db.collection(COLLECTIONS.REFUNDS).doc(refundId), {
    id: refundId,
    paymentId: params.paymentId,
    orderId: payment.orderId,
    hackathonId: payment.hackathonId,
    userId: payment.userId,
    organizerId: payment.organizerId,
    provider: payment.provider,
    providerRefundId,
    amount: refundAmount,
    currency: payment.currency,
    reason: params.reason,
    status: isDev ? "processed" : "pending",
    initiatedBy: params.actorId,
    createdAt: now,
    updatedAt: now,
  });

  batch.update(payRef, { status: isDev ? "refunded" : "refund_pending", updatedAt: now });
  if (isDev) {
    batch.update(db.collection(COLLECTIONS.ORDERS).doc(payment.orderId), { status: "refunded", updatedAt: now });
    if (payment.kind === "registration") {
      const regRef = db.collection(COLLECTIONS.REGISTRATIONS).doc(`${payment.hackathonId}_${payment.userId}`);
      batch.update(regRef, {
        status: "refunded",
        statusHistory: FieldValue.arrayUnion({ status: "refunded", timestamp: Timestamp.now(), note: params.reason, actorId: params.actorId }),
        updatedAt: now,
      });
      const tQ = await db.collection(COLLECTIONS.TICKETS).where("orderId", "==", payment.orderId).limit(5).get();
      tQ.docs.forEach((d) => batch.update(d.ref, { status: "refunded", updatedAt: now }));
    }
  }
  await batch.commit();

  await audit({
    actorId: params.actorId,
    actorEmail: params.actorEmail,
    action: "payment.refund_initiated",
    resource: "payments",
    resourceId: params.paymentId,
    notes: params.reason,
    metadata: { refundId, amount: refundAmount, provider: payment.provider },
  });

  await notify({
    userId: payment.userId,
    type: "refund_processed",
    title: isDev ? "Refund completed" : "Refund initiated",
    message: `A refund of ${formatMoney(refundAmount)} has been ${isDev ? "processed" : "initiated"} (${params.reason}).`,
    linkUrl: "/dashboard/payments",
    hackathonId: payment.hackathonId,
    email: { subject: `Refund update (${formatMoney(refundAmount)})` },
  });

  return { refundId, status: isDev ? "processed" : "pending", providerRefundId };
}

export async function finalizeWebhookRefund(providerPaymentId: string) {
  const db = adminDb();
  const pQ = await db.collection(COLLECTIONS.PAYMENTS).where("providerPaymentId", "==", providerPaymentId).limit(1).get();
  if (pQ.empty) return;
  const pSnap = pQ.docs[0];
  const payment = pSnap.data() as PaymentDoc;
  if (payment.status === "refunded") return;

  const now = FieldValue.serverTimestamp();
  const batch = db.batch();
  batch.update(pSnap.ref, { status: "refunded", updatedAt: now });
  batch.update(db.collection(COLLECTIONS.ORDERS).doc(payment.orderId), { status: "refunded", updatedAt: now });
  const rQ = await db.collection(COLLECTIONS.REFUNDS).where("paymentId", "==", pSnap.id).limit(5).get();
  rQ.docs.forEach((d) => batch.update(d.ref, { status: "processed", updatedAt: now }));
  if (payment.kind === "registration") {
    batch.update(db.collection(COLLECTIONS.REGISTRATIONS).doc(`${payment.hackathonId}_${payment.userId}`), {
      status: "refunded",
      statusHistory: FieldValue.arrayUnion({ status: "refunded", timestamp: Timestamp.now(), note: "Webhook refund.processed" }),
      updatedAt: now,
    });
    const tQ = await db.collection(COLLECTIONS.TICKETS).where("orderId", "==", payment.orderId).limit(5).get();
    tQ.docs.forEach((d) => batch.update(d.ref, { status: "refunded", updatedAt: now }));
  }
  await batch.commit();
}

export { RESERVATION_MS };

