"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { collection, doc, orderBy, query, where } from "firebase/firestore";
import { Crown, KeyRound, LogOut, Mail, MessageSquare, Plus, UserPlus, Users } from "lucide-react";
import { clientDb, firebaseReady } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLiveDoc, useLiveQuery } from "@/lib/data/live";
import { api } from "@/lib/api-client";
import {
  Button,
  CardSkeleton,
  ConfirmDialog,
  CopyButton,
  EmptyState,
  Input,
  Modal,
  NotConfigured,
  PageHeader,
  StatusBadge,
  Tabs,
  Textarea,
  useToast,
} from "@/components/ui";
import type { Registration, TeamInvitation, TeamWithEvent } from "@/types";

function TeamSecretCode({ teamId }: { teamId: string }) {
  const { data: meta } = useLiveDoc<{ inviteCode?: string }>(
    ["team-meta", teamId],
    firebaseReady() ? () => doc(clientDb(), COLLECTIONS.TEAMS, teamId, "private", "meta") : null
  );
  if (!meta?.inviteCode) return null;
  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
      <div>
        <span className="text-slate-500 mr-1.5">Invite code:</span>
        <span className="font-mono font-bold text-[#1565D8] tracking-wider">{meta.inviteCode}</span>
      </div>
      <CopyButton value={meta.inviteCode} label="Copy" />
    </div>
  );
}

function TeamsInner() {
  const { firebaseUser, notConfigured } = useAuth();
  const params = useSearchParams();
  const toast = useToast();
  const uid = firebaseUser?.uid;
  const email = (firebaseUser?.email ?? "").toLowerCase();
  const ready = Boolean(uid && firebaseReady());

  const [tab, setTab] = useState("my");
  const [joinCode, setJoinCode] = useState(params.get("code") ?? "");
  const [joining, setJoining] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [hackathonId, setHackathonId] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamDesc, setTeamDesc] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [looking, setLooking] = useState(true);
  const [creating, setCreating] = useState(false);

  const [inviteTeam, setInviteTeam] = useState<TeamWithEvent | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  const [leavingTeam, setLeavingTeam] = useState<TeamWithEvent | null>(null);
  const [leaving, setLeaving] = useState(false);

  const [transferTeam, setTransferTeam] = useState<TeamWithEvent | null>(null);
  const [newCaptainId, setNewCaptainId] = useState("");
  const [transferring, setTransferring] = useState(false);

  useEffect(() => {
    const codeParam = params.get("code");
    if (codeParam) setJoinCode(codeParam);
  }, [params]);

  const { data: myTeams, isLoading: teamsLoading } = useLiveQuery<TeamWithEvent>(
    ["my-teams", uid ?? null],
    ready ? () => query(collection(clientDb(), COLLECTIONS.TEAMS), where("memberIds", "array-contains", uid), orderBy("createdAt", "desc")) : null
  );

  const { data: myRegs } = useLiveQuery<Registration>(
    ["my-regs-for-teams", uid ?? null],
    ready ? () => query(collection(clientDb(), COLLECTIONS.REGISTRATIONS), where("userId", "==", uid), orderBy("createdAt", "desc")) : null
  );

  const { data: myInvites } = useLiveQuery<TeamInvitation>(
    ["my-invites", email],
    ready && email ? () => query(collection(clientDb(), COLLECTIONS.TEAM_INVITATIONS), where("inviteeEmail", "==", email)) : null
  );

  const eligibleRegs = (myRegs ?? []).filter((r) => ["confirmed", "checked_in"].includes(r.status) && !r.teamId);
  const pendingInvites = (myInvites ?? []).filter((i) => i.status === "pending");

  async function handleJoinByCode(codeToUse: string) {
    if (!codeToUse.trim()) return;
    setJoining(true);
    try {
      await api("/api/teams/join", { method: "POST", body: { inviteCode: codeToUse.trim().toUpperCase() } });
      toast.success("Joined team!");
      setJoinCode("");
    } catch (e) {
      toast.error("Couldn't join team", e instanceof Error ? e.message : undefined);
    } finally {
      setJoining(false);
    }
  }

  async function handleCreateTeam(e: React.FormEvent) {
    e.preventDefault();
    if (!hackathonId || !teamName.trim()) {
      toast.error("Select a hackathon and enter a team name");
      return;
    }
    setCreating(true);
    try {
      await api("/api/teams/create", {
        method: "POST",
        body: {
          hackathonId,
          name: teamName.trim(),
          description: teamDesc.trim() || undefined,
          skills: skillsInput.split(",").map((s) => s.trim()).filter(Boolean),
          isLookingForMembers: looking,
        },
      });
      toast.success("Team created!", "Share the invite code with teammates.");
      setCreateOpen(false);
      setTeamName("");
      setTeamDesc("");
      setSkillsInput("");
    } catch (e) {
      toast.error("Couldn't create team", e instanceof Error ? e.message : undefined);
    } finally {
      setCreating(false);
    }
  }

  async function handleSendInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteTeam || !inviteEmail.trim()) return;
    setInviting(true);
    try {
      await api(`/api/teams/${inviteTeam.id}/invite`, { method: "POST", body: { email: inviteEmail.trim() } });
      toast.success("Invitation emailed", `Sent to ${inviteEmail.trim()}`);
      setInviteEmail("");
      setInviteTeam(null);
    } catch (e) {
      toast.error("Couldn't invite", e instanceof Error ? e.message : undefined);
    } finally {
      setInviting(false);
    }
  }

  async function handleLeave() {
    if (!leavingTeam) return;
    setLeaving(true);
    try {
      await api(`/api/teams/${leavingTeam.id}/leave`, { method: "POST", body: {} });
      toast.success("Left team");
      setLeavingTeam(null);
    } catch (e) {
      toast.error("Couldn't leave team", e instanceof Error ? e.message : undefined);
    } finally {
      setLeaving(false);
    }
  }

  async function handleTransfer() {
    if (!transferTeam || !newCaptainId) return;
    setTransferring(true);
    try {
      await api(`/api/teams/${transferTeam.id}/transfer`, { method: "POST", body: { newCaptainId } });
      toast.success("Captaincy transferred");
      setTransferTeam(null);
      setNewCaptainId("");
    } catch (e) {
      toast.error("Couldn't transfer captaincy", e instanceof Error ? e.message : undefined);
    } finally {
      setTransferring(false);
    }
  }

  if (notConfigured) return <NotConfigured service="Firestore" />;

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Teams & Teammates"
        description="Create a team, join with an 8-character invite code, manage captaincy, and jump into live team chat."
        actions={
          <Button
            onClick={() => {
              setHackathonId(eligibleRegs[0]?.hackathonId ?? "");
              setCreateOpen(true);
            }}
            leftIcon={<Plus size={16} />}
          >
            Create Team
          </Button>
        }
      />

      {/* Join by Code Bar */}
      <div className="card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1">
          <Input
            label="Have a team invite code?"
            placeholder="Enter invite code (e.g. X9K2M4PQ)"
            leftAdornment={<KeyRound size={15} />}
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          />
        </div>
        <Button loading={joining} onClick={() => void handleJoinByCode(joinCode)} className="sm:mb-0.5">
          Join Team
        </Button>
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { id: "my", label: "My Teams", badge: (myTeams ?? []).length },
          { id: "invites", label: "Invitations", badge: pendingInvites.length },
        ]}
      />

      {tab === "my" ? (
        teamsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : !myTeams || myTeams.length === 0 ? (
          <EmptyState
            icon={<Users size={22} />}
            title="You aren't in any teams yet"
            description="Register for a hackathon first, then form your own team or enter a teammate's invite code above."
            action={
              eligibleRegs.length > 0 ? (
                <Button
                  onClick={() => {
                    setHackathonId(eligibleRegs[0].hackathonId);
                    setCreateOpen(true);
                  }}
                >
                  Create a Team
                </Button>
              ) : (
                <Button href="/hackathons">Browse Hackathons</Button>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {myTeams.map((t) => {
              const isCaptain = t.captainId === uid;
              return (
                <div key={t.id} className="card p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display font-bold text-lg text-slate-900">{t.name}</h3>
                          <StatusBadge status={t.status} />
                          {isCaptain && (
                            <span className="badge-amber">
                              <Crown size={11} /> Captain
                            </span>
                          )}
                        </div>
                        <Link href={`/hackathons/${t.hackathonSlug}`} className="text-xs font-semibold text-[#1565D8] hover:underline">
                          {t.hackathonName || "Hackathon"}
                        </Link>
                      </div>
                      <span className="badge-blue">{t.memberIds.length}/{t.maxSize} members</span>
                    </div>

                    {t.description && <p className="text-xs sm:text-sm text-slate-600">{t.description}</p>}

                    {(t.skills ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {t.skills.map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    <TeamSecretCode teamId={t.id} />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                    <Button size="sm" href={`/dashboard/messages?teamId=${t.id}`} leftIcon={<MessageSquare size={14} />}>
                      Team Chat
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setInviteTeam(t)} leftIcon={<UserPlus size={14} />}>
                      Invite
                    </Button>
                    {isCaptain && t.memberIds.length > 1 && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setTransferTeam(t);
                          setNewCaptainId(t.memberIds.find((m) => m !== uid) ?? "");
                        }}
                        leftIcon={<Crown size={14} />}
                      >
                        Transfer
                      </Button>
                    )}
                    <Button variant="danger" size="sm" onClick={() => setLeavingTeam(t)} leftIcon={<LogOut size={14} />} className="ml-auto">
                      Leave
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : pendingInvites.length === 0 ? (
        <EmptyState icon={<Mail size={22} />} title="No pending invitations" description="When teammates invite your email address, invitations appear here live." />
      ) : (
        <div className="space-y-3">
          {pendingInvites.map((inv) => (
            <div key={inv.id} className="card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-display font-bold text-base text-slate-900">{inv.teamName}</p>
                <p className="text-xs text-slate-500">Invite code: <span className="font-mono font-semibold">{inv.inviteCode}</span></p>
              </div>
              <Button size="sm" loading={joining} onClick={() => void handleJoinByCode(inv.inviteCode || "")}>
                Accept &amp; Join
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create a Hackathon Team">
        <form onSubmit={handleCreateTeam} className="space-y-4">
          {eligibleRegs.length === 0 ? (
            <EmptyState
              title="No solo registrations available"
              description="Register for a hackathon (or leave an existing team in that hackathon) before forming a new team."
              action={<Button href="/hackathons">Explore Hackathons</Button>}
            />
          ) : (
            <>
              <div className="form-field">
                <label className="label">Hackathon *</label>
                <select className="input" value={hackathonId} onChange={(e) => setHackathonId(e.target.value)} required>
                  {eligibleRegs.map((r) => (
                    <option key={r.id} value={r.hackathonId}>
                      {r.hackathonName}
                    </option>
                  ))}
                </select>
              </div>
              <Input label="Team Name *" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="e.g. Pixel Forge" required />
              <Textarea label="What are you building? (optional)" rows={3} value={teamDesc} onChange={(e) => setTeamDesc(e.target.value)} />
              <Input
                label="Needed Skills (comma separated)"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="React, Python, UI/UX"
              />
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input type="checkbox" checked={looking} onChange={(e) => setLooking(e.target.checked)} className="rounded border-slate-300" />
                Show team as open / looking for members
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" type="button" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={creating}>
                  Create Team
                </Button>
              </div>
            </>
          )}
        </form>
      </Modal>

      {/* Invite Modal */}
      <Modal open={!!inviteTeam} onClose={() => setInviteTeam(null)} title={`Invite teammate to ${inviteTeam?.name}`}>
        <form onSubmit={handleSendInvite} className="space-y-4">
          <Input
            label="Teammate's Email *"
            type="email"
            required
            placeholder="teammate@example.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setInviteTeam(null)}>
              Cancel
            </Button>
            <Button type="submit" loading={inviting}>
              Send Invite
            </Button>
          </div>
        </form>
      </Modal>

      {/* Transfer Captain Modal */}
      <Modal open={!!transferTeam} onClose={() => setTransferTeam(null)} title="Transfer Team Captaincy">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Select the teammate UID who should become team captain before you leave or step down.</p>
          <select className="input" value={newCaptainId} onChange={(e) => setNewCaptainId(e.target.value)}>
            {(transferTeam?.memberIds ?? [])
              .filter((m) => m !== uid)
              .map((m) => (
                <option key={m} value={m}>
                  Member {m}
                </option>
              ))}
          </select>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setTransferTeam(null)}>
              Cancel
            </Button>
            <Button loading={transferring} onClick={() => void handleTransfer()}>
              Transfer Captaincy
            </Button>
          </div>
        </div>
      </Modal>

      {/* Leave Confirm */}
      <ConfirmDialog
        open={!!leavingTeam}
        onClose={() => setLeavingTeam(null)}
        onConfirm={handleLeave}
        loading={leaving}
        danger
        title={`Leave ${leavingTeam?.name ?? "team"}?`}
        message="If you are the captain with other members in the team, transfer captaincy first."
        confirmLabel="Leave Team"
      />
    </div>
  );
}

export default function MyTeamsPage() {
  return (
    <Suspense fallback={<CardSkeleton />}>
      <TeamsInner />
    </Suspense>
  );
}
