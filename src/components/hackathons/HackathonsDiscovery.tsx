"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Search, SlidersHorizontal, Grid3X3, List,
  Trophy, Users, Calendar, Clock, Wifi, Building,
  Layers, CheckCircle2, Bookmark, ArrowRight, X,
  Star, Sparkles, MapPin,
} from "lucide-react";
import { format } from "date-fns";

// Extended demo hackathon data
const ALL_HACKATHONS = [
  { id: "1", name: "India AI Innovation Challenge 2026", slug: "india-ai-2026", organizer: "Innovation Hacks", organizerVerified: true, mode: "online" as const, coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80", tags: ["AI/ML", "Python", "Deep Learning"], prizePool: "₹10,00,000", prizeNumeric: 1000000, isFree: false, ticketPrice: "₹499", currency: "INR", participants: 4200, teamSize: "2-5", status: "registration_open", registrationDeadline: new Date(Date.now() + 8 * 86400000), startDate: new Date(Date.now() + 15 * 86400000), endDate: new Date(Date.now() + 17 * 86400000), featured: true, category: "ai_ml", difficulty: "intermediate" },
  { id: "2", name: "Web3 Builders Summit", slug: "web3-summit-2026", organizer: "CryptoHub India", organizerVerified: true, mode: "hybrid" as const, location: "Bangalore, India", coverImage: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=80", tags: ["Solidity", "DeFi", "NFT", "Web3"], prizePool: "$25,000", prizeNumeric: 2500000, isFree: false, ticketPrice: "$49", currency: "USD", participants: 1800, teamSize: "1-4", status: "registration_open", registrationDeadline: new Date(Date.now() + 12 * 86400000), startDate: new Date(Date.now() + 22 * 86400000), endDate: new Date(Date.now() + 24 * 86400000), featured: true, category: "web3", difficulty: "advanced" },
  { id: "3", name: "Student Hack: Open Innovation", slug: "student-hack-2026", organizer: "IIT Delhi Innovation Cell", organizerVerified: true, mode: "online" as const, coverImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80", tags: ["Open Innovation", "Any Stack"], prizePool: "₹2,00,000", prizeNumeric: 200000, isFree: true, currency: "INR", participants: 6800, teamSize: "2-6", status: "registration_open", registrationDeadline: new Date(Date.now() + 5 * 86400000), startDate: new Date(Date.now() + 10 * 86400000), endDate: new Date(Date.now() + 12 * 86400000), featured: false, category: "open_innovation", difficulty: "beginner", studentsOnly: true, beginnerFriendly: true },
  { id: "4", name: "FinTech Disrupt 2026", slug: "fintech-disrupt-2026", organizer: "Razorpay & HSBC", organizerVerified: true, mode: "offline" as const, location: "Mumbai, India", coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80", tags: ["FinTech", "Payments", "Banking API"], prizePool: "₹15,00,000", prizeNumeric: 1500000, isFree: false, ticketPrice: "₹999", currency: "INR", participants: 950, teamSize: "2-4", status: "registration_open", registrationDeadline: new Date(Date.now() + 18 * 86400000), startDate: new Date(Date.now() + 30 * 86400000), endDate: new Date(Date.now() + 32 * 86400000), featured: true, category: "fintech", difficulty: "advanced" },
  { id: "5", name: "Climate Tech Hackathon", slug: "climate-tech-2026", organizer: "GreenFuture Foundation", organizerVerified: false, mode: "online" as const, coverImage: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80", tags: ["ClimaTech", "Sustainability", "IoT"], prizePool: "$8,000", prizeNumeric: 800000, isFree: true, currency: "USD", participants: 2300, teamSize: "1-5", status: "registration_open", registrationDeadline: new Date(Date.now() + 3 * 86400000), startDate: new Date(Date.now() + 7 * 86400000), endDate: new Date(Date.now() + 9 * 86400000), featured: false, category: "sustainability", difficulty: "intermediate", closingSoon: true },
  { id: "6", name: "Healthcare Innovation Sprint", slug: "healthcare-sprint-2026", organizer: "MedTech Alliance", organizerVerified: true, mode: "hybrid" as const, location: "Hyderabad, India", coverImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&auto=format&fit=crop&q=80", tags: ["HealthTech", "AI", "Mobile"], prizePool: "$12,000", prizeNumeric: 1200000, isFree: false, ticketPrice: "$29", currency: "USD", participants: 1400, teamSize: "2-5", status: "registration_open", registrationDeadline: new Date(Date.now() + 20 * 86400000), startDate: new Date(Date.now() + 28 * 86400000), endDate: new Date(Date.now() + 30 * 86400000), featured: false, category: "healthtech", difficulty: "intermediate" },
  { id: "7", name: "Cybersecurity Challenge India", slug: "cybersec-2026", organizer: "CERT-In", organizerVerified: true, mode: "online" as const, coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80", tags: ["Cybersecurity", "CTF", "Ethical Hacking"], prizePool: "₹5,00,000", prizeNumeric: 500000, isFree: true, currency: "INR", participants: 3400, teamSize: "1-4", status: "registration_open", registrationDeadline: new Date(Date.now() + 25 * 86400000), startDate: new Date(Date.now() + 35 * 86400000), endDate: new Date(Date.now() + 37 * 86400000), featured: false, category: "cybersecurity", difficulty: "advanced" },
  { id: "8", name: "EdTech Builders Cup", slug: "edtech-cup-2026", organizer: "BYJU's Innovation Lab", organizerVerified: true, mode: "online" as const, coverImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80", tags: ["EdTech", "React", "LLM"], prizePool: "₹8,00,000", prizeNumeric: 800000, isFree: false, ticketPrice: "₹299", currency: "INR", participants: 2100, teamSize: "2-5", status: "registration_open", registrationDeadline: new Date(Date.now() + 14 * 86400000), startDate: new Date(Date.now() + 21 * 86400000), endDate: new Date(Date.now() + 23 * 86400000), featured: false, category: "edtech", difficulty: "intermediate", beginnerFriendly: true },
  { id: "9", name: "Global Open Innovation Challenge", slug: "global-open-2026", organizer: "Innovation Hacks", organizerVerified: true, mode: "online" as const, coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80", tags: ["Any Theme", "Global", "Open Source"], prizePool: "$50,000", prizeNumeric: 5000000, isFree: true, currency: "USD", participants: 12000, teamSize: "1-6", status: "registration_open", registrationDeadline: new Date(Date.now() + 30 * 86400000), startDate: new Date(Date.now() + 45 * 86400000), endDate: new Date(Date.now() + 48 * 86400000), featured: true, category: "open_innovation", difficulty: "open" },
  { id: "10", name: "IoT & Embedded Systems Hack", slug: "iot-hack-2026", organizer: "Texas Instruments India", organizerVerified: true, mode: "hybrid" as const, location: "Chennai, India", coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80", tags: ["IoT", "Embedded", "C++", "RTOS"], prizePool: "₹6,00,000", prizeNumeric: 600000, isFree: false, ticketPrice: "₹499", currency: "INR", participants: 780, teamSize: "2-4", status: "registration_open", registrationDeadline: new Date(Date.now() + 22 * 86400000), startDate: new Date(Date.now() + 32 * 86400000), endDate: new Date(Date.now() + 34 * 86400000), featured: false, category: "other", difficulty: "advanced" },
];

const CATEGORIES = [
  { value: "ai_ml", label: "AI & ML" },
  { value: "web3", label: "Web3" },
  { value: "fintech", label: "FinTech" },
  { value: "healthtech", label: "HealthTech" },
  { value: "edtech", label: "EdTech" },
  { value: "sustainability", label: "Climate Tech" },
  { value: "cybersecurity", label: "Cybersecurity" },
  { value: "open_innovation", label: "Open Innovation" },
  { value: "other", label: "Other" },
];

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "starting_soon", label: "Starting Soon" },
  { value: "ending_soon", label: "Closing Soon" },
  { value: "most_participants", label: "Most Popular" },
  { value: "largest_prize", label: "Largest Prize" },
];

const MODE_ICONS = { online: Wifi, offline: Building, hybrid: Layers };
const MODE_LABELS = { online: "Online", offline: "In-Person", hybrid: "Hybrid" };

// ─── Hackathon Grid Card (Devpost-style) ──────────────────────────────────────
function HackathonGridCard({ h }: { h: (typeof ALL_HACKATHONS)[number] }) {
  const ModeIcon = MODE_ICONS[h.mode];
  const days = Math.ceil((h.registrationDeadline.getTime() - Date.now()) / 86400000);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-[#1565D8]/30 hover:-translate-y-1 transition-all duration-300 flex flex-col group"
    >
      {/* Cover */}
      <div className="relative h-40 overflow-hidden">
        <Image
          src={h.coverImage}
          alt={h.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width:768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          {h.featured && (
            <span className="px-2 py-0.5 rounded-full bg-[#1565D8] text-white text-[10px] font-bold">
              ⭐ Featured
            </span>
          )}
          {(h as any).closingSoon && (
            <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-bold">
              🔥 Closing Soon
            </span>
          )}
          {(h as any).beginnerFriendly && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
              ✨ Beginner
            </span>
          )}
        </div>

        {/* Bookmark */}
        <button
          onClick={(e) => e.preventDefault()}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-500 hover:text-amber-500 hover:bg-white transition-all duration-200"
          aria-label="Bookmark"
        >
          <Bookmark size={14} />
        </button>

        {/* Mode pill at bottom */}
        <div className="absolute bottom-3 left-3">
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium">
            <ModeIcon size={10} />
            {MODE_LABELS[h.mode]}
            {h.location && ` · ${h.location}`}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1 mb-1.5">
          <span className="text-xs text-slate-500 truncate">{h.organizer}</span>
          {h.organizerVerified && (
            <CheckCircle2 size={11} className="text-[#0EA5E9] fill-[#0EA5E9] flex-shrink-0" />
          )}
        </div>

        <Link href={`/hackathons/${h.slug}`} className="group/link mb-2">
          <h3 className="font-display font-bold text-slate-900 text-sm leading-snug group-hover/link:text-[#1565D8] transition-colors line-clamp-2">
            {h.name}
          </h3>
        </Link>

        <div className="flex flex-wrap gap-1 mb-3">
          {h.tags.slice(0, 3).map((t) => (
            <span key={t} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">
              {t}
            </span>
          ))}
        </div>

        <div className="border-t border-slate-100 my-2" />

        <div className="flex items-center justify-between mb-3">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
            <Trophy size={10} />
            {h.prizePool}
          </span>
          {h.isFree ? (
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              Free
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
              From {h.ticketPrice}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1 text-xs text-slate-500 mb-3">
          <span className="flex items-center gap-1.5">
            <Users size={11} className="text-slate-400" />
            {h.participants.toLocaleString()} participants · Teams: {h.teamSize}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={11} className="text-slate-400" />
            {format(h.startDate, "MMM d")} – {format(h.endDate, "MMM d, yyyy")}
          </span>
          <span className={`flex items-center gap-1.5 font-medium ${days <= 3 ? "text-red-500" : "text-orange-500"}`}>
            <Clock size={11} />
            Reg. closes in {days} day{days !== 1 ? "s" : ""}
          </span>
        </div>

        <Link
          href={`/hackathons/${h.slug}`}
          className="mt-auto flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-[#1565D8] text-white text-xs font-semibold hover:bg-[#0F52B0] transition-all duration-200 shadow-sm"
        >
          View Details <ArrowRight size={13} />
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Hackathon List Card (Devpost-style row) ──────────────────────────────────
function HackathonListCard({ h }: { h: (typeof ALL_HACKATHONS)[number] }) {
  const ModeIcon = MODE_ICONS[h.mode];
  const days = Math.ceil((h.registrationDeadline.getTime() - Date.now()) / 86400000);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-[#1565D8]/30 hover:-translate-y-0.5 transition-all duration-200 flex gap-4 p-4 group"
    >
      <div className="relative w-28 h-20 rounded-xl overflow-hidden flex-shrink-0">
        <Image
          src={h.coverImage}
          alt={h.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="112px"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs text-slate-500">{h.organizer}</span>
              {h.organizerVerified && <CheckCircle2 size={10} className="text-[#0EA5E9]" />}
              {h.featured && (
                <span className="px-1.5 py-0.5 rounded-md bg-[#1565D8]/10 text-[#1565D8] text-[9px] font-bold">Featured</span>
              )}
            </div>
            <Link href={`/hackathons/${h.slug}`}>
              <h3 className="font-display font-bold text-slate-900 text-sm hover:text-[#1565D8] transition-colors line-clamp-1">{h.name}</h3>
            </Link>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {h.tags.slice(0, 4).map((t) => (
                <span key={t} className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[9px]">{t}</span>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
              <Trophy size={11} /> {h.prizePool}
            </span>
            {h.isFree ? (
              <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">Free</span>
            ) : (
              <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-semibold">{h.ticketPrice}</span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
          <span className="flex items-center gap-1"><Users size={10} />{h.participants.toLocaleString()}</span>
          <span className="flex items-center gap-1"><ModeIcon size={10} />{MODE_LABELS[h.mode]}</span>
          <span className="flex items-center gap-1"><Calendar size={10} />{format(h.startDate, "MMM d, yyyy")}</span>
          <span className={`flex items-center gap-1 font-medium ${days <= 3 ? "text-red-500" : "text-orange-500"}`}>
            <Clock size={10} />{days}d left
          </span>
        </div>
      </div>
      <Link
        href={`/hackathons/${h.slug}`}
        className="hidden md:flex items-center gap-1 self-center px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:border-[#1565D8] hover:text-[#1565D8] hover:bg-[#EEF4FF] transition-all duration-200 flex-shrink-0 whitespace-nowrap"
      >
        View Details <ArrowRight size={12} />
      </Link>
    </motion.div>
  );
}

// ─── Main Discovery Component ─────────────────────────────────────────────────
export function HackathonsDiscovery() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("");
  const [isFree, setIsFree] = useState<boolean | null>(null);
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("recommended");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = ALL_HACKATHONS.filter((h) => {
    if (query && !h.name.toLowerCase().includes(query.toLowerCase()) && !h.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))) return false;
    if (mode && h.mode !== mode) return false;
    if (isFree !== null && h.isFree !== isFree) return false;
    if (category && h.category !== category) return false;
    return true;
  }).sort((a, b) => {
    if (sort === "largest_prize") return b.prizeNumeric - a.prizeNumeric;
    if (sort === "most_participants") return b.participants - a.participants;
    if (sort === "starting_soon") return a.startDate.getTime() - b.startDate.getTime();
    if (sort === "ending_soon") return a.registrationDeadline.getTime() - b.registrationDeadline.getTime();
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });

  const activeFiltersCount = [mode, isFree !== null, category].filter(Boolean).length;

  function clearFilters() {
    setMode(""); setIsFree(null); setCategory("");
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#EEF4FF] to-white border-b border-slate-200 pt-8 pb-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-5">
            <h1 className="text-3xl font-display font-bold text-slate-900 mb-1">Discover Hackathons</h1>
            <p className="text-slate-500 text-sm">Find your next challenge — from local events to global competitions.</p>
          </div>

          {/* Search + controls */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[240px] relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search hackathons, technologies, organizers..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1565D8] focus:ring-2 focus:ring-[#1565D8]/10 transition-all"
                id="hackathon-search-input"
              />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              id="filter-toggle-btn"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${showFilters || activeFiltersCount > 0 ? "border-[#1565D8] text-[#1565D8] bg-[#EEF4FF]" : "border-slate-300 text-slate-700 bg-white hover:border-slate-400"}`}
            >
              <SlidersHorizontal size={15} />
              Filters
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#1565D8] text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-700 focus:outline-none focus:border-[#1565D8] transition-all"
              id="sort-select"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <div className="flex gap-1 bg-white rounded-xl p-1 border border-slate-200">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-[#1565D8] text-white" : "text-slate-500 hover:text-slate-700"}`}
                aria-label="Grid view"
              >
                <Grid3X3 size={15} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-[#1565D8] text-white" : "text-slate-500 hover:text-slate-700"}`}
                aria-label="List view"
              >
                <List size={15} />
              </button>
            </div>
          </div>

          {/* Filter panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-5 flex flex-wrap gap-6 bg-white rounded-2xl border border-slate-200 p-5 mt-4">
                  {/* Format */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Format</p>
                    <div className="flex gap-2">
                      {[{ v: "", l: "All" }, { v: "online", l: "Online" }, { v: "offline", l: "In-Person" }, { v: "hybrid", l: "Hybrid" }].map((opt) => (
                        <button
                          key={opt.v}
                          onClick={() => setMode(opt.v)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${mode === opt.v ? "bg-[#1565D8] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                        >
                          {opt.l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cost */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Cost</p>
                    <div className="flex gap-2">
                      {[{ v: null, l: "All" }, { v: true, l: "Free" }, { v: false, l: "Paid" }].map((opt) => (
                        <button
                          key={String(opt.v)}
                          onClick={() => setIsFree(opt.v)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isFree === opt.v ? "bg-[#1565D8] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                        >
                          {opt.l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category */}
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Category</p>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setCategory("")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!category ? "bg-[#1565D8] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                        All
                      </button>
                      {CATEGORIES.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => setCategory(c.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${category === c.value ? "bg-[#1565D8] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {activeFiltersCount > 0 && (
                    <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 self-end mb-0.5">
                      <X size={13} /> Clear filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Active filter chips */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {mode && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#EEF4FF] text-[#1565D8] text-xs font-semibold border border-[#1565D8]/25">
                {mode} <button onClick={() => setMode("")}><X size={11} /></button>
              </span>
            )}
            {isFree !== null && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#EEF4FF] text-[#1565D8] text-xs font-semibold border border-[#1565D8]/25">
                {isFree ? "Free" : "Paid"} <button onClick={() => setIsFree(null)}><X size={11} /></button>
              </span>
            )}
            {category && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#EEF4FF] text-[#1565D8] text-xs font-semibold border border-[#1565D8]/25">
                {CATEGORIES.find((c) => c.value === category)?.label} <button onClick={() => setCategory("")}><X size={11} /></button>
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-slate-500">
            <span className="text-slate-900 font-bold">{filtered.length}</span> hackathon{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Search size={40} className="text-slate-300 mx-auto mb-4" />
            <h3 className="font-display font-bold text-slate-800 text-lg mb-2">No hackathons found</h3>
            <p className="text-slate-500 text-sm mb-6">Try adjusting your filters or search terms.</p>
            <button onClick={clearFilters} className="px-5 py-2.5 rounded-xl bg-[#1565D8] text-white text-sm font-semibold hover:bg-[#0F52B0] transition-colors">
              Clear Filters
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className={viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
              : "flex flex-col gap-4"
            }
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((h) =>
                viewMode === "grid"
                  ? <HackathonGridCard key={h.id} h={h} />
                  : <HackathonListCard key={h.id} h={h} />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
