import "server-only";
import crypto from "node:crypto";
import Razorpay from "razorpay";
import { isRazorpayServerConfigured, serverEnv } from "@/lib/env";

let client: Razorpay | null = null;

export function razorpay(): Razorpay {
  if (!isRazorpayServerConfigured()) throw new Error("razorpay_not_configured");
  client ??= new Razorpay({ key_id: serverEnv.razorpayKeyId, key_secret: serverEnv.razorpayKeySecret });
  return client;
}

/** Constant-time comparison of two hex strings. */
export function safeEqualHex(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export function hmacSha256Hex(secret: string, payload: string | Buffer): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Checkout signature: HMAC_SHA256(order_id + "|" + payment_id, key_secret).
 * https://razorpay.com/docs/payments/server-integration/nodejs/payment-gateway/build-integration/#verify-payment-signature
 */
export function verifyPaymentSignature(
  params: { orderId: string; paymentId: string; signature: string },
  secret: string = serverEnv.razorpayKeySecret
): boolean {
  if (!secret || !params.orderId || !params.paymentId || !params.signature) return false;
  const expected = hmacSha256Hex(secret, `${params.orderId}|${params.paymentId}`);
  return safeEqualHex(expected, params.signature);
}

/** Webhook signature: HMAC_SHA256(raw request body, webhook_secret) in X-Razorpay-Signature. */
export function verifyWebhookSignature(
  rawBody: string | Buffer,
  signature: string | null,
  secret: string = serverEnv.razorpayWebhookSecret
): boolean {
  if (!secret || !signature) return false;
  return safeEqualHex(hmacSha256Hex(secret, rawBody), signature);
}

/** HMAC-signed ticket QR payload: "<ticketId>.<sig16>" — verifiable at check-in without a DB secret per ticket. */
export function signTicket(ticketId: string, secret: string = serverEnv.ticketQrSecret): string {
  if (!secret) throw new Error("TICKET_QR_SECRET is not configured");
  return `${ticketId}.${hmacSha256Hex(secret, `ticket:${ticketId}`).slice(0, 32)}`;
}

export function verifyTicketCode(code: string, secret: string = serverEnv.ticketQrSecret): string | null {
  const [id, sig] = code.split(".");
  if (!id || !sig || !secret) return null;
  const expected = hmacSha256Hex(secret, `ticket:${id}`).slice(0, 32);
  return safeEqualHex(expected, sig) ? id : null;
}
