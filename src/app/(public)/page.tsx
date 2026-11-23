"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { clientDb, firebaseReady } from "@/lib/firebase/client";
import {
  Trophy,
  ArrowRight,
  Sparkles,
  Wifi,
  Search,
  Heart,
  Globe,
  MapPin,
  Calendar,
  ExternalLink,
  ChevronRight,
  Award,
  Users,
  SlidersHorizontal,
  Flame,
} from "lucide-react";
import { TeamFinderSection } from "@/components/home/TeamFinderSection";

// ─── World-Class Organizations & Collaborations (Innovation Hacks) ────────────
const DEFAULT_ORGANIZATIONS = [
  {
    companyName: "Meta",
    logoUrl: "/logos/meta.svg",
    fallbackUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
  },
  {
    companyName: "Microsoft",
    logoUrl: "/logos/microsoft.svg",
    fallbackUrl: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg",
  },
  {
    companyName: "Amazon",
    logoUrl: "/logos/amazon.svg",
    fallbackUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
  },
  {
    companyName: "IBM",
    logoUrl: "/logos/ibm.svg",
    fallbackUrl: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg",
  },
  {
    companyName: "Google",
    logoUrl: "/logos/google.svg",
    fallbackUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
  },
];

const PLATFORM_STATS = [
  { val: "20,000+", label: "Active Builders" },
  { val: "150+", label: "Countries" },
  { val: "1,000+", label: "Projects Shipped" },
  { val: "4.9/5", label: "Community Rating" },
];

// ─── Devpost Hackathons For You (with dynamic tags & prize values) ────────────
const HACKATHONS_FOR_YOU = [
  {
    id: "h1",
    name: "Nebius x NVIDIA Global AI Hackathon",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80",
    daysLeft: 10,
    statusText: "10 days left",
    statusType: "active",
    mode: "Online",
    prize: "$50,000 in prizes",
    participants: 25047,
    slug: "nebius-nvidia-ai-2026",
    host: "Nebius AI & NVIDIA",
    tags: ["ai_ml", "big_prizes", "ending_soon"],
    prizeAmount: 50000,
  },
  {
    id: "h2",
    name: "Build, Ship, Shape: Amazon Developer Hackathon",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80",
    daysLeft: 4,
    statusText: "4 days left",
    statusType: "active",
    mode: "Online",
    prize: "$138,000 in prizes",
    participants: 57263,
    slug: "amazon-developer-hackathon",
    host: "Amazon Web Services",
    tags: ["big_prizes", "ending_soon", "beginner"],
    prizeAmount: 138000,
  },
  {
    id: "h3",
    name: "PayPal AI Hackathon: Innovate Commerce",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&auto=format&fit=crop&q=80",
    daysLeft: 24,
    statusText: "24 days left",
    statusType: "active",
    mode: "Online",
    prize: "$67,500 in prizes",
    participants: 17238,
    slug: "paypal-ai-hackathon",
    host: "PayPal Developer",
    tags: ["ai_ml", "big_prizes"],
    prizeAmount: 67500,
  },
  {
    id: "h4",
    name: "OpenCV AI Competition 2026, powered by AWS",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&auto=format&fit=crop&q=80",
    daysLeft: 7,
    statusText: "7 days left",
    statusType: "active",
    mode: "Online",
    prize: "$20,250 in prizes",
    participants: 5235,
    slug: "opencv-ai-competition-2026",
    host: "OpenCV & AWS",
    tags: ["ai_ml", "ending_soon"],
    prizeAmount: 20250,
  },
  {
    id: "h5",
    name: "India AI Innovation Challenge 2026",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80",
    daysLeft: 8,
    statusText: "8 days left",
    statusType: "active",
    mode: "Online",
    prize: "₹10,00,000 in prizes",
    participants: 4200,
    slug: "india-ai-2026",
    host: "Innovation Hacks",
    tags: ["ai_ml", "ending_soon", "beginner"],
    prizeAmount: 12000,
  },
  {
    id: "h6",
    name: "Web3 Builders Summit: Zero Knowledge Frontiers",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&auto=format&fit=crop&q=80",
    daysLeft: 12,
    statusText: "12 days left",
    statusType: "active",
    mode: "Hybrid · Bangalore",
    prize: "$25,000 in prizes",
    participants: 1800,
    slug: "web3-summit-2026",
    host: "CryptoHub India",
    tags: ["big_prizes", "beginner"],
    prizeAmount: 25000,
  },
];

// ─── Devpost Real 14 Themes ──────────────────────────────────────────────────
const TOP_THEMES = [
  { rank: 1, theme: "Beginner Friendly", count: 103, prize: "$793,000", tag: "beginner" },
  { rank: 2, theme: "Machine Learning/AI", count: 77, prize: "$1,684,000", tag: "ai_ml" },
  { rank: 3, theme: "Open Ended", count: 50, prize: "$679,000", tag: "open_ended" },
  { rank: 4, theme: "Social Good", count: 41, prize: "$232,000", tag: "social_good" },
  { rank: 5, theme: "Education", count: 38, prize: "$338,000", tag: "education" },
  { rank: 6, theme: "Web", count: 26, prize: "$1,104,000", tag: "web" },
  { rank: 7, theme: "Design", count: 17, prize: "$127,000", tag: "design" },
  { rank: 8, theme: "Low/No Code", count: 17, prize: "$87,000", tag: "no_code" },
  { rank: 9, theme: "Health", count: 14, prize: "$13,000", tag: "health" },
  { rank: 10, theme: "Productivity", count: 11, prize: "$204,000", tag: "productivity" },
  { rank: 11, theme: "IoT", count: 10, prize: "$184,000", tag: "iot" },
  { rank: 12, theme: "Cybersecurity", count: 10, prize: "$160,000", tag: "cybersecurity" },
  { rank: 13, theme: "Enterprise", count: 9, prize: "$90,000", tag: "enterprise" },
  { rank: 14, theme: "Databases", count: 9, prize: "$24,000", tag: "databases" },
];

// ─── Featured Online Hackathons (Devpost Blue Banner with Vertical FEATURED Ribbon) ─
const FEATURED_ONLINE_HACKATHONS = [
  {
    id: "fo-1",
    name: "PayPal AI Hackathon: Next-Gen Payments & Agents",
    slug: "paypal-ai-hackathon",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&auto=format&fit=crop&q=80",
    daysLeft: 24,
    statusText: "24 days left",
    isUpcoming: false,
    mode: "Online",
    prize: "$67,500 in prizes",
    participants: 17238,
  },
  {
    id: "fo-2",
    name: "Kiroween 2026: The Global AI Innovation Fest",
    slug: "kiroween-2026",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80",
    daysLeft: 0,
    statusText: "Upcoming",
    isUpcoming: true,
    mode: "Online",
    prize: "$100,000 in prizes",
    participants: 558,
  },
  {
    id: "fo-3",
    name: "Nebius x NVIDIA Global AI Hackathon",
    slug: "nebius-nvidia-ai-2026",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80",
    daysLeft: 10,
    statusText: "10 days left",
    isUpcoming: false,
    mode: "Online",
    prize: "$50,000 in prizes",
    participants: 25047,
  },
  {
    id: "fo-4",
    name: "Global Open Innovation Challenge 2026",
    slug: "global-open-2026",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80",
    daysLeft: 30,
    statusText: "30 days left",
    isUpcoming: false,
    mode: "Online",
    prize: "$50,000 in prizes",
    participants: 12000,
  },
];

// ─── Recent Projects (Devpost Community) ─────────────────────────────────────
const RECENT_PROJECTS = [
  {
    id: "rp-1",
    title: "NeuroPulse — Multimodal ICU Telemetry & Early Alert",
    author: "NeuralSynthetix (IIT Bombay)",
    cover: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&auto=format&fit=crop&q=80",
    tag: "Generative AI",
    award: "Grand Champion Finalist",
    upvotes: 384,
  },
  {
    id: "rp-2",
    title: "AetherShield — Zero-Knowledge Trustless Bridge",
    author: "ZeroState Labs (BITS Pilani)",
    cover: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&auto=format&fit=crop&q=80",
    tag: "Web3 & ZK",
    award: "1st Place Winner ($10,000)",
    upvotes: 512,
  },
  {
    id: "rp-3",
    title: "VocalForge — Multilingual Code Synthesis Engine",
    author: "IndicAI Core (IIIT Hyderabad)",
    cover: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80",
    tag: "Indic LLMs",
    award: "Language Innovation Prize",
    upvotes: 420,
  },
];

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "ending_soon" | "ai_ml" | "big_prizes" | "beginner">("all");
  const [organizations, setOrganizations] = useState(DEFAULT_ORGANIZATIONS);

  useEffect(() => {
    try {
      if (firebaseReady()) {
        const q = query(collection(clientDb(), "collaborations"), orderBy("order", "asc"));
        const unsub = onSnapshot(
          q,
          (snapshot) => {
            const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            if (data.length > 0) {
              setOrganizations(data as unknown as typeof DEFAULT_ORGANIZATIONS);
            }
          },
          () => setOrganizations(DEFAULT_ORGANIZATIONS)
        );
        return () => unsub();
      }
    } catch {
      setOrganizations(DEFAULT_ORGANIZATIONS);
    }
  }, []);

  const marqueeLogos = [
    ...organizations,
    ...organizations,
    ...organizations,
    ...organizations,
  ];

  const filteredHackathons = HACKATHONS_FOR_YOU.filter((h) => {
    if (activeFilter === "all") return true;
    return h.tags?.includes(activeFilter);
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/hackathons?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/hackathons");
    }
  };

  return (
    <div className="bg-white min-h-screen text-slate-800">
      {/* ─────────────────────────────────────────────────────────────
          1. DEVPOST SIGNATURE HERO SECTION
          ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#EFF2F5] border-b border-slate-200 pt-10 sm:pt-14 pb-12 sm:pb-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 z-10">
              <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-slate-900 tracking-tight leading-[1.12]">
                <span className="text-[#1868D8]">HACKSYRA</span> is the home for hackathons
              </h1>
              <p className="text-slate-600 text-base sm:text-lg mt-4 mb-8 leading-relaxed font-normal max-w-lg">
                Where organizations and developers come together to build, inspire, and innovate.
              </p>

              {/* Devpost Dual CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <Link
                  href="/organizer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1868D8] hover:bg-[#0F52B0] text-white font-bold text-sm shadow-sm transition-all whitespace-nowrap active:scale-98"
                >
                  <span>For organizers</span>
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href="/hackathons"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border-2 border-[#1868D8] text-[#1868D8] hover:bg-blue-50/60 font-bold text-sm transition-all whitespace-nowrap active:scale-98"
                >
                  <span>For participants</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Right Illustration Artwork */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[580px] aspect-[16/9] rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border border-slate-200/90 bg-slate-900 group">
                <Image
                  src="/images/hacksyra_hero.jpg"
                  alt="HACKSYRA Hackathon 2026 - Innovation Hacks"
                  fill
                  priority
                  className="object-cover group-hover:scale-102 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. DEVPOST SIGNATURE SEARCH BAR
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-3 sm:px-6 pt-8 sm:pt-10 pb-4 sm:pb-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Find your next hackathon (e.g. AI, Web3, FinTech...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 sm:py-3.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1868D8] focus:ring-2 focus:ring-[#1868D8]/10 transition-all shadow-xs"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 sm:py-3.5 rounded-xl bg-[#1868D8] hover:bg-[#0F52B0] text-white font-bold text-sm whitespace-nowrap shadow-xs transition-colors active:scale-98"
          >
            Search hackathons
          </button>
        </form>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. DEVPOST MAIN 2-COLUMN SECTION: Hackathons for you + Top themes
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Hackathons for you (7 of 12 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-baseline justify-between mb-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Hackathons for you
              </h2>
              <Link
                href="/hackathons"
                className="text-xs font-bold text-[#1868D8] hover:underline flex items-center gap-1 whitespace-nowrap"
              >
                Recommendations <ArrowRight size={13} />
              </Link>
            </div>

            {/* Interactive Live Filter Pills (Swipeable on Mobile) */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 -mx-3 px-3 sm:mx-0 sm:px-0 flex-nowrap sm:flex-wrap">
              {[
                { id: "all", label: "🔥 All (6)" },
                { id: "ending_soon", label: "⚡ Ending Soon (<10d)" },
                { id: "ai_ml", label: "🤖 AI & Machine Learning" },
                { id: "big_prizes", label: "💰 High Stakes (>$25k)" },
                { id: "beginner", label: "🟢 Beginner Friendly" },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setActiveFilter(pill.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${
                    activeFilter === pill.id
                      ? "bg-[#1868D8] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Showing count indicator */}
            <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
              <span>
                Showing <strong>{filteredHackathons.length}</strong> matching competitions
              </span>
              {activeFilter !== "all" && (
                <button
                  type="button"
                  onClick={() => setActiveFilter("all")}
                  className="text-[#1868D8] font-bold hover:underline"
                >
                  Reset filter
                </button>
              )}
            </div>

            <div className="space-y-3 sm:space-y-4">
              {filteredHackathons.map((hackathon) => (
                <Link
                  key={hackathon.id}
                  href={`/hackathons/${hackathon.slug}`}
                  className="flex flex-row items-start sm:items-center gap-3 sm:gap-4 p-3.5 sm:p-5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all relative overflow-hidden group border-l-4 border-l-[#009A76]"
                >
                  {/* Square Thumbnail */}
                  <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-100">
                    <Image
                      src={hackathon.image}
                      alt={hackathon.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-lg leading-snug group-hover:text-[#1868D8] transition-colors line-clamp-2 mb-1.5">
                      {hackathon.name}
                    </h3>

                    {/* Status Pill & Mode */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#009A76] text-white text-[10px] sm:text-xs font-semibold whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        {hackathon.statusText}
                      </span>
                      <span className="text-[11px] sm:text-xs text-slate-600 font-medium flex items-center gap-1 whitespace-nowrap">
                        <Globe size={12} className="text-slate-400" />
                        {hackathon.mode}
                      </span>
                    </div>

                    {/* Prize & Participants */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-600">
                      <span>
                        <strong className="text-slate-900 font-bold text-xs sm:text-base">
                          {hackathon.prize.split(" ")[0]}
                        </strong>{" "}
                        in prizes
                      </span>
                      <span>
                        <strong className="text-slate-900 font-bold text-xs sm:text-base">
                          {hackathon.participants.toLocaleString()}
                        </strong>{" "}
                        participants
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="pt-2 text-center">
              <Link
                href="/hackathons"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-300 hover:border-[#1868D8] text-slate-800 hover:text-[#1868D8] font-bold text-xs uppercase tracking-wider transition-colors"
              >
                <span>Browse all hackathons</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Right Column: Top Hackathon Themes (5 of 12 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
              Top hackathon themes
            </h2>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              {/* Table Header */}
              <div className="grid grid-cols-12 text-xs font-semibold text-slate-500 px-3 py-2.5 sm:px-4 sm:py-3 border-b border-slate-200 bg-slate-50/50">
                <span className="col-span-6">Theme</span>
                <span className="col-span-3 text-center">Hackathons</span>
                <span className="col-span-3 text-right">Total prizes</span>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-slate-100">
                {TOP_THEMES.map((theme) => (
                  <Link
                    key={theme.rank}
                    href={`/hackathons?category=${theme.tag}`}
                    className="grid grid-cols-12 items-center px-3 py-2.5 sm:px-4 sm:py-3 hover:bg-slate-50/80 transition-colors group text-xs"
                  >
                    <div className="col-span-6 flex items-center gap-1.5 sm:gap-2 min-w-0 pr-1">
                      <span className="text-slate-400 font-medium w-3.5 sm:w-4 flex-shrink-0 text-[11px] sm:text-xs">
                        {theme.rank}.
                      </span>
                      <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded bg-[#E8F3FF] text-[#1363DF] font-semibold group-hover:bg-[#1363DF] group-hover:text-white transition-colors truncate text-[11px] sm:text-xs">
                        {theme.theme}
                      </span>
                    </div>

                    <span className="col-span-3 text-center text-slate-700 font-semibold text-[11px] sm:text-xs">
                      {theme.count}
                    </span>

                    <div className="col-span-3 flex items-center justify-end gap-1.5 text-right">
                      <span className="font-semibold text-slate-800 text-[11px] sm:text-xs whitespace-nowrap">
                        {theme.prize}
                      </span>
                      <ArrowRight size={12} className="hidden sm:inline text-slate-300 group-hover:text-[#1363DF] transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. DEVPOST FEATURED ONLINE HACKATHONS (DEEP BLUE BANNER)
          ───────────────────────────────────────────────────────────── */}
      <section className="my-8 sm:my-12 py-10 sm:py-12 bg-gradient-to-r from-[#0C4A6E] via-[#0284C7] to-[#0369A1] text-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Featured online hackathons
              </h2>
              <p className="text-cyan-100 text-xs sm:text-sm mt-1">
                Top high-stake competitions open for global registration right now.
              </p>
            </div>

            <Link
              href="/hackathons?mode=online"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-[#0369A1] hover:bg-cyan-50 font-bold text-xs shadow-sm transition-colors self-start sm:self-auto whitespace-nowrap"
            >
              Explore online hackathons <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {FEATURED_ONLINE_HACKATHONS.map((fo) => (
              <Link
                key={fo.id}
                href={`/hackathons/${fo.slug}`}
                className="bg-white rounded-xl overflow-hidden flex border border-white/20 hover:shadow-xl transition-all duration-300 group text-slate-800"
              >
                {/* Devpost Signature Black Vertical "FEATURED" Ribbon */}
                <div className="w-7 sm:w-8 bg-[#141920] flex items-center justify-center py-3 flex-shrink-0">
                  <span className="text-[9px] sm:text-[10px] font-mono font-black text-white tracking-widest uppercase rotate-180 [writing-mode:vertical-rl]">
                    FEATURED
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-3.5 sm:p-5 flex gap-3 sm:gap-4 flex-1 items-center min-w-0">
                  <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                    <Image
                      src={fo.image}
                      alt={fo.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-xs sm:text-base leading-snug group-hover:text-[#1868D8] transition-colors line-clamp-2 mb-1 sm:mb-2">
                      {fo.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                      {fo.isUpcoming ? (
                        <span className="px-2 py-0.5 rounded-full bg-[#EA580C] text-white text-[10px] sm:text-[11px] font-semibold whitespace-nowrap">
                          ● Upcoming
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-[#009A76] text-white text-[10px] sm:text-[11px] font-semibold whitespace-nowrap">
                          ● {fo.statusText}
                        </span>
                      )}
                      <span className="text-[11px] sm:text-xs text-slate-500 flex items-center gap-1 font-medium whitespace-nowrap">
                        <Globe size={11} className="text-slate-400" />
                        {fo.mode}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] sm:text-xs text-slate-600">
                      <span>
                        <strong className="text-slate-900 font-bold">{fo.prize}</strong>
                      </span>
                      <span>
                        <strong className="text-slate-900 font-bold">{fo.participants.toLocaleString()}</strong> hackers
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          NEW FEATURE 3: BUILDER SPEED SQUAD / TEAMMATE MATCHMAKING HUB
          ───────────────────────────────────────────────────────────── */}
      <TeamFinderSection />

      {/* ─────────────────────────────────────────────────────────────
          5. DEVPOST IN-PERSON HACKATHONS NEARBY
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            In-person hackathons nearby
          </h2>
          <button
            type="button"
            className="text-xs font-bold text-[#1868D8] hover:underline flex items-center gap-1"
          >
            Edit location <ArrowRight size={13} />
          </button>
        </div>

        {/* Devpost Empty State Box */}
        <div className="relative rounded-lg border border-slate-200 bg-slate-50/50 p-12 text-center overflow-hidden">
          {/* Subtle skeleton backdrop */}
          <div className="opacity-40 max-w-2xl mx-auto space-y-4 mb-4 select-none pointer-events-none">
            <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto" />
            <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto" />
          </div>

          <div className="relative z-10 max-w-md mx-auto space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              No hackathons found near you
            </h3>
            <p className="text-xs text-slate-500">
              Try changing your search radius, or browse our hundreds of high-stake online global hackathons.
            </p>
            <div>
              <Link
                href="/hackathons"
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-md bg-[#1868D8] hover:bg-[#0F52B0] text-white text-xs font-bold transition-colors shadow-xs"
              >
                Browse all hackathons
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. WORLD-CLASS ORGANIZATIONS MARQUEE & 4 STATS (Innovation Hacks)
          ───────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white overflow-hidden border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs font-bold uppercase tracking-widest text-[#1565D8] mb-3"
          >
            TRUSTED &amp; USED BY BUILDERS FROM
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="font-display font-extrabold text-slate-900 text-3xl sm:text-4xl mb-4"
          >
            World-Class Organizations
          </motion.h2>
        </div>

        {/* Edge-to-edge masked marquee track */}
        <div
          className="relative overflow-hidden py-4"
          style={{
            maskImage:
              "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
          }}
        >
          <div className="marquee-track flex items-center">
            {marqueeLogos.map((org, index) => (
              <div
                key={`${org.companyName}-${index}`}
                className="flex items-center justify-center h-16 w-32 mx-6 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110 cursor-pointer flex-shrink-0"
              >
                <img
                  src={org.logoUrl}
                  alt={org.companyName}
                  loading="lazy"
                  className="max-h-10 max-w-[100px] object-contain opacity-60 hover:opacity-100 transition-opacity duration-300"
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (org.fallbackUrl && img.src !== org.fallbackUrl) {
                      img.src = org.fallbackUrl;
                    } else {
                      img.style.display = "none";
                      const next = img.nextElementSibling as HTMLElement;
                      if (next) next.style.display = "block";
                    }
                  }}
                />
                <span className="hidden text-sm font-extrabold text-slate-400 uppercase tracking-widest">
                  {org.companyName}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 4-Item Metrics Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto mt-10 sm:mt-14 px-3 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6"
        >
          {PLATFORM_STATS.map((item) => (
            <div
              key={item.label}
              className="bg-slate-50/80 rounded-xl p-3.5 sm:p-5 text-center border border-slate-100 sm:border-0 sm:bg-transparent"
            >
              <div className="font-display font-black text-2xl sm:text-3xl text-slate-900 mb-0.5">
                {item.val}
              </div>
              <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                {item.label}
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. DEVPOST COMMUNITY PROJECTS GALLERY
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Software built by the community
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Inspect working prototypes, AI agents, and tools built during 48-hour tournaments.
            </p>
          </div>
          <Link
            href="/projects"
            className="text-xs font-bold text-[#1868D8] hover:underline flex items-center gap-1"
          >
            View project gallery <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {RECENT_PROJECTS.map((proj) => (
            <div
              key={proj.id}
              className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-all group"
            >
              <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                <Image
                  src={proj.cover}
                  alt={proj.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-xs">
                  <Trophy size={11} /> {proj.award}
                </div>
              </div>

              <div className="p-4 space-y-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#1868D8]">
                  {proj.tag}
                </span>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#1868D8] transition-colors line-clamp-1">
                  {proj.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-1">By {proj.author}</p>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-semibold flex items-center gap-1">
                    <Heart size={13} className="text-red-500 fill-red-500" /> {proj.upvotes}
                  </span>
                  <Link
                    href="/projects"
                    className="text-xs font-bold text-[#1868D8] hover:underline"
                  >
                    View Code &amp; Demo
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. CALL TO ACTION BANNER
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="bg-[#1868D8] rounded-xl p-8 sm:p-12 text-white text-center shadow-md relative overflow-hidden">
          <div className="max-w-2xl mx-auto relative z-10 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Ready to build something world-changing?
            </h2>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Sign up today to discover hackathons, form dream teams, showcase your portfolio, and win career-changing prizes.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-white text-[#1868D8] font-bold text-sm hover:bg-blue-50 transition-colors shadow-xs"
              >
                Join for free →
              </Link>
              <Link
                href="/hackathons"
                className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-sm transition-colors"
              >
                Browse all competitions
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
