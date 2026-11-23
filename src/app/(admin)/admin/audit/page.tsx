"use client";

import { useState } from "react";
import { collection, limit, orderBy, query, where } from "firebase/firestore";
import { ScrollText } from "lucide-react";
import { clientDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useLiveQuery } from "@/lib/data/live";
import { formatInZone, toDate } from "@/lib/domain/dates";
import { DataList, EmptyState, ListSkeleton, LoadMore, PageHeader, Select } from "@/components/ui";
import type { AuditLog } from "@/types";

export default function AdminAuditPage() {
  const [resource, setResource] = useState("all");
  const [maxRows, setMaxRows] = useState(50);

  const { data: logs, isLoading } = useLiveQuery<AuditLog>(["admin", "audit", resource, maxRows], () => {
    const col = collection(clientDb(), COLLECTIONS.AUDIT_LOGS);
    return resource === "all"
      ? query(col, orderBy("createdAt", "desc"), limit(maxRows))
      : query(col, where("resource", "==", resource), orderBy("createdAt", "desc"), limit(maxRows));
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log"
        description="Immutable server record of admin reviews, role changes, payments, and submissions."
        actions={
          <Select value={resource} onChange={(e) => setResource(e.target.value)} className="w-48">
            <option value="all">All resources</option>
            <option value="hackathons">Hackathons</option>
            <option value="orders">Orders / Payments</option>
            <option value="users">Users</option>
            <option value="organizations">Organizations</option>
            <option value="platformSettings">Platform settings</option>
          </Select>
        }
      />

      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : !logs || logs.length === 0 ? (
        <EmptyState icon={<ScrollText size={22} />} title="No audit logs found" />
      ) : (
        <>
          <DataList
            items={logs}
            keyExtractor={(l) => l.id}
            columns={[
              { key: "action", header: "Action", cell: (l) => <span className="font-mono text-xs font-bold text-[#1565D8]">{l.action}</span> },
              { key: "actor", header: "Actor", cell: (l) => <span className="text-xs text-slate-700">{l.actorEmail || l.actorId}</span> },
              { key: "target", header: "Target", cell: (l) => <span className="font-mono text-xs text-slate-600">{l.resource}/{l.resourceId ?? "—"}</span> },
              { key: "notes", header: "Notes", cell: (l) => <span className="text-xs text-slate-500">{l.notes || "—"}</span> },
              { key: "time", header: "When", cell: (l) => <span className="text-xs text-slate-400">{formatInZone(toDate(l.createdAt))}</span> },
            ]}
          />
          <LoadMore hasMore={(logs?.length ?? 0) >= maxRows} onMore={() => setMaxRows((m) => m + 50)} />
        </>
      )}
    </div>
  );
}

