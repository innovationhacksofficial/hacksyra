"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Menu,
  X,
  Sun,
  Moon,
  Monitor,
  Bell,
  ChevronDown,
  Zap,
  Trophy,
  Users,
  BookOpen,
  Code2,
  LayoutDashboard,
  Settings,
  LogOut,
  UserCircle,
  Plus,
  Sparkles,
  Globe,
} from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import Image from "next/image";

// ---- Nav link definitions ----
const NAV_LINKS = [
  {
    label: "Discover",
    href: "/hackathons",
    icon: Zap,
    description: "Find hackathons worldwide",
  },
  {
    label: "Hackathons",
    href: "/hackathons",
    icon: Trophy,
    mega: true,
    groups: [
      {
        title: "Browse",
        links: [
          { label: "All Hackathons", href: "/hackathons", icon: Globe },
          { label: "Trending", href: "/hackathons?sort=trending", icon: Sparkles },
          { label: "Free Events", href: "/hackathons?free=true", icon: Zap },
          { label: "Beginner Friendly", href: "/hackathons?difficulty=beginner", icon: Users },
        ],
      },
      {
        title: "Themes",
        links: [
          { label: "AI & Machine Learning", href: "/hackathons?category=ai_ml", icon: Code2 },
          { label: "Web3 & Blockchain", href: "/hackathons?category=web3", icon: Code2 },
          { label: "FinTech", href: "/hackathons?category=fintech", icon: Code2 },
          { label: "Social Impact", href: "/hackathons?category=social_impact", icon: Code2 },
        ],
      },
    ],
  },
  {
    label: "Explore Projects",
    href: "/projects",
    icon: Code2,
  },
  {
    label: "Leaderboard",
    href: "/leaderboard",
    icon: Trophy,
  },
  {
    label: "Host a Hackathon",
    href: "/organizer/create",
    icon: Plus,
    highlight: true,
  },
  {
    label: "About",
    href: "/about",
    icon: BookOpen,
  },
];

const USER_MENU_LINKS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Profile", href: "/u/me", icon: UserCircle },
  { label: "My Hackathons", href: "/dashboard/hackathons", icon: Trophy },
  { label: "Organizer Console", href: "/organizer", icon: Zap },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, loading, signOut } = useAuth();
  const navRef = useRef<HTMLElement>(null);

  // Scroll detection
  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setActiveDropdown(null);
    setUserMenuOpen(false);
  }, [pathname]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
        setUserMenuOpen(false);
        setThemeMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Lock body scroll on mobile
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const themeIcon =
    theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  const ThemeIcon = themeIcon;

  return (
    <>
      <header
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-nav transition-all duration-300 ${
          isScrolled
            ? "bg-midnight/95 backdrop-blur-xl border-b border-white/8 shadow-lg"
            : "bg-transparent"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[var(--nav-height)]">

            {/* === LOGO === */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-violet-gradient flex items-center justify-center shadow-violet group-hover:scale-105 transition-transform duration-200">
                  <Zap size={16} className="text-white" strokeWidth={2.5} />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-aqua-400 border-2 border-midnight" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-text-primary">
                HACK<span className="gradient-text">SYRA</span>
              </span>
            </Link>

            {/* === DESKTOP NAV LINKS === */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <div key={link.label} className="relative">
                  {link.mega ? (
                    <button
                      className={`nav-link flex items-center gap-1 ${
                        activeDropdown === link.label ? "nav-link-active" : ""
                      }`}
                      onClick={() =>
                        setActiveDropdown(
                          activeDropdown === link.label ? null : link.label
                        )
                      }
                      aria-expanded={activeDropdown === link.label}
                      aria-haspopup="true"
                    >
                      {link.label}
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${
                          activeDropdown === link.label ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      className={`nav-link ${
                        link.highlight
                          ? "text-violet-400 hover:text-violet-300 font-semibold"
                          : ""
                      } ${pathname === link.href ? "nav-link-active" : ""}`}
                    >
                      {link.label}
                    </Link>
                  )}

                  {/* Mega Menu Dropdown */}
                  <AnimatePresence>
                    {link.mega && activeDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.18 }}
                        className="absolute top-full left-0 mt-2 w-[480px] card-glass border border-white/10 shadow-card-dark p-5 rounded-2xl"
                      >
                        <div className="grid grid-cols-2 gap-6">
                          {link.groups?.map((group) => (
                            <div key={group.title}>
                              <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-3">
                                {group.title}
                              </p>
                              <div className="flex flex-col gap-1">
                                {group.links.map((gl) => (
                                  <Link
                                    key={gl.href}
                                    href={gl.href}
                                    className="flex items-center gap-2.5 p-2 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all duration-150"
                                  >
                                    <gl.icon size={15} className="text-violet-400 flex-shrink-0" />
                                    {gl.label}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* === RIGHT SIDE === */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                id="global-search-btn"
                onClick={() => setSearchOpen(true)}
                className="btn-icon hidden sm:flex"
                aria-label="Search"
              >
                <Search size={16} className="text-text-secondary" />
              </button>

              {/* Theme Toggle */}
              <div className="relative">
                <button
                  id="theme-toggle-btn"
                  onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                  className="btn-icon hidden sm:flex"
                  aria-label="Toggle theme"
                >
                  <ThemeIcon size={16} className="text-text-secondary" />
                </button>
                <AnimatePresence>
                  {themeMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-36 card-glass border border-white/10 shadow-card-dark rounded-xl overflow-hidden"
                    >
                      {(["dark", "light", "system"] as const).map((t) => {
                        const Icon = t === "dark" ? Moon : t === "light" ? Sun : Monitor;
                        return (
                          <button
                            key={t}
                            onClick={() => { setTheme(t); setThemeMenuOpen(false); }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors duration-150 ${
                              theme === t
                                ? "text-violet-400 bg-violet-500/10"
                                : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                            }`}
                          >
                            <Icon size={14} />
                            <span className="capitalize">{t}</span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Auth section */}
              {loading ? (
                <div className="w-20 h-9 skeleton rounded-xl" />
              ) : user ? (
                <>
                  {/* Notifications */}
                  <button
                    id="notifications-btn"
                    className="btn-icon relative hidden sm:flex"
                    aria-label="Notifications"
                  >
                    <Bell size={16} className="text-text-secondary" />
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-violet-500 border border-midnight" />
                  </button>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      id="user-menu-btn"
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-white/5 transition-all duration-200"
                      aria-expanded={userMenuOpen}
                      aria-haspopup="true"
                    >
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                        {user.photoURL ? (
                          <Image
                            src={user.photoURL}
                            alt={user.displayName}
                            width={32}
                            height={32}
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-violet-400">
                            {user.displayName?.[0]?.toUpperCase() ?? "U"}
                          </span>
                        )}
                      </div>
                      <ChevronDown
                        size={14}
                        className={`text-text-secondary transition-transform duration-200 hidden sm:block ${
                          userMenuOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-56 card-glass border border-white/10 shadow-card-dark rounded-xl overflow-hidden"
                        >
                          {/* User info */}
                          <div className="px-4 py-3 border-b border-white/8">
                            <p className="text-sm font-semibold text-text-primary truncate">
                              {user.displayName}
                            </p>
                            <p className="text-xs text-text-secondary truncate">
                              @{user.username}
                            </p>
                          </div>

                          {/* Nav links */}
                          <div className="py-1">
                            {USER_MENU_LINKS.map((link) => (
                              <Link
                                key={link.href}
                                href={link.href}
                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors duration-150"
                              >
                                <link.icon size={15} className="text-violet-400" />
                                {link.label}
                              </Link>
                            ))}
                          </div>

                          {/* Sign out */}
                          <div className="border-t border-white/8 py-1">
                            <button
                              onClick={signOut}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/5 transition-colors duration-150"
                            >
                              <LogOut size={15} />
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn-ghost hidden sm:inline-flex">
                    Log In
                  </Link>
                  <Link href="/signup" className="btn-primary">
                    Sign Up
                  </Link>
                </>
              )}

              {/* Mobile menu toggle */}
              <button
                id="mobile-menu-btn"
                className="btn-icon lg:hidden ml-1"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? (
                  <X size={18} className="text-text-primary" />
                ) : (
                  <Menu size={18} className="text-text-secondary" />
                )}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* === MOBILE DRAWER === */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-midnight/80 backdrop-blur-sm z-[95] lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-80 bg-surface-1 border-l border-white/8 z-[96] lg:hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/8">
                <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-violet-gradient flex items-center justify-center">
                    <Zap size={14} className="text-white" />
                  </div>
                  <span className="font-display text-lg font-bold text-text-primary">
                    HACK<span className="gradient-text">SYRA</span>
                  </span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="btn-icon"
                  aria-label="Close menu"
                >
                  <X size={16} className="text-text-secondary" />
                </button>
              </div>

              {/* User info if signed in */}
              {user && (
                <div className="px-4 py-3 border-b border-white/8 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-violet-500/20 flex items-center justify-center">
                    {user.photoURL ? (
                      <Image src={user.photoURL} alt={user.displayName} width={40} height={40} className="object-cover" />
                    ) : (
                      <span className="text-base font-semibold text-violet-400">
                        {user.displayName?.[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{user.displayName}</p>
                    <p className="text-xs text-text-secondary">@{user.username}</p>
                  </div>
                </div>
              )}

              {/* Nav links */}
              <nav className="flex-1 overflow-y-auto py-4 px-3">
                <div className="space-y-1">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                        link.highlight
                          ? "text-violet-400 bg-violet-500/10 border border-violet-500/20"
                          : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                      } ${pathname === link.href ? "text-text-primary bg-white/5" : ""}`}
                    >
                      <link.icon size={18} className={link.highlight ? "text-violet-400" : "text-text-secondary"} />
                      {link.label}
                    </Link>
                  ))}
                </div>

                {user && (
                  <>
                    <div className="divider" />
                    <div className="space-y-1">
                      {USER_MENU_LINKS.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all duration-150"
                        >
                          <link.icon size={18} className="text-violet-400" />
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-white/8 space-y-2">
                {/* Theme selector */}
                <div className="flex gap-1 bg-white/5 rounded-xl p-1">
                  {(["dark", "light", "system"] as const).map((t) => {
                    const Icon = t === "dark" ? Moon : t === "light" ? Sun : Monitor;
                    return (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                          theme === t
                            ? "bg-violet-500/20 text-violet-400"
                            : "text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        <Icon size={13} />
                        <span className="capitalize">{t}</span>
                      </button>
                    );
                  })}
                </div>

                {user ? (
                  <button
                    onClick={signOut}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/5 transition-colors duration-150"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 justify-center">
                      Log In
                    </Link>
                    <Link href="/signup" onClick={() => setMobileOpen(false)} className="btn-primary flex-1 justify-center">
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* === GLOBAL SEARCH OVERLAY === */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-midnight/80 backdrop-blur-sm z-modal"
              onClick={() => setSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl z-modal px-4"
            >
              <div className="card-glass border border-white/15 rounded-2xl overflow-hidden shadow-2xl">
                <div className="flex items-center gap-3 p-4 border-b border-white/8">
                  <Search size={18} className="text-text-secondary flex-shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search hackathons, projects, builders..."
                    className="flex-1 bg-transparent text-text-primary placeholder:text-text-secondary outline-none text-sm"
                  />
                  <kbd className="px-2 py-1 rounded text-xs text-text-secondary border border-white/10 font-mono">
                    ESC
                  </kbd>
                </div>
                <div className="p-4 text-center text-sm text-text-secondary py-8">
                  Start typing to search across hackathons, projects, and builders…
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
