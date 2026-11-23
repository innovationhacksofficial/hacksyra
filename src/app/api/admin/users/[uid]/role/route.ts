import { z } from "zod";
import { adminAuth } from "@/lib/firebase/admin";
import { canGrantRole } from "@/lib/domain/admin-logic";
import { setUserRole } from "@/lib/server/users";
import { audit } from "@/lib/server/audit";
import { route, Errors } from "@/lib/server/api";
import type { UserRole } from "@/types";

const Body = z.object({
  role: z.enum(["participant", "organizer", "judge", "mentor", "sponsor_rep", "moderator", "admin", "super_admin"]),
});

export const POST = route<z.infer<typeof Body>, { uid: string }>(
  { auth: ["admin", "super_admin"], body: Body, rateLimit: { limit: 20, windowSec: 60, name: "admin-role" } },
  async ({ user, body, params, req }) => {
    if (!canGrantRole(user!.role, body.role as UserRole)) {
      throw Errors.forbidden("Only super_admin can grant admin or super_admin roles.");
    }
    if (params.uid === user!.uid && body.role !== user!.role) {
      throw Errors.badRequest("You cannot change your own role from here.");
    }
    await setUserRole(params.uid, body.role as UserRole);
    await adminAuth().revokeRefreshTokens(params.uid);
    await audit({ actorId: user!.uid, actorEmail: user!.email, action: "user.role_changed", resource: "users", resourceId: params.uid, metadata: { role: body.role }, req });
    return { ok: true, role: body.role };
  }
);

