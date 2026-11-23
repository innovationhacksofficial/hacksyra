"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  Cloud,
  CloudOff,
  Loader2,
  Plus,
  ArrowLeft,
  ArrowRight,
  FileEdit,
  Eye,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/components/providers/AuthProvider";
import { useMyHackathons } from "@/lib/data/hooks";
import { EDITABLE_STATUSES, isLive } from "@/lib/domain/status";
import { Button, EmptyState, ErrorState, PageHeader, Skeleton, StatusBadge, useToast } from "@/components/ui";
import { useHackathonDraft } from "./useHackathonDraft";
import { Step1Basics, Step2Details, Step3Location, Step4Timeline } from "./Step1To4";
import { Step5TeamsReg, Step6TracksPrizes, Step7Judging, Step8Pricing, Step9ReviewPay } from "./Step5To9";

const STEPS = [
  { id: 1, title: "Basics" },
  { id: 2, title: "Details & Rules" },
  { id: 3, title: "Location" },
  { id: 4, title: "Dates & Timeline" },
  { id: 5, title: "Teams & Form" },
  { id: 6, title: "Tracks & Prizes" },
  { id: 7, title: "Judging" },
  { id: 8, title: "Pricing" },
  { id: 9, title: "Review & Pay" },
];

export function WizardShell() {
  const router = useRouter();
  const params = useSearchParams();
  const draftId = params.get("id");
  const toast = useToast();
  const { firebaseUser } = useAuth();

  const { data: myEvents, isLoading: listLoading } = useMyHackathons(draftId ? null : firebaseUser?.uid);
  const { draft, isLoading, error, saveState, liveMode, queuePatch, flush } = useHackathonDraft(draftId);

  const [step, setStep] = useState(1);
  const [creating, setCreating] = useState(false);

  // If payment_pending, open straight at Review & Pay
  useEffect(() => {
    if (draft?.status === "payment_pending") setStep(9);
  }, [draft?.status]);

  async function createNewDraft() {
    setCreating(true);
    try {
      const res = await api<{ id: string }>("/api/hackathons/draft", { method: "POST", body: {} });
      router.replace(`/organizer/create?id=${res.id}`);
    } catch (e) {
      toast.error("Couldn't create draft", e instanceof Error ? e.message : undefined);
    } finally {
      setCreating(false);
    }
  }

  function goToStep(next: number) {
    const clamped = Math.max(1, Math.min(9, next));
    if (draft) {
      const done = Array.from(new Set([...(draft.completedSteps ?? []), step])).filter((s) => s >= 1 && s <= 9);
      // For drafts, flush step progress immediately; for live hackathons, stage it until Save Live Changes.
      queuePatch({ completedSteps: done, completionPercentage: Math.round((done.length / 9) * 100) }, !liveMode);
    }
    setStep(clamped);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // No ?id → Draft Launcher / Resumer
  if (!draftId) {
    const drafts = (myEvents ?? []).filter((e) => EDITABLE_STATUSES.includes(e.status) || e.status === "pending_review");
    return (
      <div className="space-y-6">
        <PageHeader
          title="Host a Hackathon"
          description="Create your hackathon step by step with autosave, Razorpay listing verification, and real-time launch."
          actions={
            <Button onClick={createNewDraft} loading={creating} leftIcon={<Plus size={16} />} size="lg">
              Start New Hackathon
            </Button>
          }
        />

        {listLoading ? (
          <Skeleton className="h-44 rounded-2xl" />
        ) : drafts.length === 0 ? (
          <EmptyState
            icon={<FileEdit size={22} />}
            title="No drafts in progress"
            description="Start a new hackathon and we'll autosave every change so you can resume anytime from any device."
            action={
              <Button onClick={createNewDraft} loading={creating} leftIcon={<Plus size={16} />}>
                Create your first hackathon
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            <h2 className="font-display font-bold text-base text-slate-900">Resume an existing draft or submission</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {drafts.map((d) => (
                <div key={d.id} className="card p-5 flex flex-col justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge status={d.status} />
                      <span className="text-xs font-mono text-slate-400">{d.completionPercentage ?? 0}%</span>
                    </div>
                    <h3 className="font-display font-bold text-base text-slate-900 truncate">
                      {d.name || "Untitled draft"}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{d.tagline || "No tagline yet"}</p>
                  </div>
                  <Button variant="secondary" size="sm" href={`/organizer/create?id=${d.id}`} className="w-full">
                    Continue editing
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !draft) {
    return <ErrorState title="Hackathon draft not found" message={error?.message ?? "You may not have access to this draft."} />;
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header + Autosave state */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-display font-bold text-xl sm:text-2xl text-slate-900">
              {draft.name || "New Hackathon Draft"}
            </h1>
            <StatusBadge status={draft.status} />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Step {step} of {STEPS.length} — {STEPS[step - 1].title}
          </p>
        </div>

        <div className="flex items-center gap-2.5 text-xs font-semibold">
          {saveState === "saving" && (
            <span className="inline-flex items-center gap-1.5 text-slate-500">
              <Loader2 size={13} className="animate-spin" /> Saving...
            </span>
          )}
          {saveState === "dirty" && (
            <Button size="sm" onClick={() => void flush()}>
              Save Live Changes
            </Button>
          )}
          {saveState === "saved" && (
            <span className="inline-flex items-center gap-1.5 text-emerald-700">
              <Cloud size={14} /> Saved
            </span>
          )}
          {saveState === "error" && (
            <button type="button" onClick={() => void flush()} className="inline-flex items-center gap-1.5 text-amber-700 hover:underline">
              <CloudOff size={14} /> Offline — tap to retry
            </button>
          )}
          {draft.slug && draft.isListed && (
            <Button variant="secondary" size="sm" href={`/hackathons/${draft.slug}`} leftIcon={<Eye size={13} />}>
              View Live
            </Button>
          )}
        </div>
      </div>

      {isLive(draft.status) && (
        <div className="rounded-2xl border border-[#B3D1FF] bg-[#EEF4FF] px-4 py-3 text-xs text-slate-700">
          <strong>Live event edit mode:</strong> Updating minor items (FAQ, schedule, media, support channel) takes effect immediately. Changing dates, rules, prizes, or mode automatically queues a quick admin re-review.
        </div>
      )}

      {/* Mobile scrollable step pills */}
      <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
        {STEPS.map((s) => {
          const active = s.id === step;
          const done = draft.completedSteps?.includes(s.id);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => goToStep(s.id)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                active
                  ? "bg-[#1565D8] text-white border-[#1565D8]"
                  : done
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-white text-slate-600 border-slate-200"
              }`}
            >
              <span>{s.id}.</span>
              <span>{s.title}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Desktop Left Step Rail */}
        <aside className="hidden lg:block lg:col-span-3 card p-3 space-y-1 sticky top-20">
          {STEPS.map((s) => {
            const active = s.id === step;
            const done = draft.completedSteps?.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => goToStep(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors ${
                  active
                    ? "bg-[#EEF4FF] text-[#1565D8]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                    active
                      ? "bg-[#1565D8] text-white"
                      : done
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {done && !active ? <Check size={12} /> : s.id}
                </span>
                <span className="truncate">{s.title}</span>
              </button>
            );
          })}
        </aside>

        {/* Active Step Form */}
        <div className="lg:col-span-9 card p-5 sm:p-7 space-y-6">
          {step === 1 && <Step1Basics data={draft} patch={queuePatch} />}
          {step === 2 && <Step2Details data={draft} patch={queuePatch} />}
          {step === 3 && <Step3Location data={draft} patch={queuePatch} />}
          {step === 4 && <Step4Timeline data={draft} patch={queuePatch} />}
          {step === 5 && <Step5TeamsReg data={draft} patch={queuePatch} />}
          {step === 6 && <Step6TracksPrizes data={draft} patch={queuePatch} />}
          {step === 7 && <Step7Judging data={draft} patch={queuePatch} />}
          {step === 8 && <Step8Pricing data={draft} patch={queuePatch} />}
          {step === 9 && <Step9ReviewPay data={draft} flush={flush} onJumpStep={goToStep} />}

          {/* Desktop Footer Navigation */}
          <div className="hidden sm:flex items-center justify-between pt-5 border-t border-slate-100">
            <Button
              variant="secondary"
              disabled={step === 1}
              onClick={() => goToStep(step - 1)}
              leftIcon={<ArrowLeft size={15} />}
            >
              Previous
            </Button>
            {step < 9 && (
              <Button onClick={() => goToStep(step + 1)} rightIcon={<ArrowRight size={15} />}>
                Save &amp; Continue
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Navigation */}
      <div className="sm:hidden fixed bottom-[62px] inset-x-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-4 py-2.5 flex items-center gap-3 z-20">
        <Button
          variant="secondary"
          size="sm"
          disabled={step === 1}
          onClick={() => goToStep(step - 1)}
          leftIcon={<ArrowLeft size={14} />}
          className="flex-1"
        >
          Back
        </Button>
        {step < 9 ? (
          <Button size="sm" onClick={() => goToStep(step + 1)} rightIcon={<ArrowRight size={14} />} className="flex-1">
            Save &amp; Next
          </Button>
        ) : (
          <Button variant="secondary" size="sm" onClick={() => void flush()} className="flex-1">
            Save Draft
          </Button>
        )}
      </div>
    </div>
  );
}

