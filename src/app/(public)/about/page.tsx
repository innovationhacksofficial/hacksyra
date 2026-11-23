import type { Metadata } from "next";
import { AboutClient } from "@/components/public/PublicViews";

export const metadata: Metadata = {
  title: "About HACKSYRA",
  description: "HACKSYRA is the hackathon platform by Innovation Hacks combining event hosting, teams, judging, and portfolios.",
};

export default function AboutPage() {
  return <AboutClient />;
}
