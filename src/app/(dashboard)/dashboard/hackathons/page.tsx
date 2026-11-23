"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Trophy, Plus, Calendar, Users, ArrowRight, ExternalLink,
  Clock, CheckCircle2, AlertCircle, FileText, Sparkles
} from "lucide-react";

interface RegisteredHackathon {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  status: "live" | "upcoming" | "completed";
  mode: string;
  dates: string;
  team: string;
  track: string;
  prizePool: string;
  ticketId: string;
  outcome?: string;
}

const DEMO_REGISTERED: RegisteredHackathon[] = [
  {
    id: "h1",
    name: "India AI Innovation Challenge 2026",
    slug: "india-ai-2026",
    tagline: "Build the future of AI — in 48 hours.",
    status: "upcoming",
    mode: "Online (Global)",
    dates: "Nov 15 - 17, 2026",
    team: "NeuralSynthetix (3/4)",
    track: "Generative AI & LLMs",
    prizePool: "₹10,00,000",
    ticketId: "#HACK-8849",
  },
  {
    id: "h2",
    name: "Autonomous Web3 & Zero-Knowledge Sprint",
    slug: "web3-zk-sprint",
    tagline: "Scaling privacy-preserving systems on Ethereum L2s.",
    status: "completed",
    mode: "Hybrid (Bengaluru)",
    dates: "Sep 28 - 30, 2026",
    team: "ZeroState Labs (4/4)",
    track: "Privacy & Scalability",
    prizePool: "₹6,00,000",
    ticketId: "#HACK-3102",
    outcome: "🏆 1st Place Grand Champion (₹3,00,000)",
  },
  {
    id: "h3",
    name: "CleanTech & Smart Mobility Hackathon",
    slug: "cleantech-mobility-2026",
    tagline: "Innovate for sustainable transportation and energy grids.",
    status: "completed",
    mode: "In-Person (Delhi)",
    dates: "Aug 20 - 22, 2026",
    team: "EcoGrid",
    track: "Renewable Systems",
    prizePool: "₹8,00,000",
    ticketId: "#HACK-1940",
    outcome: "⭐ Top 5 National Finalist",
  },
];

export default function MyHackathonsPage() {
  const [tab, setTab] = useState<"all" | "active" | "completed">("all");

  const filtered = DEMO_REGISTERED.filter((h) => {
    if (tab === "active") return h.status === "upcoming" || h.status === "live";
    if (tab === "completed") return h.status === "completed";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display">My Registered Hackathons</h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Track live tournaments, manage team submissions, and access your event badges.
          </p>
        </div>

        <Link
          href="/hackathons"
          className="btn-primary inline-flex items-center gap-2 self-start sm:self-auto text-xs"
        >
          <Plus className="w-4 h-4" /> Discover More Hackathons
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/8 pb-3 text-xs">
        {[
          { key: "all", label: "All Tournaments" },
          { key: "active", label: "Active & Upcoming" },
          { key: "completed", label: "Completed" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              tab === t.key
                ? "bg-violet-500 text-white shadow-violet"
                : "text-text-secondary hover:text-white hover:bg-white/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Hackathons List */}
      <div className="space-y-4">
        {filtered.map((hack) => (
          <div
            key={hack.id}
            className="card p-6 rounded-3xl border border-white/10 hover:border-violet-500/30 transition-all duration-200 space-y-4"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/8">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      hack.status === "upcoming"
                        ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                        : hack.status === "live"
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-white/10 text-text-secondary"
                    }`}
                  >
                    {hack.status === "upcoming" ? "Starts Soon" : hack.status}
                  </span>
                  <span className="text-xs text-text-secondary">{hack.dates}</span>
                  <span className="text-xs text-text-secondary">• {hack.mode}</span>
                  <span className="text-xs font-mono text-aqua-400">{hack.ticketId}</span>
                </div>

                <h3 className="text-xl font-bold text-white hover:text-violet-400 transition-colors">
                  {hack.name}
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">{hack.tagline}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/hackathons/${hack.slug}`}
                  className="btn-secondary text-xs"
                >
                  View Details
                </Link>
                {hack.status !== "completed" ? (
                  <Link
                    href={`/dashboard/submissions`}
                    className="btn-primary text-xs"
                  >
                    Submit Project <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                ) : (
                  <Link
                    href={`/dashboard/certificates`}
                    className="btn-primary text-xs bg-amber/20 hover:bg-amber/30 text-amber border border-amber/30"
                  >
                    View Certificate
                  </Link>
                )}
              </div>
            </div>

            {/* Event attributes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-text-secondary uppercase block">Team</span>
                <span className="font-semibold text-white">{hack.team}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-secondary uppercase block">Chosen Track</span>
                <span className="font-semibold text-aqua-400">{hack.track}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-secondary uppercase block">Prize Pool</span>
                <span className="font-semibold text-amber">{hack.prizePool}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-secondary uppercase block">Status</span>
                <span className="font-semibold text-text-secondary">
                  {hack.outcome || "Registered & Verified"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
