"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import {
  Bookmark,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  Clock,
  ExternalLink,
  Gavel,
  Gift,
  Heart,
  MapPin,
  Megaphone,
  MessageSquare,
  Send,
  Share2,
  Trophy,
  UserPlus,
  Users,
  Wifi,
} from "lucide-react";
import { clientDb, firebaseReady } from "@/lib/firebase/client";
import { COLLECTIONS, SUB } from "@/lib/firebase/collections";
import { useAuth } from "@/components/providers/AuthProvider";
import { useHackathonBySlug } from "@/lib/data/hooks";
import { useLiveDoc, useLiveQuery } from "@/lib/data/live";
import { api } from "@/lib/api-client";
import { computeLiveStatus, isRegistrationOpenAt, isSubmissionOpenAt } from "@/lib/domain/status";
import { formatInZone, toDate, viewerTimeZone, zoneAbbr } from "@/lib/domain/dates";
import { buildIcsContent, googleCalendarUrl } from "@/lib/domain/calendar";
import { formatMajor } from "@/lib/domain/money";
import {
  Avatar,
  Button,
  Countdown,
  EmptyState,
  Input,
  NotConfigured,
  Skeleton,
  StatusBadge,
  Tabs,
  Textarea,
  useToast,
} from "@/components/ui";
import { Markdown } from "@/components/common/Markdown";
import type {
  Announcement,
  Bookmark as BookmarkDoc,
  DiscussionReply,
  DiscussionThread,
  Follow,
  Registration,
  Submission,
  Team,
} from "@/types";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "prizes", label: "Prizes" },
  { id: "tracks", label: "Tracks" },
  { id: "schedule", label: "Schedule" },
  { id: "judges", label: "Judges" },
  { id: "teams", label: "Teams & LFT" },
  { id: "updates", label: "Updates" },
  { id: "discussions", label: "Discussions" },
  { id: "gallery", label: "Projects" },
  { id: "rules", label: "Rules & FAQ" },
];

export function HackathonDetailClient({ slug }: { slug: string }) {
  const sp = useSearchParams();
  const toast = useToast();
  const { firebaseUser, user, notConfigured } = useAuth();
  const [tab, setTab] = useState(sp.get("tab") || "overview");
  const [threadTitle, setThreadTitle] = useState("");
  const [threadBody, setThreadBody] = useState("");
  const [postingThread, setPostingThread] = useState(false);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const { data: rows, isLoading } = useHackathonBySlug(slug);
  const h = rows?.[0];

  const { data: bookmark } = useLiveDoc<BookmarkDoc>(
    ["bm", firebaseUser?.uid ?? null, h?.id ?? null],
    firebaseUser?.uid && h?.id ? () => doc(clientDb(), COLLECTIONS.BOOKMARKS, `${firebaseUser.uid}_${h.id}`) : null
  );

  const { data: follow } = useLiveDoc<Follow>(
    ["follow", firebaseUser?.uid ?? null, h?.organizerId ?? null],
    firebaseUser?.uid && h?.organizerId
      ? () => doc(clientDb(), COLLECTIONS.FOLLOWS, `${firebaseUser.uid}_${h.organizerId}`)
      : null
  );

  const { data: myReg } = useLiveDoc<Registration>(
    ["reg", h?.id ?? null, firebaseUser?.uid ?? null],
    h?.id && firebaseUser?.uid ? () => doc(clientDb(), COLLECTIONS.REGISTRATIONS, `${h.id}_${firebaseUser.uid}`) : null
  );

  const { data: announcements } = useLiveQuery<Announcement>(
    ["ann", h?.id ?? null],
    h?.id ? () => query(collection(clientDb(), COLLECTIONS.HACKATHONS, h.id, SUB.ANNOUNCEMENTS), orderBy("createdAt", "desc")) : null
  );

  const { data: discussions } = useLiveQuery<DiscussionThread>(
    ["disc", h?.id ?? null],
    h?.id ? () => query(collection(clientDb(), COLLECTIONS.HACKATHONS, h.id, SUB.DISCUSSIONS), orderBy("createdAt", "desc")) : null
  );

  const { data: replies } = useLiveQuery<DiscussionReply>(
    ["disc-replies", h?.id ?? null, activeThreadId],
    h?.id && activeThreadId
      ? () =>
          query(
            collection(clientDb(), COLLECTIONS.HACKATHONS, h.id, SUB.DISCUSSIONS, activeThreadId, SUB.REPLIES),
            orderBy("createdAt", "asc")
          )
      : null
  );

  const { data: teams } = useLiveQuery<Team>(
    ["hack-teams", h?.id ?? null],
    h?.id ? () => query(collection(clientDb(), COLLECTIONS.TEAMS), where("hackathonId", "==", h.id), orderBy("createdAt", "desc")) : null
  );

  const { data: submissions } = useLiveQuery<Submission>(
    ["hack-subs", h?.id ?? null],
    h?.id
      ? () =>
          query(
            collection(clientDb(), COLLECTIONS.SUBMISSIONS),
            where("hackathonId", "==", h.id),
            where("isPublic", "==", true),
            orderBy("finalScore", "desc")
          )
      : null
  );

  if (notConfigured) {
    return (
      <div className="container-app py-10">
        <NotConfigured service="Firestore" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container-app py-10 space-y-4">
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-12 w-2/3" />
      </div>
    );
  }

  if (!h) {
    return (
      <div className="container-app py-14 max-w-xl">
        <EmptyState
          title="Hackathon not found"
          description="This hackathon doesn't exist or hasn't been approved yet."
          action={<Button href="/hackathons">Browse all hackathons</Button>}
        />
      </div>
    );
  }

  const liveStatus = computeLiveStatus(h);
  const regOpen = isRegistrationOpenAt(h);
  const subOpen = isSubmissionOpenAt(h);
  const localTz = viewerTimeZone();
  const eventTz = h.eventTimezone || "Asia/Kolkata";
  const gcalUrl = googleCalendarUrl({
    title: h.name,
    start: h.startDate,
    end: h.endDate,
    details: h.summary,
    location: h.venueName || h.onlinePlatform || "Online",
  });

  function downloadIcs() {
    if (!h) return;
    const content = buildIcsContent({
      uid: h.id,
      title: h.name,
      start: h.startDate,
      end: h.endDate,
      description: h.summary,
      location: h.venueName || h.onlinePlatform,
      url: window.location.href,
    });
    if (!content) return;
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${h.slug}.ics`;
    a.click();
  }

  async function toggleBookmark() {
    if (!h || !firebaseUser) {
      toast.info("Sign in to bookmark this hackathon");
      return;
    }
    const ref = doc(clientDb(), COLLECTIONS.BOOKMARKS, `${firebaseUser.uid}_${h.id}`);
    if (bookmark) await deleteDoc(ref);
    else await setDoc(ref, { userId: firebaseUser.uid, hackathonId: h.id, createdAt: serverTimestamp() });
  }

  async function toggleFollow() {
    if (!h || !firebaseUser) {
      toast.info("Sign in to follow organizers");
      return;
    }
    try {
      await api("/api/follows", { method: "POST", body: { targetId: h.organizerId, targetType: "organizer" } });
    } catch (e) {
      toast.error("Couldn't update follow", e instanceof Error ? e.message : undefined);
    }
  }

  async function postThread(e: React.FormEvent) {
    e.preventDefault();
    if (!h || !firebaseUser || !firebaseReady() || !threadTitle.trim() || !threadBody.trim()) return;
    setPostingThread(true);
    try {
      await addDoc(collection(clientDb(), COLLECTIONS.HACKATHONS, h.id, SUB.DISCUSSIONS), {
        hackathonId: h.id,
        authorId: firebaseUser.uid,
        authorName: user?.displayName || firebaseUser.displayName || "Builder",
        title: threadTitle.trim(),
        body: threadBody.trim(),
        replyCount: 0,
        isAnswered: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setThreadTitle("");
      setThreadBody("");
      toast.success("Question posted");
    } catch {
      toast.error("Couldn't post discussion");
    } finally {
      setPostingThread(false);
    }
  }

  async function sendReply(threadId: string) {
    if (!h || !replyText[threadId]?.trim()) return;
    try {
      await api(`/api/hackathons/${h.id}/discussions/reply`, {
        method: "POST",
        body: { threadId, body: replyText[threadId].trim() },
      });
      setReplyText((prev) => ({ ...prev, [threadId]: "" }));
    } catch (e) {
      toast.error("Reply failed", e instanceof Error ? e.message : undefined);
    }
  }

  const totalPrize = formatMajor((h.totalPrizeInPaise ?? 0) / 100, h.currency || "INR");

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-16">
      {/* Top Banner */}
      <section className="bg-white border-b border-slate-200">
        <div className="container-app py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            <div className="lg:col-span-8 space-y-4">
              {h.coverImage && (
                <div className="relative h-48 sm:h-64 w-full rounded-2xl overflow-hidden border border-slate-200">
                  <Image src={h.coverImage} alt={h.name} fill priority className="object-cover" />
                </div>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={liveStatus} />
                <span className="badge-gray capitalize">
                  {h.mode === "online" ? <Wifi size={12} /> : <MapPin size={12} />} {h.mode}
                  {h.city ? ` · ${h.city}` : ""}
                </span>
                <span className={h.isFree ? "free-pill" : "paid-pill"}>{h.isFree ? "Free Entry" : "Paid Tickets"}</span>
              </div>

              <h1 className="font-display font-bold text-2xl sm:text-4xl text-slate-900 tracking-tight">{h.name}</h1>
              {h.tagline && <p className="text-sm sm:text-base text-slate-600">{h.tagline}</p>}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                  <Avatar name={h.organizerName || "Organizer"} src={h.organizerPhotoURL} size="xs" />
                  <span>
                    Hosted by <strong className="text-slate-900">{h.organizerName || "Organizer"}</strong>
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={toggleFollow} leftIcon={<UserPlus size={14} />}>
                  {follow ? "Following" : "Follow host"}
                </Button>
              </div>
            </div>

            {/* Right Action Card */}
            <aside className="lg:col-span-4 card p-5 sm:p-6 space-y-4 sticky top-20">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-400">Prize Pool</span>
                  <p className="font-display font-bold text-2xl text-[#1565D8]">{totalPrize}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold uppercase text-slate-400">Participants</span>
                  <p className="font-display font-bold text-xl text-slate-900 tabular-nums">{h.registrationCount ?? 0}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="text-[11px] font-bold uppercase text-slate-500">
                  {liveStatus === "ongoing" ? "Submissions close in" : "Registration closes in"}
                </p>
                <Countdown
                  target={liveStatus === "ongoing" ? h.submissionCloseDate : h.registrationCloseDate}
                  compact={false}
                />
              </div>

              {myReg && ["confirmed", "checked_in"].includes(myReg.status) ? (
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 size={16} /> You&apos;re registered!
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="secondary" size="sm" href={`/hackathons/${h.slug}/register`}>
                      View Ticket
                    </Button>
                    {subOpen && (
                      <Button size="sm" href={`/dashboard/submissions?hackathonId=${h.id}`}>
                        Submit Project
                      </Button>
                    )}
                  </div>
                </div>
              ) : regOpen ? (
                <Button size="lg" href={`/hackathons/${h.slug}/register`} className="w-full">
                  Register Now
                </Button>
              ) : (
                <Button disabled className="w-full" variant="secondary">
                  Registration Closed
                </Button>
              )}

              <div className="flex items-center gap-2 pt-1">
                <Button variant="secondary" size="sm" onClick={toggleBookmark} leftIcon={<Bookmark size={14} className={bookmark ? "fill-[#1565D8] text-[#1565D8]" : ""} />} className="flex-1">
                  {bookmark ? "Saved" : "Save"}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    toast.success("Link copied");
                  }}
                  leftIcon={<Share2 size={14} />}
                  className="flex-1"
                >
                  Share
                </Button>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                {gcalUrl && (
                  <a href={gcalUrl} target="_blank" rel="noopener noreferrer" className="text-[#1565D8] font-semibold hover:underline inline-flex items-center gap-1">
                    <CalendarPlus size={13} /> Google Calendar
                  </a>
                )}
                <button type="button" onClick={downloadIcs} className="text-slate-600 font-semibold hover:text-[#1565D8]">
                  Download .ics
                </button>
              </div>
            </aside>
          </div>

          <div className="mt-6">
            <Tabs items={TABS} value={tab} onChange={setTab} variant="underline" />
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="container-app py-6 sm:py-8">
        {tab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 card p-6 sm:p-8 space-y-5">
              <p className="text-base font-medium text-slate-800">{h.summary}</p>
              <Markdown content={h.description} />
            </div>
            <div className="lg:col-span-4 space-y-4">
              <div className="card p-5 space-y-3 text-xs sm:text-sm">
                <h3 className="font-display font-bold text-base text-slate-900">Quick Info</h3>
                <p className="text-slate-600">
                  Team size: <strong className="text-slate-900">{h.minTeamSize}–{h.maxTeamSize}</strong> {h.allowSolo ? "(Solo allowed)" : ""}
                </p>
                <p className="text-slate-600">
                  Eligibility: <strong className="text-slate-900">{h.studentsOnly ? "Students only" : "Open to all"}</strong>
                </p>
                {h.technologies?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {h.technologies.map((t) => (
                      <span key={t} className="px-2.5 py-1 rounded-lg bg-[#EEF4FF] text-[#1565D8] text-xs font-semibold">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "prizes" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(h.prizes ?? []).map((p) => (
              <div key={p.id} className="card p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Trophy size={19} />
                  </span>
                  {p.type === "cash" && p.cashAmount ? (
                    <span className="font-display font-bold text-lg text-[#1565D8]">{formatMajor(p.cashAmount, p.currency || "INR")}</span>
                  ) : (
                    <span className="badge-aqua">
                      <Gift size={11} /> Perks
                    </span>
                  )}
                </div>
                <h3 className="font-display font-bold text-base text-slate-900">{p.name}</h3>
                {p.description && <p className="text-xs text-slate-600">{p.description}</p>}
              </div>
            ))}
          </div>
        )}

        {tab === "tracks" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(h.tracks ?? []).map((t) => (
              <div key={t.id} className="card p-5 space-y-1.5">
                <h3 className="font-display font-bold text-base text-slate-900">{t.name}</h3>
                <p className="text-sm text-slate-600">{t.description}</p>
                {t.sponsorName && <p className="text-xs text-[#1565D8] font-semibold">Sponsored by {t.sponsorName}</p>}
              </div>
            ))}
          </div>
        )}

        {tab === "schedule" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-5 sm:p-6 space-y-3">
              <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                <Clock size={18} className="text-[#1565D8]" /> Key Milestones
              </h2>
              <p className="text-xs text-slate-500">
                Event timezone: <strong>{zoneAbbr(eventTz)}</strong> · Your local timezone: <strong>{zoneAbbr(localTz)}</strong>
              </p>
              <div className="divide-y divide-slate-100">
                {[
                  ["Registration Opens", h.registrationOpenDate],
                  ["Registration Closes", h.registrationCloseDate],
                  ["Hackathon Starts", h.startDate],
                  ["Hackathon Ends", h.endDate],
                  ["Submissions Close", h.submissionCloseDate],
                  ["Results Announced", h.resultsAnnouncementDate],
                ]
                  .filter(([, v]) => Boolean(v))
                  .map(([label, val]) => (
                    <div key={String(label)} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs sm:text-sm">
                      <span className="font-semibold text-slate-800">{String(label)}</span>
                      <div className="sm:text-right">
                        <p className="font-medium text-slate-900">{formatInZone(toDate(val as never), localTz)} ({zoneAbbr(localTz)})</p>
                        {localTz !== eventTz && (
                          <p className="text-[11px] text-slate-400">{formatInZone(toDate(val as never), eventTz)} ({zoneAbbr(eventTz)})</p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="card p-5 sm:p-6 space-y-3">
              <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                <Calendar size={18} className="text-[#1565D8]" /> Event Sessions
              </h2>
              {!(h.schedule?.length) ? (
                <EmptyState title="No extra sessions listed yet" />
              ) : (
                <div className="space-y-3">
                  {h.schedule.map((s) => (
                    <div key={s.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                      <div>
                        <span className="badge-blue text-[10px] uppercase mb-1">{s.type}</span>
                        <p className="font-semibold text-sm text-slate-900">{s.title}</p>
                        {s.location && <p className="text-xs text-slate-500">{s.location}</p>}
                      </div>
                      <span className="text-xs font-medium text-slate-600 shrink-0">{formatInZone(toDate(s.startTime), localTz)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "judges" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-5 space-y-3">
              <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                <Gavel size={18} className="text-[#1565D8]" /> Judging Rubric
              </h2>
              {(h.judgingCriteria ?? []).map((c) => (
                <div key={c.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-sm text-slate-900">{c.name}</p>
                    {c.description && <p className="text-xs text-slate-500">{c.description}</p>}
                  </div>
                  <span className="badge-violet shrink-0">{c.weight}%</span>
                </div>
              ))}
            </div>
            <div className="card p-5 space-y-3">
              <h2 className="font-display font-bold text-lg text-slate-900">Judges</h2>
              {!(h.judgeInvites?.length) ? (
                <EmptyState title="Judges will be announced soon" />
              ) : (
                <div className="space-y-2.5">
                  {h.judgeInvites.map((j) => (
                    <div key={j.email} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200">
                      <Avatar name={j.name || j.email} size="sm" />
                      <div>
                        <p className="font-semibold text-sm text-slate-900">{j.name || "Panel Judge"}</p>
                        <p className="text-xs text-slate-500 capitalize">{j.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "teams" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                <Users size={18} className="text-[#1565D8]" /> Teams Looking for Members
              </h2>
              <Button size="sm" href="/dashboard/teams">
                Manage My Team
              </Button>
            </div>
            {!teams || teams.length === 0 ? (
              <EmptyState title="No public teams formed yet" description="Register for this hackathon and create the first team!" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams.map((t) => (
                  <div key={t.id} className="card p-5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-bold text-base text-slate-900">{t.name}</h3>
                      <span className="badge-blue">
                        {t.memberIds.length}/{t.maxSize}
                      </span>
                    </div>
                    {t.description && <p className="text-xs text-slate-600">{t.description}</p>}
                    <div className="flex flex-wrap gap-1">
                      {(t.skills ?? []).map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-xs text-slate-700">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "updates" && (
          <div className="space-y-3 max-w-3xl">
            {!announcements || announcements.length === 0 ? (
              <EmptyState icon={<Megaphone size={22} />} title="No announcements yet" />
            ) : (
              announcements.map((a) => (
                <div key={a.id} className="card p-5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display font-bold text-base text-slate-900">{a.title}</h3>
                    <span className="text-xs text-slate-400">{formatInZone(toDate(a.createdAt), localTz)}</span>
                  </div>
                  <Markdown content={a.body} />
                </div>
              ))
            )}
          </div>
        )}

        {tab === "discussions" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              <form onSubmit={postThread} className="card p-5 space-y-3">
                <h3 className="font-display font-bold text-base text-slate-900">Ask a Question</h3>
                <Input placeholder="Topic / Question title" value={threadTitle} onChange={(e) => setThreadTitle(e.target.value)} required />
                <Textarea rows={3} placeholder="Details..." value={threadBody} onChange={(e) => setThreadBody(e.target.value)} required />
                <Button type="submit" loading={postingThread} disabled={!firebaseUser} leftIcon={<Send size={14} />}>
                  {firebaseUser ? "Post Question" : "Sign in to post"}
                </Button>
              </form>
            </div>
            <div className="lg:col-span-7 space-y-3">
              {!discussions || discussions.length === 0 ? (
                <EmptyState icon={<MessageSquare size={22} />} title="No questions yet" />
              ) : (
                discussions.map((t) => (
                  <div key={t.id} className="card p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-display font-bold text-base text-slate-900">{t.title}</h4>
                        <p className="text-xs text-slate-500">
                          {t.authorName} · {formatInZone(toDate(t.createdAt), localTz)}
                        </p>
                      </div>
                      <Button variant="secondary" size="sm" onClick={() => setActiveThreadId(activeThreadId === t.id ? null : t.id)}>
                        {t.replyCount} replies
                      </Button>
                    </div>
                    <p className="text-sm text-slate-700">{t.body}</p>

                    {activeThreadId === t.id && (
                      <div className="pt-3 border-t border-slate-100 space-y-2.5">
                        {(replies ?? []).map((r) => (
                          <div key={r.id} className="p-3 rounded-xl bg-slate-50 text-xs space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{r.authorName}</span>
                              {r.isOrganizer && <span className="badge-violet text-[10px]">Organizer</span>}
                            </div>
                            <p className="text-slate-700">{r.body}</p>
                          </div>
                        ))}
                        {firebaseUser && (
                          <div className="flex gap-2 pt-1">
                            <Input
                              placeholder="Write a reply..."
                              value={replyText[t.id] ?? ""}
                              onChange={(e) => setReplyText((p) => ({ ...p, [t.id]: e.target.value }))}
                            />
                            <Button size="sm" onClick={() => void sendReply(t.id)}>
                              Reply
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {tab === "gallery" && (
          <div>
            {!submissions || submissions.length === 0 ? (
              <EmptyState title="No public project submissions yet" description="Submitted projects appear here in real time." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {submissions.map((s) => (
                  <Link key={s.id} href={`/projects?highlight=${s.projectId}`} className="card-hover p-5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge status={s.status} />
                      {s.finalScore != null && <span className="text-xs font-bold text-[#1565D8]">Score: {s.finalScore}</span>}
                    </div>
                    <h3 className="font-display font-bold text-base text-slate-900">{(s as unknown as { projectTitle?: string }).projectTitle || "Project"}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2">{(s as unknown as { projectTagline?: string }).projectTagline}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1565D8] pt-1">
                      <Heart size={12} /> View project <ExternalLink size={11} />
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "rules" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h2 className="font-display font-bold text-lg text-slate-900 mb-3">Rules &amp; Guidelines</h2>
              <Markdown content={h.rules} />
            </div>
            <div className="card p-6 space-y-4">
              <h2 className="font-display font-bold text-lg text-slate-900">FAQs</h2>
              {(h.faq ?? []).length === 0 ? (
                <p className="text-sm text-slate-500">No FAQs added yet.</p>
              ) : (
                h.faq!.map((f) => (
                  <div key={f.id} className="pb-3 border-b last:border-0 border-slate-100">
                    <p className="font-semibold text-sm text-slate-900">{f.question}</p>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">{f.answer}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

