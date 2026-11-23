import { z } from "zod";
import { route } from "@/lib/server/api";
import { rejectHackathon } from "@/lib/server/hackathon-review";

const Body = z.object({ reason: z.string().trim().min(5, "Provide a clear rejection reason.").max(1000) });

export const POST = route<z.infer<typeof Body>, { id: string }>(
  { auth: ["admin", "super_admin"], body: Body, rateLimit: { limit: 30, windowSec: 60, name: "admin-reject" } },
  async ({ user, body, params }) => rejectHackathon(params.id, { uid: user!.uid, email: user!.email, role: user!.role }, body.reason)
);

