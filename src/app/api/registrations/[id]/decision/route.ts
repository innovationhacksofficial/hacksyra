import { z } from "zod";
import { route } from "@/lib/server/api";
import { decideRegistration } from "@/lib/server/registrations";
import { isAdminRole } from "@/lib/auth/roles";

const Body = z.object({
  decision: z.enum(["approve", "reject"]),
  reason: z.string().max(300).optional(),
});

export const POST = route(
  { auth: "required", body: Body, rateLimit: { limit: 40, windowSec: 60, name: "reg-decision" } },
  async ({ user, body, params }) => {
    return decideRegistration({
      registrationId: (params as { id: string }).id,
      actorId: user!.uid,
      actorEmail: user!.email,
      isAdmin: isAdminRole(user!.role),
      decision: body.decision,
      reason: body.reason,
    });
  }
);

