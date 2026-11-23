import { z } from "zod";
import { nanoid } from "nanoid";
import { adminDb, FieldValue, Timestamp } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { isAdminRole } from "@/lib/auth/roles";
import { route, Errors } from "@/lib/server/api";

const Body = z.object({
  code: z.string().trim().min(3).max(32),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().int().positive(),
  usageLimit: z.number().int().positive().optional(),
  validUntil: z.string().optional(),
});

export const POST = route<z.infer<typeof Body>, { id: string }>(
  { auth: "required", body: Body, rateLimit: { limit: 25, windowSec: 60, name: "org-coupon" } },
  async ({ user, body, params }) => {
    const db = adminDb();
    const hSnap = await db.collection(COLLECTIONS.HACKATHONS).doc(params.id).get();
    if (!hSnap.exists) throw Errors.notFound("Hackathon not found.");
    if (!isAdminRole(user!.role) && hSnap.data()!.organizerId !== user!.uid) throw Errors.forbidden();

    const cid = `cpn_${nanoid(10)}`;
    const now = FieldValue.serverTimestamp();
    await db.collection(COLLECTIONS.COUPONS).doc(cid).set({
      id: cid,
      hackathonId: params.id,
      organizerId: hSnap.data()!.organizerId,
      code: body.code.toUpperCase(),
      type: body.type,
      value: body.type === "percentage" ? Math.min(100, body.value) : body.value,
      currency: "INR",
      usageLimit: body.usageLimit ?? null,
      usedCount: 0,
      perUserLimit: 1,
      validUntil: body.validUntil ? Timestamp.fromDate(new Date(body.validUntil)) : null,
      isActive: true,
      createdBy: user!.uid,
      createdAt: now,
      updatedAt: now,
    });

    return { ok: true, id: cid };
  }
);

