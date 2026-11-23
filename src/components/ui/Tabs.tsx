"use client";

import { useId, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TabItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
};

export function Tabs({
  items,
  value,
  onChange,
  variant = "pill",
  className = "",
}: {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  variant?: "pill" | "underline";
  className?: string;
}) {
  const layoutId = useId();
  const reduced = useReducedMotion();

  return (
    <div
      role="tablist"
      className={`flex items-center gap-1 overflow-x-auto scrollbar-none ${
        variant === "underline"
          ? "border-b border-slate-200 pb-px"
          : "bg-slate-100/90 p-1 rounded-2xl border border-slate-200/70"
      } ${className}`}
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={`relative shrink-0 inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-colors min-h-[38px] whitespace-nowrap ${
              active
                ? variant === "underline"
                  ? "text-[#1565D8]"
                  : "text-slate-900"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {active && variant === "pill" && (
              <motion.span
                layoutId={`tab-pill-${layoutId}`}
                transition={{ duration: reduced ? 0.01 : 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 bg-white rounded-xl shadow-xs border border-slate-200/70"
              />
            )}
            {active && variant === "underline" && (
              <motion.span
                layoutId={`tab-line-${layoutId}`}
                transition={{ duration: reduced ? 0.01 : 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-2 right-2 bottom-0 h-0.5 bg-[#1565D8] rounded-full"
              />
            )}
            <span className="relative z-10 inline-flex items-center gap-1.5">
              {item.icon}
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold tabular-nums ${
                    active ? "bg-[#EEF4FF] text-[#1565D8]" : "bg-slate-200/80 text-slate-600"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

