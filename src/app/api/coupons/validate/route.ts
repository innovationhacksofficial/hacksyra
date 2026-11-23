import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { computeRegistrationPricing } from "@/lib/payments/pricing";
import { toMillis } from "@/lib/domain/dates";
import { route, Errors } from "@/lib/server/api";

const Query = z.object({
  hackathonId: z.string().min(4),
  code: z.string().trim().min(1),
  tierId: z.string().min(1),
});

export const GET = route(
  { auth: "required", body: Query, rateLimit: { limit: 30, windowSec: 60, name: "coupon-check" } },
  async ({ body }) => {
    const db = adminDb();
    const [tSnap, cQ] = await Promise.all([
      db.collection(COLLECTIONS.TICKET_TIERS).doc(body.tierId).get(),
      db
        .collection(COLLECTIONS.COUPONS)
        .where("hackathonId", "==", body.hackathonId)
        .where("code", "==", body.code.toUpperCase())
        .limit(1)
        .get(),
    ]);
    if (!tSnap.exists) throw Errors.notFound("Ticket tier not found.");
    if (cQ.empty) return { ok: false, reason: "Coupon code not found." };

    const t = tSnap.data()!;
    const c = cQ.docs[0].data();
    return computeRegistrationPricing(
      {
        id: tSnap.id,
        price: Number(t.price ?? 0),
        capacity: t.capacity,
        sold: t.sold,
        reserved: t.reserved,
        isActive: t.isActive !== false,
        saleStartDate: toMillis(t.saleStartDate),
        saleEndDate: toMillis(t.saleEndDate),
      },
      {
        id: cQ.docs[0].id,
        type: c.type,
        value: Number(c.value),
        isActive: c.isActive !== false,
        usageLimit: c.usageLimit,
        usedCount: Number(c.usedCount ?? 0),
        minOrderAmount: c.minOrderAmount,
        validFrom: toMillis(c.validFrom),
        validUntil: toMillis(c.validUntil),
        applicableTierIds: c.applicableTierIds,
      }
    );
  }
);

