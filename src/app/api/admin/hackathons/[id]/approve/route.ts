import { route } from "@/lib/server/api";
import { approveHackathon } from "@/lib/server/hackathon-review";

export const POST = route<undefined, { id: string }>(
  { auth: ["admin", "super_admin"], rateLimit: { limit: 30, windowSec: 60, name: "admin-approve" } },
  async ({ user, params }) => approveHackathon(params.id, { uid: user!.uid, email: user!.email, role: user!.role })
);

