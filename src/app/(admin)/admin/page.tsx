"use client";

import Link from "next/link";
import { collection, limit, orderBy, query, where } from "firebase/firestore";
import { ClipboardCheck, Trophy, Users, Wallet, Flag, ArrowRight, ScrollText } from "lucide-react";
import { clientDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { usePlatformStats } from "@/lib/data/hooks";
import { useLiveQuery } from "@/lib/data/live";
import { formatMoney } from "@/lib/domain/money";
import { formatInZone, toDate } from "@/lib/domain/dates";
import { AnimatedNumber, Button, EmptyState, ListSkeleton, PageHeader, StatCard, StatSkeleton, StatusBadge } from "@/components/ui";
import type { AuditLog, Hackathon } from "@/types";
import type { ModerationReport } from "@/types/admin";

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = usePlatformStats();

  const { data: pendingReviews } = useLiveQuery<Hackathon>(["admin", "pending-reviews"], () =>
    query(
      collection(clientDb(), COLLECTIONS.HACKATHONS),
      where("status", "in", ["pending_review", "more_info_required"]),
      orderBy("updatedAt", "desc"),
      limit(20)
    )
  );

  const { data: openReports } = useLiveQuery<ModerationReport>(["admin", "open-reports"], () =>
    query(collection(clientDb(), COLLECTIONS.MODERATION_REPORTS), where("status", "==", "open"), limit(20))
  );

  const { data: logs, isLoading: logsLoading } = useLiveQuery<AuditLog>(["admin", "recent-audit"], () =>
    query(collection(clientDb(), COLLECTIONS.AUDIT_LOGS), orderBy("createdAt", "desc"), limit(12))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Admin Overview"
        description="Real-time governance, hackathon review queue, payments, and audit logs."
        actions={
          <Button href="/admin/reviews" leftIcon={<ClipboardCheck size={16} />}>
            Review Queue ({pendingReviews?.length ?? 0})
          </Button>
        }
      />

      {statsLoading ? (
        <StatSkeleton count={5} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            label="Pending Reviews"
            value={<AnimatedNumber value={pendingReviews?.length ?? 0} />}
            icon={<ClipboardCheck size={18} />}
            tone="amber"
          />
          <StatCard
            label="Live Hackathons"
            value={<AnimatedNumber value={stats?.liveHackathons ?? 0} />}
            icon={<Trophy size={18} />}
            tone="green"
          />
          <StatCard
            label="Total Users"
            value={<AnimatedNumber value={stats?.users ?? 0} />}
            icon={<Users size={18} />}
            tone="blue"
          />
          <StatCard
            label="Listing Revenue"
            value={formatMoney(stats?.listingFeeRevenueInPaise ?? 0)}
            icon={<Wallet size={18} />}
            tone="violet"
          />
          <StatCard
            label="Open Reports"
            value={<AnimatedNumber value={openReports?.length ?? 0} />}
            icon={<Flag size={18} />}
            tone="red"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pending Reviews Preview */}
        <div className="lg:col-span-6 card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-base text-slate-900">Awaiting Approval</h2>
            <Link href="/admin/reviews" className="text-xs font-semibold text-[#1565D8] hover:underline flex items-center gap-1">
              Open queue <ArrowRight size={13} />
            </Link>
          </div>
          {!pendingReviews || pendingReviews.length === 0 ? (
            <EmptyState title="Review queue clear" description="No hackathons awaiting review right now." />
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingReviews.slice(0, 6).map((h) => (
                <Link
                  key={h.id}
                  href={`/admin/reviews/${h.id}`}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-xl transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-900 truncate">{h.name || "Untitled"}</p>
                    <p className="text-xs text-slate-500">
                      {h.organizerName} · Fee {h.listingFee?.paid ? "Paid ✓" : "Unpaid"}
                    </p>
                  </div>
                  <StatusBadge status={h.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Audit Feed */}
        <div className="lg:col-span-6 card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-base text-slate-900">Recent Audit Events</h2>
            <Link href="/admin/audit" className="text-xs font-semibold text-[#1565D8] hover:underline flex items-center gap-1">
              Full log <ArrowRight size={13} />
            </Link>
          </div>
          {logsLoading ? (
            <ListSkeleton rows={4} />
          ) : !logs || logs.length === 0 ? (
            <EmptyState icon={<ScrollText size={20} />} title="No audit events yet" />
          ) : (
            <div className="divide-y divide-slate-100">
              {logs.map((l) => (
                <div key={l.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <p className="font-mono font-bold text-slate-800 truncate">{l.action}</p>
                    <p className="text-slate-500 truncate">
                      {l.actorEmail || l.actorId} · {l.resource}
                      {l.resourceId ? `/${l.resourceId}` : ""}
                    </p>
                  </div>
                  <span className="text-slate-400 shrink-0">{formatInZone(toDate(l.createdAt))}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
