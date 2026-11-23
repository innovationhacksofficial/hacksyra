import { z } from "zod";
import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { audit } from "@/lib/server/audit";
import { route, Errors } from "@/lib/server/api";

const Body = z.object({
  status: z.enum(["resolved", "dismissed"]),
  actionNote: z.string().trim().max(500).optional(),
});

export const POST = route<z.infer<typeof Body>, { id: string }>(
  { auth: ["admin", "super_admin"], body: Body, rateLimit: { limit: 40, windowSec: 60, name: "admin-report" } },
  async ({ user, body, params, req }) => {
    const ref = adminDb().collection(COLLECTIONS.MODERATION_REPORTS).doc(params.id);
    const snap = await ref.get();
    if (!snap.exists) throw Errors.notFound("Report not found.");
    const now = FieldValue.serverTimestamp();
    await ref.update({
      status: body.status,
      actionNote: body.actionNote ?? null,
      resolvedBy: user!.uid,
      resolvedByEmail: user!.email ?? null,
      resolvedAt: now,
      updatedAt: now,
    });
    await audit({ actorId: user!.uid, actorEmail: user!.email, action: `report.${body.status}`, resource: "moderationReports", resourceId: params.id, notes: body.actionNote, req });
    return { ok: true, status: body.status };
  }
);

