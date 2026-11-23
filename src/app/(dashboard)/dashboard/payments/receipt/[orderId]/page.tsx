"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { doc } from "firebase/firestore";
import { ArrowLeft, Printer, ShieldCheck } from "lucide-react";
import { clientDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useLiveDoc } from "@/lib/data/live";
import { formatMoney } from "@/lib/domain/money";
import { formatInZone, toDate } from "@/lib/domain/dates";
import { Button, ErrorState, Skeleton, StatusBadge } from "@/components/ui";
import type { OrderDoc } from "@/types/commerce";

export default function PaymentReceiptPage() {
  const params = useParams<{ orderId: string }>();
  const { data: order, isLoading, error } = useLiveDoc<OrderDoc>(
    ["order", params.orderId],
    params.orderId ? () => doc(clientDb(), COLLECTIONS.ORDERS, params.orderId) : null
  );

  if (isLoading) return <Skeleton className="h-80 max-w-xl mx-auto rounded-2xl" />;
  if (error || !order) return <ErrorState title="Receipt not found" message={error?.message} />;

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex items-center justify-between no-print">
        <Link href="/dashboard/payments" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#1565D8]">
          <ArrowLeft size={14} /> All payments
        </Link>
        <Button variant="secondary" size="sm" onClick={() => window.print()} leftIcon={<Printer size={14} />}>
          Print / Save PDF
        </Button>
      </div>

      <div className="card p-6 sm:p-8 space-y-6">
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1565D8]">HACKSYRA Receipt</span>
            <h1 className="font-display font-bold text-xl text-slate-900 mt-1">{order.hackathonName || "Hackathon Order"}</h1>
            <p className="text-xs font-mono text-slate-500 mt-0.5">Order {order.orderNumber}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
          <div>
            <p className="text-slate-400 text-xs font-semibold">Billed To</p>
            <p className="font-semibold text-slate-900">{order.userName || "Customer"}</p>
            <p className="text-slate-600">{order.userEmail}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold">Paid At</p>
            <p className="font-semibold text-slate-900">{formatInZone(toDate(order.paidAt ?? order.createdAt))}</p>
            <p className="text-slate-500 capitalize">Provider: {order.paymentProvider || "razorpay"}</p>
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">{order.kind === "listing_fee" ? "Platform Listing Fee" : order.tierName || "Ticket"}</span>
            <span className="font-semibold tabular-nums">{formatMoney(order.subtotal, order.currency)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Coupon ({order.couponCode})</span>
              <span className="tabular-nums">-{formatMoney(order.discountAmount, order.currency)}</span>
            </div>
          )}
          <div className="pt-2 border-t border-slate-200 flex justify-between font-display font-bold text-base text-slate-900">
            <span>Total</span>
            <span className="tabular-nums">{formatMoney(order.total, order.currency)}</span>
          </div>
        </div>

        {order.razorpayPaymentId && (
          <p className="text-xs font-mono text-slate-500 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600" /> Ref: {order.razorpayPaymentId}
          </p>
        )}
      </div>
    </div>
  );
}

