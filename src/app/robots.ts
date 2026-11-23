import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const base = publicEnv.appUrl.replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/hackathons", "/projects", "/builders", "/leaderboard", "/host", "/pricing"],
        disallow: ["/api/", "/dashboard/", "/organizer/", "/admin/", "/judge/", "/onboarding", "/login", "/signup"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}

