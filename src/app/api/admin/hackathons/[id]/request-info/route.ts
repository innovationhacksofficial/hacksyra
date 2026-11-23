import { z } from "zod";
import { route } from "@/lib/server/api";
import { requestInfoHackathon } from "@/lib/server/hackathon-review";

const Body = z.object({ message: z.string().trim().min(5, "Include what info you need.").max(1000) });

export const POST = route<z.infer<typeof Body>, { id: string }>(
  { auth: ["admin", "super_admin"], body: Body, rateLimit: { limit: 30, windowSec: 60, name: "admin-req-info" } },
  async ({ user, body, params }) => requestInfoHackathon(params.id, { uid: user!.uid, email: user!.email, role: user!.role }, body.message)
);

