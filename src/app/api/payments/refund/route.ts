import { z } from "zod";
import { route } from "@/lib/server/api";
import { refundPayment } from "@/lib/server/payments";
import { isAdminRole } from "@/lib/auth/roles";

const Body = z.object({
  paymentId: z.string().min(4),
  amountInPaise: z.number().int().positive().optional(),
  reason: z.string().trim().min(3, "Include a refund reason.").max(300),
});

export const POST = route(
  { auth: "required", body: Body, rateLimit: { limit: 15, windowSec: 60, name: "pay-refund" } },
  async ({ user, body }) => {
    return refundPayment({
      paymentId: body.paymentId,
      actorId: user!.uid,
      actorEmail: user!.email,
      isAdmin: isAdminRole(user!.role),
      amountInPaise: body.amountInPaise,
      reason: body.reason,
    });
  }
);

