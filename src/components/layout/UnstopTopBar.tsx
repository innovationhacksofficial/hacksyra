"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Bell, ChevronDown, Zap, LogOut, UserCircle, LayoutDashboard, Trophy, Settings, Menu, X } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

export function UnstopTopBar({ sidebarWidth = 240 }: { sidebarWidth?: number }) {
  const { user, loading, signOut } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/hackathons?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header
        className="fixed top-0 right-0 z-40 h-[64px] bg-white border-b border-slate-200 flex items-center px-4 gap-3"
        style={{ left: `${sidebarWidth}px`, transition: "left 0.3s" }}
      >
        {/* Mobile logo */}
        <Link href="/" className="flex items-center gap-2 lg:hidden flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#1565D8] flex items-center justify-center">
            <Zap size={14} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-base font-bold text-slate-900">
            HACK<span className="text-[#1565D8]">SYRA</span>
          </span>
        </Link>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="flex-1 max-w-2xl mx-auto hidden sm:flex"
        >
          <div className="relative w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hackathons, competitions, jobs..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-100 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1565D8] focus:bg-white focus:ring-2 focus:ring-[#1565D8]/10 transition-all duration-200"
            />
          </div>
        </form>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto">
          {/* For Business */}
          <Link
            href="/organizer/create"
            className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-slate-300 text-sm font-medium text-slate-700 hover:border-[#1565D8] hover:text-[#1565D8] transition-all duration-200"
          >
            <Zap size={13} className="text-[#1565D8]" />
            For Organizers
          </Link>

          {loading ? (
            <div className="w-20 h-9 animate-pulse bg-slate-100 rounded-full" />
          ) : user ? (
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <button className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors duration-200">
                <Bell size={17} className="text-slate-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#1565D8] border-2 border-white" />
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-[#EEF4FF] flex items-center justify-center flex-shrink-0">
                    {user.photoURL ? (
                      <Image src={user.photoURL} alt={user.displayName} width={32} height={32} className="object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-[#1565D8]">
                        {user.displayName?.[0]?.toUpperCase() ?? "U"}
                      </span>
                    )}
                  </div>
                  <ChevronDown size={13} className={`text-slate-500 transition-transform duration-200 hidden sm:block ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-900">{user.displayName}</p>
                        <p className="text-xs text-slate-500">@{user.username}</p>
                      </div>
                      <div className="py-1">
                        {[
                          { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
                          { label: "My Profile", href: "/u/me", icon: UserCircle },
                          { label: "My Hackathons", href: "/dashboard/hackathons", icon: Trophy },
                          { label: "Settings", href: "/dashboard/settings", icon: Settings },
                        ].map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                          >
                            <link.icon size={15} className="text-[#1565D8]" />
                            {link.label}
                          </Link>
                        ))}
                      </div>
                      <div className="border-t border-slate-100 py-1">
                        <button
                          onClick={signOut}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={15} />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-700 hover:text-[#1565D8] transition-colors duration-200">
                Log In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1565D8] text-white text-sm font-semibold hover:bg-[#0F52B0] transition-all duration-200 shadow-sm"
              >
                <span>→</span> Sign Up
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
          >
            {mobileMenuOpen ? <X size={18} className="text-slate-700" /> : <Menu size={18} className="text-slate-600" />}
          </button>
        </div>
      </header>

      {/* Mobile search */}
      <div
        className="sm:hidden fixed top-[64px] right-0 left-0 bg-white border-b border-slate-200 px-4 py-2.5 z-40"
      >
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hackathons..."
              className="w-full pl-9 pr-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1565D8] transition-all"
            />
          </div>
        </form>
      </div>
    </>
  );
}
