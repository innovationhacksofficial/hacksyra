"use client";

import Link from "next/link";
import { collection, orderBy, query, where } from "firebase/firestore";
import { ClipboardCheck, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { clientDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useLiveQuery } from "@/lib/data/live";
import { formatInZone, toDate } from "@/lib/domain/dates";
import { formatMoney } from "@/lib/domain/money";
import { EmptyState, ErrorState, ListSkeleton, PageHeader, StatusBadge } from "@/components/ui";
import type { Hackathon } from "@/types";

export default function AdminReviewsQueuePage() {
  const { data: queue, isLoading, error } = useLiveQuery<Hackathon>(["admin", "reviews-queue"], () =>
    query(
      collection(clientDb(), COLLECTIONS.HACKATHONS),
      where("status", "in", ["pending_review", "more_info_required"]),
      orderBy("updatedAt", "desc")
    )
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hackathon Review Queue"
        description="Inspect event details, verify the listing fee payment, and approve, request info, or reject."
      />

      {error ? (
        <ErrorState message={error.message} />
      ) : isLoading ? (
        <ListSkeleton rows={4} />
      ) : !queue || queue.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck size={22} />}
          title="All caught up!"
          description="No hackathons are waiting for review right now."
        />
      ) : (
        <div className="space-y-3">
          {queue.map((h) => (
            <Link
              key={h.id}
              href={`/admin/reviews/${h.id}`}
              className="card-hover p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={h.status} />
                  {h.listingFee?.paid ? (
                    <span className="badge-green">
                      <CheckCircle2 size={11} /> Fee Paid ({formatMoney(h.listingFee.amountInPaise ?? 0)})
                    </span>
                  ) : (
                    <span className="badge-red">
                      <AlertCircle size={11} /> Fee Unpaid
                    </span>
                  )}
                  <span className="badge-gray capitalize">{h.mode}</span>
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 truncate">{h.name}</h3>
                <p className="text-xs text-slate-500">
                  by <strong className="text-slate-700">{h.organizerName}</strong> ({h.contactEmail}) · Starts{" "}
                  {formatInZone(toDate(h.startDate), h.eventTimezone)} · {h.completionPercentage ?? 100}% complete
                </p>
              </div>
              <span className="btn-primary btn-sm shrink-0 self-start sm:self-center">
                Inspect &amp; Decide <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

