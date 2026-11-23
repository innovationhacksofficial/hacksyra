"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { doc, deleteDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { Bookmark, MapPin, Trophy, Users, Wifi, Calendar, ArrowUpRight } from "lucide-react";
import { clientDb, firebaseReady } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/providers/AuthProvider";
import { formatMajor, formatMoney } from "@/lib/domain/money";
import { formatInZone, toDate } from "@/lib/domain/dates";
import { computeLiveStatus } from "@/lib/domain/status";
import { Countdown, StatusBadge } from "@/components/ui";
import { useToast } from "@/components/ui/Toaster";
import type { Hackathon } from "@/types";
import type { WithId } from "@/lib/data/live";

const CATEGORY_COLORS: Record<string, string> = {
  ai_ml: "from-[#1565D8] to-indigo-600",
  web3: "from-violet-600 to-indigo-600",
  fintech: "from-emerald-600 to-teal-600",
  healthtech: "from-rose-500 to-pink-600",
  sustainability: "from-green-600 to-emerald-600",
  cybersecurity: "from-slate-800 to-[#0B3E86]",
  developer_tools: "from-[#0284C7] to-[#1565D8]",
};

export function HackathonCard({
  hackathon: h,
  bookmarked = false,
}: {
  hackathon: WithId<Hackathon>;
  bookmarked?: boolean;
}) {
  const { firebaseUser } = useAuth();
  const toast = useToast();
  const [saved, setSaved] = useState(bookmarked);
  const [savingBookmark, setSavingBookmark] = useState(false);

  const liveStatus = computeLiveStatus(h);
  const prizePaise = h.totalPrizeInPaise ?? 0;
  const prizeLabel = prizePaise > 0 ? formatMajor(prizePaise / 100, h.currency || "INR", true) : null;
  const ticketLabel = h.isFree
    ? "Free"
    : h.lowestTicketPriceInPaise
      ? formatMoney(h.lowestTicketPriceInPaise, h.currency || "INR")
      : "Paid";

  const targetDeadline =
    liveStatus === "ongoing" || liveStatus === "registration_closed"
      ? h.submissionCloseDate ?? h.endDate
      : h.registrationCloseDate;

  const grad = CATEGORY_COLORS[h.category] ?? "from-[#1565D8] to-[#0284C7]";

  async function toggleBookmark(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!firebaseUser) {
      toast.info("Sign in to bookmark", "Save hackathons to track deadlines from your dashboard.");
      return;
    }
    if (!firebaseReady() || savingBookmark) return;
    setSavingBookmark(true);
    const id = `${firebaseUser.uid}_${h.id}`;
    const ref = doc(clientDb(), COLLECTIONS.BOOKMARKS, id);
    try {
      if (saved) {
        await deleteDoc(ref);
        setSaved(false);
      } else {
        await setDoc(ref, { userId: firebaseUser.uid, hackathonId: h.id, createdAt: serverTimestamp() });
        setSaved(true);
      }
    } catch {
      toast.error("Couldn't update bookmark");
    } finally {
      setSavingBookmark(false);
    }
  }

  return (
    <Link href={`/hackathons/${h.slug}`} className="hackathon-card group h-full">
      {/* Cover / Gradient Banner */}
      <div className={`relative h-40 sm:h-44 w-full overflow-hidden bg-gradient-to-br ${grad}`}>
        {h.coverImage ? (
          <Image
            src={h.coverImage}
            alt={h.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col justify-end p-4 text-white/95">
            <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
            <div className="absolute right-8 bottom-3 w-14 h-14 rounded-full bg-white/10" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/80">
              {h.category.replace(/_/g, " ")}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <StatusBadge status={liveStatus} className="shadow-xs backdrop-blur-md" />
            {h.isFeatured && (
              <span className="badge bg-white/95 text-[#1565D8] border-white shadow-xs">Featured</span>
            )}
          </div>
          <button
            type="button"
            onClick={toggleBookmark}
            aria-label={saved ? "Remove bookmark" : "Save hackathon"}
            className={`w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-md transition-all ${
              saved
                ? "bg-[#1565D8] text-white shadow-sm"
                : "bg-white/90 text-slate-700 hover:bg-white hover:text-[#1565D8]"
            }`}
          >
            <Bookmark size={15} className={saved ? "fill-white" : ""} />
          </button>
        </div>

        {/* Bottom mode chip */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between gap-2 text-white text-xs">
          <span className="inline-flex items-center gap-1 font-semibold bg-slate-900/60 backdrop-blur-md px-2.5 py-1 rounded-lg">
            {h.mode === "online" ? <Wifi size={12} /> : <MapPin size={12} />}
            <span className="capitalize">{h.mode}</span>
            {h.city ? ` · ${h.city}` : ""}
          </span>
          <span className={h.isFree ? "free-pill" : "paid-pill"}>{ticketLabel}</span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 group-hover:text-[#1565D8] transition-colors line-clamp-2 leading-snug">
            {h.name}
          </h3>
          <ArrowUpRight size={17} className="text-slate-400 group-hover:text-[#1565D8] shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>

        <p className="text-xs text-slate-500 mt-1">
          by <span className="font-semibold text-slate-700">{h.organizerName || "Organizer"}</span>
        </p>

        {h.tagline && <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mt-2 leading-relaxed">{h.tagline}</p>}

        {/* Technologies */}
        {h.technologies?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {h.technologies.slice(0, 3).map((tech) => (
              <span key={tech} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                {tech}
              </span>
            ))}
            {h.technologies.length > 3 && (
              <span className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-400 text-[11px] font-medium">
                +{h.technologies.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer metadata */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-3 text-xs text-slate-600">
            {prizeLabel && (
              <span className="prize-pill">
                <Trophy size={12} /> {prizeLabel}
              </span>
            )}
            <span className="inline-flex items-center gap-1 font-medium text-slate-600 tabular-nums">
              <Users size={13} className="text-slate-400" /> {h.registrationCount ?? 0}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {targetDeadline ? (
              <Countdown target={targetDeadline} />
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                <Calendar size={12} /> {toDate(h.startDate) ? formatInZone(h.startDate, undefined, { dateStyle: "medium" }) : "TBA"}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

