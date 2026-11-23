"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Trophy, Medal, Award, Flame, Search, Filter, Star,
  ExternalLink, Sparkles, UserPlus, CheckCircle2, Globe, MapPin, Code2
} from "lucide-react";

interface BuilderRank {
  rank: number;
  name: string;
  handle: string;
  avatar: string;
  country: string;
  flag: string;
  affiliation: string;
  badge: string;
  points: number;
  wins: number;
  hacksCount: number;
  skills: string[];
  track: string;
}

const TOP_BUILDERS: BuilderRank[] = [
  {
    rank: 1,
    name: "Arjun Venkataraman",
    handle: "arjunv",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    country: "India",
    flag: "🇮🇳",
    affiliation: "IIT Madras • Google Fellow",
    badge: "Grandmaster Builder",
    points: 14850,
    wins: 12,
    hacksCount: 19,
    skills: ["PyTorch", "Rust", "LLMs", "Distributed Systems"],
    track: "AI & ML",
  },
  {
    rank: 2,
    name: "Elena Rostova",
    handle: "elena_dev",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    country: "Germany",
    flag: "🇩🇪",
    affiliation: "TU Munich • Open Source Lead",
    badge: "Principal Innovator",
    points: 13200,
    wins: 9,
    hacksCount: 16,
    skills: ["Next.js", "Solidity", "Zero-Knowledge", "TypeScript"],
    track: "Web3 & Security",
  },
  {
    rank: 3,
    name: "Devang Nair",
    handle: "devangn",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    country: "India",
    flag: "🇮🇳",
    affiliation: "BITS Pilani • Kernel Contributor",
    badge: "Legendary Architect",
    points: 11950,
    wins: 8,
    hacksCount: 14,
    skills: ["Go", "Kubernetes", "WebAssembly", "Cloud Native"],
    track: "Systems & Cloud",
  },
  {
    rank: 4,
    name: "Marcus Chen",
    handle: "marcusc",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    country: "Singapore",
    flag: "🇸🇬",
    affiliation: "NUS Singapore • FinTech Lab",
    badge: "Elite Contender",
    points: 10420,
    wins: 7,
    hacksCount: 13,
    skills: ["React Native", "FastAPI", "Python", "Computer Vision"],
    track: "AI & ML",
  },
  {
    rank: 5,
    name: "Sneha Mukherjee",
    handle: "sneham_code",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    country: "India",
    flag: "🇮🇳",
    affiliation: "IIIT Hyderabad • Research Scholar",
    badge: "Elite Contender",
    points: 9840,
    wins: 6,
    hacksCount: 11,
    skills: ["Diffusion Models", "Transformers", "CUDA", "PyTorch"],
    track: "AI & ML",
  },
  {
    rank: 6,
    name: "Tariq Al-Mansoor",
    handle: "tariq_m",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    country: "UAE",
    flag: "🇦🇪",
    affiliation: "Khalifa University",
    badge: "Rising Prodigy",
    points: 8720,
    wins: 5,
    hacksCount: 9,
    skills: ["Solidity", "Rust", "DeFi Protocols", "PostgreSQL"],
    track: "Web3 & Security",
  },
  {
    rank: 7,
    name: "Ananya Deshmukh",
    handle: "ananyad",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    country: "India",
    flag: "🇮🇳",
    affiliation: "IIT Delhi • Tech Innovator",
    badge: "Rising Prodigy",
    points: 8150,
    wins: 5,
    hacksCount: 10,
    skills: ["Flutter", "GraphQL", "Supabase", "UX Design"],
    track: "Full-Stack",
  },
  {
    rank: 8,
    name: "Liam O'Connor",
    handle: "liam_oc",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    country: "Ireland",
    flag: "🇮🇪",
    affiliation: "Trinity College Dublin",
    badge: "Pro Challenger",
    points: 7600,
    wins: 4,
    hacksCount: 8,
    skills: ["Elixir", "Phoenix", "Postgres", "Docker"],
    track: "Systems & Cloud",
  },
];

export default function LeaderboardPage() {
  const [selectedTrack, setSelectedTrack] = useState<string>("All");
  const [regionFilter, setRegionFilter] = useState<string>("Global");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const tracks = ["All", "AI & ML", "Web3 & Security", "Systems & Cloud", "Full-Stack"];

  const filteredBuilders = TOP_BUILDERS.filter((b) => {
    const matchesTrack = selectedTrack === "All" || b.track === selectedTrack;
    const matchesRegion =
      regionFilter === "Global" || (regionFilter === "India" && b.country === "India");
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTrack && matchesRegion && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-midnight text-text-primary pt-24 pb-20">
      {/* Background ambient glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-violet-500/10 via-aqua-400/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Trophy className="w-4 h-4 text-amber" />
            Global Hall of Builders
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-display mb-4">
            Leaderboard &amp; Reputation
          </h1>
          <p className="text-text-secondary text-base md:text-lg">
            Recognizing the world&apos;s top hackathon builders, verified innovators, and serial problem solvers.
            Rankings update dynamically based on validated tournament performance.
          </p>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 items-end">
          {/* Rank 2 (Silver) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="order-2 md:order-1 card-glass p-6 rounded-3xl border border-slate-300/20 text-center relative overflow-hidden bg-gradient-to-b from-slate-400/10 to-transparent"
          >
            <div className="absolute top-3 right-3 text-2xl font-black text-slate-400/40">#2</div>
            <div className="relative mx-auto w-24 h-24 mb-4">
              <img
                src={TOP_BUILDERS[1].avatar}
                alt={TOP_BUILDERS[1].name}
                className="w-full h-full object-cover rounded-full border-4 border-slate-300 shadow-lg"
              />
              <span className="absolute -bottom-2 -right-1 text-2xl">🥈</span>
            </div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <h3 className="text-lg font-bold">{TOP_BUILDERS[1].name}</h3>
              <span>{TOP_BUILDERS[1].flag}</span>
            </div>
            <p className="text-xs text-text-secondary mb-3">{TOP_BUILDERS[1].affiliation}</p>
            <div className="badge-aqua mb-4">{TOP_BUILDERS[1].badge}</div>
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/8 text-left">
              <div>
                <span className="text-[10px] text-text-secondary uppercase">Score</span>
                <p className="text-base font-bold text-signal-blue">{TOP_BUILDERS[1].points.toLocaleString()} XP</p>
              </div>
              <div>
                <span className="text-[10px] text-text-secondary uppercase">Podiums</span>
                <p className="text-base font-bold text-aqua-400">{TOP_BUILDERS[1].wins} Wins</p>
              </div>
            </div>
          </motion.div>

          {/* Rank 1 (Gold - Elevated) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="order-1 md:order-2 card-glass p-8 rounded-3xl border-2 border-amber/50 text-center relative overflow-hidden bg-gradient-to-b from-amber/15 via-surface-1 to-transparent shadow-2xl scale-105 z-10"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-amber text-midnight font-bold text-[10px] uppercase tracking-widest px-4 py-1 rounded-b-xl flex items-center gap-1 shadow-md">
              <Sparkles className="w-3 h-3 fill-current" /> World #1 Builder
            </div>
            <div className="relative mx-auto w-28 h-28 mb-4 mt-2">
              <img
                src={TOP_BUILDERS[0].avatar}
                alt={TOP_BUILDERS[0].name}
                className="w-full h-full object-cover rounded-full border-4 border-amber shadow-violet"
              />
              <span className="absolute -bottom-2 -right-1 text-3xl animate-bounce">👑</span>
            </div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <h3 className="text-xl font-extrabold text-white">{TOP_BUILDERS[0].name}</h3>
              <span className="text-lg">{TOP_BUILDERS[0].flag}</span>
            </div>
            <p className="text-xs text-amber-200/80 mb-3">{TOP_BUILDERS[0].affiliation}</p>
            <div className="badge-amber mb-4">{TOP_BUILDERS[0].badge}</div>
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10 text-left bg-white/5 rounded-2xl p-3">
              <div>
                <span className="text-[10px] text-text-secondary uppercase">Global XP</span>
                <p className="text-lg font-black text-amber">{TOP_BUILDERS[0].points.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-[10px] text-text-secondary uppercase">Grand Titles</span>
                <p className="text-lg font-black text-green-400">{TOP_BUILDERS[0].wins} Firsts</p>
              </div>
            </div>
          </motion.div>

          {/* Rank 3 (Bronze) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="order-3 card-glass p-6 rounded-3xl border border-amber-700/30 text-center relative overflow-hidden bg-gradient-to-b from-amber-700/10 to-transparent"
          >
            <div className="absolute top-3 right-3 text-2xl font-black text-amber-600/40">#3</div>
            <div className="relative mx-auto w-24 h-24 mb-4">
              <img
                src={TOP_BUILDERS[3].avatar}
                alt={TOP_BUILDERS[2].name}
                className="w-full h-full object-cover rounded-full border-4 border-amber-600 shadow-lg"
              />
              <span className="absolute -bottom-2 -right-1 text-2xl">🥉</span>
            </div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <h3 className="text-lg font-bold">{TOP_BUILDERS[2].name}</h3>
              <span>{TOP_BUILDERS[2].flag}</span>
            </div>
            <p className="text-xs text-text-secondary mb-3">{TOP_BUILDERS[2].affiliation}</p>
            <div className="badge-violet mb-4">{TOP_BUILDERS[2].badge}</div>
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/8 text-left">
              <div>
                <span className="text-[10px] text-text-secondary uppercase">Score</span>
                <p className="text-base font-bold text-signal-blue">{TOP_BUILDERS[2].points.toLocaleString()} XP</p>
              </div>
              <div>
                <span className="text-[10px] text-text-secondary uppercase">Podiums</span>
                <p className="text-base font-bold text-aqua-400">{TOP_BUILDERS[2].wins} Wins</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters & Search */}
        <div className="card-glass p-4 rounded-2xl border border-white/10 mb-8 flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Tracks */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-none">
            {tracks.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTrack(t)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  selectedTrack === t
                    ? "bg-violet-500 text-white shadow-violet"
                    : "bg-white/5 text-text-secondary hover:text-text-primary hover:bg-white/10"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Region Toggle & Search */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => setRegionFilter("Global")}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  regionFilter === "Global" ? "bg-violet-500 text-white" : "text-text-secondary"
                }`}
              >
                Global 🌍
              </button>
              <button
                onClick={() => setRegionFilter("India")}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  regionFilter === "India" ? "bg-violet-500 text-white" : "text-text-secondary"
                }`}
              >
                India 🇮🇳
              </button>
            </div>

            <div className="relative flex-1 lg:w-64">
              <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search builder, handle, tech..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-violet-500/50"
              />
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="card rounded-2xl border border-white/10 overflow-hidden mb-16">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-text-secondary uppercase text-[11px] font-semibold tracking-wider border-b border-white/8">
                <tr>
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Builder</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Top Stack</th>
                  <th className="px-6 py-4 text-center">Wins / Hacks</th>
                  <th className="px-6 py-4 text-right">Reputation XP</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredBuilders.map((b) => (
                  <tr
                    key={b.rank}
                    className="hover:bg-white/3 transition-colors duration-150 group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {b.rank === 1 ? (
                          <span className="w-6 h-6 rounded-full bg-amber/20 text-amber font-bold flex items-center justify-center text-xs">1</span>
                        ) : b.rank === 2 ? (
                          <span className="w-6 h-6 rounded-full bg-slate-300/20 text-slate-300 font-bold flex items-center justify-center text-xs">2</span>
                        ) : b.rank === 3 ? (
                          <span className="w-6 h-6 rounded-full bg-amber-700/20 text-amber-500 font-bold flex items-center justify-center text-xs">3</span>
                        ) : (
                          <span className="text-text-secondary font-mono font-semibold text-xs ml-1">#{b.rank}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={b.avatar}
                          alt={b.name}
                          className="w-10 h-10 rounded-xl object-cover border border-white/10"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-text-primary group-hover:text-violet-400 transition-colors">
                              {b.name}
                            </span>
                            <span className="text-xs" title={b.country}>{b.flag}</span>
                          </div>
                          <span className="text-xs text-text-secondary">@{b.handle} • {b.affiliation}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-white/5 text-xs font-medium text-text-secondary border border-white/8">
                        {b.track}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {b.skills.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 text-text-secondary border border-white/8"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <span className="text-aqua-400 font-bold">{b.wins}</span>
                        <span className="text-text-secondary">/</span>
                        <span className="text-text-secondary">{b.hacksCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-mono font-bold text-base text-amber">
                        {b.points.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-text-secondary ml-1">XP</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href={`/dashboard`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 text-xs font-semibold border border-violet-500/20 transition-all"
                      >
                        Profile
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* XP Mechanics Banner */}
        <div className="card-glass p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-violet-500/10 via-surface-1 to-aqua-400/10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber/15 border border-amber/25 flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6 text-amber" />
            </div>
            <div>
              <h4 className="font-bold text-white mb-1">Hackathon Podiums</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Win 1st, 2nd, or 3rd place in verified HACKSYRA events to earn +2,500 to +5,000 XP and official verifiable on-chain certificates.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-aqua-400/15 border border-aqua-400/25 flex items-center justify-center shrink-0">
              <Code2 className="w-6 h-6 text-aqua-400" />
            </div>
            <div>
              <h4 className="font-bold text-white mb-1">Quality Project Ship</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Every verified project submission with open source repo, live deployment, and demo video awards +500 XP to each teammate.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h4 className="font-bold text-white mb-1">Recruiter Discovery</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Top 50 builders get prioritized for exclusive job offers, fast-tracked venture grants, and invitations to invite-only global hackathons.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
