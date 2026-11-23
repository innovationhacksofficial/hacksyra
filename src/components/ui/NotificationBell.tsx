"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import { doc, serverTimestamp, updateDoc, writeBatch } from "firebase/firestore";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { useNotifications } from "@/lib/data/hooks";
import { clientDb, firebaseReady } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { toDate } from "@/lib/domain/dates";
import { Sheet } from "@/components/ui/Modal";

function relativeTime(d: Date | null): string {
  if (!d) return "";
  const diff = Math.max(0, Date.now() - d.getTime());
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function NotificationBell({ notificationsHref = "/dashboard/notifications" }: { notificationsHref?: string }) {
  const { firebaseUser } = useAuth();
  const { data: items } = useNotifications(firebaseUser?.uid, 20);
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!open || isMobile) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, isMobile]);

  const unread = (items ?? []).filter((n) => !n.isRead);

  async function markOne(id: string) {
    if (!firebaseReady()) return;
    try {
      await updateDoc(doc(clientDb(), COLLECTIONS.NOTIFICATIONS, id), {
        isRead: true,
        readAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch {
      /* ignore */
    }
  }

  async function markAllRead() {
    if (!firebaseReady() || unread.length === 0) return;
    try {
      const db = clientDb();
      const batch = writeBatch(db);
      for (const n of unread.slice(0, 20)) {
        batch.update(doc(db, COLLECTIONS.NOTIFICATIONS, n.id), {
          isRead: true,
          readAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      await batch.commit();
    } catch {
      /* ignore */
    }
  }

  if (!firebaseUser) return null;

  const listBody = (
    <div className="divide-y divide-slate-100">
      {!items || items.length === 0 ? (
        <div className="py-10 px-4 text-center">
          <Bell size={24} className="mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-medium text-slate-600">You&apos;re all caught up</p>
          <p className="text-xs text-slate-400 mt-0.5">Live updates on reviews, teams, and deadlines arrive here.</p>
        </div>
      ) : (
        items.slice(0, 8).map((n) => (
          <Link
            key={n.id}
            href={n.linkUrl || notificationsHref}
            onClick={() => {
              if (!n.isRead) void markOne(n.id);
              setOpen(false);
            }}
            className={`block px-4 py-3 hover:bg-slate-50 transition-colors ${!n.isRead ? "bg-[#EEF4FF]/50" : ""}`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-1">{n.title}</p>
              {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#1565D8] shrink-0 mt-1.5" />}
            </div>
            <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{n.message}</p>
            <p className="text-[11px] text-slate-400 mt-1">{relativeTime(toDate(n.createdAt))}</p>
          </Link>
        ))
      )}
    </div>
  );

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${unread.length ? ` (${unread.length} unread)` : ""}`}
        aria-expanded={open}
        className="relative w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
      >
        <Bell size={19} />
        {unread.length > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#1565D8] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white tabular-nums">
            {unread.length > 9 ? "9+" : unread.length}
          </span>
        )}
      </button>

      {/* Desktop / Tablet dropdown */}
      <AnimatePresence>
        {open && !isMobile && (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: reduced ? 0.01 : 0.16 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-modal"
          >
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <span className="font-display font-bold text-sm text-slate-900">Notifications</span>
              {unread.length > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#1565D8] hover:underline"
                >
                  <CheckCheck size={13} /> Mark all read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">{listBody}</div>
            <Link
              href={notificationsHref}
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-[#1565D8] bg-slate-50 border-t border-slate-100 hover:bg-[#EEF4FF] transition-colors"
            >
              View all notifications <ExternalLink size={12} />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile bottom sheet */}
      {isMobile && (
        <Sheet open={open} onClose={() => setOpen(false)} title="Notifications">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500">{unread.length} unread</span>
            {unread.length > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#1565D8]"
              >
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
          </div>
          {listBody}
          <Link
            href={notificationsHref}
            onClick={() => setOpen(false)}
            className="btn-secondary w-full mt-4"
          >
            Open notification center
          </Link>
        </Sheet>
      )}
    </div>
  );
}

