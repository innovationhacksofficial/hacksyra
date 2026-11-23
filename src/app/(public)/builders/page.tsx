"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { collection, limit, query, where } from "firebase/firestore";
import { Search, Users, MapPin } from "lucide-react";
import { clientDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useLiveQuery } from "@/lib/data/live";
import { Avatar, EmptyState, Input, ListSkeleton, NotConfigured } from "@/components/ui";
import { useAuth } from "@/components/providers/AuthProvider";
import type { UserProfile } from "@/types";

export default function BuildersDirectoryPage() {
  const { notConfigured } = useAuth();
  const [search, setSearch] = useState("");
  const [lftOnly, setLftOnly] = useState(false);

  const { data: builders, isLoading } = useLiveQuery<UserProfile>(["public-builders"], () =>
    query(collection(clientDb(), COLLECTIONS.USER_PROFILES), where("isPublic", "==", true), limit(120))
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (builders ?? []).filter((b) => {
      if (lftOnly && !b.lookingForTeam) return false;
      if (q) {
        const hay = `${b.displayName} ${b.username} ${b.college ?? ""} ${(b.skills ?? []).join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [builders, search, lftOnly]);

  return (
    <div className="container-app py-8 sm:py-10 space-y-6">
      <div>
        <span className="section-tag">Community</span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900">Builders Directory</h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1">
          Find developers, designers, and ML engineers to team up with.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <Input placeholder="Search by name, @username, college, or skill (React, Python...)" leftAdornment={<Search size={16} />} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 cursor-pointer">
          <input type="checkbox" checked={lftOnly} onChange={(e) => setLftOnly(e.target.checked)} className="w-4 h-4 rounded accent-[#1565D8]" />
          Looking for team only
        </label>
      </div>

      {notConfigured ? (
        <NotConfigured service="Firestore" />
      ) : isLoading ? (
        <ListSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Users size={22} />} title="No builders match your search" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 gap-4">
          {filtered.map((b) => (
            <Link key={b.id} href={`/u/${b.username}`} className="card-hover p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Avatar name={b.displayName} src={b.photoURL} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="font-display font-bold text-base text-slate-900 truncate">{b.displayName}</p>
                  <p className="text-xs text-slate-500 truncate">@{b.username}</p>
                </div>
                {b.lookingForTeam && <span className="badge-green text-[10px]">LFT</span>}
              </div>
              {b.bio && <p className="text-xs text-slate-600 line-clamp-2">{b.bio}</p>}
              <div className="flex flex-wrap gap-1 mt-auto pt-2 border-t border-slate-100">
                {(b.skills ?? []).slice(0, 4).map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                    {s}
                  </span>
                ))}
              </div>
              {(b.college || b.country) && (
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <MapPin size={11} /> {[b.college, b.country].filter(Boolean).join(" · ")}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
