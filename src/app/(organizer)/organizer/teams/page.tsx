"use client";

import { useEffect, useState } from "react";
import { collection, orderBy, query, where } from "firebase/firestore";
import { Search, Users } from "lucide-react";
import { clientDb, firebaseReady } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLiveQuery } from "@/lib/data/live";
import { useMyHackathons } from "@/lib/data/hooks";
import { CardSkeleton, EmptyState, Input, NotConfigured, PageHeader, StatusBadge } from "@/components/ui";
import type { Team } from "@/types";

export default function OrganizerTeamsPage() {
  const { firebaseUser, notConfigured } = useAuth();
  const { data: events } = useMyHackathons(firebaseUser?.uid);
  const [hackathonId, setHackathonId] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!hackathonId && events && events.length > 0) setHackathonId(events[0].id);
  }, [events, hackathonId]);

  const { data: teams, isLoading } = useLiveQuery<Team>(
    ["org-teams", hackathonId || null],
    hackathonId && firebaseReady()
      ? () => query(collection(clientDb(), COLLECTIONS.TEAMS), where("hackathonId", "==", hackathonId), orderBy("createdAt", "desc"))
      : null
  );

  if (notConfigured) return <NotConfigured service="Firestore" />;

  const q = search.trim().toLowerCase();
  const filtered = (teams ?? []).filter((t) => !q || `${t.name} ${(t.skills ?? []).join(" ")}`.toLowerCase().includes(q));

  return (
    <div className="space-y-6 pb-8">
      <PageHeader title="Hackathon Teams" description="Inspect registered teams, sizes, and submission linkage in real time." />

      <div className="flex flex-col sm:flex-row gap-3">
        <select className="input sm:w-72" value={hackathonId} onChange={(e) => setHackathonId(e.target.value)}>
          {(events ?? []).map((h) => (
            <option key={h.id} value={h.id}>
              {h.name || "Untitled"}
            </option>
          ))}
        </select>
        <div className="flex-1">
          <Input placeholder="Filter teams by name or skill..." leftAdornment={<Search size={15} />} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {isLoading ? (
        <CardSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Users size={22} />} title="No teams formed yet" description="Teams appear here live as participants form groups for this hackathon." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <div key={t.id} className="card p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900">{t.name}</h3>
                  <p className="text-xs text-slate-500">{t.memberIds.length}/{t.maxSize} members</p>
                </div>
                <StatusBadge status={t.status} />
              </div>
              {t.description && <p className="text-xs text-slate-600 line-clamp-2">{t.description}</p>}
              {(t.skills ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {t.skills.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              )}
              <div className="pt-2 border-t border-slate-100 text-xs flex items-center justify-between text-slate-500">
                <span>{t.submissionId ? "Project submitted ✓" : "No submission yet"}</span>
                <span>{t.isLookingForMembers ? "Recruiting" : "Closed"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

