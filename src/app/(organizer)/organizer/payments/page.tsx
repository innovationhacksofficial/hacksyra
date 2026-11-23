"use client";

import { useState } from "react";
import { collection, orderBy, query, where } from "firebase/firestore";
import { CreditCard, Download, RotateCcw, Wallet } from "lucide-react";
import { clientDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLiveQuery } from "@/lib/data/live";
import { api } from "@/lib/api-client";
import { formatMoney } from "@/lib/domain/money";
import { formatInZone, toDate } from "@/lib/domain/dates";
import {
  Button,
  ConfirmDialog,
  DataList,
  EmptyState,
  ErrorState,
  Input,
  ListSkeleton,
  PageHeader,
  StatCard,
  StatusBadge,
  Tabs,
  useToast,
} from "@/components/ui";
import type { OrderDoc } from "@/types/commerce";

export default function OrganizerPaymentsPage() {
  const { firebaseUser } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState("tickets");
  const [refundTarget, setRefundTarget] = useState<OrderDoc | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [refunding, setRefunding] = useState(false);

  const { data: orders, isLoading, error } = useLiveQuery<OrderDoc>(
    ["orders", "organizer", firebaseUser?.uid ?? null],
    firebaseUser?.uid
      ? () =>
          query(
            collection(clientDb(), COLLECTIONS.ORDERS),
            where("organizerId", "==", firebaseUser.uid),
            orderBy("createdAt", "desc")
          )
      : null
  );

  const ticketOrders = (orders ?? []).filter((o) => o.kind === "registration");
  const listingOrders = (orders ?? []).filter((o) => o.kind === "listing_fee");
  const activeList = tab === "tickets" ? ticketOrders : listingOrders;

  const grossTicketRevenue = ticketOrders
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + o.total, 0);
  const listingFeesPaid = listingOrders
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + o.total, 0);

  function exportCsv() {
    if (!activeList.length) return;
    const rows = [
      ["Order Number", "Kind", "Hackathon", "Participant", "Email", "Total (INR)", "Status", "Date"].join(","),
      ...activeList.map((o) =>
        [
          o.orderNumber,
          o.kind,
          JSON.stringify(o.hackathonName ?? ""),
          JSON.stringify(o.userName ?? ""),
          o.userEmail ?? "",
          (o.total / 100).toFixed(2),
          o.status,
          toDate(o.createdAt)?.toISOString() ?? "",
        ].join(",")
      ),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `hacksyra-organizer-${tab}.csv`;
    a.click();
  }

  async function handleRefund() {
    if (!refundTarget || !refundReason.trim()) return;
    setRefunding(true);
    try {
      // Find payment doc id or call by payment query? Let's pass orderId? Wait: /api/payments/refund expects paymentId.
      // Let's look up payment via live query or pass paymentId directly. Let's fetch from payments collection!
      const { getDocs, limit: qLimit, where: qWhere, query: qFn } = await import("firebase/firestore");
      const pSnap = await getDocs(
        qFn(collection(clientDb(), COLLECTIONS.PAYMENTS), qWhere("orderId", "==", refundTarget.id), qLimit(1))
      );
      if (pSnap.empty) throw new Error("Payment record not found.");
      await api("/api/payments/refund", {
        method: "POST",
        body: { paymentId: pSnap.docs[0].id, reason: refundReason.trim() },
      });
      toast.success("Refund initiated");
      setRefundTarget(null);
      setRefundReason("");
    } catch (e) {
      toast.error("Refund failed", e instanceof Error ? e.message : undefined);
    } finally {
      setRefunding(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ticketing & Payouts"
        description="All ticket payments go through HACKSYRA's platform Razorpay account with verified webhooks and instant receipts."
        actions={
          activeList.length > 0 ? (
            <Button variant="secondary" size="sm" onClick={exportCsv} leftIcon={<Download size={14} />}>
              Export CSV
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Ticket Revenue (Paid)"
          value={formatMoney(grossTicketRevenue)}
          icon={<Wallet size={18} />}
          tone="green"
          hint={`${ticketOrders.filter((o) => o.status === "paid").length} paid registrations`}
        />
        <StatCard
          label="Listing Fees Paid"
          value={formatMoney(listingFeesPaid)}
          icon={<CreditCard size={18} />}
          tone="blue"
        />
        <StatCard
          label="Pending / Refunded"
          value={ticketOrders.filter((o) => o.status === "pending" || o.status === "refunded").length}
          tone="amber"
        />
      </div>

      <Tabs
        items={[
          { id: "tickets", label: "Participant Ticket Orders", badge: ticketOrders.length },
          { id: "listing", label: "Hackathon Listing Fees", badge: listingOrders.length },
        ]}
        value={tab}
        onChange={setTab}
      />

      {error ? (
        <ErrorState message={error.message} />
      ) : isLoading ? (
        <ListSkeleton rows={4} />
      ) : activeList.length === 0 ? (
        <EmptyState
          icon={<CreditCard size={22} />}
          title={tab === "tickets" ? "No participant orders yet" : "No listing fee payments yet"}
          description={
            tab === "tickets"
              ? "When participants buy paid tickets to your hackathons, every order appears here in real time."
              : "Listing fees you pay to submit hackathons for review appear here."
          }
        />
      ) : (
        <DataList
          items={activeList}
          keyExtractor={(o) => o.id}
          columns={[
            {
              key: "order",
              header: "Order",
              cell: (o) => (
                <div>
                  <p className="font-mono font-bold text-xs text-slate-900">{o.orderNumber}</p>
                  <p className="text-xs text-slate-500">{formatInZone(toDate(o.createdAt))}</p>
                </div>
              ),
            },
            {
              key: "hackathon",
              header: "Hackathon",
              cell: (o) => <span className="font-semibold text-slate-900">{o.hackathonName}</span>,
            },
            {
              key: "buyer",
              header: "Customer",
              cell: (o) => (
                <div className="text-xs">
                  <p className="font-semibold text-slate-800">{o.userName}</p>
                  <p className="text-slate-500">{o.userEmail}</p>
                </div>
              ),
            },
            {
              key: "amount",
              header: "Amount",
              cell: (o) => <span className="font-display font-bold tabular-nums">{formatMoney(o.total, o.currency)}</span>,
            },
            { key: "status", header: "Status", cell: (o) => <StatusBadge status={o.status} /> },
            {
              key: "actions",
              header: "Actions",
              cell: (o) =>
                o.kind === "registration" && o.status === "paid" ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setRefundTarget(o)}
                    leftIcon={<RotateCcw size={13} />}
                  >
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
        onConfirm={handleRefund}
        title={`Refund ${refundTarget ? formatMoney(refundTarget.total) : ""}?`}
        message={`This issues a full Razorpay refund to ${refundTarget?.userEmail} and cancels their ticket.`}
        confirmLabel="Issue Refund"
        danger
        loading={refunding}
      >
        <Input
          label="Refund Reason"
          required
          placeholder="e.g. Participant requested cancellation"
          value={refundReason}
          onChange={(e) => setRefundReason(e.target.value)}
        />
      </ConfirmDialog>
    </div>
  );
}
