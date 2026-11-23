import { z } from "zod";
import { adminAuth, adminDb, FieldValue } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { audit } from "@/lib/server/audit";
import { route, Errors } from "@/lib/server/api";

const Body = z.object({
  banned: z.boolean(),
  reason: z.string().trim().max(300).optional(),
});

export const POST = route<z.infer<typeof Body>, { uid: string }>(
  { auth: ["admin", "super_admin"], body: Body, rateLimit: { limit: 20, windowSec: 60, name: "admin-ban" } },
  async ({ user, body, params, req }) => {
    if (params.uid === user!.uid) throw Errors.badRequest("You cannot ban yourself.");
    await adminAuth().updateUser(params.uid, { disabled: body.banned });
    await adminAuth().revokeRefreshTokens(params.uid);
    await adminDb().collection(COLLECTIONS.USERS).doc(params.uid).set(
      {
        isBanned: body.banned,
        isActive: !body.banned,
        banReason: body.banned ? body.reason || "Policy violation" : FieldValue.delete(),
        bannedAt: body.banned ? FieldValue.serverTimestamp() : FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    await audit({ actorId: user!.uid, actorEmail: user!.email, action: body.banned ? "user.banned" : "user.unbanned", resource: "users", resourceId: params.uid, notes: body.reason, req });
    return { ok: true, banned: body.banned };
  }
);

