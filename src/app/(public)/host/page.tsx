import type { Metadata } from "next";
import { HostClient } from "@/components/public/PublicViews";

export const metadata: Metadata = {
  title: "Host a Hackathon",
  description: "Launch your hackathon on HACKSYRA with a 9-step wizard, Razorpay ticketing, QR check-in, and judging rubrics.",
};

export default function HostPage() {
  return <HostClient />;
}
