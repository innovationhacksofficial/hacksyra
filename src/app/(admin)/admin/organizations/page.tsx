"use client";

import { useState } from "react";
import { collection, orderBy, query } from "firebase/firestore";
import { Building2, CheckCircle2, XCircle } from "lucide-react";
import { clientDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useLiveQuery } from "@/lib/data/live";
import { api } from "@/lib/api-client";
import { Button, ConfirmDialog, DataList, EmptyState, Input, ListSkeleton, PageHeader, StatusBadge, useToast } from "@/components/ui";
import type { Organization } from "@/types";

export default function AdminOrganizationsPage() {
  const toast = useToast();
  const { data: orgs, isLoading } = useLiveQuery<Organization>(["admin", "orgs"], () =>
    query(collection(clientDb(), COLLECTIONS.ORGANIZATIONS), orderBy("updatedAt", "desc"))
  );

  const [target, setTarget] = useState<{ org: Organization; status: "verified" | "rejected" | "more_info_required" | "suspended" } | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function decide() {
    if (!target) return;
    setBusy(true);
    try {
      await api(`/api/admin/organizations/${target.org.id}/verify`, {
        method: "POST",
        body: { status: target.status, note: note || undefined },
      });
      toast.success("Organization updated");
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
      <PageHeader title="Organization Verification" description="Verify colleges, startups, and companies hosting hackathons." />

      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : !orgs || orgs.length === 0 ? (
        <EmptyState icon={<Building2 size={22} />} title="No organizations registered yet" />
      ) : (
        <DataList
          items={orgs}
          keyExtractor={(o) => o.id}
          columns={[
            {
              key: "name",
              header: "Organization",
              cell: (o) => (
                <div>
                  <p className="font-semibold text-slate-900">{o.name}</p>
                  <p className="text-xs text-slate-500 capitalize">
                    {o.type} · {o.country} · {o.contactEmail}
                  </p>
                </div>
              ),
            },
            { key: "status", header: "Status", cell: (o) => <StatusBadge status={o.verificationStatus} /> },
            {
              key: "actions",
              header: "Actions",
              cell: (o) => (
                <div className="flex flex-wrap gap-1.5">
                  <Button size="sm" onClick={() => setTarget({ org: o, status: "verified" })} leftIcon={<CheckCircle2 size={13} />}>
                    Verify
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setTarget({ org: o, status: "more_info_required" })}>
                    Ask Info
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => setTarget({ org: o, status: "rejected" })} leftIcon={<XCircle size={13} />}>
                    Reject
                  </Button>
                </div>
              ),
            },
          ]}
        />
      )}

      <ConfirmDialog
        open={!!target}
        onClose={() => setTarget(null)}
        onConfirm={decide}
        loading={busy}
        danger={target?.status === "rejected"}
        title={`Mark "${target?.org.name}" as ${target?.status.replace(/_/g, " ")}?`}
        confirmLabel="Confirm"
      >
        <Input label="Note to Organizer (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
      </ConfirmDialog>
    </div>
  );
}

