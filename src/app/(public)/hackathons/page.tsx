import { Suspense } from "react";
import type { Metadata } from "next";
import { HackathonsDiscovery } from "@/components/hackathons/HackathonsDiscovery";
import { CardSkeleton } from "@/components/ui";

export const metadata: Metadata = {
  title: "Discover Hackathons",
  description: "Browse real-time approved online, offline, and hybrid hackathons on HACKSYRA.",
};

export default function HackathonsPage() {
  return (
    <Suspense
      fallback={
        <div className="container-app py-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      }
    >
      <HackathonsDiscovery />
    </Suspense>
  );
}
