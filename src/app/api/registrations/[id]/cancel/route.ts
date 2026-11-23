import { z } from "zod";
import { route } from "@/lib/server/api";
import { cancelRegistration } from "@/lib/server/registrations";

const Body = z.object({ reason: z.string().max(300).optional() });

export const POST = route(
  { auth: "required", body: Body, rateLimit: { limit: 15, windowSec: 60, name: "reg-cancel" } },
  async ({ user, body, params }) => {
    return cancelRegistration({
      registrationId: (params as { id: string }).id,
      uid: user!.uid,
      email: user!.email,
      reason: body.reason,
    });
  }
);

