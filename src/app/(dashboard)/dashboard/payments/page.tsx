"use client";

import Link from "next/link";
import { collection, orderBy, query, where } from "firebase/firestore";
import { CreditCard, Download, ExternalLink } from "lucide-react";
import { clientDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLiveQuery } from "@/lib/data/live";
import { formatMoney } from "@/lib/domain/money";
import { formatInZone, toDate } from "@/lib/domain/dates";
import { Button, DataList, EmptyState, ErrorState, ListSkeleton, PageHeader, StatusBadge } from "@/components/ui";
import type { OrderDoc } from "@/types/commerce";

export default function DashboardPaymentsPage() {
  const { firebaseUser } = useAuth();
  const { data: orders, isLoading, error } = useLiveQuery<OrderDoc>(
    ["orders", "user", firebaseUser?.uid ?? null],
    firebaseUser?.uid
      ? () => query(collection(clientDb(), COLLECTIONS.ORDERS), where("userId", "==", firebaseUser.uid), orderBy("createdAt", "desc"))
      : null
  );

  function exportCsv() {
    if (!orders?.length) return;
    const rows = [
      ["Order Number", "Kind", "Event", "Total (INR)", "Status", "Provider", "Date"].join(","),
      ...orders.map((o) =>
        [
          o.orderNumber,
          o.kind,
          JSON.stringify(o.hackathonName ?? ""),
          (o.total / 100).toFixed(2),
          o.status,
          o.paymentProvider ?? "",
          toDate(o.createdAt)?.toISOString() ?? "",
        ].join(",")
      ),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "hacksyra-my-payments.csv";
    a.click();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments & Receipts"
        description="Real-time record of your ticket purchases, listing fees, and refunds."
        actions={
          orders && orders.length > 0 ? (
            <Button variant="secondary" size="sm" onClick={exportCsv} leftIcon={<Download size={14} />}>
              Export CSV
            </Button>
          ) : undefined
        }
      />

      {error ? (
        <ErrorState message={error.message} />
      ) : isLoading ? (
        <ListSkeleton rows={4} />
      ) : !orders || orders.length === 0 ? (
        <EmptyState
          icon={<CreditCard size={22} />}
          title="No payments yet"
          description="Paid hackathon tickets and organizer listing fees appear here with downloadable receipts."
          action={<Button href="/hackathons">Browse hackathons</Button>}
        />
      ) : (
        <DataList
          items={orders}
          keyExtractor={(o) => o.id}
          columns={[
            {
              key: "order",
              header: "Order",
              cell: (o) => (
                <div>
                  <p className="font-mono font-bold text-xs text-slate-900">{o.orderNumber}</p>
                  <p className="text-xs text-slate-500 capitalize">{o.kind.replace("_", " ")}</p>
                </div>
              ),
            },
            {
              key: "event",
              header: "Hackathon",
              cell: (o) => <span className="font-semibold text-slate-900">{o.hackathonName || o.hackathonId}</span>,
            },
            {
              key: "amount",
              header: "Amount",
              cell: (o) => <span className="font-display font-bold tabular-nums">{formatMoney(o.total, o.currency)}</span>,
            },
            { key: "status", header: "Status", cell: (o) => <StatusBadge status={o.status} /> },
            {
              key: "date",
              header: "Date",
              cell: (o) => <span className="text-xs text-slate-500">{formatInZone(toDate(o.createdAt))}</span>,
            },
            {
              key: "receipt",
              header: "Receipt",
              cell: (o) => (
                <Link href={`/dashboard/payments/receipt/${o.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-[#1565D8] hover:underline">
                  View <ExternalLink size={12} />
                </Link>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
