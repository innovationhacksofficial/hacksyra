"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, query, where } from "firebase/firestore";
import { CheckCircle2, ExternalLink, Gavel, Github, Save, Send, ShieldAlert, Video } from "lucide-react";
import { clientDb, firebaseReady } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLiveQuery } from "@/lib/data/live";
import { api } from "@/lib/api-client";
import { weightedScore } from "@/lib/domain/rubric";
import { Markdown } from "@/components/common/Markdown";
import { Button, CardSkeleton, EmptyState, NotConfigured, PageHeader, StatusBadge, Textarea, useToast } from "@/components/ui";
import type { Hackathon, SubmissionWithMeta } from "@/types";

type JudgeSubmission = SubmissionWithMeta & {
  snapshot?: {
    title?: string;
    tagline?: string;
    description?: string;
    howItWorks?: string;
    challenges?: string;
    technologies?: string[];
    repositoryUrl?: string;
    liveUrl?: string;
    demoVideoUrl?: string;
  };
};

type AssignedHackathon = Hackathon & { submissions: JudgeSubmission[] };

type EvaluationDoc = {
  id: string;
  submissionId: string;
  scores: { criterionId: string; score: number }[];
  totalScore: number;
  comments?: string;
  hasConflict?: boolean;
  isDraft?: boolean;
};

export default function JudgePortalPage() {
  const { firebaseUser, notConfigured } = useAuth();
  const toast = useToast();
  const uid = firebaseUser?.uid;

  const [hackathons, setHackathons] = useState<AssignedHackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHackId, setSelectedHackId] = useState("");
  const [selectedSubId, setSelectedSubId] = useState("");

  const [scoresMap, setScoresMap] = useState<Record<string, number>>({});
  const [comments, setComments] = useState("");
  const [hasConflict, setHasConflict] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ hackathons: AssignedHackathon[] }>("/api/judge/assignments");
      setHackathons(res.hackathons ?? []);
      if (res.hackathons?.length) {
        setSelectedHackId((prev) => prev || res.hackathons[0].id);
        if (res.hackathons[0].submissions?.length) {
          setSelectedSubId((prev) => prev || res.hackathons[0].submissions[0].id);
        }
      }
    } catch (e) {
      toast.error("Couldn't load judging assignments", e instanceof Error ? e.message : undefined);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (uid) void loadAssignments();
  }, [uid, loadAssignments]);

  const { data: myEvals } = useLiveQuery<EvaluationDoc>(
    ["judge-my-evals", uid ?? null],
    uid && firebaseReady() ? () => query(collection(clientDb(), COLLECTIONS.EVALUATIONS), where("judgeId", "==", uid)) : null
  );

  const activeHackathon = hackathons.find((h) => h.id === selectedHackId) ?? hackathons[0] ?? null;
  const activeSub = activeHackathon?.submissions.find((s) => s.id === selectedSubId) ?? activeHackathon?.submissions[0] ?? null;
  const criteria = useMemo(() => activeHackathon?.judgingCriteria ?? [], [activeHackathon]);

  const evalBySub = useMemo(() => {
    const m = new Map<string, EvaluationDoc>();
    (myEvals ?? []).forEach((e) => m.set(e.submissionId, e));
    return m;
  }, [myEvals]);

  useEffect(() => {
    if (!activeSub || !criteria.length) return;
    const existing = evalBySub.get(activeSub.id);
    const next: Record<string, number> = {};
    criteria.forEach((c) => {
      const found = existing?.scores?.find((x) => x.criterionId === c.id);
      next[c.id] = found ? found.score : Math.ceil(c.maxScore / 2);
    });
    setScoresMap(next);
    setComments(existing?.comments ?? "");
    setHasConflict(Boolean(existing?.hasConflict));
  }, [activeSub, criteria, evalBySub]);

  const liveWeightedTotal = useMemo(() => {
    if (hasConflict) return 0;
    return weightedScore(
      criteria,
      criteria.map((c) => ({ criterionId: c.id, score: scoresMap[c.id] ?? 0 }))
    );
  }, [criteria, scoresMap, hasConflict]);

  async function saveEvaluation(submit: boolean) {
    if (!activeHackathon || !activeSub) return;
    setSaving(true);
    try {
      await api("/api/judge/evaluate", {
        method: "POST",
        body: {
          hackathonId: activeHackathon.id,
          submissionId: activeSub.id,
          scores: criteria.map((c) => ({ criterionId: c.id, score: scoresMap[c.id] ?? 0 })),
          comments: comments.trim() || undefined,
          hasConflict,
          submit,
        },
      });
      toast.success(submit ? "Evaluation submitted!" : "Draft saved");
    } catch (e) {
      toast.error("Couldn't save evaluation", e instanceof Error ? e.message : undefined);
    } finally {
      setSaving(false);
    }
  }

  if (notConfigured) return <NotConfigured service="Firestore" />;

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Judge Portal"
        description="Evaluate submitted projects with weighted rubrics, conflict-of-interest declarations, and live scoring."
      />

      {loading ? (
        <CardSkeleton />
      ) : hackathons.length === 0 ? (
        <EmptyState
          icon={<Gavel size={22} />}
          title="No judging assignments yet"
          description="When an organizer invites your email as a judge (or for hackathons you organize), your queue appears here."
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <select
              className="input sm:w-80"
              value={activeHackathon?.id ?? ""}
              onChange={(e) => {
                const nextId = e.target.value;
                setSelectedHackId(nextId);
                const nextH = hackathons.find((h) => h.id === nextId);
                setSelectedSubId(nextH?.submissions?.[0]?.id ?? "");
              }}
            >
              {hackathons.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.submissions.length} submissions)
                </option>
              ))}
            </select>
            {activeHackathon?.isBlindJudging && <span className="badge-violet">Blind Judging Mode</span>}
          </div>

          {!activeHackathon?.submissions.length ? (
            <EmptyState title="No submissions in this hackathon yet" description="Come back once participants submit their projects." />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Queue */}
              <div className="lg:col-span-4 card p-3 space-y-1.5">
                <p className="px-2.5 pt-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Submissions Queue</p>
                {activeHackathon.submissions.map((s) => {
                  const ev = evalBySub.get(s.id);
                  const active = activeSub?.id === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedSubId(s.id)}
                      className={`w-full text-left px-3.5 py-3 rounded-xl transition-colors ${
                        active ? "bg-[#EEF4FF] text-[#1565D8]" : "hover:bg-slate-50 text-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm truncate">{s.projectTitle}</span>
                        {ev ? (
                          ev.isDraft ? (
                            <StatusBadge status="draft" />
                          ) : (
                            <span className="badge-green text-[11px]">
                              <CheckCircle2 size={11} /> {ev.totalScore.toFixed(1)}
                            </span>
                          )
                        ) : (
                          <span className="badge-gray text-[11px]">Pending</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{s.teamName || "Solo entry"}</p>
                    </button>
                  );
                })}
              </div>

              {/* Right Review & Rubric Panel */}
              {activeSub && (
                <div className="lg:col-span-8 space-y-5">
                  <div className="card p-5 sm:p-6 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="font-display font-bold text-xl text-slate-900">{activeSub.projectTitle}</h2>
                        <p className="text-xs text-slate-500">{activeSub.teamName || "Solo entry"}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {activeSub.snapshot?.liveUrl && (
                          <a href={activeSub.snapshot.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-primary btn-sm">
                            <ExternalLink size={13} /> Demo
                          </a>
                        )}
                        {activeSub.snapshot?.repositoryUrl && (
                          <a href={activeSub.snapshot.repositoryUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm">
                            <Github size={13} /> Source
                          </a>
                        )}
                        {activeSub.snapshot?.demoVideoUrl && (
                          <a href={activeSub.snapshot.demoVideoUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm">
                            <Video size={13} /> Video
                          </a>
                        )}
                      </div>
                    </div>

                    {activeSub.snapshot?.tagline && <p className="text-sm font-medium text-slate-700">{activeSub.snapshot.tagline}</p>}
                    {activeSub.snapshot?.description && <Markdown content={activeSub.snapshot.description} />}
                    {activeSub.snapshot?.howItWorks && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">How It Works</p>
                        <Markdown content={activeSub.snapshot.howItWorks} />
                      </div>
                    )}
                  </div>

                  {/* Rubric Card */}
                  <div className="card p-5 sm:p-6 space-y-5">
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="font-display font-bold text-base text-slate-900">Rubric Evaluation</h3>
                        <p className="text-xs text-slate-500">Slide or type scores for each weighted criterion.</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-bold uppercase text-slate-400 block">Weighted Total</span>
                        <span className="font-display font-bold text-2xl text-[#1565D8] tabular-nums">{liveWeightedTotal.toFixed(1)} / 100</span>
                      </div>
                    </div>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-900 cursor-pointer">
                      <input type="checkbox" checked={hasConflict} onChange={(e) => setHasConflict(e.target.checked)} className="rounded border-amber-400" />
                      <ShieldAlert size={16} className="shrink-0" />
                      <span>Declare Conflict of Interest (my score will be excluded from final average)</span>
                    </label>

                    {!hasConflict && (
                      <div className="space-y-4">
                        {criteria.map((c) => {
                          const val = scoresMap[c.id] ?? 0;
                          return (
                            <div key={c.id} className="space-y-1.5">
                              <div className="flex items-center justify-between gap-2 text-sm">
                                <div>
                                  <span className="font-semibold text-slate-900">{c.name}</span>
                                  <span className="text-xs text-slate-500 ml-2">({c.weight}% weight)</span>
                                </div>
                                <span className="font-mono font-bold text-[#1565D8]">
                                  {val} / {c.maxScore}
                                </span>
                              </div>
                              {c.description && <p className="text-xs text-slate-500">{c.description}</p>}
                              <input
                                type="range"
                                min={0}
                                max={c.maxScore}
                                step={1}
                                value={val}
                                onChange={(e) => setScoresMap((prev) => ({ ...prev, [c.id]: Number(e.target.value) }))}
                                className="w-full accent-[#1565D8]"
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <Textarea
                      label="Feedback for Team / Judges Notes"
                      rows={3}
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Strengths, technical depth, and suggestions..."
                    />

                    <div className="flex flex-wrap justify-end gap-2.5">
                      <Button variant="secondary" loading={saving} onClick={() => void saveEvaluation(false)} leftIcon={<Save size={15} />}>
                        Save Draft
                      </Button>
                      <Button loading={saving} onClick={() => void saveEvaluation(true)} leftIcon={<Send size={15} />}>
                        Submit Final Score
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
