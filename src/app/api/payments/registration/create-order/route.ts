import { z } from "zod";
import { route } from "@/lib/server/api";
import { createOrRetryRegistration } from "@/lib/server/registrations";

const Body = z.object({
  hackathonId: z.string().min(4),
  tierId: z.string().optional(),
  couponCode: z.string().optional(),
  inviteCode: z.string().optional(),
  trackId: z.string().optional(),
  answers: z.record(z.string()).optional(),
  age: z.number().int().optional(),
});

export const POST = route(
  { auth: "required", body: Body, rateLimit: { limit: 20, windowSec: 60, name: "reg-order" } },
  async ({ user, body }) => {
    return createOrRetryRegistration({
      uid: user!.uid,
      email: user!.email,
      name: user!.name,
      ...body,
    });
  }
);

