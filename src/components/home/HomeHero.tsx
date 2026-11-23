"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Plus, Compass, Sparkles, Trophy, Users, Rocket } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useListedHackathons, usePlatformStats } from "@/lib/data/hooks";
import { formatMoney } from "@/lib/domain/money";
import { AnimatedNumber, Skeleton } from "@/components/ui";

export function HomeHero() {
  const { firebaseUser } = useAuth();
  const { data: stats, isLoading: statsLoading } = usePlatformStats();
  const { data: liveHackathons } = useListedHackathons({ limit: 3 });
  const reduced = useReducedMotion();

  const hostHref = firebaseUser ? "/organizer/create" : "/signup?role=organizer&next=/organizer/create";

  const statItems = [
    { label: "Live Hackathons", val: stats?.liveHackathons ?? null, fmt: (n: number) => n.toLocaleString("en-IN"), icon: Trophy },
    { label: "Builders", val: stats?.users ?? null, fmt: (n: number) => n.toLocaleString("en-IN"), icon: Users },
    {
      label: "Prizes Listed",
      val: stats?.totalPrizePoolInPaise ?? null,
      fmt: (n: number) => (n > 0 ? formatMoney(n, "INR", { compact: true }) : "—"),
      icon: Sparkles,
    },
    { label: "Registrations", val: stats?.totalRegistrations ?? null, fmt: (n: number) => n.toLocaleString("en-IN"), icon: Rocket },
  ];

  const featuredLive = liveHackathons?.[0];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#EEF4FF] via-[#F7FAFF] to-white border-b border-slate-200/80 pt-10 sm:pt-14 pb-12 sm:pb-16">
      <div aria-hidden className="absolute -top-32 right-0 w-[520px] h-[520px] rounded-full bg-[#1565D8]/10 blur-3xl pointer-events-none" />
      <div aria-hidden className="absolute -bottom-32 -left-20 w-[420px] h-[420px] rounded-full bg-sky-400/10 blur-3xl pointer-events-none" />

      <div className="container-app relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Copy & Dual CTAs */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0.01 : 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 space-y-6"
          >
            <span className="section-tag">
              <Sparkles size={13} /> Innovation Hacks · Real-Time Platform
            </span>

            <h1 className="font-display font-bold text-3xl xs:text-4xl sm:text-5xl 3xl:text-6xl text-slate-900 tracking-tight leading-[1.08] text-balance">
              Discover <span className="gradient-text">hackathons</span> — and anyone can host one.
            </h1>

            <p className="text-slate-600 text-base sm:text-lg 3xl:text-xl leading-relaxed max-w-2xl">
              Join live coding sprints, team up with builders across India and the world, ship projects, and launch your own verified hackathon in minutes.
            </p>

            {/* Primary Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <Link href="/hackathons" className="btn-primary btn-lg">
                <Compass size={18} />
                <span>Explore Hackathons</span>
                <ArrowRight size={17} />
              </Link>
              <Link href={hostHref} className="btn-outline btn-lg bg-white">
                <Plus size={18} />
                <span>Host a Hackathon</span>
              </Link>
            </div>

            {/* Real-time Platform Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              {statItems.map((s) => (
                <div key={s.label} className="rounded-2xl bg-white/90 border border-slate-200/90 p-3.5 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold">
                    <span className="truncate">{s.label}</span>
                    <s.icon size={13} className="text-[#1565D8] shrink-0" />
                  </div>
                  <div className="font-display font-bold text-xl sm:text-2xl text-slate-900 mt-1 tabular-nums">
                    {statsLoading ? (
                      <Skeleton className="h-7 w-16" />
                    ) : s.val != null ? (
                      <AnimatedNumber value={s.val} formatter={s.fmt} />
                    ) : (
                      "—"
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Hero Card */}
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reduced ? 0.01 : 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5"
          >
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-900 shadow-2xl aspect-[16/11] sm:aspect-[16/10]">
              <Image
                src="/images/hacksyra_hero.jpg"
                alt="Builders collaborating at a HACKSYRA hackathon"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/15 to-transparent" />

              {featuredLive && (
                <Link
                  href={`/hackathons/${featuredLive.slug}`}
                  className="absolute bottom-3 left-3 right-3 rounded-2xl bg-white/95 backdrop-blur-md p-3.5 shadow-lg border border-white flex items-center justify-between gap-3 group hover:bg-white transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>LIVE ON HACKSYRA</span>
                    </div>
                    <p className="font-display font-bold text-sm text-slate-900 truncate mt-0.5 group-hover:text-[#1565D8]">
                      {featuredLive.name}
                    </p>
                  </div>
                  <span className="shrink-0 px-3 py-1.5 rounded-xl bg-[#EEF4FF] text-[#1565D8] text-xs font-bold flex items-center gap-1">
                    View <ArrowRight size={12} />
                  </span>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

