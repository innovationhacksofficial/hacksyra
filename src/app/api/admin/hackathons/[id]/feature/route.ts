import { z } from "zod";
import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { route, Errors } from "@/lib/server/api";
import { audit } from "@/lib/server/audit";

const Body = z.object({
  isFeatured: z.boolean().optional(),
  isStaffPick: z.boolean().optional(),
});

export const POST = route<z.infer<typeof Body>, { id: string }>(
  { auth: ["admin", "super_admin"], body: Body, rateLimit: { limit: 40, windowSec: 60, name: "admin-feature" } },
  async ({ user, body, params, req }) => {
    const ref = adminDb().collection(COLLECTIONS.HACKATHONS).doc(params.id);
    const snap = await ref.get();
    if (!snap.exists) throw Errors.notFound("Hackathon not found.");
    const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
    if (body.isFeatured !== undefined) updates.isFeatured = body.isFeatured;
    if (body.isStaffPick !== undefined) updates.isStaffPick = body.isStaffPick;
    await ref.update(updates);
    await audit({ actorId: user!.uid, actorEmail: user!.email, action: "hackathon.feature_updated", resource: "hackathons", resourceId: params.id, metadata: body, req });
    return { ok: true };
  }
);

