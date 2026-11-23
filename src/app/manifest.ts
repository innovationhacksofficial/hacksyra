import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HACKSYRA — Innovation Hacks",
    short_name: "HACKSYRA",
    description: "Discover global hackathons, build in teams, and host events in minutes.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#1565D8",
    icons: [
      { src: "/logos/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { src: "/logos/ih_logo.png", sizes: "512x512", type: "image/png" },
    ],
  };
}

