"use client";

import { useState } from "react";
import { collection, orderBy, query } from "firebase/firestore";
import { Flag, Check, X } from "lucide-react";
import { clientDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useLiveQuery } from "@/lib/data/live";
import { api } from "@/lib/api-client";
import { formatInZone, toDate } from "@/lib/domain/dates";
import { Button, ConfirmDialog, EmptyState, Input, ListSkeleton, PageHeader, StatusBadge, useToast } from "@/components/ui";
import type { ModerationReport } from "@/types/admin";

export default function AdminReportsPage() {
  const toast = useToast();
  const { data: reports, isLoading } = useLiveQuery<ModerationReport>(["admin", "reports"], () =>
    query(collection(clientDb(), COLLECTIONS.MODERATION_REPORTS), orderBy("createdAt", "desc"))
  );

  const [target, setTarget] = useState<{ report: ModerationReport; status: "resolved" | "dismissed" } | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function resolveReport() {
    if (!target) return;
    setBusy(true);
    try {
      await api(`/api/admin/reports/${target.report.id}`, {
        method: "POST",
        body: { status: target.status, actionNote: note || undefined },
      });
      toast.success(`Report ${target.status}`);
      setTarget(null);
      setNote("");
    } catch (e) {
      toast.error("Failed", e instanceof Error ? e.message : undefined);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Moderation Reports" description="Review user-submitted flags on hackathons, projects, and discussions." />

      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : !reports || reports.length === 0 ? (
        <EmptyState icon={<Flag size={22} />} title="No reports filed" description="Reported content will appear here for moderation." />
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <StatusBadge status={r.status} />
                  <span className="badge-gray uppercase">{r.targetType}</span>
                  <span className="text-xs text-slate-400">{formatInZone(toDate(r.createdAt))}</span>
                </div>
                <p className="font-display font-bold text-base text-slate-900">{r.reason}</p>
                {r.details && <p className="text-xs text-slate-600">{r.details}</p>}
                <p className="text-xs text-slate-400">Target: {r.targetTitle || r.targetId} · Reporter: {r.reporterEmail || r.reporterId}</p>
              </div>
              {r.status === "open" && (
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" onClick={() => setTarget({ report: r, status: "resolved" })} leftIcon={<Check size={14} />}>
                    Resolve
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setTarget({ report: r, status: "dismissed" })} leftIcon={<X size={14} />}>
                    Dismiss
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!target}
        onClose={() => setTarget(null)}
        onConfirm={resolveReport}
        loading={busy}
        title={`${target?.status === "resolved" ? "Resolve" : "Dismiss"} report?`}
        confirmLabel="Confirm"
      >
        <Input label="Resolution Note" value={note} onChange={(e) => setNote(e.target.value)} />
      </ConfirmDialog>
    </div>
  );
}

