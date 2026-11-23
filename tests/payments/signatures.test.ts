import { describe, expect, it } from "vitest";
import crypto from "node:crypto";
import {
  verifyPaymentSignature,
  verifyWebhookSignature,
  signTicket,
  verifyTicketCode,
  safeEqualHex,
} from "@/lib/payments/razorpay";

const SECRET = "test_key_secret_123";

describe("Razorpay checkout signature", () => {
  // Razorpay's documented scheme: hmac_sha256(order_id + "|" + razorpay_payment_id, secret)
  const orderId = "order_IluGWxBm9U8zJ8";
  const paymentId = "pay_IluGWxBm9U8zJ9";
  const good = crypto.createHmac("sha256", SECRET).update(`${orderId}|${paymentId}`).digest("hex");

  it("accepts a valid signature", () => {
    expect(verifyPaymentSignature({ orderId, paymentId, signature: good }, SECRET)).toBe(true);
  });
  it("rejects tampered ids, wrong secrets and garbage", () => {
    expect(verifyPaymentSignature({ orderId: "order_other", paymentId, signature: good }, SECRET)).toBe(false);
    expect(verifyPaymentSignature({ orderId, paymentId, signature: good }, "wrong")).toBe(false);
    expect(verifyPaymentSignature({ orderId, paymentId, signature: "abc" }, SECRET)).toBe(false);
    expect(verifyPaymentSignature({ orderId, paymentId, signature: "" }, SECRET)).toBe(false);
    expect(verifyPaymentSignature({ orderId, paymentId, signature: good }, "")).toBe(false);
  });
});

describe("Razorpay webhook signature", () => {
  const body = JSON.stringify({ event: "payment.captured", payload: { payment: { entity: { id: "pay_1" } } } });
  const sig = crypto.createHmac("sha256", "whsec").update(body).digest("hex");
  it("verifies against the raw body", () => {
    expect(verifyWebhookSignature(body, sig, "whsec")).toBe(true);
    expect(verifyWebhookSignature(Buffer.from(body), sig, "whsec")).toBe(true);
  });
  it("fails if the body is re-serialised or signature missing", () => {
    expect(verifyWebhookSignature(body + " ", sig, "whsec")).toBe(false);
    expect(verifyWebhookSignature(body, null, "whsec")).toBe(false);
  });
});

describe("ticket QR codes", () => {
  it("round-trips and rejects forgeries", () => {
    const code = signTicket("tkt_123", "qr");
    expect(verifyTicketCode(code, "qr")).toBe("tkt_123");
    expect(verifyTicketCode(code.replace("tkt_123", "tkt_124"), "qr")).toBeNull();
    expect(verifyTicketCode(code, "other")).toBeNull();
    expect(safeEqualHex("a", "ab")).toBe(false);
  });
});

