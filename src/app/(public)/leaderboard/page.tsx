"use client";

import Link from "next/link";
import { collection, limit, orderBy, query, where } from "firebase/firestore";
import { Trophy, Medal } from "lucide-react";
import { clientDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useLiveQuery } from "@/lib/data/live";
import { useAuth } from "@/components/providers/AuthProvider";
import { Avatar, DataList, EmptyState, ListSkeleton, NotConfigured } from "@/components/ui";
import type { UserProfile } from "@/types";

type WinnerDoc = {
  id: string;
  hackathonName: string;
  hackathonSlug: string;
  projectTitle: string;
  teamName?: string;
  prizeName: string;
  rank?: number;
  finalScore?: number;
};

export default function LeaderboardPage() {
  const { notConfigured } = useAuth();
  const { data: builders, isLoading } = useLiveQuery<UserProfile>(["leaderboard", "builders"], () =>
    query(collection(clientDb(), COLLECTIONS.USER_PROFILES), where("isPublic", "==", true), orderBy("hackathonsJoined", "desc"), limit(50))
  );

  const { data: winners } = useLiveQuery<WinnerDoc>(["leaderboard", "winners"], () =>
    query(collection(clientDb(), COLLECTIONS.WINNERS), orderBy("announcedAt", "desc"), limit(20))
  );

  const ranked = (builders ?? []).map((b, idx) => ({
    ...b,
    rank: idx + 1,
    score: (b.hackathonsJoined ?? 0) * 100 + (b.projectsPublished ?? 0) * 150,
  }));

  return (
    <div className="container-app py-8 sm:py-10 space-y-8">
      <div>
        <span className="section-tag">Standings</span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900">Builder Leaderboard &amp; Winners</h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1">
          Live rankings computed from verified hackathon participation, shipped projects, and published winners.
        </p>
      </div>

      {notConfigured ? (
        <NotConfigured service="Firestore" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-4">
            <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
              <Medal size={18} className="text-[#1565D8]" /> Top Builders
            </h2>
            {isLoading ? (
              <ListSkeleton rows={6} />
            ) : ranked.length === 0 ? (
              <EmptyState title="No public builders yet" />
            ) : (
              <DataList
                items={ranked}
                keyExtractor={(b) => b.id}
                columns={[
                  { key: "rank", header: "#", cell: (b) => <span className="font-display font-bold text-[#1565D8]">#{b.rank}</span> },
                  {
                    key: "builder",
                    header: "Builder",
                    cell: (b) => (
                      <Link href={`/u/${b.username}`} className="flex items-center gap-3 group">
                        <Avatar name={b.displayName} src={b.photoURL} size="sm" />
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-[#1565D8]">{b.displayName}</p>
                          <p className="text-xs text-slate-500">@{b.username}</p>
                        </div>
                      </Link>
                    ),
                  },
                  { key: "joined", header: "Hackathons", cell: (b) => <span className="tabular-nums">{b.hackathonsJoined ?? 0}</span> },
                  { key: "projects", header: "Projects", cell: (b) => <span className="tabular-nums">{b.projectsPublished ?? 0}</span> },
                  { key: "score", header: "Points", cell: (b) => <span className="font-bold text-slate-900 tabular-nums">{b.score}</span> },
                ]}
              />
            )}
          </div>

          <aside className="lg:col-span-4 space-y-4">
            <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
              <Trophy size={18} className="text-amber-500" /> Recent Winners
            </h2>
            {!winners || winners.length === 0 ? (
              <EmptyState title="No winners announced yet" description="Once organizers publish results, winners appear here automatically." />
            ) : (
              <div className="space-y-3">
                {winners.map((w) => (
                  <Link key={w.id} href={`/hackathons/${w.hackathonSlug}`} className="winner-card block space-y-1">
                    <span className="badge-amber text-[11px]">{w.prizeName}</span>
                    <p className="font-display font-bold text-base text-slate-900">{w.projectTitle}</p>
                    <p className="text-xs text-slate-600">
                      {w.hackathonName} {w.teamName ? `· ${w.teamName}` : ""}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
