"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Copy, Loader2 } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { STATUS_LABELS } from "@/lib/domain/status";
import { timeLeft, type DateLike } from "@/lib/domain/dates";
import type { HackathonStatus } from "@/types";
import { Button } from "./Button";
import { Modal } from "./Modal";

const TONE: Record<string, string> = {
  // Hackathon statuses
  draft: "badge-gray",
  payment_pending: "badge-amber",
  pending_review: "badge-amber",
  more_info_required: "badge-amber",
  suspended: "badge-red",
  rejected: "badge-red",
  cancelled: "badge-gray",
  archived: "badge-gray",
  approved: "badge-green",
  published: "badge-blue",
  registration_open: "badge-green",
  registration_closed: "badge-gray",
  ongoing: "badge-aqua",
  judging: "badge-violet",
  results_announced: "badge-amber",
  completed: "badge-blue",
  // Registration / order / submission / ticket / report
  confirmed: "badge-green",
  paid: "badge-green",
  captured: "badge-green",
  active: "badge-green",
  checked_in: "badge-aqua",
  used: "badge-aqua",
  pending: "badge-amber",
  pending_approval: "badge-amber",
  awaiting_payment: "badge-amber",
  waitlisted: "badge-blue",
  submitted: "badge-blue",
  under_review: "badge-amber",
  revision_requested: "badge-amber",
  eligible: "badge-green",
  ineligible: "badge-red",
  withdrawn: "badge-gray",
  finalist: "badge-violet",
  winner: "badge-amber",
  failed: "badge-red",
  expired: "badge-gray",
  refunded: "badge-gray",
  refund_pending: "badge-amber",
  verified: "badge-green",
  open: "badge-amber",
  resolved: "badge-green",
  dismissed: "badge-gray",
};

const EXTRA_LABELS: Record<string, string> = {
  pending_approval: "Pending approval",
  awaiting_payment: "Awaiting payment",
  payment_processing: "Processing",
  checked_in: "Checked in",
  refund_pending: "Refund pending",
  under_review: "Under review",
  revision_requested: "Revision requested",
  more_info_required: "More info needed",
};

export function StatusBadge({ status, label, className = "" }: { status: string; label?: string; className?: string }) {
  const text =
    label ??
    STATUS_LABELS[status as HackathonStatus] ??
    EXTRA_LABELS[status] ??
    status.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
  const tone = TONE[status] ?? "badge-gray";
  const pulse = status === "ongoing" || status === "registration_open";
  return (
    <span className={`${tone} ${className}`}>
      {pulse && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden />}
      {text}
    </span>
  );
}

const GRADIENTS = [
  "from-[#1565D8] to-[#0EA5E9]",
  "from-indigo-600 to-blue-500",
  "from-sky-600 to-cyan-500",
  "from-emerald-600 to-teal-500",
  "from-amber-600 to-orange-500",
  "from-violet-600 to-indigo-500",
];

function hashIndex(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % GRADIENTS.length;
}

export function Avatar({
  name,
  src,
  size = "md",
  className = "",
}: {
  name?: string | null;
  src?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const px = { xs: 24, sm: 32, md: 40, lg: 48, xl: 64 }[size];
  const cls = { xs: "w-6 h-6 text-[10px]", sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base", xl: "w-16 h-16 text-xl" }[size];
  const label = (name || "B").trim();
  const initials = label
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  if (src && !failed) {
    return (
      <Image
        src={src}
        alt={label}
        width={px}
        height={px}
        onError={() => setFailed(true)}
        className={`${cls} rounded-full object-cover border border-slate-200 shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      aria-label={label}
      className={`${cls} rounded-full bg-gradient-to-br ${GRADIENTS[hashIndex(label)]} text-white font-bold flex items-center justify-center shrink-0 select-none ${className}`}
    >
      {initials || "B"}
    </div>
  );
}

export function Countdown({ target, prefix, compact = true }: { target: DateLike; prefix?: string; compact?: boolean }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  const t = timeLeft(target, now);
  if (compact) {
    return (
      <span className={`tabular-nums text-xs font-semibold ${t.ended ? "text-slate-400" : "text-[#1565D8]"}`}>
        {prefix ? `${prefix} ` : ""}
        {t.label}
      </span>
    );
  }
  const totalSec = Math.max(0, Math.floor(t.ms / 1000));
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  return (
    <div className="flex items-center gap-2">
      {[
        { v: d, l: "Days" },
        { v: h, l: "Hrs" },
        { v: m, l: "Min" },
      ].map((b) => (
        <div key={b.l} className="countdown-block">
          <span className="countdown-value">{String(b.v).padStart(2, "0")}</span>
          <span className="countdown-label">{b.l}</span>
        </div>
      ))}
    </div>
  );
}

export function AnimatedNumber({ value, formatter }: { value: number; formatter?: (n: number) => string }) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);
  const last = useRef(0);

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }
    const start = last.current;
    const end = value;
    last.current = value;
    if (start === end) return;
    const t0 = performance.now();
    const dur = 500;
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, reduced]);

  return (
    <span ref={ref} className="tabular-nums">
      {formatter ? formatter(display) : display.toLocaleString("en-IN")}
    </span>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "blue",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: "blue" | "green" | "amber" | "violet" | "red";
}) {
  const bg = {
    blue: "bg-[#EEF4FF] text-[#1565D8]",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    violet: "bg-indigo-50 text-indigo-700",
    red: "bg-red-50 text-red-600",
  }[tone];
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between gap-2">
        <span className="stat-label">{label}</span>
        {icon && <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>{icon}</div>}
      </div>
      <div className="stat-value mt-1">{value}</div>
      {hint && <p className="text-xs text-slate-500 mt-0.5">{hint}</p>}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  badge,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  badge?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">{title}</h1>
          {badge}
        </div>
        {description && <p className="text-sm text-slate-600 mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2.5 flex-wrap">{actions}</div>}
    </div>
  );
}

export function CopyButton({ value, label = "Copy", className = "" }: { value: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="secondary"
      size="sm"
      className={className}
      leftIcon={copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        } catch {
          /* ignore */
        }
      }}
    >
      {copied ? "Copied" : label}
    </Button>
  );
}

export function Spinner({ size = 20, className = "" }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={`animate-spin text-[#1565D8] ${className}`} />;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  danger = false,
  loading = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message?: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  children?: ReactNode;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={message}
      maxWidth="max-w-md"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant={danger ? "danger" : "primary"} size="sm" loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  );
}

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
};

/** Responsive list: clean table on md+, stacked cards on mobile. */
export function DataList<T>({
  items,
  columns,
  keyExtractor,
  renderMobileCard,
  onRowClick,
}: {
  items: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  renderMobileCard?: (item: T) => ReactNode;
  onRowClick?: (item: T) => void;
}) {
  return (
    <>
      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {items.map((item) => (
          <div
            key={keyExtractor(item)}
            onClick={onRowClick ? () => onRowClick(item) : undefined}
            className={`card p-4 space-y-2.5 ${onRowClick ? "cursor-pointer active:scale-[0.99]" : ""}`}
          >
            {renderMobileCard ? (
              renderMobileCard(item)
            ) : (
              columns.map((c) => (
                <div key={c.key} className="flex items-start justify-between gap-3 text-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide shrink-0">{c.header}</span>
                  <div className="text-right text-slate-900">{c.cell(item)}</div>
                </div>
              ))
            )}
          </div>
        ))}
      </div>

      {/* Tablet/Laptop/TV table */}
      <div className="hidden md:block card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-50/90 border-b border-slate-200">
              <tr>
                {columns.map((c) => (
                  <th key={c.key} className={`px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider ${c.className ?? ""}`}>
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                  className={onRowClick ? "hover:bg-[#EEF4FF]/40 cursor-pointer transition-colors" : "hover:bg-slate-50/70 transition-colors"}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={`px-4 py-3.5 text-slate-800 align-middle ${c.className ?? ""}`}>
                      {c.cell(item)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export function LoadMore({ hasMore, onMore, loading }: { hasMore: boolean; onMore: () => void; loading?: boolean }) {
  if (!hasMore) return null;
  return (
    <div className="flex justify-center pt-4">
      <Button variant="secondary" size="sm" onClick={onMore} loading={loading}>
        Load more
      </Button>
    </div>
  );
}

