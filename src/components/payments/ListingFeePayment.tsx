"use client";

import { useState } from "react";
import { CreditCard, ShieldCheck, AlertCircle, CheckCircle2, Sparkles, RefreshCw } from "lucide-react";
import { api, ApiClientError } from "@/lib/api-client";
import { openRazorpayCheckout } from "@/lib/payments/checkout";
import { formatMoney } from "@/lib/domain/money";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button, NotConfigured } from "@/components/ui";

type CreateOrderResp = {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  devBypass?: boolean;
};

export function ListingFeePayment({
  hackathonId,
  amountInPaise,
  onPaid,
  onError,
}: {
  hackathonId: string;
  amountInPaise: number;
  onPaid?: (orderId: string) => void;
  onError?: (message: string) => void;
}) {
  const { user, firebaseUser } = useAuth();
  const [stage, setStage] = useState<"idle" | "creating" | "checkout" | "verifying" | "paid" | "not_configured" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [devOrder, setDevOrder] = useState<CreateOrderResp | null>(null);

  async function startPayment() {
    if (stage === "creating" || stage === "checkout" || stage === "verifying") return;
    setErrorMsg(null);
    setStage("creating");

    try {
      const order = await api<CreateOrderResp>("/api/payments/listing-fee/create-order", {
        method: "POST",
        body: { hackathonId },
      });

      if (order.devBypass) {
        setDevOrder(order);
        setStage("checkout");
        return;
      }

      setStage("checkout");
      const rzp = await openRazorpayCheckout({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        description: "HACKSYRA Hackathon Listing Fee",
        orderId: order.razorpayOrderId,
        prefill: {
          name: user?.displayName || firebaseUser?.displayName || undefined,
          email: user?.email || firebaseUser?.email || undefined,
        },
      });

      setStage("verifying");
      await api("/api/payments/verify", {
        method: "POST",
        body: {
          orderId: order.orderId,
          razorpayOrderId: rzp.razorpay_order_id,
          razorpayPaymentId: rzp.razorpay_payment_id,
          razorpaySignature: rzp.razorpay_signature,
        },
      });

      setStage("paid");
      onPaid?.(order.orderId);
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "not_configured") {
        setStage("not_configured");
        return;
      }
      const msg = err instanceof Error ? err.message : "Payment didn't complete. Try again.";
      setErrorMsg(msg);
      setStage("error");
      onError?.(msg);
    }
  }

  async function completeDevBypass() {
    if (!devOrder) return;
    setStage("verifying");
    try {
      await api("/api/payments/verify", {
        method: "POST",
        body: { orderId: devOrder.orderId, devBypass: true },
      });
      setStage("paid");
      onPaid?.(devOrder.orderId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Dev payment verification failed.";
      setErrorMsg(msg);
      setStage("error");
      onError?.(msg);
    }
  }

  if (stage === "not_configured") {
    return (
      <NotConfigured
        service="Razorpay Payments"
        hint="Add NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET (test keys) in .env.local, or enable PAYMENTS_DEV_BYPASS=true when running emulators."
      />
    );
  }

  if (stage === "paid") {
    return (
      <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-900">
        <CheckCircle2 size={22} className="text-emerald-600 shrink-0" />
        <div>
          <p className="font-display font-bold text-sm">Listing fee verified!</p>
          <p className="text-xs text-emerald-700">Your hackathon has been sent to admins for review.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#B3D1FF] bg-[#EEF4FF]/60 p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1565D8]">
            <ShieldCheck size={14} /> Platform Listing Verification Fee
          </span>
          <p className="text-xs text-slate-600 mt-1">
            One-time fee to submit your hackathon for admin review. Secured via Razorpay.
          </p>
        </div>
        <div className="font-display font-bold text-2xl text-slate-900 tabular-nums shrink-0">
          {formatMoney(amountInPaise, "INR")}
        </div>
      </div>

      {errorMsg && (
        <div role="alert" className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {devOrder ? (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
          <p className="text-xs font-semibold text-amber-900">
            Razorpay test keys aren&apos;t entered yet, and emulator dev bypass is active. Simulate payment to continue testing:
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={completeDevBypass} loading={stage === "verifying"} leftIcon={<Sparkles size={15} />} size="sm">
              Dev mode: simulate {formatMoney(devOrder.amount)} payment
            </Button>
            <Button variant="secondary" size="sm" onClick={() => { setDevOrder(null); setStage("idle"); }}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          size="lg"
          onClick={startPayment}
          loading={stage === "creating" || stage === "checkout" || stage === "verifying"}
          leftIcon={stage === "error" ? <RefreshCw size={17} /> : <CreditCard size={17} />}
          className="w-full"
        >
          {stage === "creating"
            ? "Creating order..."
            : stage === "checkout"
              ? "Complete in Razorpay..."
              : stage === "verifying"
                ? "Verifying signature..."
                : stage === "error"
                  ? `Retry ${formatMoney(amountInPaise)} Payment`
                  : `Pay ${formatMoney(amountInPaise)} & Submit for Review`}
        </Button>
      )}
    </div>
  );
}

