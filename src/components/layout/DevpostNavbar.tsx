"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  ChevronDown,
  Menu,
  X,
  Globe,
  MapPin,
  GraduationCap,
  Sparkles,
  Trophy,
  Users,
  Code2,
  BookOpen,
  ArrowRight,
  LogOut,
  LayoutDashboard,
  Rocket,
  Flame,
  Award,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { LivePulseTicker } from "@/components/home/LivePulseTicker";

export function DevpostNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navRef = useRef<HTMLElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
        setUserMenuOpen(false);
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setActiveMenu(null);
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const handleMouseEnter = (menuName: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setActiveMenu(menuName);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 180);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/hackathons?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <header
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 transition-all shadow-[0_4px_25px_-5px_rgba(15,23,42,0.06)]"
    >
      {/* 1. TOP HEAD: Real-Time Live Tournament Pulse Announcement Bar */}
      <LivePulseTicker />

      {/* 2. Main Navigation Bar */}
      <div className="h-[68px] bg-white/95 backdrop-blur-xl border-b border-slate-200/80 relative">
        {/* Top subtle highlight line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-400 opacity-90" />

        <div className="max-w-7xl mx-auto h-full px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2">
          {/* Left: Brand Logo + Primary Nav */}
          <div className="flex items-center gap-3 sm:gap-7 lg:gap-9 min-w-0 flex-shrink-0">
          {/* Innovation Hacks Logo & Brand */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
            {/* Innovation Hacks 'iH' Official Logo Mark */}
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-xs border border-slate-200/90 bg-white flex items-center justify-center p-0.5 group-hover:scale-105 group-hover:shadow-md group-hover:border-blue-400/80 transition-all duration-200 flex-shrink-0">
              <img
                src="/logo-circle.png"
                alt="Innovation Hacks"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col flex-shrink-0">
              <span className="font-display font-black text-sm sm:text-xl tracking-tight text-slate-900 group-hover:text-[#1868D8] transition-colors leading-none flex items-center gap-1 whitespace-nowrap">
                Innovation <span className="text-[#1868D8]">Hacks</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 tracking-wider uppercase leading-tight mt-0.5 whitespace-nowrap">
                Global Platform
              </span>
            </div>
          </Link>

          {/* Desktop Nav Menus — Next-Level 'Vera Maari' Design */}
          <nav className="hidden md:flex items-center gap-1">
            {/* ================= 1. JOIN A HACKATHON ================= */}
            <div
              className="relative group"
              onMouseEnter={() => handleMouseEnter("join")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() =>
                  setActiveMenu(activeMenu === "join" ? null : "join")
                }
                className={`flex items-center gap-2 px-3.5 py-2 text-[14px] font-semibold rounded-xl transition-all duration-200 ${
                  activeMenu === "join"
                    ? "text-[#1868D8] bg-blue-50/90 shadow-xs ring-1 ring-blue-500/20"
                    : "text-slate-700 group-hover:text-[#1868D8] group-hover:bg-blue-50/50"
                }`}
              >
                <span>Join a hackathon</span>
                <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                  Live
                </span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 text-slate-400 group-hover:text-[#1868D8] group-hover:rotate-180 ${
                    activeMenu === "join" ? "rotate-180 text-[#1868D8]" : ""
                  }`}
                />
              </button>

              {/* Mega Dropdown Panel: Join a hackathon */}
              <div
                className={`absolute top-full left-0 pt-2 w-[580px] z-50 transition-all duration-200 ${
                  activeMenu === "join"
                    ? "opacity-100 visible translate-y-0 pointer-events-auto"
                    : "opacity-0 invisible -translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:pointer-events-auto"
                }`}
                onMouseEnter={() => handleMouseEnter("join")}
                onMouseLeave={handleMouseLeave}
              >
                <div className="bg-white rounded-2xl shadow-[0_25px_60px_-15px_rgba(15,23,42,0.22)] border border-slate-200/90 p-4">
                  <div className="grid grid-cols-5 gap-4">
                    {/* Main Nav Options (3 Cols) */}
                    <div className="col-span-3 space-y-1">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                        Explore Competitions
                      </p>

                      <Link
                        href="/hackathons?mode=online"
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-blue-50/70 transition-all group/item"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover/item:scale-105 transition-transform flex-shrink-0">
                          <Globe size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 group-hover/item:text-[#1868D8] transition-colors">
                              Online Hackathons
                            </span>
                            <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md">
                              1,200+
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                            Compete globally from the comfort of home
                          </p>
                        </div>
                      </Link>

                      <Link
                        href="/hackathons?mode=in_person"
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-emerald-50/70 transition-all group/item"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover/item:scale-105 transition-transform flex-shrink-0">
                          <MapPin size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 group-hover/item:text-emerald-700 transition-colors">
                              In-Person Hackathons
                            </span>
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md">
                              Nearby
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                            Network, build & demo live at local campuses
                          </p>
                        </div>
                      </Link>

                      <Link
                        href="/hackathons?difficulty=beginner"
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-purple-50/70 transition-all group/item"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20 group-hover/item:scale-105 transition-transform flex-shrink-0">
                          <GraduationCap size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 group-hover/item:text-purple-700 transition-colors">
                              Student &amp; Beginner
                            </span>
                            <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-md">
                              Starter
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                            High school, college tracks &amp; mentorship
                          </p>
                        </div>
                      </Link>
                    </div>

                    {/* Featured Right Card (2 Cols) */}
                    <div className="col-span-2 bg-gradient-to-br from-slate-900 via-[#0A2540] to-blue-950 rounded-xl p-4 text-white flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
                      <div>
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold tracking-wide uppercase border border-blue-400/20 mb-2.5">
                          <Flame size={12} className="text-amber-400" />
                          Featured Event
                        </div>
                        <h4 className="font-bold text-sm text-white leading-snug">
                          Global AI Innovate Hackathon
                        </h4>
                        <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                          $150,000 prize pool with AWS, Meta &amp; Google sponsors.
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/10">
                        <Link
                          href="/hackathons"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors group/link"
                        >
                          <span>Explore &amp; Register</span>
                          <ArrowRight
                            size={13}
                            className="group-hover/link:translate-x-1 transition-transform"
                          />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Footer Bar */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between px-2">
                    <span className="text-xs text-slate-500">
                      ⚡ <strong>1,450+</strong> hackathons curated for 2026
                    </span>
                    <Link
                      href="/hackathons"
                      className="text-xs font-bold text-[#1868D8] hover:text-[#0F52B0] flex items-center gap-1 transition-colors"
                    >
                      <span>Browse all hackathons</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= 2. HOST A HACKATHON ================= */}
            <div
              className="relative group"
              onMouseEnter={() => handleMouseEnter("host")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() =>
                  setActiveMenu(activeMenu === "host" ? null : "host")
                }
                className={`flex items-center gap-2 px-3.5 py-2 text-[14px] font-semibold rounded-xl transition-all duration-200 ${
                  activeMenu === "host"
                    ? "text-[#1868D8] bg-blue-50/90 shadow-xs ring-1 ring-blue-500/20"
                    : "text-slate-700 group-hover:text-[#1868D8] group-hover:bg-blue-50/50"
                }`}
              >
                <span>Host a hackathon</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 text-slate-400 group-hover:text-[#1868D8] group-hover:rotate-180 ${
                    activeMenu === "host" ? "rotate-180 text-[#1868D8]" : ""
                  }`}
                />
              </button>

              {/* Mega Dropdown Panel: Host a hackathon */}
              <div
                className={`absolute top-full left-0 pt-2 w-[540px] z-50 transition-all duration-200 ${
                  activeMenu === "host"
                    ? "opacity-100 visible translate-y-0 pointer-events-auto"
                    : "opacity-0 invisible -translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:pointer-events-auto"
                }`}
                onMouseEnter={() => handleMouseEnter("host")}
                onMouseLeave={handleMouseLeave}
              >
                <div className="bg-white rounded-2xl shadow-[0_25px_60px_-15px_rgba(15,23,42,0.22)] border border-slate-200/90 p-4">
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                      Organizer Solutions
                    </p>

                    <Link
                      href="/organizer"
                      className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-blue-50/70 transition-all group/item"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20 group-hover/item:scale-105 transition-transform flex-shrink-0">
                        <Trophy size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 group-hover/item:text-[#1868D8] transition-colors">
                            Organizer Platform Suite
                          </span>
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md">
                            All-in-One
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Registration portal, automated team formation &amp; submission reviews
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/organizer#features"
                      className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-violet-50/70 transition-all group/item"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-violet-500/20 group-hover/item:scale-105 transition-transform flex-shrink-0">
                        <Sparkles size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 group-hover/item:text-violet-700 transition-colors">
                            AI-Powered Judging
                          </span>
                          <span className="text-[10px] font-bold bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-md">
                            New
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Weighted rubrics, anti-cheating verification &amp; instant tie-breaking
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/about"
                      className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-cyan-50/70 transition-all group/item"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-cyan-500/20 group-hover/item:scale-105 transition-transform flex-shrink-0">
                        <Users size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 group-hover/item:text-cyan-700 transition-colors">
                            Community Outreach &amp; Sponsors
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Reach over 45,000+ passionate developers, designers and builders
                        </p>
                      </div>
                    </Link>
                  </div>

                  {/* Call to action footer */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between px-2 bg-slate-50/60 -mx-2 -mb-2 p-3 rounded-b-xl">
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Ready to launch a competition?
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Setup takes less than 5 minutes.
                      </p>
                    </div>
                    <Link
                      href="/organizer/create"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1868D8] hover:bg-[#0F52B0] text-white text-xs font-bold shadow-sm transition-colors"
                    >
                      <span>Create Hackathon</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= 3. RESOURCES ================= */}
            <div
              className="relative group"
              onMouseEnter={() => handleMouseEnter("resources")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() =>
                  setActiveMenu(activeMenu === "resources" ? null : "resources")
                }
                className={`flex items-center gap-2 px-3.5 py-2 text-[14px] font-semibold rounded-xl transition-all duration-200 ${
                  activeMenu === "resources"
                    ? "text-[#1868D8] bg-blue-50/90 shadow-xs ring-1 ring-blue-500/20"
                    : "text-slate-700 group-hover:text-[#1868D8] group-hover:bg-blue-50/50"
                }`}
              >
                <span>Resources</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 text-slate-400 group-hover:text-[#1868D8] group-hover:rotate-180 ${
                    activeMenu === "resources" ? "rotate-180 text-[#1868D8]" : ""
                  }`}
                />
              </button>

              {/* Mega Dropdown Panel: Resources */}
              <div
                className={`absolute top-full left-0 pt-2 w-[520px] z-50 transition-all duration-200 ${
                  activeMenu === "resources"
                    ? "opacity-100 visible translate-y-0 pointer-events-auto"
                    : "opacity-0 invisible -translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:pointer-events-auto"
                }`}
                onMouseEnter={() => handleMouseEnter("resources")}
                onMouseLeave={handleMouseLeave}
              >
                <div className="bg-white rounded-2xl shadow-[0_25px_60px_-15px_rgba(15,23,42,0.22)] border border-slate-200/90 p-4">
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                      Builder Community &amp; Tools
                    </p>

                    <Link
                      href="/projects"
                      className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-blue-50/70 transition-all group/item"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover/item:scale-105 transition-transform flex-shrink-0">
                        <Code2 size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 group-hover/item:text-[#1868D8] transition-colors">
                            Project Showcase
                          </span>
                          <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md">
                            40k+ Projects
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Explore award-winning software, hardware &amp; AI prototypes
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/leaderboard"
                      className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-amber-50/70 transition-all group/item"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20 group-hover/item:scale-105 transition-transform flex-shrink-0">
                        <Award size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 group-hover/item:text-amber-700 transition-colors">
                            Global Leaderboard
                          </span>
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md">
                            Rankings
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Top hackers, university leaderboards &amp; win badges
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/about"
                      className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-emerald-50/70 transition-all group/item"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover/item:scale-105 transition-transform flex-shrink-0">
                        <BookOpen size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 group-hover/item:text-emerald-700 transition-colors">
                            Hackathon Playbook
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Pitch deck templates, starter kits &amp; submission checklists
                        </p>
                      </div>
                    </Link>
                  </div>

                  {/* Community Discord Bar */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between px-2">
                    <span className="text-xs text-slate-500 flex items-center gap-1.5">
                      <MessageSquare size={13} className="text-indigo-500" />
                      Join <strong>45,000+ builders</strong> on Discord &amp; Slack
                    </span>
                    <a
                      href="https://discord.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[#1868D8] hover:text-[#0F52B0] flex items-center gap-1"
                    >
                      <span>Join Community</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Right: Modern Search Bar Trigger + Auth Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          {/* Quick Search Pill Launcher (⌘K) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex items-center justify-center p-2 sm:px-3 sm:py-1.5 rounded-full bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/90 text-slate-600 hover:text-slate-900 transition-all duration-150 text-xs font-medium group"
              title="Quick Search (Ctrl + K)"
              aria-label="Search hackathons"
            >
              <Search size={15} className="text-slate-500 group-hover:text-slate-800 transition-colors" />
              <span className="hidden sm:inline text-slate-400 group-hover:text-slate-600 ml-1.5">Search hackathons...</span>
              <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-white rounded border border-slate-200/90 shadow-2xs ml-1.5">
                ⌘K
              </kbd>
            </button>

            {/* Expanded Search Floating Dropdown */}
            {searchOpen && (
              <form
                onSubmit={handleSearchSubmit}
                className="absolute right-0 top-full mt-2 w-[calc(100vw-32px)] max-w-sm sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2.5 z-50 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-150"
              >
                <Search size={16} className="text-slate-400 ml-2 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search hackathons, themes, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full text-sm py-1.5 px-1 focus:outline-none text-slate-800 placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-[#1868D8] hover:bg-[#0F52B0] text-white text-xs font-bold transition-colors flex-shrink-0"
                >
                  Search
                </button>
              </form>
            )}
          </div>

          {/* User authenticated vs unauthenticated */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-blue-100 transition-all"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-[#1868D8] to-blue-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {user.displayName
                    ? user.displayName.slice(0, 2).toUpperCase()
                    : user.email?.slice(0, 2).toUpperCase() || "ME"}
                </div>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {user.displayName || "Builder"}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <LayoutDashboard size={15} className="text-blue-600" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/dashboard/hackathons"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Trophy size={15} className="text-amber-500" />
                    <span>My hackathons</span>
                  </Link>
                  <Link
                    href="/organizer"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Sparkles size={15} className="text-purple-500" />
                    <span>Organizer portal</span>
                  </Link>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    onClick={() => signOut()}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={15} />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <Link
                href="/login"
                className="hidden md:inline-flex px-3 py-2 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-100/60 whitespace-nowrap flex-shrink-0"
              >
                Log in
              </Link>
              {/* Ultra-Stylish 'Vera Maari' Sign Up CTA Button */}
              <Link
                href="/signup"
                className="relative inline-flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-white text-xs sm:text-sm font-bold bg-gradient-to-r from-[#1868D8] via-[#2563EB] to-[#4F46E5] shadow-sm shadow-blue-600/25 hover:shadow-md hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group overflow-hidden whitespace-nowrap flex-shrink-0"
              >
                <span className="relative z-10 flex items-center gap-1 whitespace-nowrap">
                  Sign up
                  <ArrowRight
                    size={13}
                    className="hidden xs:inline group-hover:translate-x-0.5 transition-transform"
                  />
                </span>
                {/* Subtle sheen highlight */}
                <span className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-700 ease-out" />
              </Link>
            </div>
          )}

          {/* Mobile hamburger menu */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </div>

      {/* Mobile Menu Backdrop + Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[104px] bottom-0 bg-slate-950/40 backdrop-blur-xs z-40 animate-in fade-in duration-200">
          <div
            className="bg-white border-b border-slate-200 px-4 py-5 space-y-4 shadow-2xl max-h-[calc(100vh-110px)] overflow-y-auto animate-in slide-in-from-top-2 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Quick In-Drawer Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search size={16} className="text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search hackathons, topics, builders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-20 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1868D8] focus:bg-white"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-[#1868D8] text-white text-xs font-bold"
              >
                Go
              </button>
            </form>

            {/* Quick Browse Category Badges */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
              <Link
                href="/hackathons?mode=online"
                className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#1868D8] font-semibold whitespace-nowrap"
              >
                🌐 Online
              </Link>
              <Link
                href="/hackathons?mode=in_person"
                className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold whitespace-nowrap"
              >
                📍 In-Person
              </Link>
              <Link
                href="#team-finder"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-semibold whitespace-nowrap"
              >
                👥 Find Squad
              </Link>
              <Link
                href="/hackathons?category=beginner"
                className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-semibold whitespace-nowrap"
              >
                🎓 Beginners
              </Link>
            </div>

            {/* Main Navigation Links */}
            <div className="space-y-1 pt-1 border-t border-slate-100">
              <Link
                href="/hackathons"
                className="flex items-center justify-between px-3 py-3 text-sm font-bold text-slate-800 rounded-xl hover:bg-blue-50 hover:text-[#1868D8] transition-colors"
              >
                <span className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#1868D8] flex items-center justify-center">
                    <Globe size={16} />
                  </div>
                  Join a hackathon
                </span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  1,200+ Live
                </span>
              </Link>

              <Link
                href="#team-finder"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-3 text-sm font-bold text-slate-800 rounded-xl hover:bg-blue-50 hover:text-[#1868D8] transition-colors"
              >
                <span className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Users size={16} />
                  </div>
                  Speed Squad · Teammate Finder
                </span>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                  Match
                </span>
              </Link>

              <Link
                href="/organizer"
                className="flex items-center justify-between px-3 py-3 text-sm font-bold text-slate-800 rounded-xl hover:bg-blue-50 hover:text-[#1868D8] transition-colors"
              >
                <span className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Trophy size={16} />
                  </div>
                  Host a hackathon
                </span>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  Organizer Suite
                </span>
              </Link>

              <Link
                href="/projects"
                className="flex items-center justify-between px-3 py-3 text-sm font-bold text-slate-800 rounded-xl hover:bg-blue-50 hover:text-[#1868D8] transition-colors"
              >
                <span className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center">
                    <Code2 size={16} />
                  </div>
                  Explore projects
                </span>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  40k+ Community
                </span>
              </Link>

              <Link
                href="/leaderboard"
                className="flex items-center justify-between px-3 py-3 text-sm font-bold text-slate-800 rounded-xl hover:bg-blue-50 hover:text-[#1868D8] transition-colors"
              >
                <span className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-yellow-100 text-yellow-700 flex items-center justify-center">
                    <Award size={16} />
                  </div>
                  Global Leaderboard
                </span>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  Rankings
                </span>
              </Link>
            </div>

            {/* Auth Buttons inside drawer */}
            {!user ? (
              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <Link
                  href="/login"
                  className="flex-1 text-center py-3 text-sm font-bold text-slate-800 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="flex-1 text-center py-3 text-sm font-bold text-white bg-gradient-to-r from-[#1868D8] to-blue-600 rounded-xl shadow-md transition-colors"
                >
                  Sign up free
                </Link>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-100">
                <Link
                  href="/dashboard"
                  className="w-full block text-center py-3 text-sm font-bold text-white bg-[#1868D8] rounded-xl shadow-md"
                >
                  Open Dashboard
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
