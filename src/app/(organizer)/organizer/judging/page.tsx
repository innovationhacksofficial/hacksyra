"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { collection, orderBy, query, where } from "firebase/firestore";
import { ExternalLink, Gavel, Plus, Trash2, Trophy, UserCheck } from "lucide-react";
import { clientDb, firebaseReady } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLiveQuery } from "@/lib/data/live";
import { useMyHackathons } from "@/lib/data/hooks";
import { api } from "@/lib/api-client";
import {
  Button,
  CardSkeleton,
  EmptyState,
  Input,
  NotConfigured,
  PageHeader,
  StatusBadge,
  Tabs,
  useToast,
} from "@/components/ui";
import type { SubmissionWithMeta } from "@/types";

type WinnerSelection = { submissionId: string; prizeName: string; prizeId?: string; rank: number };

function JudgingInner() {
  const { firebaseUser, notConfigured } = useAuth();
  const params = useSearchParams();
  const toast = useToast();
  const uid = firebaseUser?.uid;

  const { data: events } = useMyHackathons(uid);
  const [hackathonId, setHackathonId] = useState(params.get("hackathonId") ?? "");
  const [tab, setTab] = useState("judges");

  const [judgeEmail, setJudgeEmail] = useState("");
  const [judgeName, setJudgeName] = useState("");
  const [addingJudge, setAddingJudge] = useState(false);

  const [picks, setPicks] = useState<WinnerSelection[]>([]);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (!hackathonId && events && events.length > 0) setHackathonId(events[0].id);
  }, [events, hackathonId]);

  const activeHackathon = (events ?? []).find((e) => e.id === hackathonId);

  const { data: submissions, isLoading: subsLoading } = useLiveQuery<SubmissionWithMeta>(
    ["org-judging-subs", hackathonId || null],
    hackathonId && firebaseReady()
      ? () => query(collection(clientDb(), COLLECTIONS.SUBMISSIONS), where("hackathonId", "==", hackathonId), orderBy("createdAt", "desc"))
      : null
  );

  const validSubs = (submissions ?? [])
    .filter((s) => s.status !== "withdrawn" && s.status !== "draft")
    .sort((a, b) => (b.finalScore ?? -1) - (a.finalScore ?? -1));

  async function addJudge(e: React.FormEvent) {
    e.preventDefault();
    if (!hackathonId || !judgeEmail.trim()) return;
    setAddingJudge(true);
    try {
      await api(`/api/organizer/hackathons/${hackathonId}/judges`, {
        method: "POST",
        body: { email: judgeEmail.trim(), name: judgeName.trim() || undefined, action: "add" },
      });
      toast.success("Judge invited & assigned");
      setJudgeEmail("");
      setJudgeName("");
    } catch (err) {
      toast.error("Couldn't invite judge", err instanceof Error ? err.message : undefined);
    } finally {
      setAddingJudge(false);
    }
  }

  async function removeJudge(email: string) {
    if (!hackathonId) return;
    try {
      await api(`/api/organizer/hackathons/${hackathonId}/judges`, {
        method: "POST",
        body: { email, action: "remove" },
      });
      toast.info("Judge removed");
    } catch (err) {
      toast.error("Couldn't remove judge", err instanceof Error ? err.message : undefined);
    }
  }

  function toggleWinnerPick(sub: SubmissionWithMeta) {
    setPicks((prev) => {
      if (prev.some((p) => p.submissionId === sub.id)) return prev.filter((p) => p.submissionId !== sub.id);
      const nextRank = prev.length + 1;
      const defaultPrize = activeHackathon?.prizes?.[nextRank - 1]?.name || `Winner #${nextRank}`;
      return [
        ...prev,
        { submissionId: sub.id, prizeName: defaultPrize, prizeId: activeHackathon?.prizes?.[nextRank - 1]?.id, rank: nextRank },
      ];
    });
  }

  async function publishWinners() {
    if (!hackathonId || picks.length === 0) {
      toast.error("Select at least one winning submission");
      return;
    }
    setPublishing(true);
    try {
      await api(`/api/organizer/hackathons/${hackathonId}/winners`, { method: "POST", body: { winners: picks } });
      toast.success("Winners published & participants notified!");
    } catch (err) {
      toast.error("Couldn't publish winners", err instanceof Error ? err.message : undefined);
    } finally {
      setPublishing(false);
    }
  }

  if (notConfigured) return <NotConfigured service="Firestore" />;

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Judging & Winners"
        description="Invite judges, review weighted rubric scores in real time, and publish official winners."
        actions={
          <Link href="/judge" className="btn-secondary btn-sm">
            <ExternalLink size={14} /> Open Judge Portal
          </Link>
        }
      />

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <select className="input sm:w-80" value={hackathonId} onChange={(e) => { setHackathonId(e.target.value); setPicks([]); }}>
          {(events ?? []).map((h) => (
            <option key={h.id} value={h.id}>
              {h.name || "Untitled"}
            </option>
          ))}
        </select>
        {activeHackathon?.resultsPublished && <span className="badge-amber"><Trophy size={12} /> Results Published</span>}
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { id: "judges", label: "Judges Panel", badge: activeHackathon?.judgeInvites?.length ?? 0 },
          { id: "scores", label: "Rankings & Publish Winners", badge: validSubs.length },
        ]}
      />

      {tab === "judges" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <form onSubmit={addJudge} className="lg:col-span-5 card p-5 space-y-4">
            <h2 className="font-display font-bold text-base text-slate-900">Invite a Judge</h2>
            <Input label="Judge Email *" type="email" required value={judgeEmail} onChange={(e) => setJudgeEmail(e.target.value)} placeholder="judge@company.com" />
            <Input label="Full Name (optional)" value={judgeName} onChange={(e) => setJudgeName(e.target.value)} placeholder="Dr. Maya Rao" />
            <Button type="submit" loading={addingJudge} leftIcon={<Plus size={15} />} className="w-full">
              Invite &amp; Assign Judge
            </Button>
          </form>

          <div className="lg:col-span-7 card p-5 space-y-3">
            <h2 className="font-display font-bold text-base text-slate-900">Assigned Judges</h2>
            {!activeHackathon?.judgeInvites || activeHackathon.judgeInvites.length === 0 ? (
              <EmptyState icon={<UserCheck size={20} />} title="No judges invited yet" description="Add judges on the left; you can also score entries directly from the Judge Portal." />
            ) : (
              <div className="space-y-2.5">
                {activeHackathon.judgeInvites.map((j) => (
                  <div key={j.email} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <p className="font-semibold text-sm text-slate-900">{j.name || j.email}</p>
                      <p className="text-xs text-slate-500">{j.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={j.status} />
                      <Button variant="ghost" size="sm" onClick={() => void removeJudge(j.email)} className="text-red-600">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : subsLoading ? (
        <CardSkeleton />
      ) : validSubs.length === 0 ? (
        <EmptyState icon={<Gavel size={22} />} title="No submissions to rank yet" description="Once participants submit projects, scores and rankings appear here live." />
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {validSubs.map((s) => {
              const chosen = picks.find((p) => p.submissionId === s.id);
              return (
                <div key={s.id} className={`card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${chosen ? "border-2 border-[#1565D8]" : ""}`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-bold text-base text-slate-900">{s.projectTitle}</span>
                      <StatusBadge status={s.status} />
                      {typeof s.finalScore === "number" && <span className="badge-blue">Score: {s.finalScore.toFixed(1)}</span>}
                    </div>
                    <p className="text-xs text-slate-500">{s.teamName || "Solo entry"}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {chosen && (
                      <>
                        <Input
                          value={chosen.prizeName}
                          onChange={(e) => setPicks((prev) => prev.map((p) => (p.submissionId === s.id ? { ...p, prizeName: e.target.value } : p)))}
                          placeholder="Prize label"
                          className="!py-1.5 !text-xs w-40"
                        />
                        <Input
                          type="number"
                          min={1}
                          value={chosen.rank}
                          onChange={(e) => setPicks((prev) => prev.map((p) => (p.submissionId === s.id ? { ...p, rank: Number(e.target.value) || 1 } : p)))}
                          className="!py-1.5 !text-xs w-16"
                        />
                      </>
                    )}
                    <Button variant={chosen ? "primary" : "secondary"} size="sm" onClick={() => toggleWinnerPick(s)} leftIcon={<Trophy size={14} />}>
                      {chosen ? "Selected Winner ✓" : "Select as Winner"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <Button size="lg" loading={publishing} disabled={picks.length === 0} onClick={() => void publishWinners()} leftIcon={<Trophy size={16} />}>
              Publish {picks.length} Winner{picks.length === 1 ? "" : "s"} &amp; Notify All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrganizerJudgingPage() {
  return (
    <Suspense fallback={<CardSkeleton />}>
      <JudgingInner />
    </Suspense>
  );
}
