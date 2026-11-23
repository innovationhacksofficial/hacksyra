import { Suspense } from "react";
import type { Metadata } from "next";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { HackathonDetailClient } from "@/components/hackathons/HackathonDetailClient";
import { Skeleton } from "@/components/ui";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!isAdminConfigured()) return { title: slug };
  try {
    const snap = await adminDb()
      .collection(COLLECTIONS.HACKATHONS)
      .where("slug", "==", slug)
      .where("isListed", "==", true)
      .limit(1)
      .get();
    if (snap.empty) return { title: "Hackathon" };
    const h = snap.docs[0].data() as { name: string; summary?: string };
    return { title: h.name, description: h.summary };
  } catch {
    return { title: slug };
  }
}

export default async function HackathonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <Suspense fallback={<div className="container-app py-10"><Skeleton className="h-96 rounded-2xl" /></div>}>
      <HackathonDetailClient slug={slug} />
    </Suspense>
  );
}
