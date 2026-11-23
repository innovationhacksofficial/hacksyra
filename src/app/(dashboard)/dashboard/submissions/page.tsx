"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { collection, orderBy, query, where } from "firebase/firestore";
import { CheckCircle2, FileCode2, Send, Trophy, Undo2 } from "lucide-react";
import { clientDb, firebaseReady } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLiveQuery } from "@/lib/data/live";
import { useHackathon } from "@/lib/data/hooks";
import { api } from "@/lib/api-client";
import { formatInZone, toDate } from "@/lib/domain/dates";
import { isSubmissionOpenAt } from "@/lib/domain/status";
import {
  Button,
  CardSkeleton,
  ConfirmDialog,
  Countdown,
  EmptyState,
  NotConfigured,
  PageHeader,
  StatusBadge,
  useToast,
} from "@/components/ui";
import type { Project, Registration, SubmissionWithMeta } from "@/types";

function SubmissionsInner() {
  const { firebaseUser, notConfigured } = useAuth();
  const params = useSearchParams();
  const toast = useToast();
  const uid = firebaseUser?.uid;
  const ready = Boolean(uid && firebaseReady());

  const [selectedHackId, setSelectedHackId] = useState(params.get("hackathonId") ?? "");
  const [selectedProjectId, setSelectedProjectId] = useState(params.get("projectId") ?? "");
  const [trackIds, setTrackIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [withdrawTarget, setWithdrawTarget] = useState<SubmissionWithMeta | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);

  const { data: regs } = useLiveQuery<Registration>(
    ["sub-regs", uid ?? null],
    ready ? () => query(collection(clientDb(), COLLECTIONS.REGISTRATIONS), where("userId", "==", uid), orderBy("createdAt", "desc")) : null
  );

  const { data: projects } = useLiveQuery<Project>(
    ["sub-projects", uid ?? null],
    ready ? () => query(collection(clientDb(), COLLECTIONS.PROJECTS), where("memberIds", "array-contains", uid), orderBy("updatedAt", "desc")) : null
  );

  const { data: submissions, isLoading } = useLiveQuery<SubmissionWithMeta>(
    ["my-submissions", uid ?? null],
    ready ? () => query(collection(clientDb(), COLLECTIONS.SUBMISSIONS), where("memberIds", "array-contains", uid), orderBy("updatedAt", "desc")) : null
  );

  const confirmedRegs = (regs ?? []).filter((r) => ["confirmed", "checked_in"].includes(r.status));
  const { data: chosenHackathon } = useHackathon(selectedHackId || null);

  useEffect(() => {
    if (!selectedHackId && confirmedRegs.length > 0) setSelectedHackId(confirmedRegs[0].hackathonId);
  }, [confirmedRegs, selectedHackId]);

  useEffect(() => {
    if (!selectedProjectId && projects && projects.length > 0) setSelectedProjectId(projects[0].id);
  }, [projects, selectedProjectId]);

  useEffect(() => {
    const tracks = chosenHackathon?.tracks ?? [];
    if (tracks.length > 0) {
      setTrackIds((prev) => (prev.length > 0 ? prev : [tracks[0].id]));
    } else if (chosenHackathon) {
      setTrackIds(["general"]);
    }
  }, [chosenHackathon]);

  function toggleTrack(tid: string) {
    if (!chosenHackathon?.allowMultipleTracks) {
      setTrackIds([tid]);
      return;
    }
    setTrackIds((prev) => (prev.includes(tid) ? (prev.length > 1 ? prev.filter((x) => x !== tid) : prev) : [...prev, tid]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedHackId || !selectedProjectId) {
      toast.error("Choose a hackathon and a project");
      return;
    }
    const chosenTracks = trackIds.length > 0 ? trackIds : ["general"];
    setSubmitting(true);
    try {
      await api("/api/submissions/submit", {
        method: "POST",
        body: { hackathonId: selectedHackId, projectId: selectedProjectId, trackIds: chosenTracks },
      });
      toast.success("Project submitted!", "An immutable submission snapshot has been recorded.");
    } catch (err) {
      toast.error("Submission failed", err instanceof Error ? err.message : undefined);
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmWithdraw() {
    if (!withdrawTarget) return;
    setWithdrawing(true);
    try {
      await api(`/api/submissions/${withdrawTarget.id}/withdraw`, { method: "POST", body: {} });
      toast.success("Submission withdrawn");
      setWithdrawTarget(null);
    } catch (err) {
      toast.error("Couldn't withdraw", err instanceof Error ? err.message : undefined);
    } finally {
      setWithdrawing(false);
    }
  }

  if (notConfigured) return <NotConfigured service="Firestore" />;

  const deadlineOpen = chosenHackathon ? isSubmissionOpenAt(chosenHackathon) : true;

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Project Submissions"
        description="Submit your project to a registered hackathon with track selection, immutable snapshots, and live judging results."
        actions={
          <Button variant="secondary" href="/dashboard/projects">
            Manage Projects
          </Button>
        }
      />

      {/* Submit Form */}
      <form onSubmit={handleSubmit} className="card p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="font-display font-bold text-lg text-slate-900">Submit / Update Entry</h2>
          {chosenHackathon?.submissionCloseDate && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Deadline:</span>
              <Countdown target={chosenHackathon.submissionCloseDate} />
            </div>
          )}
        </div>

        {confirmedRegs.length === 0 ? (
          <EmptyState
            title="No confirmed hackathon registrations"
            description="Register for an active hackathon before submitting a project."
            action={<Button href="/hackathons">Explore Hackathons</Button>}
          />
        ) : !projects || projects.length === 0 ? (
          <EmptyState
            title="Create a project first"
            description="Build your project story and attach your repo/demo URL before submitting."
            action={<Button href="/dashboard/projects">Create Project</Button>}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-field">
                <label className="label">Registered Hackathon *</label>
                <select className="input" value={selectedHackId} onChange={(e) => { setSelectedHackId(e.target.value); setTrackIds([]); }}>
                  {confirmedRegs.map((r) => (
                    <option key={r.id} value={r.hackathonId}>
                      {r.hackathonName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label className="label">Project *</label>
                <select className="input" value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title || "Untitled"} ({p.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {chosenHackathon && (chosenHackathon.tracks ?? []).length > 0 && (
              <div className="space-y-2">
                <label className="label">
                  Select Track{chosenHackathon.allowMultipleTracks ? "s" : ""} *
                </label>
                <div className="flex flex-wrap gap-2">
                  {(chosenHackathon.tracks ?? []).map((tr) => {
                    const active = trackIds.includes(tr.id);
                    return (
                      <button
                        key={tr.id}
                        type="button"
                        onClick={() => toggleTrack(tr.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors min-h-[40px] ${
                          active ? "bg-[#1565D8] text-white border-[#1565D8]" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {tr.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {!deadlineOpen && (
              <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
                The submission window for this hackathon is currently closed.
              </p>
            )}

            <div className="flex justify-end">
              <Button type="submit" loading={submitting} disabled={!deadlineOpen} leftIcon={<Send size={15} />}>
                Submit Entry
              </Button>
            </div>
          </>
        )}
      </form>

      {/* Submitted Entries */}
      <div className="space-y-3">
        <h2 className="font-display font-bold text-lg text-slate-900">Your Submissions</h2>
        {isLoading ? (
          <CardSkeleton />
        ) : !submissions || submissions.length === 0 ? (
          <EmptyState icon={<FileCode2 size={22} />} title="No submissions yet" description="Once you submit a project above, your locked snapshots and scores appear here." />
        ) : (
          <div className="space-y-3">
            {submissions.map((s) => (
              <div key={s.id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-bold text-base text-slate-900">{s.projectTitle}</h3>
                    <StatusBadge status={s.status} />
                    {s.status === "winner" && (
                      <span className="badge-amber">
                        <Trophy size={12} /> {s.rank ? `Rank #${s.rank}` : "Winner"}
                      </span>
                    )}
                    {typeof s.finalScore === "number" && (
                      <span className="badge-blue">
                        <CheckCircle2 size={12} /> Score: {s.finalScore.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    <Link href={`/hackathons/${s.hackathonSlug || s.hackathonId}`} className="font-semibold text-[#1565D8] hover:underline">
                      {s.hackathonName || s.hackathonId}
                    </Link>{" "}
                    · {s.teamName ? `Team ${s.teamName}` : "Solo entry"} · Submitted {formatInZone(toDate(s.submittedAt ?? s.updatedAt))}
                  </p>
                </div>

                {s.status !== "withdrawn" && (
                  <Button variant="secondary" size="sm" onClick={() => setWithdrawTarget(s)} leftIcon={<Undo2 size={14} />}>
                    Withdraw
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!withdrawTarget}
        onClose={() => setWithdrawTarget(null)}
        onConfirm={confirmWithdraw}
        loading={withdrawing}
        danger
        title={`Withdraw "${withdrawTarget?.projectTitle}"?`}
        message="You can re-submit before the deadline closes, as long as submissions remain open."
        confirmLabel="Withdraw Submission"
      />
    </div>
  );
}

export default function SubmissionsPage() {
  return (
    <Suspense fallback={<CardSkeleton />}>
      <SubmissionsInner />
    </Suspense>
  );
}
