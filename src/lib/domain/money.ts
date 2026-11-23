/** Money helpers. All amounts are integer minor units (paise for INR). */

export function formatMoney(minor: number, currency = "INR", opts: { compact?: boolean } = {}): string {
  const major = minor / 100;
  try {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: major % 1 === 0 ? 0 : 2,
      notation: opts.compact ? "compact" : "standard",
    }).format(major);
  } catch {
    return `${currency} ${major.toFixed(2)}`;
  }
}

/** Format a major-unit amount (₹ prizes are stored in major units). */
export function formatMajor(major: number, currency = "INR", compact = false): string {
  return formatMoney(Math.round(major * 100), currency, { compact });
}

export type CouponLike = {
  type: "percentage" | "fixed";
  value: number; // percentage 0-100 or fixed minor units
  isActive: boolean;
  usageLimit?: number | null;
  usedCount: number;
  minOrderAmount?: number | null;
  validFrom?: number | null; // millis
  validUntil?: number | null; // millis
  applicableTierIds?: string[] | null;
};

export type CouponCheck =
  | { ok: true; discount: number; total: number }
  | { ok: false; reason: string };

/**
 * Pure coupon math + validity check. Discount never exceeds subtotal; result is integer paise.
 * Razorpay requires ≥ 100 paise, so a non-zero total below ₹1 is rounded up to ₹1;
 * a 100% coupon yields total 0 (registration confirmed without payment).
 */
export function applyCoupon(subtotal: number, coupon: CouponLike, ctx: { tierId?: string; now?: number } = {}): CouponCheck {
  const now = ctx.now ?? Date.now();
  if (!Number.isInteger(subtotal) || subtotal < 0) return { ok: false, reason: "Invalid amount." };
  if (!coupon.isActive) return { ok: false, reason: "This coupon is no longer active." };
  if (coupon.validFrom && now < coupon.validFrom) return { ok: false, reason: "This coupon isn't valid yet." };
  if (coupon.validUntil && now > coupon.validUntil) return { ok: false, reason: "This coupon has expired." };
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) return { ok: false, reason: "This coupon has been fully redeemed." };
  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) return { ok: false, reason: `Minimum order is ${formatMoney(coupon.minOrderAmount)}.` };
  if (coupon.applicableTierIds?.length && ctx.tierId && !coupon.applicableTierIds.includes(ctx.tierId)) {
    return { ok: false, reason: "This coupon doesn't apply to the selected ticket." };
  }

  let discount = 0;
  if (coupon.type === "percentage") {
    const pct = Math.min(100, Math.max(0, coupon.value));
    discount = Math.floor((subtotal * pct) / 100);
  } else {
    discount = Math.max(0, Math.floor(coupon.value));
  }
  discount = Math.min(discount, subtotal);
  let total = subtotal - discount;
  if (total > 0 && total < 100) {
    total = 100;
    discount = subtotal - total;
  }
  return { ok: true, discount, total };
}
