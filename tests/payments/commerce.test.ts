import { describe, expect, it } from "vitest";
import { computeRegistrationPricing, canReserveSeat } from "@/lib/payments/pricing";
import { verifyPaymentSignature } from "@/lib/payments/razorpay";
import crypto from "node:crypto";

const tier = { id: "t1", price: 50000, capacity: 100, sold: 60, reserved: 39, isActive: true };

describe("seat reservation & pricing", () => {
  it("allows reservation when sold + reserved < capacity", () => {
    expect(canReserveSeat(tier).ok).toBe(true);
    expect(canReserveSeat({ ...tier, reserved: 40 }).ok).toBe(false);
    expect(canReserveSeat({ ...tier, isActive: false }).ok).toBe(false);
  });

  it("computes registration pricing with percentage and 100% coupons", () => {
    expect(computeRegistrationPricing(tier, { id: "c1", type: "percentage", value: 25, isActive: true, usedCount: 0 })).toEqual({
      ok: true,
      subtotal: 50000,
      discount: 12500,
      total: 37500,
    });

    expect(computeRegistrationPricing(tier, { id: "c2", type: "percentage", value: 100, isActive: true, usedCount: 0 })).toEqual({
      ok: true,
      subtotal: 50000,
      discount: 50000,
      total: 0,
    });
  });

  it("rejects out-of-window ticket tiers", () => {
    const r = computeRegistrationPricing({ ...tier, saleEndDate: 100 }, null, 200);
    expect(r.ok).toBe(false);
  });

  it("verifies Razorpay verify payload using documented HMAC SHA256 scheme", () => {
    const secret = "rzp_test_secret_xyz";
    const orderId = "order_ABC123";
    const paymentId = "pay_XYZ789";
    const sig = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
    expect(verifyPaymentSignature({ orderId, paymentId, signature: sig }, secret)).toBe(true);
    expect(verifyPaymentSignature({ orderId, paymentId: "pay_tampered", signature: sig }, secret)).toBe(false);
  });
});

