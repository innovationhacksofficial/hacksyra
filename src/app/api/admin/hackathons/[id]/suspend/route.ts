import { z } from "zod";
import { route } from "@/lib/server/api";
import { suspendHackathon } from "@/lib/server/hackathon-review";

const Body = z.object({ reason: z.string().trim().min(5, "Provide a suspension reason.").max(500) });

export const POST = route<z.infer<typeof Body>, { id: string }>(
  { auth: ["admin", "super_admin"], body: Body, rateLimit: { limit: 30, windowSec: 60, name: "admin-suspend" } },
  async ({ user, body, params }) => suspendHackathon(params.id, { uid: user!.uid, email: user!.email, role: user!.role }, body.reason)
);

