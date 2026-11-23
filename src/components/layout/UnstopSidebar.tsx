"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Briefcase,
  Trophy,
  FlaskConical,
  MonitorPlay,
  Code2,
  Users,
  BookOpen,
  ChevronRight,
  Plus,
  Zap,
  UserPlus,
  PanelLeftClose,
  PanelLeftOpen,
  Star,
  TrendingUp,
  Globe,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

const MAIN_NAV = [
  { label: "Home", href: "/", icon: Home, exact: true },
  { label: "Hackathons", href: "/hackathons", icon: Trophy },
  { label: "Jobs", href: "/hackathons?type=jobs", icon: Briefcase },
  { label: "Competitions", href: "/hackathons?type=competitions", icon: Star },
  { label: "Mock Tests", href: "/hackathons?type=mock", icon: FlaskConical },
  { label: "Mock Interviews", href: "/hackathons?type=interview", icon: MonitorPlay },
  { label: "Projects", href: "/projects", icon: Code2 },
  { label: "Leaderboard", href: "/leaderboard", icon: TrendingUp },
  {
    label: "Builders",
    href: "/builders",
    icon: Users,
    children: [
      { label: "Find Builders", href: "/builders" },
      { label: "Team Up", href: "/hackathons?teamlookup=true" },
    ],
  },
  {
    label: "Prep Zone",
    href: "/resources",
    icon: BookOpen,
    children: [
      { label: "Resources", href: "/resources" },
      { label: "About", href: "/about" },
    ],
  },
];

const BOTTOM_CTA = [
  {
    label: "Post a Hackathon",
    sub: "Reach 2M+ builders",
    href: "/organizer/create",
    icon: Globe,
    color: "bg-blue-50 border-blue-100",
    dot: "bg-[#1565D8]",
  },
  {
    label: "Become a Mentor",
    sub: "Shape next builders",
    href: "/host",
    icon: Sparkles,
    color: "bg-violet-50 border-violet-100",
    dot: "bg-violet-500",
  },
];

export function UnstopSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href) && href !== "/";

  return (
    <aside
      className={`hidden lg:flex flex-col fixed top-0 left-0 h-full bg-white border-r border-slate-200 z-50 transition-all duration-300 ${
        collapsed ? "w-[68px]" : "w-[240px]"
      }`}
    >
      {/* Logo row */}
      <div className="flex items-center justify-between px-4 h-[64px] border-b border-slate-200 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#1565D8] flex items-center justify-center flex-shrink-0 shadow-sm">
            <Zap size={15} className="text-white" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <span className="font-display text-lg font-bold text-slate-900 tracking-tight">
              HACK<span className="text-[#1565D8]">SYRA</span>
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200 flex-shrink-0"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen size={15} />
          ) : (
            <PanelLeftClose size={15} />
          )}
        </button>
      </div>

      {/* Post button */}
      <div className={`px-3 py-3 border-b border-slate-100 flex-shrink-0`}>
        <Link
          href="/organizer/create"
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-[#1565D8] text-[#1565D8] font-semibold text-sm hover:bg-[#EEF4FF] transition-all duration-200 group ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <Plus size={17} strokeWidth={2.5} className="flex-shrink-0" />
          {!collapsed && <span>Post</span>}
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {MAIN_NAV.map((item) => {
          const active = isActive(item.href, item.exact);
          const isExpanded = expandedItems.includes(item.label);

          return (
            <div key={item.label}>
              {item.children ? (
                <>
                  <button
                    onClick={() => !collapsed && toggleExpand(item.label)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                      active
                        ? "bg-[#EEF4FF] text-[#1565D8]"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    } ${collapsed ? "justify-center" : ""}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon
                      size={18}
                      className={`flex-shrink-0 ${active ? "text-[#1565D8]" : "text-slate-500"}`}
                    />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronRight
                          size={14}
                          className={`text-slate-400 transition-transform duration-200 ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                      </>
                    )}
                  </button>
                  <AnimatePresence>
                    {!collapsed && isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden ml-4 pl-3 border-l border-slate-200"
                      >
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="flex items-center py-2 px-2 text-xs text-slate-500 hover:text-[#1565D8] transition-colors duration-150 rounded-lg hover:bg-[#EEF4FF]"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    active
                      ? "bg-[#EEF4FF] text-[#1565D8]"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  <item.icon
                    size={18}
                    className={`flex-shrink-0 ${active ? "text-[#1565D8]" : "text-slate-500"}`}
                  />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom CTAs */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-100 space-y-2 flex-shrink-0">
          {BOTTOM_CTA.map((cta) => (
            <Link
              key={cta.href}
              href={cta.href}
              className={`flex items-center gap-3 p-3 rounded-xl border ${cta.color} hover:shadow-sm transition-all duration-200 group`}
            >
              <div className={`w-8 h-8 rounded-lg ${cta.dot} bg-opacity-15 flex items-center justify-center flex-shrink-0`}>
                <cta.icon size={15} className="text-slate-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 leading-tight">{cta.label}</p>
                <p className="text-[10px] text-slate-500">{cta.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </aside>
  );
}
