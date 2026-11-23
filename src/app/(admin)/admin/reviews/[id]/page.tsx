"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc } from "firebase/firestore";
import { ArrowLeft, CheckCircle2, XCircle, MessageSquareWarning, Star, ShieldAlert } from "lucide-react";
import { clientDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useHackathon } from "@/lib/data/hooks";
import { useLiveDoc } from "@/lib/data/live";
import { api } from "@/lib/api-client";
import { formatInZone, toDate, viewerTimeZone } from "@/lib/domain/dates";
import { formatMajor, formatMoney } from "@/lib/domain/money";
import { Button, ConfirmDialog, ErrorState, Skeleton, StatusBadge, Textarea, useToast } from "@/components/ui";
import { Markdown } from "@/components/common/Markdown";
import type { User } from "@/types";
import type { ReviewHistoryEntry } from "@/types/admin";

export default function AdminReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();

  const { data: h, isLoading, error } = useHackathon(id);
  const { data: organizer } = useLiveDoc<User>(
    ["admin", "user", h?.organizerId ?? null],
    h?.organizerId ? () => doc(clientDb(), COLLECTIONS.USERS, h.organizerId) : null
  );

  const [busy, setBusy] = useState(false);
  const [modalKind, setModalKind] = useState<"approve" | "reject" | "info" | null>(null);
  const [note, setNote] = useState("");

  if (isLoading) return <Skeleton className="h-96 rounded-2xl" />;
  if (error || !h) return <ErrorState title="Hackathon not found" message={error?.message} />;

  const adminTz = viewerTimeZone();

  async function runAction() {
    if (!h) return;
    setBusy(true);
    try {
      if (modalKind === "approve") {
        await api(`/api/admin/hackathons/${h.id}/approve`, { method: "POST", body: {} });
        toast.success("Hackathon approved & live!");
        setModalKind(null);
        router.push("/admin/reviews");
      } else if (modalKind === "reject") {
        await api(`/api/admin/hackathons/${h.id}/reject`, { method: "POST", body: { reason: note } });
        toast.success("Hackathon rejected", "Organizer has been notified.");
        setModalKind(null);
      } else if (modalKind === "info") {
        await api(`/api/admin/hackathons/${h.id}/request-info`, { method: "POST", body: { message: note } });
        toast.success("Info requested", "Organizer has been emailed.");
        setModalKind(null);
      }
    } catch (e) {
      toast.error("Action failed", e instanceof Error ? e.message : undefined);
    } finally {
      setBusy(false);
    }
  }

  async function toggleFlag(field: "isFeatured" | "isStaffPick") {
    if (!h) return;
    try {
      await api(`/api/admin/hackathons/${h.id}/feature`, {
        method: "POST",
        body: { [field]: !h[field] },
      });
      toast.success("Updated highlight flag");
    } catch (e) {
      toast.error("Failed", e instanceof Error ? e.message : undefined);
    }
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link href="/admin/reviews" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#1565D8]">
            <ArrowLeft size={14} /> Back to review queue
          </Link>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-display font-bold text-2xl text-slate-900">{h.name}</h1>
            <StatusBadge status={h.status} />
            {h.listingFee?.paid ? (
              <span className="badge-green">Fee Paid ({formatMoney(h.listingFee.amountInPaise ?? 0)})</span>
            ) : (
              <span className="badge-red">Fee Unpaid</span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant={h.isFeatured ? "primary" : "secondary"} size="sm" onClick={() => toggleFlag("isFeatured")} leftIcon={<Star size={14} />}>
            {h.isFeatured ? "Featured ✓" : "Feature"}
          </Button>
          <Button variant={h.isStaffPick ? "aqua" : "secondary"} size="sm" onClick={() => toggleFlag("isStaffPick")}>
            {h.isStaffPick ? "Staff Pick ✓" : "Staff Pick"}
          </Button>
        </div>
      </div>

      {/* Organizer & Payment Meta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 space-y-1 text-xs">
          <p className="font-bold uppercase text-slate-400">Organizer</p>
          <p className="font-bold text-sm text-slate-900">{organizer?.displayName || h.organizerName}</p>
          <p className="text-slate-600">{organizer?.email || h.contactEmail}</p>
          <p className="text-slate-500">Username: @{organizer?.username || "—"}</p>
        </div>
        <div className="card p-4 space-y-1 text-xs">
          <p className="font-bold uppercase text-slate-400">Listing Fee Verification</p>
          <p className="font-bold text-sm text-slate-900">{h.listingFee?.paid ? "Verified Paid" : "Not Paid"}</p>
          <p className="text-slate-600">Amount: {formatMoney(h.listingFee?.amountInPaise ?? 0)}</p>
          <p className="font-mono text-slate-500 truncate">Provider: {h.listingFee?.provider || "—"} · {h.listingFee?.paymentId || ""}</p>
        </div>
        <div className="card p-4 space-y-1 text-xs">
          <p className="font-bold uppercase text-slate-400">Event Settings</p>
          <p className="text-slate-700 capitalize">Mode: {h.mode} {h.city ? `(${h.city})` : ""}</p>
          <p className="text-slate-700 capitalize">Visibility: {h.visibility} · Slug: <span className="font-mono">{h.slug}</span></p>
          <p className="text-slate-700">Teams: {h.minTeamSize}–{h.maxTeamSize} · {h.isFree ? "Free" : "Paid"}</p>
        </div>
      </div>

      {h.coverImage && (
        <div className="relative h-56 w-full rounded-2xl overflow-hidden border border-slate-200">
          <Image src={h.coverImage} alt={h.name} fill className="object-cover" />
        </div>
      )}

      {/* Timeline */}
      <div className="card p-5 space-y-3">
        <h2 className="font-display font-bold text-base text-slate-900">Timeline ({h.eventTimezone})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {[
            ["Registration Opens", h.registrationOpenDate],
            ["Registration Closes", h.registrationCloseDate],
            ["Starts", h.startDate],
            ["Ends", h.endDate],
            ["Submissions Close", h.submissionCloseDate],
            ["Results", h.resultsAnnouncementDate],
          ].map(([label, val]) => (
            <div key={String(label)} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-slate-400 font-semibold">{String(label)}</p>
              <p className="font-semibold text-slate-900 mt-0.5">{formatInZone(toDate(val as never), h.eventTimezone)}</p>
              {adminTz !== h.eventTimezone && (
                <p className="text-[11px] text-slate-500 mt-0.5">Local: {formatInZone(toDate(val as never), adminTz)}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Description & Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5 space-y-2">
          <h2 className="font-display font-bold text-base text-slate-900">Summary &amp; Description</h2>
          <p className="text-sm text-slate-700 font-medium">{h.summary}</p>
          <div className="pt-2 border-t border-slate-100">
            <Markdown content={h.description} />
          </div>
        </div>
        <div className="card p-5 space-y-4">
          <div>
            <h2 className="font-display font-bold text-base text-slate-900 mb-2">Rules</h2>
            <Markdown content={h.rules} />
          </div>
          <div className="pt-3 border-t border-slate-100">
            <h3 className="font-display font-bold text-sm text-slate-900 mb-2">Tracks &amp; Prizes</h3>
            <p className="text-xs text-slate-600 mb-2">Total Cash Pool: <strong>{formatMajor((h.totalPrizeInPaise ?? 0) / 100)}</strong></p>
            <div className="flex flex-wrap gap-1.5">
              {(h.tracks ?? []).map((t) => (
                <span key={t.id} className="badge-violet">{t.name}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Review History */}
      {(h.review?.history?.length ?? 0) > 0 && (
        <div className="card p-5 space-y-2">
          <h2 className="font-display font-bold text-base text-slate-900">Review History</h2>
          {(h.review!.history as ReviewHistoryEntry[]).map((entry, idx) => (
            <div key={idx} className="text-xs flex items-start justify-between gap-4 py-2 border-b last:border-0 border-slate-100">
              <div>
                <span className="font-bold uppercase text-slate-900">{entry.decision}</span>
                {entry.message && <p className="text-slate-600 mt-0.5">{entry.message}</p>}
              </div>
              <span className="text-slate-400 shrink-0">{entry.byEmail || entry.by} · {formatInZone(toDate(entry.at))}</span>
            </div>
          ))}
        </div>
      )}

      {/* Action Bar */}
      <div className="sticky bottom-16 md:bottom-4 z-20 card p-4 bg-white/95 backdrop-blur-xl shadow-2xl border-[#B3D1FF] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <ShieldAlert size={16} className="text-[#1565D8]" />
          <span>Every review decision triggers an audit log + instant notification + email.</span>
        </div>
        <div className="flex flex-wrap gap-2.5 ml-auto">
          <Button variant="secondary" size="sm" onClick={() => { setNote(""); setModalKind("info"); }} leftIcon={<MessageSquareWarning size={15} />}>
            Request Info
          </Button>
          <Button variant="danger" size="sm" onClick={() => { setNote(""); setModalKind("reject"); }} leftIcon={<XCircle size={15} />}>
            Reject
          </Button>
          <Button size="sm" onClick={() => setModalKind("approve")} leftIcon={<CheckCircle2 size={15} />}>
            Approve &amp; Go Live
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={modalKind === "approve"}
        onClose={() => setModalKind(null)}
        onConfirm={runAction}
        loading={busy}
        title="Approve & publish this hackathon?"
        message="It will immediately become visible according to its visibility and dates, and the organizer will be notified."
        confirmLabel="Approve Now"
      />

      <ConfirmDialog
        open={modalKind === "reject" || modalKind === "info"}
        onClose={() => setModalKind(null)}
        onConfirm={runAction}
        loading={busy}
        danger={modalKind === "reject"}
        title={modalKind === "reject" ? "Reject hackathon" : "Request more information"}
        message={modalKind === "reject" ? "Provide a clear reason sent to the organizer." : "Tell the organizer what to clarify before approval."}
        confirmLabel={modalKind === "reject" ? "Reject Hackathon" : "Send Request"}
      >
        <Textarea
          label={modalKind === "reject" ? "Rejection Reason" : "Message to Organizer"}
          required
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </ConfirmDialog>
    </div>
  );
}

