"use client";

import { useEffect, useState } from "react";
import { Timestamp } from "firebase/firestore";
import { Check, AlertCircle, Plus, Trash2, Copy, Calendar } from "lucide-react";
import { nanoid } from "nanoid";
import { slugify } from "@/lib/domain/slug";
import { listTimeZones, utcToZonedInput, zonedTimeToUtc } from "@/lib/domain/timezone";
import { formatInZone, toDate, viewerTimeZone } from "@/lib/domain/dates";
import { validateTimeline } from "@/lib/domain/timeline";
import { CATEGORIES } from "@/lib/domain/hackathon-schema";
import { Button, Input, Select, Textarea } from "@/components/ui";
import { MarkdownEditor } from "@/components/common/MarkdownEditor";
import { ChipInput, ImageUploader } from "./WizardShared";
import type { EmbeddedScheduleItem, Hackathon, HackathonFaqItem, HackathonStage } from "@/types";
import type { WithId } from "@/lib/data/live";

type StepProps = {
  data: WithId<Hackathon>;
  patch: (p: Partial<Hackathon> & Record<string, unknown>, immediate?: boolean) => void;
};

export function Step1Basics({ data, patch }: StepProps) {
  const [slugState, setSlugState] = useState<{ checking: boolean; available?: boolean; reason?: string }>({ checking: false });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(data.slug));

  useEffect(() => {
    if (!data.slug || data.slug.length < 3) {
      setSlugState({ checking: false });
      return;
    }
    let cancelled = false;
    setSlugState({ checking: true });
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/hackathons/slug-check?slug=${encodeURIComponent(data.slug)}&excludeId=${encodeURIComponent(data.id)}`);
        const json = (await res.json()) as { available?: boolean; reason?: string };
        if (!cancelled) setSlugState({ checking: false, available: json.available, reason: json.reason });
      } catch {
        if (!cancelled) setSlugState({ checking: false });
      }
    }, 350);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [data.slug, data.id]);

  return (
    <div className="space-y-5">
      <Input
        label="Hackathon Name"
        required
        placeholder="e.g. Bharat FinTech Hack 2026"
        value={data.name || ""}
        onChange={(e) => {
          const name = e.target.value;
          const updates: Record<string, unknown> = { name };
          if (!slugManuallyEdited) updates.slug = slugify(name);
          patch(updates);
        }}
      />

      <div>
        <Input
          label="Public URL Slug"
          required
          placeholder="bharat-fintech-hack-2026"
          value={data.slug || ""}
          onChange={(e) => {
            setSlugManuallyEdited(true);
            patch({ slug: slugify(e.target.value) });
          }}
          leftAdornment={<span className="text-xs font-mono text-slate-400">/hackathons/</span>}
          className="!pl-[104px] font-mono text-xs sm:text-sm"
          error={slugState.available === false ? slugState.reason : undefined}
        />
        {slugState.checking && <p className="text-xs text-slate-500 mt-1">Checking availability...</p>}
        {slugState.available === true && (
          <p className="text-xs text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <Check size={13} /> URL slug is available!
          </p>
        )}
      </div>

      <Input
        label="Tagline"
        required
        maxLength={160}
        placeholder="One punchy sentence describing what builders will create"
        value={data.tagline || ""}
        onChange={(e) => patch({ tagline: e.target.value })}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Select label="Category" required value={data.category || "ai_ml"} onChange={(e) => patch({ category: e.target.value as Hackathon["category"] })}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.replace(/_/g, " ").toUpperCase()}
            </option>
          ))}
        </Select>

        <Select label="Mode" required value={data.mode || "online"} onChange={(e) => patch({ mode: e.target.value as Hackathon["mode"] })}>
          <option value="online">Online</option>
          <option value="offline">In-person (Offline)</option>
          <option value="hybrid">Hybrid</option>
        </Select>

        <Select label="Difficulty" value={data.difficulty || "open"} onChange={(e) => patch({ difficulty: e.target.value as Hackathon["difficulty"] })}>
          <option value="open">All levels</option>
          <option value="beginner">Beginner friendly</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </Select>

        <Select
          label="Visibility"
          value={data.visibility || "public"}
          onChange={(e) => {
            const v = e.target.value as Hackathon["visibility"];
            const updates: Record<string, unknown> = { visibility: v };
            if (v === "invite_only" && !data.inviteCode) {
              updates.inviteCode = `INV-${nanoid(6).toUpperCase()}`;
            }
            patch(updates);
          }}
        >
          <option value="public">Public (Listed)</option>
          <option value="unlisted">Unlisted (Link only)</option>
          <option value="invite_only">Invite-only (Code)</option>
          <option value="private">Private</option>
        </Select>
      </div>

      {data.visibility === "invite_only" && (
        <div className="p-4 rounded-2xl bg-[#EEF4FF]/60 border border-[#DCE9FF] flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1">
            <Input
              label="Invite Code"
              value={data.inviteCode || ""}
              onChange={(e) => patch({ inviteCode: e.target.value.toUpperCase() })}
              hint="Participants must enter this code to register."
            />
          </div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Copy size={13} />}
            onClick={() => navigator.clipboard?.writeText(data.inviteCode || "")}
          >
            Copy code
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChipInput label="Themes" values={data.themes ?? []} onChange={(themes) => patch({ themes })} placeholder="e.g. Rural Health, FinTech" />
        <ChipInput label="Technologies" values={data.technologies ?? []} onChange={(technologies) => patch({ technologies })} placeholder="e.g. Python, Next.js, Solana" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <ImageUploader
          label="Cover Banner"
          storagePath={`hackathons/${data.id}/cover`}
          value={data.coverImage}
          onChange={(url) => patch({ coverImage: url ?? "" }, true)}
          hint="Recommended 16:9 banner shown on cards and hero."
        />
        <ImageUploader
          label="Event Logo (optional)"
          storagePath={`hackathons/${data.id}/logo`}
          value={data.logoImage}
          onChange={(url) => patch({ logoImage: url ?? "" }, true)}
          aspect="aspect-[16/9]"
          hint="Square/transparent emblem for organizer badge."
        />
      </div>
    </div>
  );
}

export function Step2Details({ data, patch }: StepProps) {
  const faq: HackathonFaqItem[] = data.faq ?? [];

  return (
    <div className="space-y-5">
      <Textarea
        label="Executive Summary"
        required
        rows={3}
        maxLength={500}
        placeholder="Concise 2–3 sentence overview of the hackathon challenge, format, and target audience."
        value={data.summary || ""}
        onChange={(e) => patch({ summary: e.target.value })}
        hint={`${(data.summary || "").length}/500 characters (minimum 20)`}
      />

      <MarkdownEditor
        label="Full Description & Problem Statements"
        required
        rows={8}
        placeholder="## About the hackathon&#10;Describe tracks, expectations, mentor support, and submission guidelines..."
        value={data.description || ""}
        onChange={(description) => patch({ description })}
        hint="Supports GitHub-flavored Markdown (headings, tables, lists, links)."
      />

      <MarkdownEditor
        label="Official Rules & Code of Conduct"
        required
        rows={5}
        placeholder="1. All code must be written during the hackathon.&#10;2. Open-source libraries are allowed..."
        value={data.rules || ""}
        onChange={(rules) => patch({ rules })}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Organizer Contact Email"
          type="email"
          required
          value={data.contactEmail || ""}
          onChange={(e) => patch({ contactEmail: e.target.value })}
        />
        <Input
          label="Community / Support Channel (Discord, Slack, WhatsApp)"
          placeholder="https://discord.gg/..."
          value={data.supportChannel || ""}
          onChange={(e) => patch({ supportChannel: e.target.value })}
        />
      </div>

      {/* Eligibility */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
        <h3 className="font-display font-bold text-sm text-slate-900">Eligibility &amp; Approval</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-start gap-2.5 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(data.studentsOnly)}
              onChange={(e) => patch({ studentsOnly: e.target.checked })}
              className="mt-1 w-4 h-4 rounded accent-[#1565D8]"
            />
            <span>
              <span className="font-semibold text-slate-900 block">Students only</span>
              <span className="text-xs text-slate-500">Restrict to university / school students.</span>
            </span>
          </label>
          <label className="flex items-start gap-2.5 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(data.requiresApproval)}
              onChange={(e) => patch({ requiresApproval: e.target.checked })}
              className="mt-1 w-4 h-4 rounded accent-[#1565D8]"
            />
            <span>
              <span className="font-semibold text-slate-900 block">Manually approve participants</span>
              <span className="text-xs text-slate-500">New registrations stay pending until you accept them.</span>
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Minimum Age (optional)"
            type="number"
            min={13}
            max={99}
            placeholder="e.g. 16"
            value={data.minAge ?? ""}
            onChange={(e) => patch({ minAge: e.target.value ? Number(e.target.value) : undefined })}
          />
          <ChipInput
            label="Restrict Email Domains (optional)"
            values={data.emailDomainRestrictions ?? []}
            onChange={(emailDomainRestrictions) => patch({ emailDomainRestrictions })}
            placeholder="e.g. iitm.ac.in"
          />
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900">Frequently Asked Questions</h3>
            <p className="text-xs text-slate-500">Displayed on your public hackathon page.</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => patch({ faq: [...faq, { id: nanoid(6), question: "", answer: "" }] })}
          >
            Add FAQ
          </Button>
        </div>

        {faq.map((item, idx) => (
          <div key={item.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-400">FAQ #{idx + 1}</span>
              <button
                type="button"
                onClick={() => patch({ faq: faq.filter((f) => f.id !== item.id) })}
                className="text-xs text-red-600 hover:underline inline-flex items-center gap-1"
              >
                <Trash2 size={13} /> Remove
              </button>
            </div>
            <Input
              placeholder="Question"
              value={item.question}
              onChange={(e) =>
                patch({ faq: faq.map((f) => (f.id === item.id ? { ...f, question: e.target.value } : f)) })
              }
            />
            <Textarea
              rows={2}
              placeholder="Answer"
              value={item.answer}
              onChange={(e) =>
                patch({ faq: faq.map((f) => (f.id === item.id ? { ...f, answer: e.target.value } : f)) })
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function Step3Location({ data, patch }: StepProps) {
  const needsVenue = data.mode === "offline" || data.mode === "hybrid";
  const needsOnline = data.mode === "online" || data.mode === "hybrid";

  return (
    <div className="space-y-5">
      <div className="p-4 rounded-2xl bg-[#EEF4FF]/60 border border-[#DCE9FF] text-xs sm:text-sm text-slate-700">
        Current format: <strong className="uppercase text-[#1565D8]">{data.mode}</strong> (change in Step 1 if needed).
      </div>

      {needsOnline && (
        <Input
          label="Online Platform / Virtual Venue"
          required
          placeholder="e.g. Discord + HACKSYRA Live Stream, Zoom, Google Meet"
          value={data.onlinePlatform || ""}
          onChange={(e) => patch({ onlinePlatform: e.target.value })}
        />
      )}

      {needsVenue && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Country"
            placeholder="India"
            value={data.country || ""}
            onChange={(e) => patch({ country: e.target.value })}
          />
          <Input
            label="City"
            required
            placeholder="Bengaluru"
            value={data.city || ""}
            onChange={(e) => patch({ city: e.target.value })}
          />
          <Input
            label="Venue Name"
            required
            placeholder="e.g. IIT Madras Research Park"
            value={data.venueName || ""}
            onChange={(e) => patch({ venueName: e.target.value })}
          />
          <Input
            label="Full Address"
            placeholder="Street, Landmark, PIN code"
            value={data.venueAddress || ""}
            onChange={(e) => patch({ venueAddress: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}

export function Step4Timeline({ data, patch }: StepProps) {
  const tz = data.eventTimezone || "Asia/Kolkata";
  const localTz = viewerTimeZone();
  const zones = listTimeZones();
  const issues = validateTimeline(data, { requireFuture: false });
  const issueMap = new Map(issues.map((i) => [i.field, i.message]));

  const dateFields: { key: keyof Hackathon; label: string; required?: boolean }[] = [
    { key: "registrationOpenDate", label: "Registration Opens", required: true },
    { key: "registrationCloseDate", label: "Registration Closes", required: true },
    { key: "teamFormationDeadline", label: "Team Formation Deadline" },
    { key: "startDate", label: "Hackathon Starts", required: true },
    { key: "endDate", label: "Hackathon Ends", required: true },
    { key: "submissionOpenDate", label: "Project Submissions Open", required: true },
    { key: "submissionCloseDate", label: "Project Submissions Close", required: true },
    { key: "judgingStartDate", label: "Judging Starts" },
    { key: "judgingEndDate", label: "Judging Ends" },
    { key: "resultsAnnouncementDate", label: "Results Announced" },
    { key: "certificateReleaseDate", label: "Certificates Released" },
  ];

  function handleDateChange(key: keyof Hackathon, localStr: string) {
    if (!localStr) {
      patch({ [key]: null });
      return;
    }
    const utc = zonedTimeToUtc(localStr, tz);
    if (utc) patch({ [key]: Timestamp.fromDate(utc) });
  }

  const schedule: EmbeddedScheduleItem[] = data.schedule ?? [];
  const stages: HackathonStage[] = data.stages ?? [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
        <Select label="Event Timezone" required value={tz} onChange={(e) => patch({ eventTimezone: e.target.value })}>
          {zones.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </Select>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
          Inputs below are in <strong>{tz}</strong>. Your local device timezone is <strong>{localTz}</strong>.
        </div>
      </div>

      {issues.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 space-y-1">
          {issues.map((i) => (
            <p key={i.field} className="flex items-center gap-1.5">
              <AlertCircle size={14} className="shrink-0" /> {i.message}
            </p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dateFields.map((f) => {
          const val = toDate(data[f.key] as never);
          const inputVal = val ? utcToZonedInput(val, tz) : "";
          const err = issueMap.get(f.key as never);
          return (
            <div key={f.key} className="form-field">
              <label className="label">
                {f.label} {f.required && <span className="text-red-500">*</span>}
              </label>
              <input
                type="datetime-local"
                value={inputVal}
                onChange={(e) => handleDateChange(f.key, e.target.value)}
                className={`input ${err ? "input-error" : ""}`}
              />
              {val && localTz !== tz && (
                <p className="text-[11px] text-slate-500">Your local time: {formatInZone(val, localTz)}</p>
              )}
              {err && <p className="text-xs text-red-600 font-medium">{err}</p>}
            </div>
          );
        })}
      </div>

      {/* Unstop-style Stages / Rounds */}
      <div className="pt-4 border-t border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900">Rounds &amp; Stages (Optional)</h3>
            <p className="text-xs text-slate-500">Define multi-round milestones (e.g. Idea Pitch → Prototype → Grand Finale).</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => {
              const now = Timestamp.now();
              patch({
                stages: [
                  ...stages,
                  { id: nanoid(6), name: `Round ${stages.length + 1}`, kind: "custom", startDate: now, endDate: now },
                ],
              });
            }}
          >
            Add stage
          </Button>
        </div>

        {stages.map((st) => (
          <div key={st.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Stage Name"
                value={st.name}
                onChange={(e) =>
                  patch({ stages: stages.map((x) => (x.id === st.id ? { ...x, name: e.target.value } : x)) })
                }
              />
              <Select
                label="Type"
                value={st.kind}
                onChange={(e) =>
                  patch({ stages: stages.map((x) => (x.id === st.id ? { ...x, kind: e.target.value as HackathonStage["kind"] } : x)) })
                }
              >
                <option value="registration">Registration</option>
                <option value="submission">Submission</option>
                <option value="shortlisting">Shortlisting</option>
                <option value="final">Grand Finale</option>
                <option value="custom">Custom</option>
              </Select>
              <div className="flex items-end justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => patch({ stages: stages.filter((x) => x.id !== st.id) })}
                  leftIcon={<Trash2 size={14} className="text-red-600" />}
                >
                  Remove
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Starts"
                type="datetime-local"
                value={utcToZonedInput(toDate(st.startDate), tz)}
                onChange={(e) => {
                  const u = zonedTimeToUtc(e.target.value, tz);
                  if (u) patch({ stages: stages.map((x) => (x.id === st.id ? { ...x, startDate: Timestamp.fromDate(u) } : x)) });
                }}
              />
              <Input
                label="Ends"
                type="datetime-local"
                value={utcToZonedInput(toDate(st.endDate), tz)}
                onChange={(e) => {
                  const u = zonedTimeToUtc(e.target.value, tz);
                  if (u) patch({ stages: stages.map((x) => (x.id === st.id ? { ...x, endDate: Timestamp.fromDate(u) } : x)) });
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Event Schedule Items */}
      <div className="pt-4 border-t border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900">Event Schedule</h3>
            <p className="text-xs text-slate-500">Workshops, ceremonies, mentor hours, and demo day slots.</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Calendar size={14} />}
            onClick={() =>
              patch({
                schedule: [
                  ...schedule,
                  { id: nanoid(6), title: "", type: "workshop", startTime: Timestamp.now(), location: "" },
                ],
              })
            }
          >
            Add session
          </Button>
        </div>

        {schedule.map((item) => (
          <div key={item.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Session Title"
                placeholder="Opening Keynote"
                value={item.title}
                onChange={(e) =>
                  patch({ schedule: schedule.map((x) => (x.id === item.id ? { ...x, title: e.target.value } : x)) })
                }
              />
              <Select
                label="Type"
                value={item.type}
                onChange={(e) =>
                  patch({
                    schedule: schedule.map((x) =>
                      x.id === item.id ? { ...x, type: e.target.value as EmbeddedScheduleItem["type"] } : x
                    ),
                  })
                }
              >
                <option value="ceremony">Ceremony</option>
                <option value="workshop">Workshop</option>
                <option value="mentoring">Mentoring</option>
                <option value="judging">Judging</option>
                <option value="demo">Demo</option>
                <option value="award">Awards</option>
                <option value="break">Break</option>
                <option value="other">Other</option>
              </Select>
              <Input
                label="Time"
                type="datetime-local"
                value={utcToZonedInput(toDate(item.startTime), tz)}
                onChange={(e) => {
                  const u = zonedTimeToUtc(e.target.value, tz);
                  if (u) {
                    patch({
                      schedule: schedule.map((x) => (x.id === item.id ? { ...x, startTime: Timestamp.fromDate(u) } : x)),
                    });
                  }
                }}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <Input
                  label="Room or Meeting Link"
                  placeholder="Hall A or https://meet.google.com/..."
                  value={item.location || item.meetingLink || ""}
                  onChange={(e) =>
                    patch({ schedule: schedule.map((x) => (x.id === item.id ? { ...x, location: e.target.value } : x)) })
                  }
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => patch({ schedule: schedule.filter((x) => x.id !== item.id) })}
                leftIcon={<Trash2 size={14} className="text-red-600" />}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
