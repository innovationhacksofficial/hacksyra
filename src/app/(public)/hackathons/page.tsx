import type { Metadata } from "next";
import { HackathonsDiscovery } from "@/components/hackathons/HackathonsDiscovery";

export const metadata: Metadata = {
  title: "Discover Hackathons",
  description:
    "Browse hundreds of online, in-person, and hybrid hackathons worldwide. Filter by technology, prize pool, location, and more. Find your perfect competition on HACKSYRA.",
  openGraph: {
    title: "Discover Hackathons | HACKSYRA",
    description: "Find your next hackathon — AI, Web3, FinTech, HealthTech, and more.",
  },
};

export default function HackathonsPage() {
  return <HackathonsDiscovery />;
}
