"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PUBLIC_MOBILE_TABS } from "@/components/layout/nav-config";
import { useAuth } from "@/components/providers/AuthProvider";

export function MobileTabBar() {
  const pathname = usePathname();
  const { firebaseUser } = useAuth();
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;
      if (y < 60) setVisible(true);
      else if (delta > 14) setVisible(false);
      else if (delta < -10) setVisible(true);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      aria-label="Mobile navigation"
      className={`md:hidden fixed bottom-0 inset-x-0 z-nav transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-[110%]"
      }`}
    >
      <div className="bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-bar-top safe-bottom">
        <div className="grid grid-cols-5 items-end h-[64px] px-1 max-w-md mx-auto">
          {PUBLIC_MOBILE_TABS.map((tab) => {
            const targetHref =
              tab.href === "/organizer/create" && !firebaseUser
                ? "/signup?role=organizer&next=/organizer/create"
                : tab.href === "/dashboard" && !firebaseUser
                  ? "/login"
                  : tab.href;

            const active = tab.exact
              ? pathname === tab.href
              : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

            if (tab.isCenter) {
              return (
                <Link
                  key={tab.label}
                  href={targetHref}
                  className="flex flex-col items-center justify-center pb-1.5 group"
                >
                  <span className="-mt-5 w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1565D8] to-[#0284C7] text-white shadow-brand flex items-center justify-center ring-4 ring-white group-active:scale-95 transition-transform">
                    <tab.icon size={22} strokeWidth={2.5} />
                  </span>
                  <span className="text-[10px] font-bold text-[#1565D8] mt-1">{tab.label}</span>
                </Link>
              );
            }

            return (
              <Link
                key={tab.label}
                href={targetHref}
                className={`relative flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                  active ? "text-[#1565D8]" : "text-slate-500"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="public-mobile-tab"
                    transition={{ duration: reduced ? 0.01 : 0.2 }}
                    className="absolute top-1 w-8 h-1 rounded-full bg-[#1565D8]"
                  />
                )}
                <tab.icon size={20} strokeWidth={active ? 2.4 : 2} />
                <span className={`text-[10px] mt-1 ${active ? "font-bold" : "font-medium"}`}>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

