"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { addDoc, collection, limit, orderBy, query, serverTimestamp, where } from "firebase/firestore";
import { MessageSquare, Send, Users } from "lucide-react";
import { clientDb, firebaseReady } from "@/lib/firebase/client";
import { COLLECTIONS, SUB } from "@/lib/firebase/collections";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLiveQuery } from "@/lib/data/live";
import { formatInZone, toDate, type DateLike } from "@/lib/domain/dates";
import { Avatar, Button, CardSkeleton, EmptyState, NotConfigured, PageHeader, useToast } from "@/components/ui";
import type { TeamWithEvent } from "@/types";

type TeamMessage = {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string | null;
  body: string;
  createdAt: DateLike;
};

function MessagesInner() {
  const { firebaseUser, user, notConfigured } = useAuth();
  const params = useSearchParams();
  const toast = useToast();
  const uid = firebaseUser?.uid;
  const ready = Boolean(uid && firebaseReady());

  const [selectedTeamId, setSelectedTeamId] = useState(params.get("teamId") ?? "");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: teams, isLoading: teamsLoading } = useLiveQuery<TeamWithEvent>(
    ["chat-teams", uid ?? null],
    ready ? () => query(collection(clientDb(), COLLECTIONS.TEAMS), where("memberIds", "array-contains", uid), orderBy("createdAt", "desc")) : null
  );

  useEffect(() => {
    const paramId = params.get("teamId");
    if (paramId) setSelectedTeamId(paramId);
    else if (!selectedTeamId && teams && teams.length > 0) setSelectedTeamId(teams[0].id);
  }, [params, teams, selectedTeamId]);

  const activeTeam = (teams ?? []).find((t) => t.id === selectedTeamId) ?? teams?.[0] ?? null;

  const { data: messages } = useLiveQuery<TeamMessage>(
    ["team-messages", activeTeam?.id ?? null],
    activeTeam && firebaseReady()
      ? () => query(collection(clientDb(), COLLECTIONS.TEAMS, activeTeam.id, SUB.MESSAGES), orderBy("createdAt", "asc"), limit(120))
      : null
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!activeTeam || !uid || !firebaseReady() || !text.trim()) return;
    setSending(true);
    try {
      await addDoc(collection(clientDb(), COLLECTIONS.TEAMS, activeTeam.id, SUB.MESSAGES), {
        senderId: uid,
        senderName: user?.displayName || firebaseUser?.displayName || "Builder",
        senderPhoto: user?.photoURL ?? firebaseUser?.photoURL ?? null,
        body: text.trim().slice(0, 4000),
        createdAt: serverTimestamp(),
      });
      setText("");
    } catch (err) {
      toast.error("Couldn't send message", err instanceof Error ? err.message : undefined);
    } finally {
      setSending(false);
    }
  }

  if (notConfigured) return <NotConfigured service="Firestore" />;

  return (
    <div className="space-y-5 pb-8">
      <PageHeader
        title="Team Messages"
        description="Real-time team channels synced across all your devices."
        actions={
          <Button variant="secondary" href="/dashboard/teams" leftIcon={<Users size={16} />}>
            Manage Teams
          </Button>
        }
      />

      {teamsLoading ? (
        <CardSkeleton />
      ) : !teams || teams.length === 0 ? (
        <EmptyState
          icon={<MessageSquare size={22} />}
          title="No team channels yet"
          description="Create or join a team in any hackathon to unlock real-time team chat."
          action={<Button href="/dashboard/teams">Go to Teams</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Channel Switcher: Horizontal pills on mobile, Sidebar on lg+ */}
          <div className="lg:col-span-4 card p-3 space-y-1.5">
            <p className="px-2.5 pt-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Your Team Channels</p>
            <div className="flex lg:flex-col gap-1.5 overflow-x-auto scrollbar-none pb-1 lg:pb-0">
              {teams.map((t) => {
                const active = activeTeam?.id === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTeamId(t.id)}
                    className={`shrink-0 lg:w-full text-left px-3.5 py-2.5 rounded-xl transition-colors min-h-[44px] ${
                      active ? "bg-[#EEF4FF] text-[#1565D8]" : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <p className="font-semibold text-sm truncate">{t.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{t.hackathonName || "Hackathon Team"}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Chat Stream */}
          <div className="lg:col-span-8 card flex flex-col h-[520px] sm:h-[580px] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-2 bg-slate-50/60">
              <div>
                <h2 className="font-display font-bold text-base text-slate-900">{activeTeam?.name}</h2>
                <p className="text-xs text-slate-500">{activeTeam?.memberIds.length} members · Live Firestore Sync</p>
              </div>
              <span className="badge-green text-[11px]">Live</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
              {!messages || messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center text-sm text-slate-400">
                  No messages yet. Say hello to your teammates!
                </div>
              ) : (
                messages.map((m) => {
                  const mine = m.senderId === uid;
                  return (
                    <div key={m.id} className={`flex items-end gap-2.5 ${mine ? "flex-row-reverse" : ""}`}>
                      <Avatar name={m.senderName} src={m.senderPhoto} size="sm" />
                      <div
                        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm ${
                          mine ? "bg-[#1565D8] text-white rounded-br-sm" : "bg-slate-100 text-slate-800 rounded-bl-sm"
                        }`}
                      >
                        {!mine && <p className="text-[11px] font-bold text-[#1565D8] mb-0.5">{m.senderName}</p>}
                        <p className="whitespace-pre-wrap break-words leading-relaxed">{m.body}</p>
                        <p className={`text-[10px] mt-1 ${mine ? "text-blue-100" : "text-slate-400"}`}>
                          {formatInZone(toDate(m.createdAt), undefined, { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={sendMessage} className="p-3 sm:p-4 border-t border-slate-100 flex items-center gap-2 bg-white">
              <input
                className="input flex-1"
                placeholder={`Message ${activeTeam?.name ?? "team"}...`}
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={4000}
              />
              <Button type="submit" loading={sending} disabled={!text.trim()} leftIcon={<Send size={15} />}>
                Send
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<CardSkeleton />}>
      <MessagesInner />
    </Suspense>
  );
}
