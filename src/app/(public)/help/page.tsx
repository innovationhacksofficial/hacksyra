import type { Metadata } from "next";
import { HelpClient } from "@/components/public/PublicViews";

export const metadata: Metadata = {
  title: "Help Center",
  description: "Frequently asked questions for hackathon participants, organizers, and judges on HACKSYRA.",
};

export default function HelpPage() {
  return <HelpClient />;
}
