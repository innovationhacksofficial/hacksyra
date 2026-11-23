"use client";

import { useMemo, useState } from "react";
import { collection, orderBy, query, where } from "firebase/firestore";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3, CheckCircle2, FileCode2, IndianRupee, Users } from "lucide-react";
import { clientDb, firebaseReady } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLiveQuery } from "@/lib/data/live";
import { useMyHackathons } from "@/lib/data/hooks";
import { formatInZone, toDate } from "@/lib/domain/dates";
import { formatMoney } from "@/lib/domain/money";
import { AnimatedNumber, CardSkeleton, EmptyState, NotConfigured, PageHeader, StatCard } from "@/components/ui";
import type { Registration, Submission } from "@/types";
import type { OrderDoc } from "@/types/commerce";

export default function OrganizerAnalyticsPage() {
  const { firebaseUser, notConfigured } = useAuth();
  const uid = firebaseUser?.uid;
  const ready = Boolean(uid && firebaseReady());

  const { data: events } = useMyHackathons(uid);
  const [hackathonId, setHackathonId] = useState("all");

  const { data: regs, isLoading } = useLiveQuery<Registration>(
    ["analytics-regs", uid ?? null],
    ready ? () => query(collection(clientDb(), COLLECTIONS.REGISTRATIONS), where("organizerId", "==", uid), orderBy("createdAt", "desc")) : null
  );

  const { data: orders } = useLiveQuery<OrderDoc>(
    ["analytics-orders", uid ?? null],
    ready ? () => query(collection(clientDb(), COLLECTIONS.ORDERS), where("organizerId", "==", uid), orderBy("createdAt", "desc")) : null
  );

  const { data: subs } = useLiveQuery<Submission>(
    ["analytics-subs", uid ?? null],
    ready ? () => query(collection(clientDb(), COLLECTIONS.SUBMISSIONS), where("organizerId", "==", uid)) : null
  );

  const filteredRegs = useMemo(() => (regs ?? []).filter((r) => hackathonId === "all" || r.hackathonId === hackathonId), [regs, hackathonId]);
  const filteredSubs = useMemo(() => (subs ?? []).filter((s) => hackathonId === "all" || s.hackathonId === hackathonId), [subs, hackathonId]);
  const filteredOrders = useMemo(
    () => (orders ?? []).filter((o) => o.kind === "registration" && o.status === "paid" && (hackathonId === "all" || o.hackathonId === hackathonId)),
    [orders, hackathonId]
  );

  const checkedInCount = filteredRegs.filter((r) => r.status === "checked_in").length;
  const revenuePaise = filteredOrders.reduce((s, o) => s + (o.total ?? 0), 0);

  // Daily registration trend (last 14 days)
  const dailyTrend = useMemo(() => {
    const map = new Map<string, number>();
    filteredRegs.forEach((r) => {
      const d = toDate(r.createdAt);
      if (!d) return;
      const key = formatInZone(d, undefined, { month: "short", day: "numeric" });
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .map(([day, count]) => ({ day, count }))
      .slice(-14);
  }, [filteredRegs]);

  // Event comparison bar chart
  const eventBreakdown = useMemo(() => {
    return (events ?? []).slice(0, 8).map((e) => ({
      name: (e.name || "Untitled").slice(0, 18),
      registrations: e.registrationCount ?? 0,
      submissions: e.submissionCount ?? 0,
    }));
  }, [events]);

  if (notConfigured) return <NotConfigured service="Firestore" />;

  return (
    <div className="space-y-6 pb-8">
      <PageHeader title="Live Analytics" description="Real-time registration funnel, check-in rates, ticket revenue, and submission trends." />

      <div className="flex gap-3">
        <select className="input sm:w-80" value={hackathonId} onChange={(e) => setHackathonId(e.target.value)}>
          <option value="all">All my hackathons</option>
          {(events ?? []).map((h) => (
            <option key={h.id} value={h.id}>
              {h.name || "Untitled"}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <CardSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Registrations" value={<AnimatedNumber value={filteredRegs.length} />} icon={<Users size={18} />} tone="blue" />
            <StatCard label="Checked In" value={<AnimatedNumber value={checkedInCount} />} hint={filteredRegs.length ? `${Math.round((checkedInCount / filteredRegs.length) * 100)}% attendance` : undefined} icon={<CheckCircle2 size={18} />} tone="green" />
            <StatCard label="Submissions" value={<AnimatedNumber value={filteredSubs.filter((s) => s.status !== "withdrawn").length} />} icon={<FileCode2 size={18} />} tone="violet" />
            <StatCard label="Ticket Revenue" value={formatMoney(revenuePaise)} icon={<IndianRupee size={18} />} tone="amber" />
          </div>

          {filteredRegs.length === 0 && eventBreakdown.length === 0 ? (
            <EmptyState icon={<BarChart3 size={22} />} title="Waiting for activity" description="Charts populate live as builders register and submit projects." />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-5 space-y-3">
                <h2 className="font-display font-bold text-base text-slate-900">Registrations Over Time</h2>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyTrend.length ? dailyTrend : [{ day: "Today", count: 0 }]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748B" }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748B" }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="count" stroke="#1565D8" fill="#DCEAFF" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card p-5 space-y-3">
                <h2 className="font-display font-bold text-base text-slate-900">Registrations vs Submissions by Event</h2>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={eventBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748B" }} />
                      <Tooltip />
                      <Bar dataKey="registrations" fill="#1565D8" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="submissions" fill="#10B981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
