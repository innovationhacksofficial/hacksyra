"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Trophy, Users, Code2, Send, Bell, Plus, ArrowRight,
  Zap, Calendar, Clock, CheckCircle2, AlertCircle, Star,
  TrendingUp, Bookmark, Award,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { format } from "date-fns";

// Demo data for dashboard — clearly labeled
const UPCOMING_EVENTS = [
  {
    id: "1",
    name: "India AI Innovation Challenge 2026",
    slug: "india-ai-2026",
    startDate: new Date(Date.now() + 15 * 86400000),
    endDate: new Date(Date.now() + 17 * 86400000),
    submissionDeadline: new Date(Date.now() + 17 * 86400000),
    status: "confirmed" as const,
    teamName: "ByteBusters",
    ticketType: "Standard Pass",
    hasSubmission: false,
  },
];

const QUICK_ACTIONS = [
  { label: "Browse Hackathons", href: "/hackathons", icon: Trophy, color: "text-amber" },
  { label: "Create Project", href: "/dashboard/projects/new", icon: Plus, color: "text-violet-400" },
  { label: "Find Teammates", href: "/hackathons?teamlookup=true", icon: Users, color: "text-aqua-400" },
  { label: "My Submissions", href: "/dashboard/submissions", icon: Send, color: "text-signal-blue" },
];

const SUGGESTED_HACKATHONS = [
  { id: "s1", name: "Student Hack: Open Innovation", slug: "student-hack-2026", prize: "₹2,00,000", isFree: true, deadline: new Date(Date.now() + 5 * 86400000), tags: ["Any Stack"] },
  { id: "s2", name: "Climate Tech Hackathon", slug: "climate-tech-2026", prize: "$8,000", isFree: true, deadline: new Date(Date.now() + 3 * 86400000), tags: ["IoT", "ClimaTech"] },
];

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color.replace("text-", "bg-").replace("-400", "-500/15").replace("-500", "-500/15")}`}>
        <Icon size={20} className={color} />
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-text-primary tabular">{value}</p>
        <p className="text-xs text-text-secondary">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-text-secondary text-sm mb-1">{greeting()},</p>
          <h1 className="text-3xl font-display font-bold text-text-primary">
            {user?.displayName?.split(" ")[0] ?? "Builder"} 👋
          </h1>
          <p className="text-text-secondary mt-1">
            {UPCOMING_EVENTS.length > 0
              ? `You have ${UPCOMING_EVENTS.length} upcoming hackathon. Keep building!`
              : "No upcoming hackathons yet. Find one below!"}
          </p>
        </motion.div>
      </div>

      {/* Demo notice */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-amber/8 border border-amber/20 mb-6 text-xs text-amber">
        <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
        <span>Dashboard showing demo data. Connect your Firebase credentials in <code className="font-mono">.env.local</code> to see real data.</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Trophy} label="Hackathons Joined" value={user?.hackathonsJoined ?? 0} color="text-amber" />
        <StatCard icon={Code2} label="Projects Built" value={user?.projectsPublished ?? 0} color="text-violet-400" />
        <StatCard icon={Award} label="Certificates" value={0} color="text-aqua-400" />
        <StatCard icon={Star} label="Achievements" value={0} color="text-signal-blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Quick actions */}
          <div className="card p-5">
            <h2 className="font-display font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Zap size={18} className="text-violet-400" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/8 hover:bg-white/6 hover:border-white/15 transition-all duration-200 group"
                >
                  <action.icon size={18} className={action.color} />
                  <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Upcoming hackathons */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-text-primary flex items-center gap-2">
                <Trophy size={18} className="text-amber" />
                Upcoming Hackathons
              </h2>
              <Link href="/dashboard/hackathons" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>

            {UPCOMING_EVENTS.length === 0 ? (
              <div className="text-center py-10">
                <Trophy size={32} className="text-text-secondary/30 mx-auto mb-3" />
                <p className="text-text-secondary text-sm">No upcoming hackathons yet.</p>
                <Link href="/hackathons" className="btn-primary btn-sm mt-4 inline-flex">
                  Discover Hackathons
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {UPCOMING_EVENTS.map((ev) => (
                  <div key={ev.id} className="p-4 rounded-xl bg-white/3 border border-white/8">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <Link href={`/hackathons/${ev.slug}`} className="font-semibold text-sm text-text-primary hover:text-violet-400 transition-colors">
                          {ev.name}
                        </Link>
                        {ev.teamName && (
                          <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-1">
                            <Users size={11} />
                            Team: {ev.teamName}
                          </p>
                        )}
                      </div>
                      <span className={ev.status === "confirmed" ? "status-confirmed" : "status-pending"}>
                        {ev.status === "confirmed" ? <><CheckCircle2 size={11} />Confirmed</> : "Pending"}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {format(ev.startDate, "MMM d")} – {format(ev.endDate, "MMM d, yyyy")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        Submit by {format(ev.submissionDeadline, "MMM d, HH:mm")}
                      </span>
                    </div>
                    {!ev.hasSubmission && (
                      <div className="mt-3 flex gap-2">
                        <Link href={`/hackathons/${ev.slug}/submit`} className="btn-primary btn-sm">
                          Start Submission
                        </Link>
                        <Link href={`/hackathons/${ev.slug}/team`} className="btn-secondary btn-sm">
                          Manage Team
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Profile completion */}
          {!user?.onboardingComplete && (
            <div className="card p-5 border-violet-500/25 bg-violet-500/5">
              <h3 className="font-semibold text-text-primary text-sm mb-2">Complete your profile</h3>
              <p className="text-xs text-text-secondary mb-4">A complete profile helps organizers and teammates find you.</p>
              <div className="progress-bar mb-3">
                <div className="progress-fill" style={{ width: "40%" }} />
              </div>
              <p className="text-xs text-text-secondary mb-3">40% complete</p>
              <Link href="/onboarding" className="btn-primary btn-sm w-full justify-center">
                Complete Setup
              </Link>
            </div>
          )}

          {/* Notifications */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-sm text-text-primary flex items-center gap-2">
                <Bell size={16} className="text-violet-400" />
                Notifications
              </h2>
              <Link href="/dashboard/notifications" className="text-xs text-violet-400 hover:text-violet-300">View all</Link>
            </div>
            <div className="text-center py-6">
              <Bell size={24} className="text-text-secondary/30 mx-auto mb-2" />
              <p className="text-xs text-text-secondary">No new notifications</p>
            </div>
          </div>

          {/* Suggested hackathons */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-sm text-text-primary flex items-center gap-2">
                <TrendingUp size={16} className="text-aqua-400" />
                Suggested For You
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              {SUGGESTED_HACKATHONS.map((h) => (
                <Link key={h.id} href={`/hackathons/${h.slug}`} className="flex flex-col gap-2 p-3 rounded-xl bg-white/3 border border-white/8 hover:border-white/15 hover:bg-white/6 transition-all duration-200">
                  <p className="text-xs font-semibold text-text-primary line-clamp-2">{h.name}</p>
                  <div className="flex items-center justify-between">
                    <span className="prize-pill text-[10px] px-2 py-0.5">{h.prize}</span>
                    {h.isFree && <span className="free-pill text-[10px] px-2 py-0.5">Free</span>}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-amber">
                    <Clock size={10} />
                    Closes {format(h.deadline, "MMM d")}
                  </div>
                </Link>
              ))}
              <Link href="/hackathons" className="btn-ghost btn-sm w-full justify-center text-text-secondary">
                Browse All <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
