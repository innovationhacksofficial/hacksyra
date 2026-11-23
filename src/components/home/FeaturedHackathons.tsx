"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Calendar,
  Users,
  Trophy,
  Clock,
  Bookmark,
  ArrowRight,
  Wifi,
  Building,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

// DEMO hackathons — clearly labeled as sample data
const DEMO_HACKATHONS = [
  {
    id: "1",
    name: "India AI Innovation Challenge 2026",
    slug: "india-ai-2026",
    organizer: "Innovation Hacks",
    organizerVerified: true,
    mode: "online" as const,
    coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80",
    tags: ["AI/ML", "Python", "Deep Learning"],
    prizePool: "₹10,00,000",
    isFree: false,
    ticketPrice: "₹499",
    currency: "INR",
    participants: 4200,
    teamSize: "2-5",
    status: "registration_open" as const,
    registrationDeadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
    featured: true,
  },
  {
    id: "2",
    name: "Web3 Builders Summit",
    slug: "web3-summit-2026",
    organizer: "CryptoHub India",
    organizerVerified: true,
    mode: "hybrid" as const,
    location: "Bangalore, India",
    coverImage: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=80",
    tags: ["Solidity", "DeFi", "NFT", "Web3"],
    prizePool: "$25,000",
    isFree: false,
    ticketPrice: "$49",
    currency: "USD",
    participants: 1800,
    teamSize: "1-4",
    status: "registration_open" as const,
    registrationDeadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000),
    featured: true,
  },
  {
    id: "3",
    name: "Student Hack: Open Innovation",
    slug: "student-hack-2026",
    organizer: "IIT Delhi Innovation Cell",
    organizerVerified: true,
    mode: "online" as const,
    coverImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80",
    tags: ["Open Innovation", "Any Stack"],
    prizePool: "₹2,00,000",
    isFree: true,
    currency: "INR",
    participants: 6800,
    teamSize: "2-6",
    status: "registration_open" as const,
    registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    featured: false,
    studentsOnly: true,
    beginnerFriendly: true,
  },
  {
    id: "4",
    name: "FinTech Disrupt 2026",
    slug: "fintech-disrupt-2026",
    organizer: "Razorpay & HSBC",
    organizerVerified: true,
    mode: "offline" as const,
    location: "Mumbai, India",
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    tags: ["FinTech", "Payments", "Banking API"],
    prizePool: "₹15,00,000",
    isFree: false,
    ticketPrice: "₹999",
    currency: "INR",
    participants: 950,
    teamSize: "2-4",
    status: "registration_open" as const,
    registrationDeadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000),
    featured: true,
  },
  {
    id: "5",
    name: "Climate Tech Hackathon",
    slug: "climate-tech-2026",
    organizer: "GreenFuture Foundation",
    organizerVerified: false,
    mode: "online" as const,
    coverImage: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80",
    tags: ["ClimaTech", "Sustainability", "IoT"],
    prizePool: "$8,000",
    isFree: true,
    currency: "USD",
    participants: 2300,
    teamSize: "1-5",
    status: "registration_open" as const,
    registrationDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    featured: false,
    closingSoon: true,
  },
  {
    id: "6",
    name: "Healthcare Innovation Sprint",
    slug: "healthcare-sprint-2026",
    organizer: "MedTech Alliance",
    organizerVerified: true,
    mode: "hybrid" as const,
    location: "Hyderabad, India",
    coverImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&auto=format&fit=crop&q=80",
    tags: ["HealthTech", "AI", "Mobile"],
    prizePool: "$12,000",
    isFree: false,
    ticketPrice: "$29",
    currency: "USD",
    participants: 1400,
    teamSize: "2-5",
    status: "registration_open" as const,
    registrationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    featured: false,
  },
];

const MODE_ICONS = {
  online: Wifi,
  offline: Building,
  hybrid: Layers,
};

const MODE_LABELS = {
  online: "Online",
  offline: "In-Person",
  hybrid: "Hybrid",
};

function HackathonCard({ h, index }: { h: (typeof DEMO_HACKATHONS)[number]; index: number }) {
  const ModeIcon = MODE_ICONS[h.mode];
  const daysUntilDeadline = Math.ceil((h.registrationDeadline.getTime() - Date.now()) / 86400000);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: (index % 3) * 0.1, duration: 0.5 }}
      className="hackathon-card group"
    >
      {/* Cover image */}
      <div className="relative h-44 overflow-hidden">
        <Image
          src={h.coverImage}
          alt={h.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-1/90 via-surface-1/20 to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {h.featured && (
            <span className="badge-violet text-[10px]">
              ⭐ Featured
            </span>
          )}
          {(h as any).closingSoon && (
            <span className="badge-amber text-[10px]">
              🔥 Closing Soon
            </span>
          )}
          {(h as any).studentsOnly && (
            <span className="badge-blue text-[10px]">
              🎓 Students Only
            </span>
          )}
          {(h as any).beginnerFriendly && (
            <span className="badge-green text-[10px]">
              ✨ Beginner
            </span>
          )}
        </div>

        {/* Bookmark */}
        <button
          className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-midnight/60 backdrop-blur-sm flex items-center justify-center text-text-secondary hover:text-amber hover:bg-midnight/80 transition-all duration-200"
          aria-label="Bookmark hackathon"
          onClick={(e) => e.preventDefault()}
        >
          <Bookmark size={14} />
        </button>

        {/* Mode badge */}
        <div className="absolute bottom-3 left-3">
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-midnight/70 backdrop-blur-sm text-text-secondary text-[11px] font-medium">
            <ModeIcon size={11} />
            {MODE_LABELS[h.mode]}
            {h.location && ` • ${h.location}`}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Organizer */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-xs text-text-secondary">{h.organizer}</span>
          {h.organizerVerified && (
            <span className="verified-badge">
              <CheckCircle2 size={12} className="fill-aqua-400 text-aqua-400" />
              Verified
            </span>
          )}
        </div>

        {/* Title */}
        <Link href={`/hackathons/${h.slug}`} className="group/link">
          <h3 className="font-display font-semibold text-text-primary text-sm leading-snug mb-3 group-hover/link:text-violet-400 transition-colors duration-200 line-clamp-2">
            {h.name}
          </h3>
        </Link>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {h.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="badge-gray text-[10px]">{tag}</span>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/8 my-3" />

        {/* Prize + Free/Paid */}
        <div className="flex items-center justify-between mb-3">
          <span className="prize-pill text-xs">{h.prizePool}</span>
          {h.isFree ? (
            <span className="free-pill text-xs">Free</span>
          ) : (
            <span className="paid-pill text-xs">From {h.ticketPrice}</span>
          )}
        </div>

        {/* Meta info */}
        <div className="flex flex-col gap-1.5 text-xs text-text-secondary">
          <div className="flex items-center gap-1.5">
            <Users size={12} />
            <span>{h.participants.toLocaleString()} participants • Teams: {h.teamSize}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={12} />
            <span>
              {format(h.startDate, "MMM d")} – {format(h.endDate, "MMM d, yyyy")}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={12} className={daysUntilDeadline <= 3 ? "text-red-400" : "text-amber"} />
            <span className={daysUntilDeadline <= 3 ? "text-red-400" : ""}>
              Registration closes in {daysUntilDeadline} day{daysUntilDeadline !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-4">
          <Link
            href={`/hackathons/${h.slug}`}
            className="btn-primary w-full justify-center text-sm"
          >
            View Details
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export function FeaturedHackathons() {
  return (
    <section className="py-20 bg-midnight">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="section-tag">
              <Trophy size={13} />
              Live & Upcoming
            </span>
            <h2 className="section-title">Featured Hackathons</h2>
            <p className="section-subtitle">
              Curated competitions worth your time — from student projects to global challenges.
            </p>
          </div>
          <Link href="/hackathons" className="btn-outline flex-shrink-0">
            Browse All Hackathons
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Demo data label */}
        <p className="text-xs text-text-secondary/40 font-mono mb-6">
          * Sample events for demonstration purposes
        </p>

        {/* Card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEMO_HACKATHONS.map((h, i) => (
            <HackathonCard key={h.id} h={h} index={i} />
          ))}
        </div>

        {/* Load more */}
        <div className="text-center mt-12">
          <Link href="/hackathons" className="btn-secondary btn-lg">
            Discover More Hackathons
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
