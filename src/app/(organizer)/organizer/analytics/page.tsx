"use client";

import {
  TrendingUp, Users, Eye, FileText, Globe, Award,
  ArrowUpRight, BarChart3, PieChart, Activity, Sparkles
} from "lucide-react";

export default function OrganizerAnalyticsPage() {
  const metrics = [
    { label: "Total Page Views", value: "48,250", change: "+34% this week", icon: Eye, color: "text-[#1565D8]", bg: "bg-blue-50 border-blue-100" },
    { label: "Registrations", value: "4,200", change: "+18% vs avg", icon: Users, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
    { label: "Teams Formed", value: "980", change: "82% formation rate", icon: Activity, color: "text-purple-600", bg: "bg-purple-50 border-purple-100" },
    { label: "Final Submissions", value: "340", change: "34.7% conversion", icon: FileText, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
  ];

  const tracksDistribution = [
    { name: "Generative AI & LLMs", percent: 42, count: "1,764 builders" },
    { name: "Computer Vision & Robotics", percent: 24, count: "1,008 builders" },
    { name: "AI for Good & Healthcare", percent: 20, count: "840 builders" },
    { name: "NLP & Multimodal Systems", percent: 14, count: "588 builders" },
  ];

  const institutions = [
    { name: "Indian Institute of Technology (IITs)", count: 940, percent: 22 },
    { name: "BITS Pilani (Pilani, Goa, Hyd)", count: 680, percent: 16 },
    { name: "National Institutes of Tech (NITs)", count: 620, percent: 15 },
    { name: "IIITs & Premier State Tech", count: 540, percent: 13 },
    { name: "International Universities", count: 480, percent: 11 },
    { name: "Working Developers & Researchers", count: 940, percent: 23 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
          Analytics &amp; Demographics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Real-time performance metrics, audience demographics, and conversion funnels.
        </p>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{m.label}</span>
                <div className={`p-2 rounded-xl border ${m.bg}`}>
                  <Icon className={`w-4 h-4 ${m.color}`} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-display font-black text-slate-900">{m.value}</div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1.5">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{m.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2 Column Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Track Selection Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#1565D8]" />
              Track Participation Breakdown
            </h3>
            <span className="text-xs font-semibold text-slate-500">4,200 Total</span>
          </div>

          <div className="space-y-3.5 pt-2">
            {tracksDistribution.map((t) => (
              <div key={t.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{t.name}</span>
                  <span className="font-bold text-slate-600">
                    {t.percent}% ({t.count})
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#1565D8] to-[#0EA5E9] rounded-full"
                    style={{ width: `${t.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Institution / Background Representation */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              Audience Origin &amp; Colleges
            </h3>
            <span className="text-xs font-semibold text-slate-500">Global Coverage</span>
          </div>

          <div className="space-y-3 pt-2">
            {institutions.map((inst) => (
              <div key={inst.name} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 last:border-0">
                <span className="text-slate-700 font-medium truncate max-w-[280px]">{inst.name}</span>
                <span className="font-bold text-[#1565D8] bg-blue-50 px-2 py-0.5 rounded-md">
                  {inst.count} ({inst.percent}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
