"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Flame, Clock, Sparkles, Compass, Plus } from "lucide-react";
import { useListedHackathons } from "@/lib/data/hooks";
import { computeLiveStatus } from "@/lib/domain/status";
import { toMillis } from "@/lib/domain/dates";
import { HackathonCard } from "@/components/hackathons/HackathonCard";
import { CardSkeleton, EmptyState, ErrorState, NotConfigured, Tabs } from "@/components/ui";
import { useAuth } from "@/components/providers/AuthProvider";

const FEED_TABS = [
  { id: "all", label: "All live", icon: <Compass size={14} /> },
  { id: "featured", label: "Featured", icon: <Sparkles size={14} /> },
  { id: "live_now", label: "Live now", icon: <Flame size={14} /> },
  { id: "ending_soon", label: "Ending soon", icon: <Clock size={14} /> },
  { id: "upcoming", label: "Upcoming" },
];

export function LiveHackathonSections() {
  const { firebaseUser } = useAuth();
  const { data: hackathons, isLoading, error, notConfigured } = useListedHackathons({ sort: "startDate", limit: 36 });
  const [tab, setTab] = useState("all");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    const list = hackathons ?? [];
    const now = Date.now();
    let res = list.filter((h) => {
      if (category !== "all" && h.category !== category) return false;
      const st = computeLiveStatus(h, now);
      if (tab === "featured") return h.isFeatured || h.isStaffPick;
      if (tab === "live_now") return st === "ongoing" || st === "registration_open";
      if (tab === "ending_soon") {
        const close = toMillis(h.registrationCloseDate) ?? 0;
        return close > now && close - now < 10 * 86_400_000;
      }
      if (tab === "upcoming") return st === "published";
      return true;
    });

    if (tab === "ending_soon") {
      res = [...res].sort((a, b) => (toMillis(a.registrationCloseDate) ?? 0) - (toMillis(b.registrationCloseDate) ?? 0));
    }
    return res.slice(0, 9);
  }, [hackathons, tab, category]);

  const categories = [
    { id: "all", label: "All domains" },
    { id: "ai_ml", label: "AI / ML" },
    { id: "fintech", label: "FinTech" },
    { id: "web3", label: "Web3" },
    { id: "sustainability", label: "Sustainability" },
    { id: "cybersecurity", label: "Cybersecurity" },
    { id: "open_innovation", label: "Open Innovation" },
  ];

  return (
    <section className="py-12 sm:py-16">
      <div className="container-app space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="section-tag">Real-Time Directory</span>
            <h2 className="section-title !mb-1">Explore live hackathons</h2>
            <p className="text-sm sm:text-base text-slate-600">
              Every approved event updates in real time as deadlines and statuses change.
            </p>
          </div>
          <Link href="/hackathons" className="btn-secondary btn-sm self-start sm:self-auto">
            Browse all hackathons <ArrowRight size={14} />
          </Link>
        </div>

        {/* Feed Tabs + Domain Chips */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <Tabs items={FEED_TABS} value={tab} onChange={setTab} />
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-colors ${
                  category === c.id
                    ? "bg-[#1565D8] text-white border-[#1565D8]"
                    : "bg-white text-slate-600 border-slate-200 hover:border-[#1565D8]/40"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {notConfigured ? (
          <NotConfigured service="Firestore Live Directory" />
        ) : error ? (
          <ErrorState message={error.message} />
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No hackathons match this filter yet"
            description="Try switching tabs, clearing the category filter, or host your own hackathon right now."
            action={
              <div className="flex flex-wrap gap-2.5 justify-center">
                {tab !== "all" || category !== "all" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setTab("all");
                      setCategory("all");
                    }}
                    className="btn-secondary btn-sm"
                  >
                    Reset filters
                  </button>
                ) : null}
                <Link
                  href={firebaseUser ? "/organizer/create" : "/signup?role=organizer&next=/organizer/create"}
                  className="btn-primary btn-sm"
                >
                  <Plus size={14} /> Host a Hackathon
                </Link>
              </div>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 gap-5">
            {filtered.map((h) => (
              <HackathonCard key={h.id} hackathon={h} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

