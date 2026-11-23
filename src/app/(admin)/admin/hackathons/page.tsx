"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { collection, limit, orderBy, query } from "firebase/firestore";
import { Trophy, Search, Star, Ban, RotateCcw } from "lucide-react";
import { clientDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useLiveQuery } from "@/lib/data/live";
import { api } from "@/lib/api-client";
import { Button, ConfirmDialog, DataList, EmptyState, Input, ListSkeleton, PageHeader, StatusBadge, useToast } from "@/components/ui";
import type { Hackathon } from "@/types";

export default function AdminHackathonsPage() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [suspendTarget, setSuspendTarget] = useState<Hackathon | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: list, isLoading } = useLiveQuery<Hackathon>(["admin", "all-hackathons"], () =>
    query(collection(clientDb(), COLLECTIONS.HACKATHONS), orderBy("updatedAt", "desc"), limit(100))
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (list ?? []).filter((h) => {
      if (statusFilter !== "all" && h.status !== statusFilter) return false;
      if (q && !`${h.name} ${h.slug} ${h.organizerName}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [list, search, statusFilter]);

  async function toggleFeature(h: Hackathon) {
    try {
      await api(`/api/admin/hackathons/${h.id}/feature`, { method: "POST", body: { isFeatured: !h.isFeatured } });
      toast.success(h.isFeatured ? "Removed from featured" : "Marked featured");
    } catch (e) {
      toast.error("Failed", e instanceof Error ? e.message : undefined);
    }
  }

  async function handleSuspend() {
    if (!suspendTarget || !reason.trim()) return;
    setBusy(true);
    try {
      await api(`/api/admin/hackathons/${suspendTarget.id}/suspend`, { method: "POST", body: { reason } });
      toast.success("Hackathon suspended");
      setSuspendTarget(null);
      setReason("");
    } catch (e) {
      toast.error("Failed", e instanceof Error ? e.message : undefined);
    } finally {
      setBusy(false);
    }
  }

  async function handleUnsuspend(h: Hackathon) {
    try {
      await api(`/api/admin/hackathons/${h.id}/unsuspend`, { method: "POST", body: {} });
      toast.success("Hackathon restored");
    } catch (e) {
      toast.error("Failed", e instanceof Error ? e.message : undefined);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="All Hackathons" description="Manage every hackathon across drafts, pending reviews, live events, and suspensions." />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input placeholder="Search by name, slug, or organizer..." leftAdornment={<Search size={15} />} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input sm:w-52">
          <option value="all">All statuses</option>
          <option value="pending_review">Pending review</option>
          <option value="registration_open">Registration open</option>
          <option value="ongoing">Live now</option>
          <option value="draft">Draft</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {isLoading ? (
        <ListSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Trophy size={22} />} title="No matching hackathons" />
      ) : (
        <DataList
          items={filtered}
          keyExtractor={(h) => h.id}
          columns={[
            {
              key: "name",
              header: "Hackathon",
              cell: (h) => (
                <Link href={`/admin/reviews/${h.id}`} className="font-semibold text-slate-900 hover:text-[#1565D8]">
                  {h.name || "Untitled draft"}
                </Link>
              ),
            },
            { key: "org", header: "Organizer", cell: (h) => <span className="text-xs text-slate-600">{h.organizerName}</span> },
            { key: "status", header: "Status", cell: (h) => <StatusBadge status={h.status} /> },
            { key: "regs", header: "Registrations", cell: (h) => <span className="tabular-nums">{h.registrationCount ?? 0}</span> },
            {
              key: "actions",
              header: "Actions",
              cell: (h) => (
                <div className="flex items-center gap-1.5">
                  <Button variant={h.isFeatured ? "primary" : "secondary"} size="sm" onClick={() => toggleFeature(h)}>
                    <Star size={13} />
                  </Button>
                  {h.status === "suspended" ? (
                    <Button variant="secondary" size="sm" onClick={() => handleUnsuspend(h)} leftIcon={<RotateCcw size={13} />}>
                      Restore
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => setSuspendTarget(h)} leftIcon={<Ban size={13} className="text-red-600" />}>
                      Suspend
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
        />
      )}

      <ConfirmDialog
        open={!!suspendTarget}
        onClose={() => setSuspendTarget(null)}
        onConfirm={handleSuspend}
        loading={busy}
        danger
        title={`Suspend "${suspendTarget?.name}"?`}
        message="This removes it from public listings immediately."
        confirmLabel="Suspend"
      >
        <Input label="Reason" required value={reason} onChange={(e) => setReason(e.target.value)} />
      </ConfirmDialog>
    </div>
  );
}

