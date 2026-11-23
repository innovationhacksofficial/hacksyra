import { z } from "zod";
import { route } from "@/lib/server/api";
import { bootstrapUser } from "@/lib/server/users";
import { audit } from "@/lib/server/audit";

const Body = z.object({
  role: z.enum(["participant", "organizer"]).optional(),
  displayName: z.string().trim().min(1).max(80).optional(),
});

/**
 * POST /api/users/bootstrap — called right after sign-up / first OAuth sign-in.
 * Creates the user + profile docs, reserves a unique username and sets the role claim.
 * The client must then refresh its ID token (getIdToken(true)) and create a session.
 */
export const POST = route(
  { auth: "required", body: Body, rateLimit: { limit: 10, windowSec: 60, name: "bootstrap" } },
  async ({ user, body, req }) => {
    const res = await bootstrapUser({ uid: user!.uid, requestedRole: body.role, displayName: body.displayName });
    if (res.created) {
      await audit({ actorId: user!.uid, actorEmail: user!.email, action: "user.signup", resource: "users", resourceId: user!.uid, metadata: { role: res.role }, req });
    }
    return res;
  }
);

