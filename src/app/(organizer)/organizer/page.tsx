"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { motion } from "framer-motion";
import {
  Plus, Trophy, Users, BarChart3, CreditCard, ArrowRight,
  Zap, TrendingUp, AlertCircle, CheckCircle2, Eye,
  Clock, Calendar, Award, ExternalLink, Download,
  Sparkles, ShieldCheck
} from "lucide-react";

const STATS = [
  {
    icon: Trophy,
    label: "Active Hackathons",
    value: "3",
    sub: "12 completed in 2026",
    color: "text-[#1565D8]",
    bg: "bg-blue-50 border-blue-100",
  },
  {
    icon: Users,
    label: "Total Builders",
    value: "23,850",
    sub: "+1,420 this week",
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-100",
  },
  {
    icon: CreditCard,
    label: "Prize Distributed",
    value: "₹48.5L",
    sub: "100% verified escrow",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-100",
  },
  {
    icon: TrendingUp,
    label: "Builder Rating",
    value: "4.92 ★",
    sub: "94% submission rate",
    color: "text-purple-600",
    bg: "bg-purple-50 border-purple-100",
  },
];

const ACTIVE_EVENTS = [
  {
    id: "1",
    name: "India AI Innovation Challenge 2026",
    slug: "india-ai-2026",
    status: "Live · Registration Open",
    participants: 4200,
    submissions: 340,
    daysLeft: 8,
    prize: "₹10,00,000",
    mode: "Online",
  },
  {
    id: "2",
    name: "Web3 Builders Summit",
    slug: "web3-summit-2026",
    status: "Upcoming",
    participants: 1800,
    submissions: 85,
    daysLeft: 12,
    prize: "$25,000",
    mode: "Hybrid (Bangalore)",
  },
  {
    id: "3",
    name: "Global Open Innovation Challenge",
    slug: "global-open-2026",
    status: "Open for Entries",
    participants: 12000,
    submissions: 1120,
    daysLeft: 30,
    prize: "$50,000",
    mode: "Online Global",
  },
];

export default function OrganizerPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner (Unstop / Devpost Organizer Style) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1565D8] text-xs font-bold border border-blue-100 flex items-center gap-1">
              <Sparkles size={12} />
              Innovation Hacks Organizer Console
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
            Welcome back, Innovation Hacks HQ 👋
          </h1>
          <p className="text-slate-600 text-sm mt-1.5 max-w-2xl">
            Monitor registration velocity, review code submissions, manage mentors and judges, and generate verifiable digital certificates.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">
          <Link
            href="/organizer/create"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1565D8] hover:bg-[#0F52B0] text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow transition-all duration-200 active:scale-95"
          >
            <Plus size={16} />
            Create Hackathon
          </Link>
          <Link
            href="/hackathons"
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm transition-colors"
          >
            <span>Live Site</span>
            <ExternalLink size={14} className="text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Key Metric Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {stat.label}
              </span>
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center border`}>
                <stat.icon size={18} className={stat.color} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-display font-black text-slate-900">
              {stat.value}
            </p>
            <p className="text-xs text-slate-500 mt-1">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Active Hackathons Management Section (Devpost Style) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-display font-bold text-slate-900 flex items-center gap-2">
              <Trophy size={18} className="text-[#1565D8]" />
              Active Competitions
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live registration metrics and project submission checkpoints.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/organizer/events"
              className="text-xs font-semibold text-[#1565D8] hover:underline"
            >
              View All (15) →
            </Link>
          </div>
        </div>

        {/* Competitions Table / Cards */}
        <div className="space-y-3">
          {ACTIVE_EVENTS.map((event) => (
            <div
              key={event.id}
              className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-[#1565D8]/40 hover:bg-blue-50/20 transition-all gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    {event.status}
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-500">{event.mode}</span>
                </div>
                <Link
                  href={`/hackathons/${event.slug}`}
                  className="font-display font-bold text-slate-900 text-base hover:text-[#1565D8] transition-colors"
                >
                  {event.name}
                </Link>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                  <span>Prize: <strong className="text-slate-800">{event.prize}</strong></span>
                  <span>·</span>
                  <span>{event.participants.toLocaleString()} registered</span>
                  <span>·</span>
                  <span>{event.submissions} submissions</span>
                  <span>·</span>
                  <span className="text-orange-600 font-semibold">{event.daysLeft} days left</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href={`/hackathons/${event.slug}`}
                  target="_blank"
                  className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  <Eye size={13} />
                  <span>Preview</span>
                </Link>
                <Link
                  href={`/organizer/participants`}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#1565D8] text-white text-xs font-semibold hover:bg-[#0F52B0] transition-colors"
                >
                  <Users size={13} />
                  <span>Manage</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Grid: Checklist & Quick Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organizer Quick Tools */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
          <h3 className="font-display font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
            <Zap size={18} className="text-[#1565D8]" />
            Organizer Toolkit
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { title: "Review Submissions", desc: "Grade and score submissions against rubrics", href: "/organizer/participants", icon: Award },
              { title: "Issue Certificates", desc: "1-click verifiable credentials for teams", href: "/organizer/certificates", icon: ShieldCheck },
              { title: "Financial Reports", desc: "Ticket sales, sponsorships & payouts", href: "/organizer/payments", icon: CreditCard },
              { title: "Export Data", desc: "Download CSV rosters and contact list", href: "/organizer/analytics", icon: Download },
            ].map((tool, i) => (
              <Link
                key={i}
                href={tool.href}
                className="p-4 rounded-xl border border-slate-200 hover:border-[#1565D8]/50 hover:bg-blue-50/20 transition-all text-left flex flex-col justify-between group"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1565D8] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <tool.icon size={16} />
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-[#1565D8] transition-colors">
                    {tool.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    {tool.desc}
                  </p>
                </div>
                <div className="mt-3 flex items-center text-[11px] font-semibold text-[#1565D8]">
                  Open <ArrowRight size={11} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Hackathon Launch Guide Checklist */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
          <h3 className="font-display font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600" />
            Hackathon Host Checklist
          </h3>
          <div className="space-y-2.5 text-xs">
            {[
              { task: "Define challenge problem statements & tracks", done: true },
              { task: "Set up prize pool breakdown & sponsor tiers", done: true },
              { task: "Publish landing page on HACKSYRA discovery feed", done: true },
              { task: "Assign judging panel & evaluation rubrics", done: false },
              { task: "Connect Razorpay webhook for ticket confirmations", done: false },
              { task: "Prepare automated digital certificate templates", done: false },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-xl border ${
                  item.done
                    ? "bg-emerald-50/50 border-emerald-200/60 text-slate-800"
                    : "bg-slate-50/50 border-slate-200 text-slate-600"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                    item.done
                      ? "bg-emerald-600 text-white"
                      : "border-2 border-slate-300 bg-white"
                  }`}
                >
                  {item.done && <CheckCircle2 size={12} className="stroke-[3]" />}
                </div>
                <span className={item.done ? "font-semibold" : ""}>{item.task}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
