import { z } from "zod";
import { route } from "@/lib/server/api";
import { createListingFeeOrder } from "@/lib/server/payments";

const Body = z.object({ hackathonId: z.string().min(4) });

export const POST = route(
  { auth: "required", body: Body, rateLimit: { limit: 20, windowSec: 60, name: "listing-order" } },
  async ({ user, body }) => {
    return createListingFeeOrder({
      uid: user!.uid,
      email: user!.email,
      name: user!.name,
      hackathonId: body.hackathonId,
    });
  }
);

