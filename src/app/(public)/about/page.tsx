import type { Metadata } from "next";
import Link from "next/link";
import {
  Zap, Trophy, Users, Shield, Sparkles, Globe,
  ArrowRight, Award, Code2, Rocket, Heart, CheckCircle2
} from "lucide-react";

export const metadata: Metadata = {
  title: "About HACKSYRA — An Innovation Hacks Product",
  description:
    "DISCOVER. BUILD. COMPETE. HACKSYRA is the global hackathon ecosystem founded by Innovation Hacks to empower builders, streamline tournament hosting, and connect elite engineering talent with global opportunities.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-midnight text-text-primary pt-24 pb-20">
      {/* Background glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-gradient-to-b from-violet-500/15 via-aqua-400/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-aqua-400" />
            An Innovation Hacks Product
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight leading-tight">
            The Global Arena Where Builders Become Founders
          </h1>

          <p className="text-text-secondary text-base sm:text-lg leading-relaxed">
            HACKSYRA is built on one simple thesis: <strong>The world&apos;s most transformative innovations don&apos;t originate in lecture halls — they are forged in 48-hour pressure cookers of relentless code.</strong>
          </p>

          <div className="flex items-center justify-center gap-6 pt-4 text-xs font-mono text-aqua-400">
            <span>DISCOVER.</span>
            <span className="text-text-secondary">•</span>
            <span>BUILD.</span>
            <span className="text-text-secondary">•</span>
            <span>COMPETE.</span>
          </div>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-glass p-8 rounded-3xl border border-white/10 space-y-4 bg-gradient-to-b from-white/5 to-surface-1">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-violet-400">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-display text-white">1. Discovery Without Borders</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              From flagship Indian collegiate hackathons at IITs, BITS, and NITs to premier global web3 &amp; AI tournaments — discover vetted events with transparent rubrics and guaranteed prize distribution.
            </p>
          </div>

          <div className="card-glass p-8 rounded-3xl border border-white/10 space-y-4 bg-gradient-to-b from-white/5 to-surface-1">
            <div className="w-12 h-12 rounded-2xl bg-aqua-400/15 border border-aqua-400/25 flex items-center justify-center text-aqua-400">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-display text-white">2. Proof of Competence</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              No paper resumes. Your HACKSYRA builder profile is backed by cryptographically verifiable credentials, peer-reviewed git repositories, and recorded video pitches evaluated by industry judges.
            </p>
          </div>

          <div className="card-glass p-8 rounded-3xl border border-white/10 space-y-4 bg-gradient-to-b from-white/5 to-surface-1">
            <div className="w-12 h-12 rounded-2xl bg-amber/15 border border-amber/25 flex items-center justify-center text-amber">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-display text-white">3. Venture &amp; Talent Engine</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Hackathon winners don&apos;t just win bounties; they earn priority access to top tech recruiters, venture accelerator interviews, and angel funding networks through the Innovation Hacks community.
            </p>
          </div>
        </div>

        {/* The Innovation Hacks Story */}
        <div className="card-glass p-8 sm:p-12 rounded-3xl border border-white/10 bg-surface-1 space-y-8">
          <div className="max-w-3xl space-y-4">
            <span className="badge-violet text-[10px] font-bold uppercase tracking-wider">
              PARENT BRAND
            </span>
            <h2 className="text-3xl font-extrabold font-display">
              Powered by Innovation Hacks
            </h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              Innovation Hacks originated as a developer-first collective dedicated to bridging the chasm between raw student engineering potential and global industry leadership.
            </p>
            <p className="text-text-secondary text-sm leading-relaxed">
              After organizing grassroots hackathons and witnessing the friction of fragmented forms, opaque judging spreadsheets, and missing project showcases, we engineered <strong>HACKSYRA</strong>: the definitive global operating system for competitive technology tournaments.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/10">
            <div>
              <span className="text-3xl sm:text-4xl font-black font-mono text-white block">50,000+</span>
              <span className="text-xs text-text-secondary mt-1 block">Active Builders</span>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-black font-mono text-aqua-400 block">₹2.5 Cr+</span>
              <span className="text-xs text-text-secondary mt-1 block">Prizes Awarded</span>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-black font-mono text-violet-400 block">240+</span>
              <span className="text-xs text-text-secondary mt-1 block">Partner Colleges</span>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-black font-mono text-amber block">1,800+</span>
              <span className="text-xs text-text-secondary mt-1 block">Shipped Projects</span>
            </div>
          </div>
        </div>

        {/* Commitment to Fair Play */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="badge-aqua text-[10px] uppercase font-bold tracking-wider">
              INTEGRITY FIRST
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold font-display">
              The Gold Standard in Tournament Fairness
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Every tournament hosted on HACKSYRA adheres to strict anti-cheating, code originality verification, and double-blind judging rubrics.
            </p>

            <ul className="space-y-2.5 text-xs text-text-secondary">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-aqua-400 shrink-0" />
                <span>Automated commit-timestamp and git velocity analysis</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-aqua-400 shrink-0" />
                <span>Multi-judge rubric score normalization to eliminate subjective bias</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-aqua-400 shrink-0" />
                <span>Transparent dispute resolution and public finalist audits</span>
              </li>
            </ul>
          </div>

          <div className="card-glass p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-surface-2 to-surface-1 text-center space-y-4">
            <Shield className="w-12 h-12 text-aqua-400 mx-auto" />
            <h4 className="text-lg font-bold text-white">Organizing an Event?</h4>
            <p className="text-xs text-text-secondary leading-relaxed max-w-sm mx-auto">
              Join leading tech universities, developer DAO communities, and Fortune 500 tech partners who trust HACKSYRA to run high-stakes hackathons.
            </p>
            <div className="pt-2">
              <Link href="/organizer/create" className="btn-primary inline-flex text-xs">
                Launch Your Hackathon <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center py-12 border-t border-white/8 space-y-4">
          <h2 className="text-3xl font-extrabold font-display">Ready to Build the Future?</h2>
          <p className="text-xs text-text-secondary max-w-md mx-auto">
            Create your builder profile, join or assemble a squad, and compete in the world&apos;s most exciting hackathons.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link href="/hackathons" className="btn-primary text-xs">
              Explore Active Hackathons
            </Link>
            <Link href="/leaderboard" className="btn-secondary text-xs">
              View Global Leaderboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
