import type { Metadata } from "next";
import { PricingClient } from "@/components/public/PublicViews";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Free for participants. Simple one-time event listing fee for hackathon organizers.",
};

export default function PricingPage() {
  return <PricingClient />;
}
