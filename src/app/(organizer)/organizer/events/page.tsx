"use client";

import { useMemo, useState } from "react";
import { Calendar, Edit3, Eye, Gavel, Megaphone, Plus, Tag, Users } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useMyHackathons } from "@/lib/data/hooks";
import { formatInZone, toDate } from "@/lib/domain/dates";
import { EDITABLE_STATUSES, isLive } from "@/lib/domain/status";
import { Button, CardSkeleton, EmptyState, NotConfigured, PageHeader, StatusBadge, Tabs } from "@/components/ui";

export default function OrganizerEventsPage() {
  const { firebaseUser, notConfigured } = useAuth();
  const { data: events, isLoading } = useMyHackathons(firebaseUser?.uid);
  const [tab, setTab] = useState("all");

  const filtered = useMemo(() => {
    const all = events ?? [];
    if (tab === "live") return all.filter((e) => isLive(e.status));
    if (tab === "pending") return all.filter((e) => e.status === "pending_review" || e.status === "more_info_required");
    if (tab === "drafts") return all.filter((e) => EDITABLE_STATUSES.includes(e.status));
    return all;
  }, [events, tab]);

  if (notConfigured) return <NotConfigured service="Firestore" />;

  const all = events ?? [];

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="My Hackathons"
        description="Every hackathon you host — live status updates, review notes, participants, and quick actions."
        actions={
          <Button href="/organizer/create" leftIcon={<Plus size={16} />}>
            Host a Hackathon
          </Button>
        }
      />

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { id: "all", label: "All", badge: all.length },
          { id: "live", label: "Live", badge: all.filter((e) => isLive(e.status)).length },
          { id: "pending", label: "In Review", badge: all.filter((e) => e.status === "pending_review" || e.status === "more_info_required").length },
          { id: "drafts", label: "Drafts / Action", badge: all.filter((e) => EDITABLE_STATUSES.includes(e.status)).length },
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
          title="No hackathons match this filter"
          description="Start building your next hackathon event with our step-by-step launcher."
          action={<Button href="/organizer/create">Create Hackathon</Button>}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((h) => {
            const feedback = h.rejectionReason || h.review?.message;
            return (
              <div key={h.id} className="card p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-display font-bold text-lg text-slate-900">{h.name || "Untitled Draft"}</h2>
                      <StatusBadge status={h.status} />
                      <span className="text-xs font-mono text-slate-400">{h.completionPercentage ?? 0}% setup</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-2">{h.tagline || "No tagline added yet."}</p>
                    <p className="text-xs text-slate-500">
                      {h.startDate ? `Starts ${formatInZone(toDate(h.startDate), h.eventTimezone)}` : "Dates not set"} ·{" "}
                      <strong>{h.registrationCount ?? 0}</strong> registrants · <strong>{h.teamCount ?? 0}</strong> teams ·{" "}
                      <strong>{h.submissionCount ?? 0}</strong> submissions
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0">
                    {h.status !== "pending_review" && (
                      <Button variant="secondary" size="sm" href={`/organizer/create?id=${h.id}`} leftIcon={<Edit3 size={14} />}>
                        {h.status === "payment_pending" ? "Pay Fee" : isLive(h.status) ? "Edit" : "Resume"}
                      </Button>
                    )}
                    {h.isListed && h.slug && (
                      <Button size="sm" href={`/hackathons/${h.slug}`} leftIcon={<Eye size={14} />}>
                        View Live
                      </Button>
                    )}
                  </div>
                </div>

                {(h.status === "rejected" || h.status === "more_info_required") && feedback && (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-900">
                    <strong>Admin review note:</strong> {feedback}
                  </div>
                )}

                {isLive(h.status) && (
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                    <Button variant="secondary" size="sm" href={`/organizer/participants?hackathonId=${h.id}`} leftIcon={<Users size={14} />}>
                      Participants
                    </Button>
                    <Button variant="secondary" size="sm" href={`/organizer/judging?hackathonId=${h.id}`} leftIcon={<Gavel size={14} />}>
                      Judging &amp; Winners
                    </Button>
                    <Button variant="secondary" size="sm" href={`/organizer/announcements?hackathonId=${h.id}`} leftIcon={<Megaphone size={14} />}>
                      Announce
                    </Button>
                    <Button variant="secondary" size="sm" href={`/organizer/coupons?hackathonId=${h.id}`} leftIcon={<Tag size={14} />}>
                      Coupons
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
