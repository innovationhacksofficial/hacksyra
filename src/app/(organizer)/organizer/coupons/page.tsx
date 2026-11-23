"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { collection, query, where } from "firebase/firestore";
import { Plus, Tag, Ticket, ToggleLeft, ToggleRight } from "lucide-react";
import { clientDb, firebaseReady } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLiveQuery } from "@/lib/data/live";
import { useMyHackathons } from "@/lib/data/hooks";
import { api } from "@/lib/api-client";
import { formatMoney } from "@/lib/domain/money";
import { Button, CardSkeleton, EmptyState, Input, NotConfigured, PageHeader, useToast } from "@/components/ui";

type TierRow = {
  id: string;
  hackathonId: string;
  name: string;
  price: number;
  currency?: string;
  capacity?: number | null;
  sold?: number;
};

type CouponRow = {
  id: string;
  hackathonId: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  usageLimit?: number | null;
  usedCount?: number;
  isActive: boolean;
};

function CouponsInner() {
  const { firebaseUser, notConfigured } = useAuth();
  const params = useSearchParams();
  const toast = useToast();
  const uid = firebaseUser?.uid;
  const ready = Boolean(uid && firebaseReady());

  const { data: events } = useMyHackathons(uid);
  const [hackathonId, setHackathonId] = useState(params.get("hackathonId") ?? "");

  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [amountInput, setAmountInput] = useState("20");
  const [usageLimit, setUsageLimit] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!hackathonId && events && events.length > 0) setHackathonId(events[0].id);
  }, [events, hackathonId]);

  const { data: tiers } = useLiveQuery<TierRow>(
    ["org-tiers", uid ?? null],
    ready ? () => query(collection(clientDb(), COLLECTIONS.TICKET_TIERS), where("organizerId", "==", uid)) : null
  );

  const { data: coupons, isLoading } = useLiveQuery<CouponRow>(
    ["org-coupons", uid ?? null],
    ready ? () => query(collection(clientDb(), COLLECTIONS.COUPONS), where("organizerId", "==", uid)) : null
  );

  const hackTiers = (tiers ?? []).filter((t) => !hackathonId || t.hackathonId === hackathonId);
  const hackCoupons = (coupons ?? []).filter((c) => !hackathonId || c.hackathonId === hackathonId);

  async function createCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!hackathonId || !code.trim()) return;
    const rawNum = Number(amountInput);
    if (!Number.isFinite(rawNum) || rawNum <= 0) {
      toast.error("Enter a valid discount value");
      return;
    }
    const value = type === "percentage" ? Math.min(100, Math.round(rawNum)) : Math.round(rawNum * 100);
    setCreating(true);
    try {
      await api(`/api/organizer/hackathons/${hackathonId}/coupons`, {
        method: "POST",
        body: {
          code: code.trim().toUpperCase(),
          type,
          value,
          usageLimit: usageLimit ? Math.max(1, Number(usageLimit)) : undefined,
          validUntil: validUntil || undefined,
        },
      });
      toast.success(`Coupon ${code.toUpperCase()} created!`);
      setCode("");
      setUsageLimit("");
    } catch (err) {
      toast.error("Couldn't create coupon", err instanceof Error ? err.message : undefined);
    } finally {
      setCreating(false);
    }
  }

  async function toggleCoupon(c: CouponRow) {
    try {
      await api(`/api/organizer/hackathons/${c.hackathonId}/coupons`, {
        method: "PATCH",
        body: { couponId: c.id, isActive: !c.isActive },
      });
      toast.info(c.isActive ? "Coupon paused" : "Coupon activated");
    } catch (err) {
      toast.error("Couldn't update coupon", err instanceof Error ? err.message : undefined);
    }
  }

  if (notConfigured) return <NotConfigured service="Firestore" />;

  return (
    <div className="space-y-6 pb-8">
      <PageHeader title="Tickets & Promo Coupons" description="Review ticket sales per tier and launch promotional discount codes in real time." />

      <div className="flex gap-3">
        <select className="input sm:w-80" value={hackathonId} onChange={(e) => setHackathonId(e.target.value)}>
          {(events ?? []).map((h) => (
            <option key={h.id} value={h.id}>
              {h.name || "Untitled"}
            </option>
          ))}
        </select>
      </div>

      {/* Tiers Overview */}
      <div className="card p-5 space-y-3">
        <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
          <Ticket size={16} className="text-[#1565D8]" /> Ticket Tiers
        </h2>
        {hackTiers.length === 0 ? (
          <p className="text-xs text-slate-500">This hackathon is Free (or has no paid tiers configured in Step 8 of the wizard).</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {hackTiers.map((t) => (
              <div key={t.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sm text-slate-900">{t.name}</span>
                  <span className="font-mono font-bold text-sm text-[#1565D8]">{formatMoney(t.price, t.currency)}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {t.sold ?? 0} sold {t.capacity ? `/ ${t.capacity} seats` : "(unlimited)"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Coupon + Live List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form onSubmit={createCoupon} className="lg:col-span-5 card p-5 space-y-4">
          <h2 className="font-display font-bold text-base text-slate-900">Create Promo Coupon</h2>
          <Input label="Coupon Code *" required minLength={3} placeholder="STUDENT50" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
          <div className="grid grid-cols-2 gap-3">
            <div className="form-field">
              <label className="label">Discount Type</label>
              <select className="input" value={type} onChange={(e) => setType(e.target.value as "percentage" | "fixed")}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Flat Amount (₹)</option>
              </select>
            </div>
            <Input
              label={type === "percentage" ? "Percent (1–100) *" : "Discount (₹) *"}
              type="number"
              min={1}
              max={type === "percentage" ? 100 : undefined}
              required
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Usage Limit (optional)" type="number" min={1} placeholder="50" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} />
            <Input label="Expires On (optional)" type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
          </div>
          <Button type="submit" loading={creating} disabled={!hackathonId} leftIcon={<Plus size={15} />} className="w-full">
            Create Coupon
          </Button>
        </form>

        <div className="lg:col-span-7 space-y-3">
          <h2 className="font-display font-bold text-base text-slate-900">Active &amp; Past Coupons</h2>
          {isLoading ? (
            <CardSkeleton />
          ) : hackCoupons.length === 0 ? (
            <EmptyState icon={<Tag size={22} />} title="No coupons created" description="Create discount codes for students, sponsors, or early-bird builders." />
          ) : (
            <div className="space-y-2.5">
              {hackCoupons.map((c) => (
                <div key={c.id} className="card p-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#1565D8] bg-[#EEF4FF] px-2.5 py-0.5 rounded-lg">{c.code}</span>
                      <span className="text-xs font-semibold text-slate-700">
                        {c.type === "percentage" ? `${c.value}% OFF` : `${formatMoney(c.value)} OFF`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Used {c.usedCount ?? 0} {c.usageLimit ? `/ ${c.usageLimit}` : "times"}
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => void toggleCoupon(c)}>
                    {c.isActive ? <ToggleRight size={16} className="text-emerald-600" /> : <ToggleLeft size={16} className="text-slate-400" />}
                    {c.isActive ? "Active" : "Paused"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrganizerCouponsPage() {
  return (
    <Suspense fallback={<CardSkeleton />}>
      <CouponsInner />
    </Suspense>
  );
}

