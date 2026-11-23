import { z } from "zod";
import { route, Errors } from "@/lib/server/api";
import { verifyPaymentSignature } from "@/lib/payments/razorpay";
import { serverEnv } from "@/lib/env";
import { finalizeCapturedPayment } from "@/lib/server/payments";
import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";

const Body = z.object({
  orderId: z.string().min(4),
  razorpayOrderId: z.string().optional(),
  razorpayPaymentId: z.string().optional(),
  razorpaySignature: z.string().optional(),
  devBypass: z.boolean().optional(),
});

export const POST = route(
  { auth: "required", body: Body, rateLimit: { limit: 20, windowSec: 60, name: "pay-verify" } },
  async ({ user, body }) => {
    const orderSnap = await adminDb().collection(COLLECTIONS.ORDERS).doc(body.orderId).get();
    if (!orderSnap.exists) throw Errors.notFound("Order not found.");
    const order = orderSnap.data()!;
    if (order.userId !== user!.uid && user!.role !== "admin" && user!.role !== "super_admin") {
      throw Errors.forbidden();
    }

    if (body.devBypass) {
      if (!serverEnv.paymentsDevBypass) {
        throw Errors.forbidden("Dev payment bypass is disabled.");
      }
      return finalizeCapturedPayment({
        orderId: body.orderId,
        providerOrderId: order.razorpayOrderId,
        providerPaymentId: `pay_dev_${Date.now()}`,
        method: "dev",
        provider: "dev",
      });
    }

    if (!body.razorpayOrderId || !body.razorpayPaymentId || !body.razorpaySignature) {
      throw Errors.badRequest("Missing Razorpay payment signature fields.");
    }
    if (order.razorpayOrderId && order.razorpayOrderId !== body.razorpayOrderId) {
      throw Errors.badRequest("Order ID mismatch.");
    }

    const valid = verifyPaymentSignature({
      orderId: body.razorpayOrderId,
      paymentId: body.razorpayPaymentId,
      signature: body.razorpaySignature,
    });
    if (!valid) {
      throw Errors.forbidden("Invalid payment signature. If money was debited, the webhook will reconcile it automatically.");
    }

    return finalizeCapturedPayment({
      orderId: body.orderId,
      providerOrderId: body.razorpayOrderId,
      providerPaymentId: body.razorpayPaymentId,
      provider: "razorpay",
    });
  }
);

