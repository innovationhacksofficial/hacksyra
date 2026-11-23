"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  LayoutDashboard, Trophy, Users, Code2, Send, CreditCard, Ticket,
  Bookmark, Award, Bell, Settings, UserCircle, MessageSquare, Zap,
  ChevronRight, LogOut,
} from "lucide-react";

const SIDEBAR_LINKS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/hackathons", label: "My Hackathons", icon: Trophy },
  { href: "/dashboard/teams", label: "My Teams", icon: Users },
  { href: "/dashboard/projects", label: "My Projects", icon: Code2 },
  { href: "/dashboard/submissions", label: "Submissions", icon: Send },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/tickets", label: "Tickets", icon: Ticket },
  { href: "/dashboard/saved", label: "Saved Events", icon: Bookmark },
  { href: "/dashboard/certificates", label: "Certificates", icon: Award },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const demoUser: any = {
    uid: "demo-builder",
    displayName: "Aarav Sharma",
    email: "aarav.sharma@gmail.com",
    role: "builder",
    avatarUrl: "",
    bio: "Full-stack AI developer building autonomous workflows.",
    skills: ["Next.js", "PyTorch", "Python", "TypeScript"],
    rating: 1850,
    hackathonsWon: 2,
    hackathonsCount: 5,
  };

  const activeUser = user || demoUser;

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-gradient flex items-center justify-center animate-pulse">
            <Zap size={20} className="text-white" />
          </div>
          <div className="w-5 h-5 border-2 border-white/20 border-t-violet-400 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed top-0 left-0 h-full bg-surface-1 border-r border-white/8 z-50">
        {/* Logo */}
        <div className="p-5 border-b border-white/8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-gradient flex items-center justify-center">
              <Zap size={15} className="text-white" />
            </div>
            <span className="font-display text-lg font-bold text-text-primary">
              HACK<span className="gradient-text">SYRA</span>
            </span>
          </Link>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-white/8">
          <Link href="/dashboard/settings" className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all duration-200 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-violet-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-violet-400">
                {activeUser.displayName?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">{activeUser.displayName}</p>
              <p className="text-xs text-text-secondary truncate">@{activeUser.username || "builder"}</p>
            </div>
            <ChevronRight size={14} className="text-text-secondary group-hover:text-text-primary transition-colors" />
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="flex flex-col gap-0.5">
            {SIDEBAR_LINKS.map((link) => {
              const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
                >
                  <link.icon size={18} className={isActive ? "text-violet-400" : "text-text-secondary"} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-white/8 space-y-1">
          <Link href="/u/me" className="sidebar-link">
            <UserCircle size={18} className="text-text-secondary" />
            View Public Profile
          </Link>
          <button
            onClick={signOut}
            className="w-full sidebar-link text-red-400 hover:text-red-300 hover:bg-red-500/5"
          >
            <LogOut size={18} className="text-red-400" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 h-16 bg-surface-1 border-b border-white/8 sticky top-0 z-40">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-gradient flex items-center justify-center">
              <Zap size={13} className="text-white" />
            </div>
            <span className="font-display text-base font-bold text-text-primary">
              HACK<span className="gradient-text">SYRA</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/notifications" className="btn-icon relative">
              <Bell size={16} className="text-text-secondary" />
            </Link>
          </div>
        </div>

        <div className="p-6 lg:p-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
