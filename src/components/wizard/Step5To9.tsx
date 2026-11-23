"use client";

import { useState } from "react";
import { Plus, Trash2, CheckCircle2, AlertCircle, ArrowUp, ArrowDown, Trophy, Sparkles } from "lucide-react";
import { nanoid } from "nanoid";
import { validateAllWizardSteps } from "@/lib/domain/hackathon-schema";
import { rubricTotal } from "@/lib/domain/rubric";
import { formatMajor, formatMoney } from "@/lib/domain/money";
import { DEFAULT_LISTING_FEE_PAISE, usePlatformSettings } from "@/lib/data/hooks";
import { api, ApiClientError } from "@/lib/api-client";
import { Button, Input, Select, StatusBadge } from "@/components/ui";
import { ListingFeePayment } from "@/components/payments/ListingFeePayment";
import { ImageUploader } from "./WizardShared";
import type {
  EmbeddedPrize,
  EmbeddedSponsor,
  EmbeddedTrack,
  Hackathon,
  HackathonPricingDraft,
  JudgeInvite,
  JudgingCriterion,
  RegistrationQuestion,
  TicketTierType,
} from "@/types";
import type { WithId } from "@/lib/data/live";

type StepProps = {
  data: WithId<Hackathon>;
  patch: (p: Partial<Hackathon> & Record<string, unknown>, immediate?: boolean) => void;
};

export function Step5TeamsReg({ data, patch }: StepProps) {
  const questions: RegistrationQuestion[] = data.registrationQuestions ?? [];

  function moveQ(idx: number, dir: -1 | 1) {
    const next = [...questions];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    patch({ registrationQuestions: next });
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Min Team Size"
          type="number"
          min={1}
          max={20}
          value={data.minTeamSize ?? 1}
          onChange={(e) => patch({ minTeamSize: Number(e.target.value) || 1 })}
        />
        <Input
          label="Max Team Size"
          type="number"
          min={1}
          max={20}
          value={data.maxTeamSize ?? 4}
          onChange={(e) => patch({ maxTeamSize: Number(e.target.value) || 4 })}
        />
        <Input
          label="Participant Capacity (optional)"
          type="number"
          min={1}
          placeholder="Unlimited"
          value={data.registrationCapacity ?? ""}
          onChange={(e) => patch({ registrationCapacity: e.target.value ? Number(e.target.value) : undefined })}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Registration Mode"
          value={data.registrationMode || "open"}
          onChange={(e) => patch({ registrationMode: e.target.value as Hackathon["registrationMode"] })}
        >
          <option value="open">Open instant registration</option>
          <option value="application">Application (requires organizer approval)</option>
          <option value="invite_only">Invite code required</option>
        </Select>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-center gap-2">
          <label className="flex items-center gap-2.5 text-sm font-medium text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={data.allowSolo !== false}
              onChange={(e) => patch({ allowSolo: e.target.checked, allowsIndividuals: e.target.checked })}
              className="w-4 h-4 rounded accent-[#1565D8]"
            />
            Allow solo participants
          </label>
          <label className="flex items-center gap-2.5 text-sm font-medium text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(data.hasWaitlist)}
              onChange={(e) => patch({ hasWaitlist: e.target.checked })}
              className="w-4 h-4 rounded accent-[#1565D8]"
            />
            Enable waitlist when full
          </label>
        </div>
      </div>

      {/* Custom Registration Questions */}
      <div className="pt-4 border-t border-slate-200 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900">Custom Registration Form</h3>
            <p className="text-xs text-slate-500">Ask for GitHub handles, resumes (PDF), dietary notes, or pitch links.</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() =>
              patch({
                registrationQuestions: [
                  ...questions,
                  { id: nanoid(6), label: "", type: "text", required: false },
                ],
              })
            }
          >
            Add question
          </Button>
        </div>

        {questions.map((q, idx) => (
          <div key={q.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Question #{idx + 1}</span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => moveQ(idx, -1)} disabled={idx === 0} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30">
                  <ArrowUp size={14} />
                </button>
                <button type="button" onClick={() => moveQ(idx, 1)} disabled={idx === questions.length - 1} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30">
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => patch({ registrationQuestions: questions.filter((x) => x.id !== q.id) })}
                  className="p-1 text-red-500 hover:text-red-700"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <Input
                  label="Question Prompt"
                  placeholder="e.g. GitHub profile URL or College Name"
                  value={q.label}
                  onChange={(e) =>
                    patch({
                      registrationQuestions: questions.map((x) => (x.id === q.id ? { ...x, label: e.target.value } : x)),
                    })
                  }
                />
              </div>
              <Select
                label="Answer Type"
                value={q.type}
                onChange={(e) =>
                  patch({
                    registrationQuestions: questions.map((x) =>
                      x.id === q.id ? { ...x, type: e.target.value as RegistrationQuestion["type"] } : x
                    ),
                  })
                }
              >
                <option value="text">Short text</option>
                <option value="textarea">Long text</option>
                <option value="select">Dropdown select</option>
                <option value="url">URL</option>
                <option value="file">File upload (PDF/Image)</option>
              </Select>
            </div>

            {q.type === "select" && (
              <Input
                label="Dropdown Options (comma-separated)"
                placeholder="S, M, L, XL"
                value={(q.options ?? []).join(", ")}
                onChange={(e) =>
                  patch({
                    registrationQuestions: questions.map((x) =>
                      x.id === q.id
                        ? { ...x, options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }
                        : x
                    ),
                  })
                }
              />
            )}

            <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={q.required}
                onChange={(e) =>
                  patch({
                    registrationQuestions: questions.map((x) => (x.id === q.id ? { ...x, required: e.target.checked } : x)),
                  })
                }
                className="w-4 h-4 rounded accent-[#1565D8]"
              />
              Required question
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Step6TracksPrizes({ data, patch }: StepProps) {
  const tracks: EmbeddedTrack[] = data.tracks ?? [];
  const prizes: EmbeddedPrize[] = data.prizes ?? [];
  const sponsors: EmbeddedSponsor[] = data.sponsors ?? [];

  function syncPrizes(nextPrizes: EmbeddedPrize[]) {
    const totalPrizeInPaise = nextPrizes.reduce(
      (sum, p) => sum + (p.type === "cash" && p.cashAmount ? Math.round(p.cashAmount * (p.winnersCount || 1) * 100) : 0),
      0
    );
    patch({ prizes: nextPrizes, totalPrizeInPaise });
  }

  return (
    <div className="space-y-6">
      {/* Tracks */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900">Tracks *</h3>
            <p className="text-xs text-slate-500">Problem tracks builders submit into (at least 1 required).</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => patch({ tracks: [...tracks, { id: nanoid(6), name: "", description: "" }] })}
          >
            Add track
          </Button>
        </div>

        {tracks.map((t, idx) => (
          <div key={t.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Track #{idx + 1}</span>
              <button
                type="button"
                onClick={() => patch({ tracks: tracks.filter((x) => x.id !== t.id) })}
                className="text-xs text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Track Name"
                placeholder="e.g. Generative AI Agents"
                value={t.name}
                onChange={(e) => patch({ tracks: tracks.map((x) => (x.id === t.id ? { ...x, name: e.target.value } : x)) })}
              />
              <Input
                label="Sponsor (optional)"
                placeholder="e.g. AWS"
                value={t.sponsorName || ""}
                onChange={(e) =>
                  patch({ tracks: tracks.map((x) => (x.id === t.id ? { ...x, sponsorName: e.target.value } : x)) })
                }
              />
            </div>
            <Input
              label="Description"
              placeholder="What makes a winning project in this track?"
              value={t.description}
              onChange={(e) =>
                patch({ tracks: tracks.map((x) => (x.id === t.id ? { ...x, description: e.target.value } : x)) })
              }
            />
          </div>
        ))}
      </div>

      {/* Prizes */}
      <div className="pt-4 border-t border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900">Prizes *</h3>
            <p className="text-xs text-slate-500">
              Total cash pool: <strong className="text-[#1565D8]">{formatMajor((data.totalPrizeInPaise ?? 0) / 100)}</strong>
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Trophy size={14} />}
            onClick={() =>
              syncPrizes([
                ...prizes,
                { id: nanoid(6), name: "", type: "cash", cashAmount: 0, currency: "INR", winnersCount: 1 },
              ])
            }
          >
            Add prize
          </Button>
        </div>

        {prizes.map((p, idx) => (
          <div key={p.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Prize #{idx + 1}</span>
              <button
                type="button"
                onClick={() => syncPrizes(prizes.filter((x) => x.id !== p.id))}
                className="text-xs text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <Input
                  label="Prize Title"
                  placeholder="e.g. 1st Place Grand Winner"
                  value={p.name}
                  onChange={(e) => syncPrizes(prizes.map((x) => (x.id === p.id ? { ...x, name: e.target.value } : x)))}
                />
              </div>
              <Select
                label="Kind"
                value={p.type}
                onChange={(e) =>
                  syncPrizes(
                    prizes.map((x) =>
                      x.id === p.id ? { ...x, type: e.target.value as "cash" | "non_cash" } : x
                    )
                  )
                }
              >
                <option value="cash">Cash (₹)</option>
                <option value="non_cash">Credits / Swag / Non-cash</option>
              </Select>
              {p.type === "cash" ? (
                <Input
                  label="Amount (₹)"
                  type="number"
                  min={0}
                  value={p.cashAmount ?? 0}
                  onChange={(e) =>
                    syncPrizes(prizes.map((x) => (x.id === p.id ? { ...x, cashAmount: Number(e.target.value) || 0 } : x)))
                  }
                />
              ) : (
                <Input
                  label="Winners Count"
                  type="number"
                  min={1}
                  value={p.winnersCount ?? 1}
                  onChange={(e) =>
                    syncPrizes(prizes.map((x) => (x.id === p.id ? { ...x, winnersCount: Number(e.target.value) || 1 } : x)))
                  }
                />
              )}
            </div>
            <Input
              label="Prize Details / Perks (optional)"
              placeholder="e.g. ₹50,000 + direct interview + cloud credits"
              value={p.description || ""}
              onChange={(e) =>
                syncPrizes(prizes.map((x) => (x.id === p.id ? { ...x, description: e.target.value } : x)))
              }
            />
          </div>
        ))}
      </div>

      {/* Sponsors */}
      <div className="pt-4 border-t border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900">Sponsors &amp; Partners (Optional)</h3>
            <p className="text-xs text-slate-500">Showcase partner brands on your event page.</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => patch({ sponsors: [...sponsors, { id: nanoid(6), name: "", tier: "gold" }] })}
          >
            Add sponsor
          </Button>
        </div>

        {sponsors.map((sp) => (
          <div key={sp.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Sponsor Name"
                value={sp.name}
                onChange={(e) =>
                  patch({ sponsors: sponsors.map((x) => (x.id === sp.id ? { ...x, name: e.target.value } : x)) })
                }
              />
              <Select
                label="Tier"
                value={sp.tier}
                onChange={(e) =>
                  patch({
                    sponsors: sponsors.map((x) =>
                      x.id === sp.id ? { ...x, tier: e.target.value as EmbeddedSponsor["tier"] } : x
                    ),
                  })
                }
              >
                <option value="title">Title</option>
                <option value="platinum">Platinum</option>
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
                <option value="partner">Partner</option>
                <option value="community">Community</option>
              </Select>
              <Input
                label="Website"
                placeholder="https://..."
                value={sp.website || ""}
                onChange={(e) =>
                  patch({ sponsors: sponsors.map((x) => (x.id === sp.id ? { ...x, website: e.target.value } : x)) })
                }
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <ImageUploader
                  label="Logo (optional)"
                  storagePath={`hackathons/${data.id}/sponsors/${sp.id}`}
                  value={sp.logoUrl}
                  onChange={(url) =>
                    patch({ sponsors: sponsors.map((x) => (x.id === sp.id ? { ...x, logoUrl: url } : x)) }, true)
                  }
                  aspect="aspect-[16/7]"
                />
              </div>
              <Button variant="ghost" size="sm" onClick={() => patch({ sponsors: sponsors.filter((x) => x.id !== sp.id) })}>
                <Trash2 size={14} className="text-red-600" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Step7Judging({ data, patch }: StepProps) {
  const criteria: JudgingCriterion[] = data.judgingCriteria ?? [];
  const judges: JudgeInvite[] = data.judgeInvites ?? [];
  const [judgeEmail, setJudgeEmail] = useState("");
  const [judgeName, setJudgeName] = useState("");

  const total = rubricTotal(criteria);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display font-bold text-sm text-slate-900">Judging Rubric (Weights must total 100%)</h3>
          <p className={`text-xs font-semibold mt-0.5 ${total === 100 ? "text-emerald-700" : "text-red-600"}`}>
            Current total: {total}% {total === 100 ? "✓" : `(need ${100 - total > 0 ? `+${100 - total}` : 100 - total}%)`}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Plus size={14} />}
          onClick={() =>
            patch({
              judgingCriteria: [...criteria, { id: nanoid(6), name: "", description: "", weight: 10, maxScore: 10 }],
            })
          }
        >
          Add criterion
        </Button>
      </div>

      <div className="space-y-3">
        {criteria.map((c) => (
          <div key={c.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6">
                <Input
                  label="Criterion Name"
                  placeholder="e.g. Technical Execution"
                  value={c.name}
                  onChange={(e) =>
                    patch({
                      judgingCriteria: criteria.map((x) => (x.id === c.id ? { ...x, name: e.target.value } : x)),
                    })
                  }
                />
              </div>
              <div className="sm:col-span-3">
                <Input
                  label="Weight (%)"
                  type="number"
                  min={1}
                  max={100}
                  value={c.weight}
                  onChange={(e) =>
                    patch({
                      judgingCriteria: criteria.map((x) =>
                        x.id === c.id ? { ...x, weight: Number(e.target.value) || 0 } : x
                      ),
                    })
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  label="Max Score"
                  type="number"
                  min={1}
                  max={100}
                  value={c.maxScore}
                  onChange={(e) =>
                    patch({
                      judgingCriteria: criteria.map((x) =>
                        x.id === c.id ? { ...x, maxScore: Number(e.target.value) || 10 } : x
                      ),
                    })
                  }
                />
              </div>
              <div className="sm:col-span-1 flex items-end justify-end">
                <button
                  type="button"
                  onClick={() => patch({ judgingCriteria: criteria.filter((x) => x.id !== c.id) })}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <Input
              placeholder="Guidance for judges (optional)"
              value={c.description}
              onChange={(e) =>
                patch({
                  judgingCriteria: criteria.map((x) => (x.id === c.id ? { ...x, description: e.target.value } : x)),
                })
              }
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
        <label className="flex items-start gap-2.5 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(data.isBlindJudging)}
            onChange={(e) => patch({ isBlindJudging: e.target.checked })}
            className="mt-1 w-4 h-4 rounded accent-[#1565D8]"
          />
          <span>
            <span className="font-semibold text-slate-900 block">Blind judging</span>
            <span className="text-xs text-slate-500">Hide team identities from judges while scoring.</span>
          </span>
        </label>
        <label className="flex items-start gap-2.5 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(data.hasPublicVoting)}
            onChange={(e) => patch({ hasPublicVoting: e.target.checked })}
            className="mt-1 w-4 h-4 rounded accent-[#1565D8]"
          />
          <span>
            <span className="font-semibold text-slate-900 block">Enable community likes / voting</span>
            <span className="text-xs text-slate-500">Let the community upvote public project submissions.</span>
          </span>
        </label>
      </div>

      {/* Invite Judges */}
      <div className="pt-4 border-t border-slate-200 space-y-3">
        <h3 className="font-display font-bold text-sm text-slate-900">Invite Judges by Email (Optional)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 items-end">
          <div className="sm:col-span-2">
            <Input label="Judge Name" placeholder="Dr. Ananya Rao" value={judgeName} onChange={(e) => setJudgeName(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Input label="Judge Email" type="email" placeholder="judge@company.com" value={judgeEmail} onChange={(e) => setJudgeEmail(e.target.value)} />
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              const email = judgeEmail.trim().toLowerCase();
              if (!email.includes("@") || judges.some((j) => j.email === email)) return;
              patch({ judgeInvites: [...judges, { email, name: judgeName.trim() || undefined, status: "invited" }] });
              setJudgeEmail("");
              setJudgeName("");
            }}
          >
            Add judge
          </Button>
        </div>

        {judges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {judges.map((j) => (
              <span key={j.email} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-medium text-slate-800">
                <span>{j.name ? `${j.name} (${j.email})` : j.email}</span>
                <button
                  type="button"
                  onClick={() => patch({ judgeInvites: judges.filter((x) => x.email !== j.email) })}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function Step8Pricing({ data, patch }: StepProps) {
  const pricing: HackathonPricingDraft = data.pricingDraft ?? { isFree: true, currency: "INR", tiers: [], coupons: [] };

  function updatePricing(next: HackathonPricingDraft) {
    patch({ pricingDraft: next, isFree: next.isFree, currency: "INR" });
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { free: true, title: "Free to participate", sub: "No registration fee — instant free tickets." },
          { free: false, title: "Paid tickets (Razorpay INR)", sub: "Create early-bird, student, or team tiers & coupons." },
        ].map((opt) => {
          const active = pricing.isFree === opt.free;
          return (
            <button
              key={String(opt.free)}
              type="button"
              onClick={() => updatePricing({ ...pricing, isFree: opt.free })}
              className={`p-4 rounded-2xl border text-left transition-all ${
                active ? "border-[#1565D8] bg-[#EEF4FF]/60 ring-1 ring-[#1565D8]/20" : "border-slate-200 bg-white"
              }`}
            >
              <p className="font-display font-bold text-sm text-slate-900">{opt.title}</p>
              <p className="text-xs text-slate-600 mt-1">{opt.sub}</p>
            </button>
          );
        })}
      </div>

      {!pricing.isFree && (
        <>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-sm text-slate-900">Ticket Tiers (INR)</h3>
                <p className="text-xs text-slate-500">All paid tickets go through HACKSYRA&apos;s platform Razorpay checkout.</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Plus size={14} />}
                onClick={() =>
                  updatePricing({
                    ...pricing,
                    tiers: [
                      ...pricing.tiers,
                      { id: `tier_${nanoid(8)}`, name: "Standard Pass", type: "standard", price: 19900, perPersonLimit: 1 },
                    ],
                  })
                }
              >
                Add tier
              </Button>
            </div>

            {pricing.tiers.map((t) => (
              <div key={t.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <Input
                    label="Tier Name"
                    value={t.name}
                    onChange={(e) =>
                      updatePricing({
                        ...pricing,
                        tiers: pricing.tiers.map((x) => (x.id === t.id ? { ...x, name: e.target.value } : x)),
                      })
                    }
                  />
                  <Select
                    label="Type"
                    value={t.type}
                    onChange={(e) =>
                      updatePricing({
                        ...pricing,
                        tiers: pricing.tiers.map((x) =>
                          x.id === t.id ? { ...x, type: e.target.value as TicketTierType } : x
                        ),
                      })
                    }
                  >
                    <option value="early_bird">Early Bird</option>
                    <option value="student">Student</option>
                    <option value="standard">Standard</option>
                    <option value="team">Team</option>
                    <option value="vip">VIP</option>
                  </Select>
                  <Input
                    label="Price (₹)"
                    type="number"
                    min={0}
                    value={Math.round(t.price / 100)}
                    onChange={(e) =>
                      updatePricing({
                        ...pricing,
                        tiers: pricing.tiers.map((x) =>
                          x.id === t.id ? { ...x, price: Math.max(0, Math.round(Number(e.target.value || 0) * 100)) } : x
                        ),
                      })
                    }
                  />
                  <Input
                    label="Capacity (optional)"
                    type="number"
                    min={1}
                    placeholder="Unlimited"
                    value={t.capacity ?? ""}
                    onChange={(e) =>
                      updatePricing({
                        ...pricing,
                        tiers: pricing.tiers.map((x) =>
                          x.id === t.id ? { ...x, capacity: e.target.value ? Number(e.target.value) : undefined } : x
                        ),
                      })
                    }
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => updatePricing({ ...pricing, tiers: pricing.tiers.filter((x) => x.id !== t.id) })}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove tier
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-sm text-slate-900">Coupon Codes (Optional)</h3>
                <p className="text-xs text-slate-500">Stored securely on the server when you submit.</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Plus size={14} />}
                onClick={() =>
                  updatePricing({
                    ...pricing,
                    coupons: [
                      ...pricing.coupons,
                      { id: `cpn_${nanoid(8)}`, code: "EARLY20", type: "percentage", value: 20 },
                    ],
                  })
                }
              >
                Add coupon
              </Button>
            </div>

            {pricing.coupons.map((c) => (
              <div key={c.id} className="p-4 rounded-2xl border border-slate-200 bg-white grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <Input
                  label="Code"
                  value={c.code}
                  onChange={(e) =>
                    updatePricing({
                      ...pricing,
                      coupons: pricing.coupons.map((x) =>
                        x.id === c.id ? { ...x, code: e.target.value.toUpperCase() } : x
                      ),
                    })
                  }
                />
                <Select
                  label="Discount Type"
                  value={c.type}
                  onChange={(e) =>
                    updatePricing({
                      ...pricing,
                      coupons: pricing.coupons.map((x) =>
                        x.id === c.id ? { ...x, type: e.target.value as "percentage" | "fixed" } : x
                      ),
                    })
                  }
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed (₹)</option>
                </Select>
                <Input
                  label={c.type === "percentage" ? "Percent (1–100)" : "Amount (₹)"}
                  type="number"
                  min={1}
                  value={c.type === "percentage" ? c.value : Math.round(c.value / 100)}
                  onChange={(e) =>
                    updatePricing({
                      ...pricing,
                      coupons: pricing.coupons.map((x) =>
                        x.id === c.id
                          ? {
                              ...x,
                              value:
                                x.type === "percentage"
                                  ? Math.min(100, Math.max(1, Number(e.target.value || 1)))
                                  : Math.max(100, Math.round(Number(e.target.value || 1) * 100)),
                            }
                          : x
                      ),
                    })
                  }
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updatePricing({ ...pricing, coupons: pricing.coupons.filter((x) => x.id !== c.id) })}
                >
                  <Trash2 size={14} className="text-red-600" /> Remove
                </Button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function Step9ReviewPay({
  data,
  flush,
  onJumpStep,
}: {
  data: WithId<Hackathon>;
  flush: () => Promise<void>;
  onJumpStep: (step: number) => void;
}) {
  const { data: settings } = usePlatformSettings();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const feePaise = settings?.listingFeeInPaise ?? DEFAULT_LISTING_FEE_PAISE;
  const issues = validateAllWizardSteps(data, { requireFutureDates: true });

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await flush();
      await api(`/api/hackathons/${data.id}/submit`, { method: "POST", body: {} });
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Could not submit hackathon. Check highlighted steps.");
    } finally {
      setSubmitting(false);
    }
  }

  if (data.status === "pending_review") {
    return (
      <div className="p-6 sm:p-8 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
          <Sparkles size={30} />
        </div>
        <StatusBadge status="pending_review" />
        <h2 className="font-display font-bold text-2xl text-slate-900">Submitted for Admin Review!</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          <strong>{data.name}</strong> has been verified and sent to our admin review team. Once approved, it will immediately go live on HACKSYRA and you&apos;ll receive a notification &amp; email.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button href="/organizer/events">View My Hackathons</Button>
          <Button variant="secondary" href="/organizer">
            Organizer Console
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Completeness Checklist */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-base text-slate-900">Pre-submission Checklist</h3>
          <span className={`text-xs font-bold ${issues.length === 0 ? "text-emerald-700" : "text-amber-700"}`}>
            {issues.length === 0 ? "All checks passed ✓" : `${issues.length} step(s) need attention`}
          </span>
        </div>

        {issues.length === 0 ? (
          <p className="text-xs sm:text-sm text-emerald-700 flex items-center gap-2">
            <CheckCircle2 size={16} /> Every required detail, date ordering, track, prize, and rubric check is valid.
          </p>
        ) : (
          <div className="space-y-2">
            {issues.map((item) => (
              <div key={item.step} className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start justify-between gap-3">
                <div className="text-xs text-amber-900 space-y-0.5">
                  <p className="font-bold">
                    Step {item.step}: {item.title}
                  </p>
                  {item.errors.map((e, i) => (
                    <p key={i}>• {e}</p>
                  ))}
                </div>
                <Button variant="secondary" size="sm" onClick={() => onJumpStep(item.step)}>
                  Fix
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
        <div className="card p-4 space-y-1.5">
          <p className="text-[11px] font-bold uppercase text-slate-400">Event Identity</p>
          <p className="font-bold text-slate-900">{data.name || "Untitled"}</p>
          <p className="text-slate-600 font-mono text-xs">/hackathons/{data.slug || "..."}</p>
          <p className="text-slate-600 capitalize">
            {data.mode} · {data.category?.replace(/_/g, " ")} · {data.visibility}
          </p>
        </div>
        <div className="card p-4 space-y-1.5">
          <p className="text-[11px] font-bold uppercase text-slate-400">Tracks, Prizes &amp; Judging</p>
          <p className="text-slate-700">
            <strong>{data.tracks?.length ?? 0}</strong> track(s) · <strong>{data.prizes?.length ?? 0}</strong> prize(s)
          </p>
          <p className="text-slate-700">
            Total cash pool: <strong>{formatMajor((data.totalPrizeInPaise ?? 0) / 100)}</strong>
          </p>
          <p className="text-slate-700">
            Entry: <strong>{data.isFree ? "Free" : "Paid tickets"}</strong> · Rubric weight: <strong>{rubricTotal(data.judgingCriteria ?? [])}%</strong>
          </p>
        </div>
      </div>

      {error && (
        <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {data.status === "payment_pending" && !data.listingFee?.paid ? (
        <ListingFeePayment hackathonId={data.id} amountInPaise={feePaise} />
      ) : (
        <div className="p-5 rounded-2xl bg-[#EEF4FF]/60 border border-[#B3D1FF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-display font-bold text-base text-slate-900">
              {data.listingFee?.paid || feePaise === 0
                ? "Ready to submit for admin approval"
                : `Step 1: Lock event details & pay ${formatMoney(feePaise)} listing fee`}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {data.listingFee?.paid
                ? "Your listing fee is already paid — re-submitting moves your hackathon straight back to review."
                : "Validates your hackathon, reserves your slug, and opens Razorpay Checkout."}
            </p>
          </div>
          <Button size="lg" onClick={handleSubmit} loading={submitting} disabled={issues.length > 0}>
            {data.listingFee?.paid || feePaise === 0 ? "Submit for Review" : `Validate & Proceed to Pay ${formatMoney(feePaise)}`}
          </Button>
        </div>
      )}
    </div>
  );
}
