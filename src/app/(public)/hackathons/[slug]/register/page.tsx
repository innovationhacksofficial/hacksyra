"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { collection, doc, orderBy, query, where } from "firebase/firestore";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  Tag,
  Sparkles,
  Calendar,
  AlertCircle,
  UploadCloud,
} from "lucide-react";
import { clientDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/providers/AuthProvider";
import { useHackathonBySlug } from "@/lib/data/hooks";
import { useLiveDoc, useLiveQuery } from "@/lib/data/live";
import { api, ApiClientError } from "@/lib/api-client";
import { openRazorpayCheckout } from "@/lib/payments/checkout";
import { uploadToStorage } from "@/lib/storage/upload";
import { formatMoney } from "@/lib/domain/money";
import { formatInZone, toDate } from "@/lib/domain/dates";
import { isRegistrationOpenAt } from "@/lib/domain/status";
import {
  Button,
  Countdown,
  EmptyState,
  Input,
  NotConfigured,
  Select,
  Skeleton,
  StatusBadge,
  Textarea,
  useToast,
} from "@/components/ui";
import { QrDisplay } from "@/components/payments/QrDisplay";
import type { Registration, TicketTier } from "@/types";
import type { TicketDoc } from "@/types/commerce";

type RegApiResponse = {
  requiresPayment: boolean;
  status: string;
  registrationId?: string;
  ticketId?: string;
  orderId?: string;
  razorpayOrderId?: string;
  amount?: number;
  discount?: number;
  subtotal?: number;
  currency?: string;
  keyId?: string;
  devBypass?: boolean;
};

export default function RegisterHackathonPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const toast = useToast();
  const { firebaseUser, user, loading: authLoading, notConfigured } = useAuth();

  const { data: hackRows, isLoading: hackLoading } = useHackathonBySlug(slug);
  const hackathon = hackRows?.[0];

  const { data: tiers } = useLiveQuery<TicketTier>(
    ["tiers", hackathon?.id ?? null],
    hackathon?.id
      ? () =>
          query(
            collection(clientDb(), COLLECTIONS.TICKET_TIERS),
            where("hackathonId", "==", hackathon.id),
            where("isPublic", "==", true),
            orderBy("order", "asc")
          )
      : null
  );

  const regId = hackathon?.id && firebaseUser?.uid ? `${hackathon.id}_${firebaseUser.uid}` : null;
  const { data: existingReg } = useLiveDoc<Registration>(
    ["registration", regId],
    regId ? () => doc(clientDb(), COLLECTIONS.REGISTRATIONS, regId) : null
  );
  const ticketId = existingReg?.ticketId;
  const { data: myTicket } = useLiveDoc<TicketDoc>(
    ["ticket", ticketId ?? null],
    ticketId ? () => doc(clientDb(), COLLECTIONS.TICKETS, ticketId) : null
  );

  const [selectedTierId, setSelectedTierId] = useState<string>("");
  const [selectedTrackId, setSelectedTrackId] = useState<string>("");
  const [inviteCode, setInviteCode] = useState<string>("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [couponInput, setCouponInput] = useState("");
  const [couponState, setCouponState] = useState<{ ok: boolean; discount: number; total: number; reason?: string } | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [devCheckout, setDevCheckout] = useState<RegApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeTier = useMemo(() => {
    if (!tiers?.length) return undefined;
    return tiers.find((t) => t.id === selectedTierId) ?? tiers[0];
  }, [tiers, selectedTierId]);

  if (notConfigured) {
    return (
      <div className="container-app py-10 max-w-2xl">
        <NotConfigured service="Firebase" />
      </div>
    );
  }

  if (hackLoading || authLoading) {
    return (
      <div className="container-app py-10 max-w-2xl space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="container-app py-12 max-w-xl">
        <EmptyState
          title="Hackathon not found"
          description="This hackathon may not be approved yet or the link might be incorrect."
          action={<Button href="/hackathons">Browse hackathons</Button>}
        />
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="container-app py-12 max-w-xl">
        <div className="card p-8 text-center space-y-4">
          <h1 className="font-display font-bold text-2xl text-slate-900">Sign in to register</h1>
          <p className="text-sm text-slate-600">
            Create an account or log in to register for <strong>{hackathon.name}</strong> and get your QR pass.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button href={`/login?next=${encodeURIComponent(`/hackathons/${slug}/register`)}`}>Log in</Button>
            <Button variant="secondary" href={`/signup?next=${encodeURIComponent(`/hackathons/${slug}/register`)}`}>
              Sign up
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const regOpen = isRegistrationOpenAt(hackathon);

  // Already registered view
  if (
    existingReg &&
    ["confirmed", "checked_in", "pending_approval", "waitlisted"].includes(existingReg.status)
  ) {
    return (
      <div className="container-app py-10 max-w-xl">
        <div className="card p-6 sm:p-8 space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <StatusBadge status={existingReg.status} />
            <h1 className="font-display font-bold text-2xl text-slate-900 mt-2">{hackathon.name}</h1>
            <p className="text-sm text-slate-600 mt-1">
              {existingReg.status === "confirmed"
                ? "Your registration is confirmed! Present this QR pass at check-in."
                : existingReg.status === "waitlisted"
                  ? "You are on the waitlist. We'll notify you if a spot opens."
                  : "Your application is awaiting organizer approval."}
            </p>
          </div>

          {myTicket && (
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200 flex flex-col items-center gap-3">
              <QrDisplay value={myTicket.qrCode} size={170} />
              <div className="text-xs space-y-0.5">
                <p className="font-mono font-bold text-[#1565D8]">{myTicket.ticketNumber}</p>
                <p className="font-semibold text-slate-900">{myTicket.attendeeName}</p>
                <p className="text-slate-500">{myTicket.tierName}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button href={`/hackathons/${hackathon.slug}`}>Hackathon Page</Button>
            <Button variant="secondary" href="/dashboard/teams">
              Form / Join a Team
            </Button>
            <Button variant="secondary" href="/dashboard/tickets">
              My Tickets
            </Button>
          </div>
        </div>
      </div>
    );
  }

  async function validateCoupon() {
    if (!couponInput.trim() || !activeTier || !hackathon) return;
    setCheckingCoupon(true);
    try {
      const r = await api<{ ok: boolean; discount: number; total: number; reason?: string }>(
        `/api/coupons/validate?hackathonId=${encodeURIComponent(hackathon.id)}&code=${encodeURIComponent(
          couponInput.trim()
        )}&tierId=${encodeURIComponent(activeTier.id)}`
      );
      setCouponState(r);
      if (r.ok) toast.success("Coupon applied!", `Saved ${formatMoney(r.discount)}`);
      else toast.error("Invalid coupon", r.reason);
    } catch (e) {
      toast.error("Couldn't validate coupon", e instanceof Error ? e.message : undefined);
    } finally {
      setCheckingCoupon(false);
    }
  }

  async function handleFileAnswer(questionId: string, file: File) {
    if (!hackathon || !firebaseUser) return;
    try {
      const res = await uploadToStorage(
        `registrations/${hackathon.id}/${firebaseUser.uid}/${questionId}_${file.name}`,
        file,
        { maxMb: 10, accept: ["image/", "application/pdf"] }
      );
      setAnswers((a) => ({ ...a, [questionId]: res.url }));
      toast.success("File uploaded");
    } catch (e) {
      toast.error("Upload failed", e instanceof Error ? e.message : undefined);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hackathon) return;
    setError(null);
    setSubmitting(true);
    try {
      const resp = await api<RegApiResponse>("/api/registrations", {
        method: "POST",
        body: {
          hackathonId: hackathon.id,
          tierId: activeTier?.id,
          couponCode: couponState?.ok ? couponInput.trim() : undefined,
          inviteCode: inviteCode.trim() || undefined,
          trackId: selectedTrackId || undefined,
          answers,
        },
      });

      if (!resp.requiresPayment) {
        toast.success("Registration submitted!");
        return;
      }

      if (resp.devBypass) {
        setDevCheckout(resp);
        return;
      }

      const rzp = await openRazorpayCheckout({
        key: resp.keyId!,
        amount: resp.amount!,
        currency: resp.currency || "INR",
        description: `${hackathon.name} — ${activeTier?.name ?? "Registration"}`,
        orderId: resp.razorpayOrderId!,
        prefill: { name: user?.displayName || firebaseUser?.displayName || undefined, email: firebaseUser?.email || undefined },
      });

      await api("/api/payments/verify", {
        method: "POST",
        body: {
          orderId: resp.orderId,
          razorpayOrderId: rzp.razorpay_order_id,
          razorpayPaymentId: rzp.razorpay_payment_id,
          razorpaySignature: rzp.razorpay_signature,
        },
      });
      toast.success("Payment verified & ticket issued!");
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "not_configured") {
        setError("Payments aren't configured yet. Add Razorpay keys or enable dev bypass in .env.local.");
      } else {
        setError(err instanceof Error ? err.message : "Could not complete registration.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function completeDevPayment() {
    if (!devCheckout?.orderId) return;
    setSubmitting(true);
    try {
      await api("/api/payments/verify", {
        method: "POST",
        body: { orderId: devCheckout.orderId, devBypass: true },
      });
      setDevCheckout(null);
      toast.success("Dev registration confirmed!");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Dev verification failed.");
    } finally {
      setSubmitting(false);
    }
  }

  const displaySubtotal = activeTier?.price ?? 0;
  const displayTotal = couponState?.ok ? couponState.total : displaySubtotal;

  return (
    <div className="container-app py-8 sm:py-10 max-w-2xl space-y-6">
      <Link href={`/hackathons/${hackathon.slug}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#1565D8]">
        <ArrowLeft size={14} /> Back to {hackathon.name}
      </Link>

      <div className="card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-900">Register for {hackathon.name}</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-1.5">
              <Calendar size={14} /> Closes {formatInZone(toDate(hackathon.registrationCloseDate), hackathon.eventTimezone)}
            </p>
          </div>
          <Countdown target={hackathon.registrationCloseDate} prefix="Closes in" />
        </div>

        {!regOpen ? (
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
            <p className="font-display font-bold text-base text-slate-900">Registration has closed</p>
            <p className="text-xs text-slate-600">The registration deadline for this hackathon has passed.</p>
          </div>
        ) : devCheckout ? (
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-4">
            <p className="text-sm font-bold text-amber-900">Emulator Dev Mode: Simulate Ticket Payment</p>
            <p className="text-xs text-amber-800">
              Seat reserved for 15 minutes. Amount: <strong>{formatMoney(devCheckout.amount ?? 0)}</strong>.
            </p>
            <div className="flex gap-3">
              <Button onClick={completeDevPayment} loading={submitting} leftIcon={<Sparkles size={15} />}>
                Simulate Paid Ticket
              </Button>
              <Button variant="secondary" onClick={() => setDevCheckout(null)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Read-only account summary */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 uppercase font-bold block">Participant</span>
                <span className="font-semibold text-slate-900 text-sm">{user?.displayName || firebaseUser.displayName || "Builder"}</span>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-bold block">Email</span>
                <span className="font-semibold text-slate-900 text-sm">{firebaseUser.email}</span>
              </div>
            </div>

            {hackathon.visibility === "invite_only" && (
              <Input
                label="Event Invite Code"
                required
                placeholder="Enter invite code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
              />
            )}

            {/* Ticket Tier Selection (for paid events) */}
            {!hackathon.isFree && (tiers?.length ?? 0) > 0 && (
              <div className="space-y-2">
                <span className="label">Select Ticket Tier *</span>
                <div className="space-y-2">
                  {tiers!.map((t) => {
                    const selected = activeTier?.id === t.id;
                    const remaining = t.capacity != null ? Math.max(0, t.capacity - (t.sold ?? 0) - (t.reserved ?? 0)) : null;
                    const soldOut = remaining === 0;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        disabled={soldOut}
                        onClick={() => {
                          setSelectedTierId(t.id);
                          setCouponState(null);
                        }}
                        className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all ${
                          selected ? "border-[#1565D8] bg-[#EEF4FF]/60 ring-1 ring-[#1565D8]/20" : "border-slate-200 bg-white"
                        } disabled:opacity-50`}
                      >
                        <div>
                          <p className="font-display font-bold text-sm text-slate-900">{t.name}</p>
                          {t.description && <p className="text-xs text-slate-500">{t.description}</p>}
                          {remaining !== null && <p className="text-[11px] text-slate-500 mt-0.5">{soldOut ? "Sold out" : `${remaining} left`}</p>}
                        </div>
                        <span className="font-display font-bold text-base text-[#1565D8] tabular-nums">
                          {t.price === 0 ? "Free" : formatMoney(t.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Coupon */}
            {!hackathon.isFree && activeTier && activeTier.price > 0 && (
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Input
                    label="Coupon Code (optional)"
                    placeholder="EARLY20"
                    leftAdornment={<Tag size={15} />}
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  />
                </div>
                <Button variant="secondary" onClick={validateCoupon} loading={checkingCoupon}>
                  Apply
                </Button>
              </div>
            )}

            {/* Preferred Track */}
            {(hackathon.tracks?.length ?? 0) > 0 && (
              <Select label="Preferred Track (optional)" value={selectedTrackId} onChange={(e) => setSelectedTrackId(e.target.value)}>
                <option value="">Decide later</option>
                {hackathon.tracks!.map((tr) => (
                  <option key={tr.id} value={tr.id}>
                    {tr.name}
                  </option>
                ))}
              </Select>
            )}

            {/* Custom Registration Questions */}
            {(hackathon.registrationQuestions ?? []).map((q) => (
              <div key={q.id}>
                {q.type === "textarea" ? (
                  <Textarea
                    label={q.label}
                    required={q.required}
                    value={answers[q.id] ?? ""}
                    onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                  />
                ) : q.type === "select" ? (
                  <Select
                    label={q.label}
                    required={q.required}
                    value={answers[q.id] ?? ""}
                    onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                  >
                    <option value="">Select an option</option>
                    {(q.options ?? []).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </Select>
                ) : q.type === "file" ? (
                  <div className="form-field">
                    <span className="label">
                      {q.label} {q.required && <span className="text-red-500">*</span>}
                    </span>
                    <label className="flex items-center gap-3 p-3.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 cursor-pointer text-xs font-semibold text-slate-700 hover:border-[#1565D8]">
                      <UploadCloud size={17} className="text-[#1565D8]" />
                      <span>{answers[q.id] ? "File uploaded ✓ (click to replace)" : "Upload PDF or Image (≤ 10 MB)"}</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="sr-only"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) void handleFileAnswer(q.id, f);
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  <Input
                    label={q.label}
                    type={q.type === "url" ? "url" : "text"}
                    required={q.required}
                    value={answers[q.id] ?? ""}
                    onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                  />
                )}
              </div>
            ))}

            {error && (
              <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-slate-600 flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#1565D8]" />
                {hackathon.isFree || displayTotal === 0 ? (
                  <span>Instant free pass &amp; QR ticket</span>
                ) : (
                  <span>
                    Total due: <strong className="text-base text-slate-900">{formatMoney(displayTotal)}</strong>
                    {couponState?.ok && (
                      <span className="ml-1.5 text-emerald-700 font-semibold">(Saved {formatMoney(couponState.discount)})</span>
                    )}
                  </span>
                )}
              </div>
              <Button
                type="submit"
                size="lg"
                loading={submitting}
                leftIcon={hackathon.isFree || displayTotal === 0 ? <CheckCircle2 size={17} /> : <CreditCard size={17} />}
              >
                {hackathon.isFree || displayTotal === 0 ? "Confirm Registration" : `Pay ${formatMoney(displayTotal)} & Register`}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
