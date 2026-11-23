"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { sendEmailVerification } from "firebase/auth";
import {
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  MoreHorizontal,
  ExternalLink,
  LogOut,
  MailWarning,
  ArrowLeftRight,
  Check,
  ChevronRight,
  LayoutDashboard,
  Trophy,
  ShieldCheck,
  Gavel,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { AREA_META, AREA_NAV, type AppArea } from "@/components/layout/nav-config";
import { Avatar, Button } from "@/components/ui";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { Sheet } from "@/components/ui/Modal";
import { CommandSearch } from "@/components/layout/CommandSearch";
import { useToast } from "@/components/ui/Toaster";

export function AppShell({ area, children }: { area: AppArea; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { firebaseUser, user, isAdmin, loading, signOut } = useAuth();
  const reduced = useReducedMotion();
  const toast = useToast();

  // Collapsed by default on tablet (md..lg), expanded on lg+
  const [collapsed, setCollapsed] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const switchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px) and (max-width: 1023px)");
    if (mq.matches) setCollapsed(true);
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
    setMoreOpen(false);
    setSwitchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!switchOpen) return;
    const onDown = (e: MouseEvent) => {
      if (switchRef.current && !switchRef.current.contains(e.target as Node)) setSwitchOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [switchOpen]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = window.setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [resendCooldown]);

  // Client-side guard fallback (middleware protects routes on navigation, this catches expired sessions).
  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, firebaseUser, pathname, router]);

  const items = AREA_NAV[area];
  const meta = AREA_META[area];
  const primaryMobile = items.filter((i) => i.primaryMobile).slice(0, 4);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const activeItem = items.find((i) => isActive(i.href, i.exact)) ?? items[0];
  const displayName = user?.displayName || firebaseUser?.displayName || "Builder";

  async function handleResendVerification() {
    if (!firebaseUser || resending || resendCooldown > 0) return;
    setResending(true);
    try {
      await sendEmailVerification(firebaseUser);
      toast.success("Verification email sent", "Check your inbox and click the verification link.");
      setResendCooldown(60);
    } catch {
      toast.error("Couldn't send email", "Please wait a moment and try again.");
    } finally {
      setResending(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    router.replace("/");
  }

  const areas: { id: AppArea; label: string; href: string; icon: React.ElementType; show: boolean }[] = [
    { id: "participant", label: "Participant Hub", href: "/dashboard", icon: LayoutDashboard, show: true },
    { id: "organizer", label: "Organizer Console", href: "/organizer", icon: Trophy, show: true },
    { id: "judge", label: "Judge Portal", href: "/judge", icon: Gavel, show: true },
    { id: "admin", label: "Platform Admin", href: "/admin", icon: ShieldCheck, show: isAdmin },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 shadow-sm p-1.5 animate-pulse">
            <Image src="/logos/ih_logo.png" alt="HACKSYRA" width={36} height={36} className="w-full h-full object-contain" />
          </div>
          <div className="w-5 h-5 border-2 border-slate-200 border-t-[#1565D8] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Tablet / Laptop / TV Sidebar */}
      <aside
        className={`hidden md:flex flex-col fixed top-0 left-0 h-full bg-white border-r border-slate-200 z-nav transition-all duration-200 ${
          collapsed ? "w-[74px]" : "w-[256px]"
        }`}
      >
        {/* Brand */}
        <div className="h-[64px] px-3.5 border-b border-slate-100 flex items-center justify-between gap-2 shrink-0">
          <Link href="/" className={`flex items-center gap-2.5 min-w-0 ${collapsed ? "mx-auto" : ""}`}>
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 p-1 shadow-xs shrink-0">
              <Image src="/logos/ih_logo.png" alt="HACKSYRA" width={32} height={32} className="w-full h-full object-contain" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <span className="font-display font-bold text-base text-slate-900 tracking-tight block leading-none">
                  HACK<span className="text-[#1565D8]">SYRA</span>
                </span>
                <span className="text-[10px] font-bold text-[#1565D8] uppercase tracking-wider mt-0.5 block truncate">
                  {meta.title}
                </span>
              </div>
            )}
          </Link>
          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              aria-label="Collapse sidebar"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <PanelLeftClose size={16} />
            </button>
          )}
        </div>

        {collapsed && (
          <div className="px-3 pt-3 flex justify-center">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
              className="w-10 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-[#1565D8] hover:bg-[#EEF4FF]"
            >
              <PanelLeftOpen size={16} />
            </button>
          </div>
        )}

        {/* Nav items */}
        <nav aria-label={meta.title} className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5">
          {items.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[42px] ${
                  collapsed ? "justify-center px-0" : ""
                } ${active ? "text-[#1565D8] font-semibold" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"}`}
              >
                {active && (
                  <motion.span
                    layoutId={`sidebar-active-${area}`}
                    transition={{ duration: reduced ? 0.01 : 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 bg-[#EEF4FF] border border-[#DCE9FF] rounded-xl -z-10"
                  />
                )}
                <item.icon size={18} className="shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom area links + user */}
        <div className="p-2.5 border-t border-slate-100 space-y-1.5 shrink-0">
          <Link
            href="/"
            title={collapsed ? "Public Site" : undefined}
            className={`sidebar-link text-xs ${collapsed ? "justify-center px-0" : ""}`}
          >
            <ExternalLink size={16} className="shrink-0 text-slate-400" />
            {!collapsed && <span>Back to Public Site</span>}
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            title={collapsed ? "Sign out" : undefined}
            className={`sidebar-link text-xs text-red-600 hover:bg-red-50 hover:text-red-700 ${
              collapsed ? "justify-center px-0" : ""
            }`}
          >
            <LogOut size={16} className="shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main Column */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${collapsed ? "md:ml-[74px]" : "md:ml-[256px]"}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-[60px] md:h-[64px] bg-white/95 backdrop-blur-xl border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link href="/" className="md:hidden w-8 h-8 rounded-xl bg-white border border-slate-200 p-1 shrink-0">
              <Image src="/logos/ih_logo.png" alt="HACKSYRA" width={28} height={28} className="w-full h-full object-contain" />
            </Link>
            <div className="min-w-0">
              <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400">
                <span>{meta.title}</span>
                <ChevronRight size={12} />
                <span className="font-semibold text-slate-700">{activeItem?.label}</span>
              </div>
              <p className="md:hidden font-display font-bold text-base text-slate-900 truncate">
                {activeItem?.label ?? meta.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Global search */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="w-10 h-10 md:w-auto md:px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 border border-slate-200/80 flex items-center justify-center gap-2 text-slate-600 text-xs font-medium"
            >
              <Search size={16} className="text-[#1565D8]" />
              <span className="hidden lg:inline text-slate-500">Search...</span>
              <kbd className="hidden xl:inline px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono text-slate-400">
                ⌘K
              </kbd>
            </button>

            {/* Area switcher */}
            <div ref={switchRef} className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setSwitchOpen((v) => !v)}
                className="h-10 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-2 text-xs font-semibold text-slate-700"
              >
                <ArrowLeftRight size={14} className="text-[#1565D8]" />
                <span className="hidden lg:inline">{meta.title}</span>
              </button>

              <AnimatePresence>
                {switchOpen && (
                  <motion.div
                    initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: reduced ? 0.01 : 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-2xl p-1.5 z-modal"
                  >
                    <p className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Switch workspace</p>
                    {areas
                      .filter((a) => a.show)
                      .map((a) => (
                        <Link
                          key={a.id}
                          href={a.href}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                            a.id === area ? "bg-[#EEF4FF] text-[#1565D8]" : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <a.icon size={15} /> {a.label}
                          </span>
                          {a.id === area && <Check size={14} />}
                        </Link>
                      ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <NotificationBell />

            <Link
              href={user?.username ? `/u/${user.username}` : "/dashboard/settings"}
              className="hidden sm:flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <Avatar name={displayName} src={user?.photoURL || firebaseUser?.photoURL} size="sm" />
              <span className="hidden xl:inline text-xs font-semibold text-slate-800 max-w-[110px] truncate">{displayName}</span>
            </Link>
          </div>
        </header>

        {/* Unverified email slim banner */}
        {firebaseUser && !firebaseUser.emailVerified && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MailWarning size={15} className="text-amber-600 shrink-0" />
              <span>Verify your email address ({firebaseUser.email}) to unlock all organizer &amp; team invites.</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                loading={resending}
                disabled={resendCooldown > 0}
                onClick={handleResendVerification}
              >
                {resendCooldown > 0 ? `Resent (${resendCooldown}s)` : "Resend verification"}
              </Button>
              <Link href="/verify-email" className="font-semibold text-[#1565D8] hover:underline">
                Check status
              </Link>
            </div>
          </div>
        )}

        {/* Content */}
        <main className="flex-1 w-full max-w-7xl 3xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-10">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label={`${meta.title} mobile navigation`}
        className="md:hidden fixed bottom-0 inset-x-0 z-nav bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-bar-top safe-bottom"
      >
        <div className="grid grid-cols-5 h-[62px] px-1">
          {primaryMobile.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center min-h-[44px] transition-colors ${
                  active ? "text-[#1565D8]" : "text-slate-500"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId={`mobile-tab-${area}`}
                    transition={{ duration: reduced ? 0.01 : 0.2 }}
                    className="absolute top-0.5 w-8 h-1 rounded-full bg-[#1565D8]"
                  />
                )}
                <item.icon size={19} strokeWidth={active ? 2.4 : 2} />
                <span className={`text-[10px] mt-1 truncate max-w-[60px] ${active ? "font-bold" : "font-medium"}`}>
                  {item.shortLabel ?? item.label}
                </span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="flex flex-col items-center justify-center min-h-[44px] text-slate-600"
          >
            <MoreHorizontal size={20} />
            <span className="text-[10px] font-medium mt-1">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile "More" Sheet */}
      <Sheet open={moreOpen} onClose={() => setMoreOpen(false)} title={meta.title}>
        <div className="space-y-5">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <Avatar name={displayName} src={user?.photoURL || firebaseUser?.photoURL} size="md" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
              <p className="text-xs text-slate-500 truncate">{firebaseUser?.email}</p>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">All sections</p>
            <div className="grid grid-cols-2 gap-1.5">
              {items.map((item) => {
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-semibold min-h-[44px] ${
                      active ? "bg-[#EEF4FF] text-[#1565D8]" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <item.icon size={16} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Switch workspace</p>
            <div className="grid grid-cols-2 gap-1.5">
              {areas
                .filter((a) => a.show)
                .map((a) => (
                  <Link
                    key={a.id}
                    href={a.href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold border min-h-[44px] ${
                      a.id === area ? "bg-[#EEF4FF] border-[#B3D1FF] text-[#1565D8]" : "bg-white border-slate-200 text-slate-700"
                    }`}
                  >
                    <a.icon size={15} /> {a.label}
                  </Link>
                ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
            <Link href="/" onClick={() => setMoreOpen(false)} className="btn-secondary btn-sm flex-1">
              <ExternalLink size={14} /> Public Site
            </Link>
            <Button variant="danger" size="sm" onClick={handleSignOut} leftIcon={<LogOut size={14} />} className="flex-1">
              Sign out
            </Button>
          </div>
        </div>
      </Sheet>

      <CommandSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
