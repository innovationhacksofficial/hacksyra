"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { collection, orderBy, query } from "firebase/firestore";
import { Mail, Megaphone, Pin, Send } from "lucide-react";
import { clientDb, firebaseReady } from "@/lib/firebase/client";
import { COLLECTIONS, SUB } from "@/lib/firebase/collections";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLiveQuery } from "@/lib/data/live";
import { useMyHackathons } from "@/lib/data/hooks";
import { api } from "@/lib/api-client";
import { formatInZone, toDate, type DateLike } from "@/lib/domain/dates";
import { Markdown } from "@/components/common/Markdown";
import { Button, CardSkeleton, EmptyState, Input, NotConfigured, PageHeader, Textarea, useToast } from "@/components/ui";

type AnnouncementDoc = {
  id: string;
  title: string;
  body: string;
  pinned?: boolean;
  emailed?: boolean;
  createdAt?: DateLike;
};

function AnnouncementsInner() {
  const { firebaseUser, notConfigured } = useAuth();
  const params = useSearchParams();
  const toast = useToast();

  const { data: events } = useMyHackathons(firebaseUser?.uid);
  const [hackathonId, setHackathonId] = useState(params.get("hackathonId") ?? "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!hackathonId && events && events.length > 0) setHackathonId(events[0].id);
  }, [events, hackathonId]);

  const { data: announcements, isLoading } = useLiveQuery<AnnouncementDoc>(
    ["org-announcements", hackathonId || null],
    hackathonId && firebaseReady()
      ? () => query(collection(clientDb(), COLLECTIONS.HACKATHONS, hackathonId, SUB.ANNOUNCEMENTS), orderBy("createdAt", "desc"))
      : null
  );

  async function publish(e: React.FormEvent) {
    e.preventDefault();
    if (!hackathonId || !title.trim() || !body.trim()) return;
    setPosting(true);
    try {
      const res = await api<{ notified: number }>(`/api/organizer/hackathons/${hackathonId}/announcements`, {
        method: "POST",
        body: { title: title.trim(), body: body.trim(), pinned, sendEmail },
      });
      toast.success("Announcement posted!", `Notified ${res.notified} participants.`);
      setTitle("");
      setBody("");
      setPinned(false);
    } catch (err) {
      toast.error("Couldn't post announcement", err instanceof Error ? err.message : undefined);
    } finally {
      setPosting(false);
    }
  }

  if (notConfigured) return <NotConfigured service="Firestore" />;

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Announcements & Blasts"
        description="Broadcast schedule changes, judging updates, and deadlines directly to registered participants."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form onSubmit={publish} className="lg:col-span-5 card p-5 sm:p-6 space-y-4">
          <div className="form-field">
            <label className="label">Hackathon *</label>
            <select className="input" value={hackathonId} onChange={(e) => setHackathonId(e.target.value)} required>
              {(events ?? []).map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name || "Untitled"}
                </option>
              ))}
            </select>
          </div>
          <Input label="Headline *" required minLength={3} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Mentor office hours starting in 30 mins" />
          <Textarea label="Message (Markdown supported) *" required minLength={5} rows={5} value={body} onChange={(e) => setBody(e.target.value)} />

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="rounded border-slate-300" />
              <Pin size={14} className="text-[#1565D8]" /> Pin to top of event updates
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} className="rounded border-slate-300" />
              <Mail size={14} className="text-[#1565D8]" /> Email all confirmed &amp; waitlisted participants
            </label>
          </div>

          <Button type="submit" loading={posting} disabled={!hackathonId} leftIcon={<Send size={15} />} className="w-full">
            Publish Announcement
          </Button>
        </form>

        <div className="lg:col-span-7 space-y-3">
          <h2 className="font-display font-bold text-lg text-slate-900">Published Updates</h2>
          {isLoading ? (
            <CardSkeleton />
          ) : !announcements || announcements.length === 0 ? (
            <EmptyState icon={<Megaphone size={22} />} title="No announcements yet" description="Post your first update on the left to notify attendees instantly." />
          ) : (
            announcements.map((a) => (
              <div key={a.id} className="card p-5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display font-bold text-base text-slate-900">{a.title}</h3>
                  <div className="flex items-center gap-1.5">
                    {a.pinned && <span className="badge-blue"><Pin size={11} /> Pinned</span>}
                    {a.emailed && <span className="badge-green">Emailed</span>}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">{formatInZone(toDate(a.createdAt))}</p>
                <Markdown content={a.body} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrganizerAnnouncementsPage() {
  return (
    <Suspense fallback={<CardSkeleton />}>
      <AnnouncementsInner />
    </Suspense>
  );
}
