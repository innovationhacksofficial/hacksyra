"use client";

import Link from "next/link";
import { collection, limit, orderBy, query, where } from "firebase/firestore";
import {
  Award,
  Calendar,
  Code2,
  Compass,
  FolderGit2,
  MailCheck,
  Send,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";
import { sendEmailVerification } from "firebase/auth";
import { useState } from "react";
import { clientAuth, clientDb, firebaseReady } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLiveQuery } from "@/lib/data/live";
import { useListedHackathons, useNotifications } from "@/lib/data/hooks";
import { formatInZone, toDate } from "@/lib/domain/dates";
import { HackathonCard } from "@/components/hackathons/HackathonCard";
import {
  AnimatedNumber,
  Button,
  CardSkeleton,
  EmptyState,
  NotConfigured,
  PageHeader,
  StatCard,
  StatSkeleton,
  StatusBadge,
  useToast,
} from "@/components/ui";
import type { Certificate, Project, Registration, Submission, TeamWithEvent } from "@/types";

export default function ParticipantOverviewPage() {
  const { firebaseUser, user, notConfigured } = useAuth();
  const toast = useToast();
  const uid = firebaseUser?.uid;
  const ready = Boolean(uid && firebaseReady());
  const [sendingVerify, setSendingVerify] = useState(false);

  const { data: registrations, isLoading: regsLoading } = useLiveQuery<Registration>(
    ["dash-regs", uid ?? null],
    ready ? () => query(collection(clientDb(), COLLECTIONS.REGISTRATIONS), where("userId", "==", uid), orderBy("createdAt", "desc"), limit(10)) : null
  );

  const { data: teams } = useLiveQuery<TeamWithEvent>(
    ["dash-teams", uid ?? null],
    ready ? () => query(collection(clientDb(), COLLECTIONS.TEAMS), where("memberIds", "array-contains", uid), orderBy("createdAt", "desc"), limit(10)) : null
  );

  const { data: projects } = useLiveQuery<Project>(
    ["dash-projects", uid ?? null],
    ready ? () => query(collection(clientDb(), COLLECTIONS.PROJECTS), where("memberIds", "array-contains", uid), orderBy("updatedAt", "desc"), limit(10)) : null
  );

  const { data: submissions } = useLiveQuery<Submission>(
    ["dash-subs", uid ?? null],
    ready ? () => query(collection(clientDb(), COLLECTIONS.SUBMISSIONS), where("memberIds", "array-contains", uid), orderBy("updatedAt", "desc"), limit(10)) : null
  );

  const { data: certificates } = useLiveQuery<Certificate>(
    ["dash-certs", uid ?? null],
    ready ? () => query(collection(clientDb(), COLLECTIONS.CERTIFICATES), where("userId", "==", uid), orderBy("issuedAt", "desc"), limit(10)) : null
  );

  const { data: notifications } = useNotifications(uid, 6);
  const { data: listedHackathons, isLoading: listedLoading } = useListedHackathons({ limit: 3 });

  if (notConfigured) return <NotConfigured service="Firebase" />;

  const activeRegs = (registrations ?? []).filter((r) => r.status !== "cancelled" && r.status !== "rejected");
  const unreadCount = (notifications ?? []).filter((n) => !n.isRead).length;

  async function resendVerification() {
    const fb = clientAuth().currentUser;
    if (!fb) return;
    setSendingVerify(true);
    try {
      await sendEmailVerification(fb);
      toast.success("Verification email sent", "Check your inbox and click the link.");
    } catch (e) {
      toast.error("Couldn't send email", e instanceof Error ? e.message : undefined);
    } finally {
      setSendingVerify(false);
    }
  }

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title={`Welcome back, ${user?.displayName || firebaseUser?.displayName || "Builder"}`}
        description="Track your registered hackathons, team activity, project submissions, and certificates in real time."
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button variant="secondary" href="/hackathons" leftIcon={<Compass size={16} />}>
              Explore Hackathons
            </Button>
            <Button href="/dashboard/projects" leftIcon={<Code2 size={16} />}>
              New Project
            </Button>
          </div>
        }
      />

      {/* Verification / Onboarding Banners */}
      {firebaseUser && !firebaseUser.emailVerified && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <MailCheck size={20} className="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-900">Verify your email address</p>
              <p className="text-xs text-amber-800">Verified accounts unlock instant registrations, team invites, and hosting.</p>
            </div>
          </div>
          <Button size="sm" variant="secondary" loading={sendingVerify} onClick={() => void resendVerification()}>
            Resend Verification
          </Button>
        </div>
      )}

      {user && (!user.skills?.length || !user.bio) && (
        <div className="rounded-2xl border border-[#B3D1FF] bg-[#EEF4FF] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Sparkles size={20} className="text-[#1565D8] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-slate-900">Complete your builder profile</p>
              <p className="text-xs text-slate-600">Add your skills, bio, and GitHub link so teams can discover you.</p>
            </div>
          </div>
          <Button size="sm" href="/dashboard/settings">
            Update Profile
          </Button>
        </div>
      )}

      {/* KPI Grid */}
      {regsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Registered Events" value={<AnimatedNumber value={activeRegs.length} />} icon={<Calendar size={18} />} tone="blue" />
          <StatCard label="My Teams" value={<AnimatedNumber value={(teams ?? []).length} />} icon={<Users size={18} />} tone="green" />
          <StatCard label="Projects & Submissions" value={<AnimatedNumber value={(projects ?? []).length} />} hint={`${(submissions ?? []).length} submitted`} icon={<FolderGit2 size={18} />} tone="violet" />
          <StatCard label="Certificates" value={<AnimatedNumber value={(certificates ?? []).length} />} hint={unreadCount ? `${unreadCount} unread alerts` : "All caught up"} icon={<Award size={18} />} tone="amber" />
        </div>
      )}

      {/* Active Hackathons + Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-slate-900">Your Active Hackathons</h2>
            <Link href="/dashboard/hackathons" className="text-xs font-semibold text-[#1565D8] hover:underline">
              View all
            </Link>
          </div>

          {regsLoading ? (
            <CardSkeleton />
          ) : activeRegs.length === 0 ? (
            <EmptyState
              icon={<Calendar size={22} />}
              title="You haven't joined any hackathons yet"
              description="Discover upcoming events, win cash prizes, and ship projects with builders worldwide."
              action={<Button href="/hackathons">Browse Hackathons</Button>}
            />
          ) : (
            <div className="space-y-3">
              {activeRegs.slice(0, 4).map((r) => (
                <div key={r.id} className="card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/hackathons/${r.hackathonSlug}`} className="font-display font-bold text-base text-slate-900 hover:text-[#1565D8] truncate">
                        {r.hackathonName}
                      </Link>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-xs text-slate-500">
                      Registered {formatInZone(toDate(r.createdAt))} · {r.teamId ? "In a team" : "Individual"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <Button variant="secondary" size="sm" href="/dashboard/tickets" leftIcon={<Ticket size={14} />}>
                      Ticket
                    </Button>
                    <Button size="sm" href={`/dashboard/submissions?hackathonId=${r.hackathonId}`} leftIcon={<Send size={14} />}>
                      Submit Project
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Teams & Submissions Summary */}
          {(teams ?? []).length > 0 && (
            <div className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-base text-slate-900">Your Teams</h3>
                <Link href="/dashboard/teams" className="text-xs font-semibold text-[#1565D8] hover:underline">
                  Manage teams
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(teams ?? []).slice(0, 4).map((t) => (
                  <Link key={t.id} href={`/dashboard/messages?teamId=${t.id}`} className="rounded-xl border border-slate-200 p-3.5 hover:border-[#1565D8] transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm text-slate-900 truncate">{t.name}</span>
                      <span className="badge-blue text-[11px]">{t.memberIds.length}/{t.maxSize}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-1">{t.hackathonName || "Hackathon team"} · Open chat</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications + Host CTA */}
        <div className="lg:col-span-4 space-y-4">
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-base text-slate-900">Recent Updates</h2>
              <Link href="/dashboard/notifications" className="text-xs font-semibold text-[#1565D8] hover:underline">
                All ({(notifications ?? []).length})
              </Link>
            </div>
            {!notifications || notifications.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No notifications yet.</p>
            ) : (
              <div className="space-y-2.5">
                {notifications.slice(0, 4).map((n) => (
                  <Link
                    key={n.id}
                    href={n.linkUrl || "/dashboard/notifications"}
                    className={`block rounded-xl p-3 border text-xs transition-colors ${
                      n.isRead ? "bg-slate-50/70 border-slate-100" : "bg-[#EEF4FF]/60 border-[#B3D1FF]"
                    }`}
                  >
                    <p className="font-semibold text-slate-900 line-clamp-1">{n.title}</p>
                    <p className="text-slate-600 line-clamp-2 mt-0.5">{n.message}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{formatInZone(toDate(n.createdAt))}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="card p-5 bg-gradient-to-br from-[#EEF4FF] to-white border-[#B3D1FF] space-y-2.5">
            <h3 className="font-display font-bold text-base text-slate-900">Want to host an event?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Launch your hackathon in minutes with built-in registrations, QR check-in, Razorpay ticketing, judging rubrics, and certificates.
            </p>
            <Button size="sm" href="/organizer/create" className="w-full">
              Host a Hackathon
            </Button>
          </div>
        </div>
      </div>

      {/* Recommended Live Hackathons */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-slate-900">Recommended Live Hackathons</h2>
          <Link href="/hackathons" className="text-xs font-semibold text-[#1565D8] hover:underline">
            Explore directory
          </Link>
        </div>
        {listedLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : listedHackathons && listedHackathons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {listedHackathons.map((h) => (
              <HackathonCard key={h.id} hackathon={h} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
