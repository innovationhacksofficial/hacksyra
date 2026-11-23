"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Search,
  Plus,
  ChevronDown,
  LayoutDashboard,
  Trophy,
  ShieldCheck,
  Gavel,
  Settings,
  LogOut,
  UserCircle,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { PUBLIC_NAV } from "@/components/layout/nav-config";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { Avatar } from "@/components/ui/Primitives";
import { CommandSearch } from "@/components/layout/CommandSearch";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { firebaseUser, user, isAdmin, loading, signOut } = useAuth();
  const reduced = useReducedMotion();

  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  const hostHref = firebaseUser ? "/organizer/create" : "/signup?role=organizer&next=/organizer/create";
  const displayName = user?.displayName || firebaseUser?.displayName || "Builder";

  async function handleSignOut() {
    setMenuOpen(false);
    await signOut();
    router.replace("/");
  }

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-nav transition-all duration-200 safe-top ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-sm"
            : "bg-white/85 backdrop-blur-md border-b border-slate-200/60"
        }`}
      >
        <div className="container-app h-[64px] md:h-[68px] flex items-center justify-between gap-3">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center p-1 group-hover:scale-105 group-hover:border-[#1565D8]/40 transition-all">
              <Image src="/logos/ih_logo.png" alt="Innovation Hacks" width={32} height={32} className="w-full h-full object-contain" priority />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-slate-900 leading-none">
                HACK<span className="text-[#1565D8]">SYRA</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5 hidden xs:block">
                Innovation Hacks
              </span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1">
            {PUBLIC_NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    active ? "text-[#1565D8]" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="site-nav-active"
                      transition={{ duration: reduced ? 0.01 : 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0 bg-[#EEF4FF] rounded-xl -z-10"
                    />
                  )}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Open global search"
              className="flex items-center gap-2.5 h-10 px-3 sm:px-3.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/70 border border-slate-200/80 text-slate-500 hover:text-slate-800 text-sm transition-colors"
            >
              <Search size={16} className="text-[#1565D8]" />
              <span className="hidden md:inline text-xs font-medium text-slate-500">Search...</span>
              <kbd className="hidden xl:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono text-slate-400">
                ⌘K
              </kbd>
            </button>

            {/* Tablet/Desktop Host CTA */}
            <Link
              href={hostHref}
              className="hidden sm:inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#EEF4FF] text-[#1565D8] hover:bg-[#1565D8] hover:text-white border border-[#B3D1FF] text-xs sm:text-sm font-semibold transition-all"
            >
              <Plus size={15} />
              <span>Host a Hackathon</span>
            </Link>

            {loading ? (
              <div className="w-20 h-10 rounded-xl skeleton" />
            ) : firebaseUser ? (
              <div className="flex items-center gap-1.5">
                <NotificationBell />
                <div ref={menuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-expanded={menuOpen}
                    aria-label="Account menu"
                    className="flex items-center gap-2 h-10 pl-1.5 pr-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                  >
                    <Avatar name={displayName} src={user?.photoURL || firebaseUser.photoURL} size="sm" />
                    <span className="hidden xl:inline text-xs font-semibold text-slate-800 max-w-[110px] truncate">
                      {displayName}
                    </span>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {menuOpen && (
                      <motion.div
                        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: reduced ? 0.01 : 0.16 }}
                        className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-modal"
                      >
                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                          <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
                          <p className="text-xs text-slate-500 truncate">
                            {user?.username ? `@${user.username}` : firebaseUser.email}
                          </p>
                        </div>
                        <div className="p-1.5 space-y-0.5">
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-[#EEF4FF] hover:text-[#1565D8]"
                          >
                            <LayoutDashboard size={15} /> Participant Dashboard
                          </Link>
                          <Link
                            href="/organizer"
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-[#EEF4FF] hover:text-[#1565D8]"
                          >
                            <Trophy size={15} /> Organizer Console
                          </Link>
                          <Link
                            href="/judge"
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-[#EEF4FF] hover:text-[#1565D8]"
                          >
                            <Gavel size={15} /> Judge Portal
                          </Link>
                          {isAdmin && (
                            <Link
                              href="/admin"
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-[#1565D8] bg-[#EEF4FF]/60 hover:bg-[#EEF4FF]"
                            >
                              <ShieldCheck size={15} /> Admin Panel
                            </Link>
                          )}
                          {user?.username && (
                            <Link
                              href={`/u/${user.username}`}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
                            >
                              <UserCircle size={15} /> Public Profile
                            </Link>
                          )}
                          <Link
                            href="/dashboard/settings"
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
                          >
                            <Settings size={15} /> Settings
                          </Link>
                        </div>
                        <div className="p-1.5 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut size={15} /> Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="hidden sm:inline-flex items-center px-3.5 h-10 rounded-xl text-sm font-semibold text-slate-700 hover:text-[#1565D8] hover:bg-slate-100 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 px-4 h-10 rounded-xl bg-[#1565D8] hover:bg-[#0F52B0] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
                >
                  <Sparkles size={14} className="hidden xs:inline" />
                  <span>Sign up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <CommandSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

