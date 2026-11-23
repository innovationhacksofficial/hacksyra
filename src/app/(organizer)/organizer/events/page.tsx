"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Trophy, Plus, Search, Filter, Calendar, Users, FileText,
  CheckCircle2, Clock, AlertCircle, ArrowRight, ExternalLink, Settings,
  Eye, Sparkles
} from "lucide-react";

interface HostedEvent {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  status: "published" | "active" | "judging" | "completed";
  mode: string;
  startDate: string;
  registrations: number;
  teams: number;
  submissions: number;
  prizePool: string;
}

const DEMO_EVENTS: HostedEvent[] = [
  {
    id: "1",
    name: "India AI Innovation Challenge 2026",
    slug: "india-ai-2026",
    tagline: "Build the future of Autonomous Intelligence — in 48 hours.",
    status: "active",
    mode: "Online (Global)",
    startDate: "Nov 15, 2026",
    registrations: 4200,
    teams: 980,
    submissions: 340,
    prizePool: "₹10,00,000",
  },
  {
    id: "2",
    name: "Web3 Builders Summit",
    slug: "web3-summit-2026",
    tagline: "Scaling privacy-preserving systems on Ethereum L2s.",
    status: "judging",
    mode: "Hybrid (Bengaluru)",
    startDate: "Oct 10, 2026",
    registrations: 1850,
    teams: 410,
    submissions: 195,
    prizePool: "$25,000",
  },
  {
    id: "3",
    name: "Global Open Innovation Challenge",
    slug: "global-open-2026",
    tagline: "Build without limits. The world's largest open challenge.",
    status: "active",
    mode: "Online Global",
    startDate: "Dec 01, 2026",
    registrations: 12000,
    teams: 2450,
    submissions: 1120,
    prizePool: "$50,000",
  },
  {
    id: "4",
    name: "CleanTech & Smart Mobility Hackathon",
    slug: "cleantech-mobility-2026",
    tagline: "Innovate for sustainable transportation and energy grids.",
    status: "completed",
    mode: "In-Person (Delhi)",
    startDate: "Aug 20, 2026",
    registrations: 2400,
    teams: 520,
    submissions: 310,
    prizePool: "₹8,00,000",
  },
];

export default function MyEventsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filtered = DEMO_EVENTS.filter((e) => {
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    const matchesSearch =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
            My Hosted Hackathons
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Oversee registrations, manage live timeline phases, coordinate judging, and announce winners.
          </p>
        </div>
        <Link
          href="/organizer/create"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1565D8] hover:bg-[#0F52B0] text-white font-bold text-xs sm:text-sm shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus size={16} /> Create Hackathon
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {["all", "active", "judging", "completed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                statusFilter === tab
                  ? "bg-[#1565D8] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {tab === "all" ? "All Hackathons" : tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1565D8] focus:bg-white"
          />
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filtered.map((event) => (
          <div
            key={event.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-[#1565D8]/50 shadow-sm transition-all duration-200"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                      event.status === "active"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : event.status === "judging"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {event.status === "active" ? "● Live / Hacking" : event.status}
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-500 font-medium">{event.mode}</span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-500">Starts {event.startDate}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 hover:text-[#1565D8] transition-colors">
                  {event.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{event.tagline}</p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/hackathons/${event.slug}`}
                  target="_blank"
                  className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                  title="View Public Event Page"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </Link>
                <Link
                  href={`/organizer/participants`}
                  className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                >
                  Manage
                </Link>
                <Link
                  href={`/organizer/create`}
                  className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-[#1565D8] hover:bg-[#0F52B0] text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Edit Event
                </Link>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1565D8]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Registrations</span>
                  <p className="text-base font-bold text-slate-900">{event.registrations.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Teams Formed</span>
                  <p className="text-base font-bold text-slate-900">{event.teams.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Submissions</span>
                  <p className="text-base font-bold text-slate-900">{event.submissions.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Prize Bounty</span>
                  <p className="text-base font-bold text-amber-700">{event.prizePool}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
