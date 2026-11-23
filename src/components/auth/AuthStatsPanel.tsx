"use client";

import Image from "next/image";
import Link from "next/link";
import { Trophy, Users, Sparkles, Rocket, ShieldCheck } from "lucide-react";
import { usePlatformStats } from "@/lib/data/hooks";
import { formatMoney } from "@/lib/domain/money";
import { AnimatedNumber, Skeleton } from "@/components/ui";

export function AuthStatsPanel({ mode }: { mode: "login" | "signup" }) {
  const { data: stats, isLoading } = usePlatformStats();

  const metrics = [
    {
      label: "Builders on platform",
      value: stats?.users ?? null,
      format: (n: number) => n.toLocaleString("en-IN"),
      icon: Users,
    },
    {
      label: "Live hackathons",
      value: stats?.liveHackathons ?? null,
      format: (n: number) => n.toLocaleString("en-IN"),
      icon: Trophy,
    },
    {
      label: "Total prizes listed",
      value: stats?.totalPrizePoolInPaise ?? null,
      format: (n: number) => (n > 0 ? formatMoney(n, "INR", { compact: true }) : "—"),
      icon: Sparkles,
    },
    {
      label: "Registrations",
      value: stats?.totalRegistrations ?? null,
      format: (n: number) => n.toLocaleString("en-IN"),
      icon: Rocket,
    },
  ];

  return (
    <div className="hidden md:flex md:w-[42%] bg-gradient-to-br from-[#1565D8] via-[#1359C2] to-[#0B3E86] text-white p-7 lg:p-9 flex-col justify-between relative overflow-hidden">
      {/* Subtle geometric backdrop */}
      <svg aria-hidden className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="85%" cy="15%" r="130" fill="none" stroke="white" strokeWidth="1.2" />
        <circle cx="85%" cy="15%" r="210" fill="none" stroke="white" strokeWidth="1" />
        <circle cx="15%" cy="88%" r="150" fill="none" stroke="white" strokeWidth="1" />
      </svg>

      {/* Brand */}
      <div className="relative z-10">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-white p-1.5 shadow-md group-hover:scale-105 transition-transform">
            <Image src="/logos/ih_logo.png" alt="Innovation Hacks" width={36} height={36} className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-display font-bold text-xl tracking-tight block leading-none">
              HACK<span className="text-[#BAE6FD]">SYRA</span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-100/90 mt-1 block">
              Innovation Hacks
            </span>
          </div>
        </Link>

        <div className="mt-8 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold text-blue-50 border border-white/20">
            <ShieldCheck size={13} /> Real-time Hackathon Platform
          </span>
          <h2 className="font-display font-bold text-2xl lg:text-[26px] leading-snug text-white">
            {mode === "login"
              ? "Welcome back to your builder workspace."
              : "Discover hackathons — or host your own in minutes."}
          </h2>
          <p className="text-xs lg:text-sm text-blue-100/90 leading-relaxed">
            Compete in curated hackathons, form teams with builders worldwide, submit projects, and earn verified certificates.
          </p>
        </div>
      </div>

      {/* Live platform stats */}
      <div className="relative z-10 mt-8">
        <p className="text-[11px] font-bold uppercase tracking-wider text-blue-200 mb-3">Live platform pulse</p>
        <div className="grid grid-cols-2 gap-2.5">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 p-3">
              <div className="flex items-center justify-between text-blue-100 mb-1">
                <span className="text-[11px] font-medium truncate">{m.label}</span>
                <m.icon size={13} className="shrink-0 opacity-85" />
              </div>
              {isLoading ? (
                <Skeleton className="h-6 w-16 bg-white/20" />
              ) : (
                <p className="font-display font-bold text-lg text-white tabular-nums">
                  {m.value != null ? <AnimatedNumber value={m.value} formatter={m.format} /> : "—"}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <p className="relative z-10 text-[11px] text-blue-100/80 mt-6">
        Powered by <strong className="text-white">Innovation Hacks</strong> · Verified &amp; real-time
      </p>
    </div>
  );
}

