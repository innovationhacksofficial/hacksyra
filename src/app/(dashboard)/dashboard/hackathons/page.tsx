"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { collection, orderBy, query, where } from "firebase/firestore";
import { Calendar, CalendarPlus, Compass, Download, ExternalLink, Send, Ticket, Users, XCircle } from "lucide-react";
import { clientDb, firebaseReady } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLiveQuery } from "@/lib/data/live";
import { useHackathon } from "@/lib/data/hooks";
import { api } from "@/lib/api-client";
import { formatInZone, toDate, toMillis } from "@/lib/domain/dates";
import { buildIcsContent, googleCalendarUrl } from "@/lib/domain/calendar";
import { computeLiveStatus } from "@/lib/domain/status";
import {
  Button,
  CardSkeleton,
  ConfirmDialog,
  Countdown,
  EmptyState,
  NotConfigured,
  PageHeader,
  StatusBadge,
  Tabs,
  useToast,
} from "@/components/ui";
import type { Registration } from "@/types";

function RegistrationItem({
  reg,
  onCancel,
}: {
  reg: Registration;
  onCancel: (r: Registration) => void;
}) {
  const { data: h } = useHackathon(reg.hackathonId);
  const liveStage = h ? computeLiveStatus(h) : null;
  const gcal = h
    ? googleCalendarUrl({
        title: h.name,
        start: h.startDate,
        end: h.endDate,
        details: h.tagline,
        location: h.mode === "online" ? h.onlinePlatform || "Online" : [h.venueName, h.city].filter(Boolean).join(", "),
      })
    : null;

  function downloadIcs() {
    if (!h) return;
    const ics = buildIcsContent({
      uid: h.id,
      title: h.name,
      start: h.startDate,
      end: h.endDate,
      description: h.tagline,
      location: h.mode === "online" ? h.onlinePlatform || "Online" : [h.venueName, h.city].filter(Boolean).join(", "),
    });
    if (!ics) return;
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${h.slug || h.id}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const canCancel = reg.status !== "cancelled" && reg.status !== "rejected" && (!h?.startDate || Date.now() < (toMillis(h.startDate) ?? Infinity));

  return (
    <div className="card p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/hackathons/${reg.hackathonSlug}`} className="font-display font-bold text-lg text-slate-900 hover:text-[#1565D8]">
              {reg.hackathonName}
            </Link>
            <StatusBadge status={reg.status} />
            {liveStage && <StatusBadge status={liveStage} />}
          </div>
          <p className="text-xs text-slate-500">
            Registered {formatInZone(toDate(reg.createdAt))} · {reg.registrationType === "individual" ? "Individual" : "Team entry"}
          </p>
          {h?.submissionCloseDate && reg.status !== "cancelled" && (
            <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
              <span>Submission deadline:</span>
              <Countdown target={h.submissionCloseDate} />
            </div>
          )}
        </div>

        <Link
          href={`/hackathons/${reg.hackathonSlug}`}
          className="text-xs font-semibold text-[#1565D8] inline-flex items-center gap-1 hover:underline shrink-0"
        >
          Event Page <ExternalLink size={12} />
        </Link>
      </div>

      {reg.status !== "cancelled" && reg.status !== "rejected" && (
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
          <Button variant="secondary" size="sm" href="/dashboard/tickets" leftIcon={<Ticket size={14} />}>
            Pass &amp; QR
          </Button>
          <Button variant="secondary" size="sm" href="/dashboard/teams" leftIcon={<Users size={14} />}>
            {reg.teamId ? "My Team" : "Join / Create Team"}
          </Button>
          <Button size="sm" href={`/dashboard/submissions?hackathonId=${reg.hackathonId}`} leftIcon={<Send size={14} />}>
            Submit Project
          </Button>
          {gcal && (
            <a href={gcal} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm">
              <CalendarPlus size={14} /> Google Cal
            </a>
          )}
          {h && (
            <Button variant="secondary" size="sm" onClick={downloadIcs} leftIcon={<Download size={14} />}>
              .ICS
            </Button>
          )}
          {canCancel && (
            <Button variant="danger" size="sm" onClick={() => onCancel(reg)} leftIcon={<XCircle size={14} />} className="sm:ml-auto">
              Cancel
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default function MyHackathonsPage() {
  const { firebaseUser, notConfigured } = useAuth();
  const toast = useToast();
  const ready = Boolean(firebaseUser?.uid && firebaseReady());

  const [tab, setTab] = useState("active");
  const [cancelling, setCancelling] = useState<Registration | null>(null);
  const [busy, setBusy] = useState(false);

  const { data: regs, isLoading } = useLiveQuery<Registration>(
    ["my-regs", firebaseUser?.uid ?? null],
    ready
      ? () =>
          query(
            collection(clientDb(), COLLECTIONS.REGISTRATIONS),
            where("userId", "==", firebaseUser!.uid),
            orderBy("createdAt", "desc")
          )
      : null
  );

  const filtered = useMemo(() => {
    const all = regs ?? [];
    if (tab === "active") return all.filter((r) => ["confirmed", "checked_in", "waitlisted", "pending_approval"].includes(r.status));
    if (tab === "cancelled") return all.filter((r) => r.status === "cancelled" || r.status === "rejected");
    return all;
  }, [regs, tab]);

  async function confirmCancel() {
    if (!cancelling) return;
    setBusy(true);
    try {
      await api(`/api/registrations/${cancelling.id}/cancel`, { method: "POST", body: { reason: "Cancelled by participant" } });
      toast.success("Registration cancelled");
      setCancelling(null);
    } catch (e) {
      toast.error("Couldn't cancel registration", e instanceof Error ? e.message : undefined);
    } finally {
      setBusy(false);
    }
  }

  if (notConfigured) return <NotConfigured service="Firestore" />;

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="My Hackathons"
        description="Real-time tracker for every hackathon you registered in, including tickets, team status, and submissions."
        actions={
          <Button href="/hackathons" leftIcon={<Compass size={16} />}>
            Browse Hackathons
          </Button>
        }
      />

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { id: "active", label: "Active", badge: (regs ?? []).filter((r) => !["cancelled", "rejected"].includes(r.status)).length },
          { id: "cancelled", label: "Cancelled / Rejected", badge: (regs ?? []).filter((r) => ["cancelled", "rejected"].includes(r.status)).length },
          { id: "all", label: "All", badge: (regs ?? []).length },
        ]}
      />

      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Calendar size={22} />}
          title="No hackathons in this view"
          description="Explore upcoming hackathons and register with one click."
          action={<Button href="/hackathons">Explore Hackathons</Button>}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <RegistrationItem key={r.id} reg={r} onCancel={setCancelling} />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!cancelling}
        onClose={() => setCancelling(null)}
        onConfirm={confirmCancel}
        loading={busy}
        danger
        title={`Cancel registration for ${cancelling?.hackathonName ?? "hackathon"}?`}
        message="You can only cancel before the hackathon starts. Your seat will be released immediately."
        confirmLabel="Cancel Registration"
      />
    </div>
  );
}
