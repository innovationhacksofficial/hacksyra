"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  LayoutDashboard, Plus, Trophy, Users, BarChart3,
  CreditCard, Award, Settings, Zap, ChevronRight,
  Menu, X, ExternalLink, Sparkles, CheckCircle2,
  Bell, HelpCircle
} from "lucide-react";

const SIDEBAR_LINKS = [
  { href: "/organizer", label: "Dashboard Overview", icon: LayoutDashboard, exact: true },
  { href: "/organizer/create", label: "Host New Hackathon", icon: Plus, highlight: true },
  { href: "/organizer/events", label: "My Hackathons", icon: Trophy },
  { href: "/organizer/participants", label: "Participants & Teams", icon: Users },
  { href: "/organizer/analytics", label: "Analytics & Reports", icon: BarChart3 },
  { href: "/organizer/payments", label: "Ticketing & Payouts", icon: CreditCard },
  { href: "/organizer/certificates", label: "Certificates & Badges", icon: Award },
  { href: "/organizer/settings", label: "Organizer Settings", icon: Settings },
];

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const demoOrganizer: any = {
    uid: "demo-organizer",
    displayName: "Innovation Hacks HQ",
    email: "organizer@innovationhacks.in",
    role: "organizer",
  };

  const activeUser = user || demoOrganizer;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#1565D8] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row">
      {/* Mobile Top Header */}
      <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#1565D8] flex items-center justify-center shadow-sm">
            <Zap size={16} className="text-white fill-white" />
          </div>
          <span className="font-display font-black text-lg tracking-tight text-slate-900">
            HACK<span className="text-[#1565D8]">SYRA</span>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#1565D8] text-[10px] font-bold border border-blue-100">
            Host
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/organizer/create"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1565D8] text-white text-xs font-semibold"
          >
            <Plus size={13} />
            <span>Create</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
          <div className="w-72 max-w-[85%] h-full bg-white flex flex-col p-4 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <span className="font-display font-bold text-slate-900 text-sm">
                Organizer Console
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto">
              {SIDEBAR_LINKS.map((link) => {
                const isActive = link.exact
                  ? pathname === link.href
                  : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-[#EEF4FF] text-[#1565D8]"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <link.icon size={16} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-100">
              <Link
                href="/"
                className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#1565D8]"
              >
                <ExternalLink size={14} /> Back to Public Platform
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Fixed Left Sidebar (Unstop Organizer Style) */}
      <aside className="hidden lg:flex w-64 flex-col fixed top-0 left-0 h-full bg-white border-r border-slate-200 z-40">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1565D8] to-[#0EA5E9] flex items-center justify-center shadow-sm">
              <Zap size={16} className="text-white fill-white" />
            </div>
            <div>
              <span className="font-display font-black text-lg tracking-tight text-slate-900">
                HACK<span className="text-[#1565D8]">SYRA</span>
              </span>
              <span className="block text-[9px] font-bold text-slate-400 tracking-wider uppercase">
                Organizer Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Organizer Profile Card */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="w-10 h-10 rounded-xl bg-[#1565D8] text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
              IH
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {activeUser.displayName || "Innovation Hacks"}
                </p>
                <CheckCircle2 size={12} className="text-[#1565D8] fill-[#1565D8] flex-shrink-0" />
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {activeUser.email || "organizer@innovationhacks.in"}
              </p>
            </div>
          </div>
        </div>

        {/* Primary CTA: Host Hackathon */}
        <div className="px-4 pt-4 pb-2">
          <Link
            href="/organizer/create"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#1565D8] hover:bg-[#0F52B0] text-white font-bold text-xs shadow-sm hover:shadow transition-all duration-200 active:scale-95 group"
          >
            <Plus size={15} className="group-hover:rotate-90 transition-transform" />
            Host New Hackathon
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {SIDEBAR_LINKS.map((link) => {
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-[#EEF4FF] text-[#1565D8] font-bold shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <link.icon
                  size={16}
                  className={isActive ? "text-[#1565D8]" : "text-slate-400"}
                />
                <span className="flex-1">{link.label}</span>
                {link.highlight && !isActive && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    New
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom links */}
        <div className="p-3 border-t border-slate-100 space-y-1">
          <Link
            href="/hackathons"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <ExternalLink size={14} className="text-slate-400" />
            Explore All Hackathons
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-[#1565D8] transition-colors"
          >
            <ChevronRight size={14} className="rotate-180" />
            Back to Public Home
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        {/* Desktop Top Header Bar */}
        <div className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Organizer Console</span>
            <ChevronRight size={12} className="text-slate-400" />
            <span className="font-semibold text-slate-900 capitalize">
              {pathname === "/organizer"
                ? "Overview"
                : pathname.replace("/organizer/", "").replace("-", " ")}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/hackathons/india-ai-2026"
              target="_blank"
              className="flex items-center gap-1.5 text-xs text-[#1565D8] font-semibold hover:underline"
            >
              <span>View Public Page</span>
              <ExternalLink size={12} />
            </Link>

            <div className="h-4 w-px bg-slate-200" />

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">
                Innovation Hacks HQ
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
