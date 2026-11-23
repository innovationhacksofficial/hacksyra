"use client";

import { useState } from "react";
import { collection, limit, orderBy, query } from "firebase/firestore";
import { CreditCard, RotateCcw } from "lucide-react";
import { clientDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useLiveQuery } from "@/lib/data/live";
import { api } from "@/lib/api-client";
import { formatMoney } from "@/lib/domain/money";
import { formatInZone, toDate } from "@/lib/domain/dates";
import { Button, ConfirmDialog, DataList, EmptyState, Input, ListSkeleton, PageHeader, StatCard, StatusBadge, useToast } from "@/components/ui";
import type { PaymentDoc } from "@/types/commerce";

export default function AdminPaymentsPage() {
  const toast = useToast();
  const { data: payments, isLoading } = useLiveQuery<PaymentDoc>(["admin", "payments"], () =>
    query(collection(clientDb(), COLLECTIONS.PAYMENTS), orderBy("createdAt", "desc"), limit(120))
  );

  const [refundTarget, setRefundTarget] = useState<PaymentDoc | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const captured = (payments ?? []).filter((p) => p.status === "captured");
  const listingTotal = captured.filter((p) => p.kind === "listing_fee").reduce((s, p) => s + p.amount, 0);
  const ticketTotal = captured.filter((p) => p.kind === "registration").reduce((s, p) => s + p.amount, 0);

  async function doRefund() {
    if (!refundTarget || !reason.trim()) return;
    setBusy(true);
    try {
      await api("/api/payments/refund", { method: "POST", body: { paymentId: refundTarget.id, reason } });
      toast.success("Refund initiated");
      setRefundTarget(null);
      setReason("");
    } catch (e) {
      toast.error("Refund failed", e instanceof Error ? e.message : undefined);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Platform Payments & Refunds" description="Every listing fee and ticket payment captured through Razorpay." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Listing Fee Revenue" value={formatMoney(listingTotal)} tone="blue" />
        <StatCard label="Ticket Volume" value={formatMoney(ticketTotal)} tone="green" />
        <StatCard label="Total Transactions" value={payments?.length ?? 0} tone="violet" />
      </div>

      {isLoading ? (
        <ListSkeleton rows={5} />
      ) : !payments || payments.length === 0 ? (
        <EmptyState icon={<CreditCard size={22} />} title="No payment records yet" />
      ) : (
        <DataList
          items={payments}
          keyExtractor={(p) => p.id}
          columns={[
            {
              key: "id",
              header: "Payment",
              cell: (p) => (
                <div>
                  <p className="font-mono text-xs font-bold text-slate-900">{p.providerPaymentId || p.providerOrderId}</p>
                  <p className="text-xs text-slate-500 capitalize">{p.kind.replace("_", " ")} · {p.provider}</p>
                </div>
              ),
            },
            { key: "amount", header: "Amount", cell: (p) => <span className="font-bold tabular-nums">{formatMoney(p.amount, p.currency)}</span> },
            { key: "status", header: "Status", cell: (p) => <StatusBadge status={p.status} /> },
            { key: "date", header: "Created", cell: (p) => <span className="text-xs text-slate-500">{formatInZone(toDate(p.createdAt))}</span> },
            {
              key: "act",
              header: "Actions",
              cell: (p) =>
                p.status === "captured" ? (
                  <Button variant="secondary" size="sm" onClick={() => setRefundTarget(p)} leftIcon={<RotateCcw size={13} />}>
                    Refund
                  </Button>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                ),
            },
          ]}
        />
      )}

      <ConfirmDialog
        open={!!refundTarget}
        onClose={() => setRefundTarget(null)}
        onConfirm={doRefund}
        loading={busy}
        danger
        title={`Refund ${refundTarget ? formatMoney(refundTarget.amount) : ""}?`}
        confirmLabel="Issue Refund"
      >
        <Input label="Reason" required value={reason} onChange={(e) => setReason(e.target.value)} />
      </ConfirmDialog>
    </div>
  );
}

