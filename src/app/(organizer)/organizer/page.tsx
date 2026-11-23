"use client";

import Link from "next/link";
import { collection, limit, orderBy, query, where } from "firebase/firestore";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  FileCode2,
  Gavel,
  IndianRupee,
  Megaphone,
  Plus,
  QrCode,
  Users,
} from "lucide-react";
import { clientDb, firebaseReady } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLiveQuery } from "@/lib/data/live";
import { useMyHackathons } from "@/lib/data/hooks";
import { formatMoney } from "@/lib/domain/money";
import { isLive } from "@/lib/domain/status";
import {
  AnimatedNumber,
  Button,
  CardSkeleton,
  EmptyState,
  NotConfigured,
  PageHeader,
  StatCard,
  StatSkeleton,
  StatusBadge,
} from "@/components/ui";
import type { Registration, Submission } from "@/types";
import type { OrderDoc } from "@/types/commerce";

export default function OrganizerOverviewPage() {
  const { firebaseUser, user, notConfigured } = useAuth();
  const uid = firebaseUser?.uid;
  const ready = Boolean(uid && firebaseReady());

  const { data: events, isLoading } = useMyHackathons(uid);

  const { data: regs } = useLiveQuery<Registration>(
    ["org-overview-regs", uid ?? null],
    ready ? () => query(collection(clientDb(), COLLECTIONS.REGISTRATIONS), where("organizerId", "==", uid), orderBy("createdAt", "desc"), limit(150)) : null
  );

  const { data: orders } = useLiveQuery<OrderDoc>(
    ["org-overview-orders", uid ?? null],
    ready ? () => query(collection(clientDb(), COLLECTIONS.ORDERS), where("organizerId", "==", uid), orderBy("createdAt", "desc"), limit(100)) : null
  );

  const { data: subs } = useLiveQuery<Submission>(
    ["org-overview-subs", uid ?? null],
    ready ? () => query(collection(clientDb(), COLLECTIONS.SUBMISSIONS), where("organizerId", "==", uid), limit(100)) : null
  );

  if (notConfigured) return <NotConfigured service="Firebase" />;

  const allEvents = events ?? [];
  const liveCount = allEvents.filter((e) => isLive(e.status)).length;
  const actionNeeded = allEvents.filter((e) => ["more_info_required", "rejected", "payment_pending"].includes(e.status));
  const pendingReview = allEvents.filter((e) => e.status === "pending_review").length;

  const ticketRevenuePaise = (orders ?? [])
    .filter((o) => o.kind === "registration" && o.status === "paid")
    .reduce((sum, o) => sum + (o.total ?? 0), 0);

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title={`Organizer Console`}
        description={`Manage your hackathons, check-ins, judging, and payouts, ${user?.displayName || "Organizer"}.`}
        actions={
          <Button href="/organizer/create" leftIcon={<Plus size={16} />}>
            Host a Hackathon
          </Button>
        }
      />

      {actionNeeded.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-900">
                {actionNeeded.length} hackathon{actionNeeded.length > 1 ? "s need" : " needs"} your attention
              </p>
              <p className="text-xs text-amber-800">
                Complete listing fee payment or respond to admin review feedback so your event can go live.
              </p>
            </div>
          </div>
          <Button size="sm" variant="secondary" href={`/organizer/create?id=${actionNeeded[0].id}`}>
            Open Event
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="My Hackathons" value={<AnimatedNumber value={allEvents.length} />} hint={`${liveCount} live · ${pendingReview} pending`} icon={<Calendar size={18} />} tone="blue" />
          <StatCard label="Total Registrations" value={<AnimatedNumber value={(regs ?? []).length} />} icon={<Users size={18} />} tone="green" />
          <StatCard label="Ticket Revenue" value={formatMoney(ticketRevenuePaise)} icon={<IndianRupee size={18} />} tone="amber" />
          <StatCard label="Project Submissions" value={<AnimatedNumber value={(subs ?? []).filter((s) => s.status !== "withdrawn").length} />} icon={<FileCode2 size={18} />} tone="violet" />
        </div>
      )}

      {/* Quick Console Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Check-in QR", href: "/organizer/participants", icon: QrCode },
          { label: "Announcements", href: "/organizer/announcements", icon: Megaphone },
          { label: "Judging & Winners", href: "/organizer/judging", icon: Gavel },
          { label: "Live Analytics", href: "/organizer/analytics", icon: BarChart3 },
        ].map((q) => {
          const Icon = q.icon;
          return (
            <Link key={q.href} href={q.href} className="card-hover p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EEF4FF] text-[#1565D8] flex items-center justify-center shrink-0">
                <Icon size={18} />
              </div>
              <span className="font-semibold text-xs sm:text-sm text-slate-900">{q.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Recent Events */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-slate-900">Your Hackathons</h2>
          <Link href="/organizer/events" className="text-xs font-semibold text-[#1565D8] hover:underline">
            View all
          </Link>
        </div>

        {isLoading ? (
          <CardSkeleton />
        ) : allEvents.length === 0 ? (
          <EmptyState
            icon={<Calendar size={22} />}
            title="Launch your first hackathon"
            description="Use our 9-step wizard with autosave, tracks, tickets, and judging rubrics to go live fast."
            action={<Button href="/organizer/create">Create Hackathon</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allEvents.slice(0, 6).map((h) => (
              <div key={h.id} className="card p-5 space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge status={h.status} />
                    <span className="text-xs text-slate-500 capitalize">{h.mode}</span>
                  </div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 truncate">{h.name || "Untitled draft"}</h3>
                  <p className="text-xs text-slate-500">
                    {h.registrationCount ?? 0} registered · {h.teamCount ?? 0} teams · {h.submissionCount ?? 0} submissions
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                  <Button variant="secondary" size="sm" href={`/organizer/create?id=${h.id}`}>
                    {isLive(h.status) ? "Edit Event" : "Continue Setup"}
                  </Button>
                  <Button variant="secondary" size="sm" href={`/organizer/participants?hackathonId=${h.id}`}>
                    Participants
                  </Button>
                  {h.isListed && h.slug && (
                    <Button size="sm" href={`/hackathons/${h.slug}`} className="ml-auto">
                      View Live
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
