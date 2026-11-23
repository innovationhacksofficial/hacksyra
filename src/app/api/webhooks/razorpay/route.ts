import crypto from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";
import { serverEnv } from "@/lib/env";
import { finalizeCapturedPayment, finalizeWebhookRefund, markPaymentFailed } from "@/lib/server/payments";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!serverEnv.razorpayWebhookSecret) {
    return NextResponse.json({ error: { code: "not_configured", message: "Webhook secret not set." } }, { status: 503 });
  }
  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: { code: "invalid_signature", message: "Invalid webhook signature." } }, { status: 400 });
  }

  let payload: {
    event?: string;
    payload?: {
      payment?: { entity?: { id?: string; order_id?: string; method?: string; error_code?: string; error_description?: string } };
      refund?: { entity?: { payment_id?: string } };
    };
  };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: { code: "bad_json", message: "Invalid JSON" } }, { status: 400 });
  }

  const eventId =
    req.headers.get("x-razorpay-event-id") ||
    crypto.createHash("sha256").update(rawBody).digest("hex").slice(0, 32);
  const eventName = payload.event ?? "unknown";

  const db = adminDb();
  const evRef = db.collection(COLLECTIONS.WEBHOOK_EVENTS).doc(eventId);
  const already = await db.runTransaction(async (tx) => {
    const snap = await tx.get(evRef);
    if (snap.exists) return true;
    tx.set(evRef, {
      id: eventId,
      event: eventName,
      receivedAt: FieldValue.serverTimestamp(),
      status: "processing",
    });
    return false;
  });
  if (already) {
    return NextResponse.json({ ok: true, deduped: true });
  }

  try {
    const payEntity = payload.payload?.payment?.entity;
    if (eventName === "payment.captured" && payEntity?.id && payEntity?.order_id) {
      await finalizeCapturedPayment({
        providerOrderId: payEntity.order_id,
        providerPaymentId: payEntity.id,
        method: payEntity.method,
        provider: "razorpay",
      });
    } else if (eventName === "payment.failed" && payEntity?.order_id) {
      await markPaymentFailed({
        providerOrderId: payEntity.order_id,
        code: payEntity.error_code,
        message: payEntity.error_description,
      });
    } else if (eventName === "refund.processed") {
      const pid = payload.payload?.refund?.entity?.payment_id || payEntity?.id;
      if (pid) await finalizeWebhookRefund(pid);
    }

    await evRef.update({ status: "processed", processedAt: FieldValue.serverTimestamp() });
    return NextResponse.json({ ok: true });
  } catch (err) {
    await evRef.update({ status: "failed", error: err instanceof Error ? err.message : "error" }).catch(() => {});
    console.error("[webhook:razorpay]", err);
    return NextResponse.json({ error: { code: "webhook_error", message: "Processing failed" } }, { status: 500 });
  }
}

