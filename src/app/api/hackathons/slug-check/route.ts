import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { isValidSlug, slugify } from "@/lib/domain/slug";
import { route } from "@/lib/server/api";

const Query = z.object({
  slug: z.string().trim().min(1).max(80),
  excludeId: z.string().optional(),
});

export const GET = route(
  { auth: "optional", body: Query, rateLimit: { limit: 60, windowSec: 60, name: "slug-check" } },
  async ({ body }) => {
    const clean = slugify(body.slug);
    if (!isValidSlug(clean)) {
      return { available: false, slug: clean, reason: "Use 3–60 lowercase letters, numbers, or hyphens (avoid reserved words)." };
    }
    const snap = await adminDb().collection(COLLECTIONS.SLUGS).doc(clean).get();
    if (!snap.exists) return { available: true, slug: clean };
    const takenBy = (snap.data() as { hackathonId?: string }).hackathonId;
    if (body.excludeId && takenBy === body.excludeId) return { available: true, slug: clean };
    return { available: false, slug: clean, reason: "This URL slug is already taken." };
  }
);

