import { z } from "zod";
import { route } from "@/lib/server/api";
import { checkInTicketByCode } from "@/lib/server/registrations";
import { isAdminRole } from "@/lib/auth/roles";

const Body = z.object({ code: z.string().trim().min(3).max(200) });

export const POST = route(
  { auth: "required", body: Body, rateLimit: { limit: 60, windowSec: 60, name: "ticket-checkin" } },
  async ({ user, body }) => {
    return checkInTicketByCode({
      code: body.code,
      actorId: user!.uid,
      isAdmin: isAdminRole(user!.role),
    });
  }
);

