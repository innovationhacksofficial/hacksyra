"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Zap,
  Trophy,
  Users,
  Globe,
  Code2,
  Star,
  TrendingUp,
  Play,
} from "lucide-react";

// Demo floating cards for the hero visual
const FLOATING_CARDS = [
  {
    id: 1,
    type: "hackathon",
    title: "AI Innovation Challenge",
    org: "TechCorp India",
    prize: "₹5,00,000",
    participants: 1240,
    tags: ["AI/ML", "Python"],
    style: "top-[8%] left-[2%] rotate-[-6deg]",
  },
  {
    id: 2,
    type: "project",
    title: "EcoTrack – Carbon Monitor",
    team: "GreenHackers",
    likes: 847,
    tags: ["React", "IoT"],
    style: "top-[35%] left-[0%] rotate-[4deg]",
  },
  {
    id: 3,
    type: "winner",
    title: "1st Place Winner 🏆",
    hackathon: "GlobalHack 2026",
    prize: "$10,000",
    style: "bottom-[20%] left-[4%] rotate-[-3deg]",
  },
  {
    id: 4,
    type: "hackathon",
    title: "Web3 Builders Summit",
    org: "CryptoHub",
    prize: "$25,000",
    participants: 3100,
    tags: ["Solidity", "Web3"],
    style: "top-[5%] right-[0%] rotate-[5deg]",
  },
  {
    id: 5,
    type: "team",
    title: "Looking for teammates",
    user: "Priya S.",
    skills: ["React", "FastAPI"],
    style: "top-[40%] right-[2%] rotate-[-4deg]",
  },
  {
    id: 6,
    type: "cert",
    title: "Certificate Issued",
    recipient: "Arjun Mehta",
    event: "DevHack 2026",
    style: "bottom-[15%] right-[0%] rotate-[6deg]",
  },
];

function FloatingCard({ card }: { card: (typeof FLOATING_CARDS)[number] }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8 + card.id * 0.15, duration: 0.6, ease: "easeOut" }}
      className={`absolute w-52 card-glass border border-white/10 p-3 rounded-xl shadow-lg backdrop-blur-xl pointer-events-none hidden lg:block ${card.style}`}
      style={{ animation: `float ${5 + card.id * 0.7}s ease-in-out infinite` }}
    >
      {card.type === "hackathon" && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Trophy size={12} className="text-amber" />
            <span className="text-[10px] font-semibold text-amber uppercase tracking-wider">
              Hackathon
            </span>
          </div>
          <p className="text-xs font-semibold text-text-primary mb-1">{card.title}</p>
          <p className="text-[10px] text-text-secondary mb-2">{card.org}</p>
          <div className="flex items-center justify-between">
            <span className="prize-pill text-[10px] px-2 py-0.5">{card.prize}</span>
            <span className="flex items-center gap-1 text-[10px] text-text-secondary">
              <Users size={10} />{card.participants?.toLocaleString()}
            </span>
          </div>
        </div>
      )}
      {card.type === "project" && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Code2 size={12} className="text-aqua-400" />
            <span className="text-[10px] font-semibold text-aqua-400 uppercase tracking-wider">
              Project
            </span>
          </div>
          <p className="text-xs font-semibold text-text-primary mb-1">{card.title}</p>
          <p className="text-[10px] text-text-secondary mb-2">{card.team}</p>
          <div className="flex items-center gap-1">
            {card.tags?.map((tag) => (
              <span key={tag} className="badge-gray text-[9px] px-1.5 py-0.5">{tag}</span>
            ))}
          </div>
        </div>
      )}
      {card.type === "winner" && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Star size={12} className="text-amber fill-amber" />
            <span className="text-[10px] font-semibold text-amber uppercase tracking-wider">
              Winner
            </span>
          </div>
          <p className="text-xs font-semibold text-text-primary mb-1">{card.title}</p>
          <p className="text-[10px] text-text-secondary mb-1">{card.hackathon}</p>
          <p className="text-sm font-bold gradient-text">{card.prize}</p>
        </div>
      )}
      {card.type === "team" && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Users size={12} className="text-violet-400" />
            <span className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider">
              Team Up
            </span>
          </div>
          <p className="text-xs font-semibold text-text-primary mb-1">{card.title}</p>
          <p className="text-[10px] text-text-secondary mb-2">{card.user}</p>
          <div className="flex gap-1">
            {card.skills?.map((s) => (
              <span key={s} className="skill-tag text-[9px] px-1.5 py-0.5">{s}</span>
            ))}
          </div>
        </div>
      )}
      {card.type === "cert" && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Zap size={12} className="text-aqua-400" />
            <span className="text-[10px] font-semibold text-aqua-400 uppercase tracking-wider">
              Certificate
            </span>
          </div>
          <p className="text-xs font-semibold text-text-primary mb-1">{card.title}</p>
          <p className="text-[10px] text-text-secondary">{card.recipient}</p>
          <p className="text-[10px] text-text-secondary">{card.event}</p>
        </div>
      )}
    </motion.div>
  );
}

const LIVE_STATS = [
  { value: "10,000+", label: "Hackathons hosted", icon: Trophy },
  { value: "2M+", label: "Builders worldwide", icon: Users },
  { value: "₹50Cr+", label: "Prizes distributed", icon: Star },
  { value: "150+", label: "Countries", icon: Globe },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-midnight">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-hero-gradient" />

      {/* Noise overlay */}
      <div className="absolute inset-0 noise" />

      {/* Glow orbs */}
      <div className="orb w-[600px] h-[600px] bg-violet/8 -top-40 -left-40 animate-pulse-slow" />
      <div className="orb w-[500px] h-[500px] bg-aqua/6 -bottom-20 -right-20 animate-pulse-slow" style={{ animationDelay: "1.5s" }} />
      <div className="orb w-[300px] h-[300px] bg-signal-blue/5 top-1/3 right-1/4" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(121,108,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(121,108,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Floating cards */}
      {FLOATING_CARDS.map((card) => (
        <FloatingCard key={card.id} card={card} />
      ))}

      {/* Central content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-300 text-sm font-medium mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-aqua-400 animate-pulse" />
          <TrendingUp size={14} />
          <span>India's fastest growing hackathon platform</span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="text-5xl sm:text-6xl md:text-7xl font-display font-bold text-text-primary leading-[1.05] text-balance mb-6"
        >
          Where Ideas
          <br />
          <span className="gradient-text">Become Impact.</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-xl md:text-2xl font-display font-medium text-text-secondary mb-4 tracking-wide"
        >
          DISCOVER. BUILD. COMPETE.
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-text-secondary text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Discover global hackathons, collaborate with talented builders, bring your ideas to
          life, and compete for opportunities that move innovation forward.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
        >
          <Link href="/hackathons" className="btn-aqua btn-lg group">
            Explore Hackathons
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform duration-200"
            />
          </Link>
          <Link href="/host" className="btn-secondary btn-lg group">
            <Zap size={18} className="text-violet-400" />
            Host a Hackathon
          </Link>
          <Link
            href="/about"
            className="btn-ghost flex items-center gap-2 text-text-secondary hover:text-text-primary"
          >
            <Play size={16} className="text-violet-400" />
            Watch demo
          </Link>
        </motion.div>

        {/* Live stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/8 rounded-2xl overflow-hidden border border-white/8"
        >
          {LIVE_STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="bg-surface-1/80 backdrop-blur-xl px-4 py-4 text-center"
            >
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <stat.icon size={16} className="text-violet-400" />
                <span className="text-xl font-display font-bold text-text-primary tabular">
                  {stat.value}
                </span>
              </div>
              <p className="text-xs text-text-secondary">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Trusted by line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="mt-8 text-xs text-text-secondary/50 font-medium uppercase tracking-widest"
        >
          Trusted by builders from IIT, NIT, IIM, Google, Microsoft, Razorpay & more
        </motion.p>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-midnight to-transparent pointer-events-none" />
    </section>
  );
}
