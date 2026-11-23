import { applyCoupon, type CouponLike } from "@/lib/domain/money";

export type TierCapacityLike = {
  id: string;
  price: number;
  capacity?: number | null;
  sold?: number;
  reserved?: number;
  isActive?: boolean;
  saleStartDate?: number | null;
  saleEndDate?: number | null;
};

export function canReserveSeat(tier: TierCapacityLike, now = Date.now()): { ok: boolean; reason?: string } {
  if (tier.isActive === false) return { ok: false, reason: "This ticket tier is not available." };
  if (tier.saleStartDate && now < tier.saleStartDate) return { ok: false, reason: "Ticket sales haven't opened yet." };
  if (tier.saleEndDate && now > tier.saleEndDate) return { ok: false, reason: "Ticket sales for this tier have ended." };
  if (tier.capacity != null && (tier.sold ?? 0) + (tier.reserved ?? 0) >= tier.capacity) {
    return { ok: false, reason: "This ticket tier is sold out." };
  }
  return { ok: true };
}

export function computeRegistrationPricing(
  tier: TierCapacityLike,
  coupon: (CouponLike & { id?: string; code?: string }) | null,
  now = Date.now()
):
  | { ok: true; subtotal: number; discount: number; total: number }
  | { ok: false; reason: string } {
  const seat = canReserveSeat(tier, now);
  if (!seat.ok) return { ok: false, reason: seat.reason! };
  const subtotal = Math.max(0, Math.round(tier.price));
  if (!coupon) return { ok: true, subtotal, discount: 0, total: subtotal };
  const res = applyCoupon(subtotal, coupon, { tierId: tier.id, now });
  if (!res.ok) return res;
  return { ok: true, subtotal, discount: res.discount, total: res.total };
}

