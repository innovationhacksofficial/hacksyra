import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = publicEnv.appUrl.replace(/\/$/, "");
  const staticRoutes = ["/", "/hackathons", "/projects", "/builders", "/leaderboard", "/host", "/pricing", "/about", "/resources", "/help", "/contact", "/privacy", "/terms"];

  const entries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path === "/" || path === "/hackathons" ? "hourly" : "weekly",
    priority: path === "/" ? 1 : 0.8,
  }));

  if (isAdminConfigured()) {
    try {
      const snap = await adminDb()
        .collection(COLLECTIONS.HACKATHONS)
        .where("isListed", "==", true)
        .limit(200)
        .get();
      for (const doc of snap.docs) {
        const slug = (doc.data() as { slug?: string }).slug;
        if (slug) {
          entries.push({ url: `${base}/hackathons/${slug}`, changeFrequency: "daily", priority: 0.9 });
        }
      }
    } catch {
      /* ignore if DB unreachable at build */
    }
  }

  return entries;
}

