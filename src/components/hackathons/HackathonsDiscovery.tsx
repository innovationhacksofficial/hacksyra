"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { collection, query, where } from "firebase/firestore";
import { Search, SlidersHorizontal, Calendar as CalIcon, LayoutGrid, X } from "lucide-react";
import { clientDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/providers/AuthProvider";
import { useListedHackathons } from "@/lib/data/hooks";
import { useLiveQuery } from "@/lib/data/live";
import { computeLiveStatus } from "@/lib/domain/status";
import { formatInZone, toDate, toMillis } from "@/lib/domain/dates";
import { CATEGORIES } from "@/lib/domain/hackathon-schema";
import { HackathonCard } from "@/components/hackathons/HackathonCard";
import { Button, CardSkeleton, EmptyState, ErrorState, Input, NotConfigured, Select, Sheet } from "@/components/ui";
import type { Bookmark, HackathonSortOption } from "@/types";

export function HackathonsDiscovery() {
  const searchParams = useSearchParams();
  const { firebaseUser } = useAuth();

  const initialQ = searchParams.get("q") || searchParams.get("search") || "";
  const [queryText, setQueryText] = useState(initialQ);
  const [mode, setMode] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [price, setPrice] = useState<"all" | "free" | "paid">("all");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [soloOnly, setSoloOnly] = useState(false);
  const [sort, setSort] = useState<HackathonSortOption>("starting_soon");
  const [view, setView] = useState<"grid" | "calendar">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q") || searchParams.get("search");
    if (q != null) setQueryText(q);
  }, [searchParams]);

  const { data: hackathons, isLoading, error, notConfigured } = useListedHackathons({ sort: "startDate", limit: 100 });
  const { data: bookmarks } = useLiveQuery<Bookmark>(
    ["bookmarks", firebaseUser?.uid ?? null],
    firebaseUser?.uid ? () => query(collection(clientDb(), COLLECTIONS.BOOKMARKS), where("userId", "==", firebaseUser.uid)) : null
  );

  const bookmarkedIds = useMemo(() => new Set((bookmarks ?? []).map((b) => b.hackathonId)), [bookmarks]);

  const filtered = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    const list = (hackathons ?? []).filter((h) => {
      if (mode !== "all" && h.mode !== mode) return false;
      if (category !== "all" && h.category !== category) return false;
      if (price === "free" && !h.isFree) return false;
      if (price === "paid" && h.isFree) return false;
      if (difficulty !== "all" && h.difficulty !== difficulty) return false;
      if (soloOnly && !h.allowSolo) return false;
      if (q) {
        const hay = `${h.name} ${h.tagline ?? ""} ${h.organizerName ?? ""} ${h.city ?? ""} ${(h.technologies ?? []).join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sort === "ending_soon") return (toMillis(a.registrationCloseDate) ?? 0) - (toMillis(b.registrationCloseDate) ?? 0);
      if (sort === "most_participants") return (b.registrationCount ?? 0) - (a.registrationCount ?? 0);
      if (sort === "largest_prize") return (b.totalPrizeInPaise ?? 0) - (a.totalPrizeInPaise ?? 0);
      if (sort === "newest") return (toMillis(b.createdAt) ?? 0) - (toMillis(a.createdAt) ?? 0);
      return (toMillis(a.startDate) ?? 0) - (toMillis(b.startDate) ?? 0);
    });
  }, [hackathons, queryText, mode, category, price, difficulty, soloOnly, sort]);

  function resetAll() {
    setQueryText("");
    setMode("all");
    setCategory("all");
    setPrice("all");
    setDifficulty("all");
    setSoloOnly(false);
  }

  const filterForm = (
    <div className="space-y-4">
      <Select label="Mode" value={mode} onChange={(e) => setMode(e.target.value)}>
        <option value="all">All modes</option>
        <option value="online">Online</option>
        <option value="offline">In-person</option>
        <option value="hybrid">Hybrid</option>
      </Select>

      <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="all">All categories</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c.replace(/_/g, " ").toUpperCase()}
          </option>
        ))}
      </Select>

      <Select label="Entry Fee" value={price} onChange={(e) => setPrice(e.target.value as "all" | "free" | "paid")}>
        <option value="all">Free &amp; Paid</option>
        <option value="free">Free only</option>
        <option value="paid">Paid tickets</option>
      </Select>

      <Select label="Difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
        <option value="all">Any level</option>
        <option value="open">Open</option>
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </Select>

      <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700 cursor-pointer pt-1">
        <input
          type="checkbox"
          checked={soloOnly}
          onChange={(e) => setSoloOnly(e.target.checked)}
          className="w-4 h-4 rounded accent-[#1565D8]"
        />
        Solo participation allowed
      </label>

      <Button variant="secondary" size="sm" onClick={resetAll} className="w-full" leftIcon={<X size={13} />}>
        Reset filters
      </Button>
    </div>
  );

  return (
    <div className="container-app py-8 sm:py-10 space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="section-tag">Opportunity Feed</span>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Discover Hackathons
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Only admin-approved live events appear here, synced in real time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setView("grid")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                view === "grid" ? "bg-white text-[#1565D8] shadow-xs" : "text-slate-600"
              }`}
            >
              <LayoutGrid size={14} /> Cards
            </button>
            <button
              type="button"
              onClick={() => setView("calendar")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                view === "calendar" ? "bg-white text-[#1565D8] shadow-xs" : "text-slate-600"
              }`}
            >
              <CalIcon size={14} /> Timeline
            </button>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setMobileFiltersOpen(true)} className="lg:hidden" leftIcon={<SlidersHorizontal size={14} />}>
            Filters
          </Button>
        </div>
      </div>

      {/* Top Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by name, stack (Python, Next.js...), city, or organizer..."
            leftAdornment={<Search size={16} />}
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
          />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value as HackathonSortOption)} className="input sm:w-52">
          <option value="starting_soon">Starting soon</option>
          <option value="ending_soon">Registration closing soon</option>
          <option value="largest_prize">Largest prize pool</option>
          <option value="most_participants">Most participants</option>
          <option value="newest">Newest listed</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 card p-5 sticky top-20">{filterForm}</aside>

        {/* Results */}
        <div className="lg:col-span-9">
          {notConfigured ? (
            <NotConfigured service="Firestore" />
          ) : error ? (
            <ErrorState message={error.message} />
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No matching hackathons"
              description="Adjust your filters or check back soon — or launch your own hackathon in minutes."
              action={
                <div className="flex gap-2.5">
                  <Button variant="secondary" onClick={resetAll}>
                    Clear filters
                  </Button>
                  <Button href="/organizer/create">Host a Hackathon</Button>
                </div>
              }
            />
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4 gap-5">
              {filtered.map((h) => (
                <HackathonCard key={h.id} hackathon={h} bookmarked={bookmarkedIds.has(h.id)} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((h) => (
                <a
                  key={h.id}
                  href={`/hackathons/${h.slug}`}
                  className="card-hover p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-xs font-bold text-[#1565D8]">
                      {formatInZone(toDate(h.startDate), h.eventTimezone)} → {formatInZone(toDate(h.endDate), h.eventTimezone)}
                    </p>
                    <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 mt-0.5">{h.name}</h3>
                    <p className="text-xs text-slate-500 capitalize">
                      {h.mode} {h.city ? `· ${h.city}` : ""} · {computeLiveStatus(h).replace(/_/g, " ")}
                    </p>
                  </div>
                  <span className="btn-secondary btn-sm shrink-0">View details →</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <Sheet open={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)} title="Filter Hackathons">
        {filterForm}
      </Sheet>
    </div>
  );
}
