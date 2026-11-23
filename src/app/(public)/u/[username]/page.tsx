"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { collection, doc, limit, orderBy, query, where } from "firebase/firestore";
import { Award, Code2, ExternalLink, MapPin, Trophy, UserPlus } from "lucide-react";
import { clientDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLiveDoc, useLiveQuery } from "@/lib/data/live";
import { api } from "@/lib/api-client";
import { Avatar, Button, EmptyState, NotConfigured, Skeleton, useToast } from "@/components/ui";
import type { Certificate, Follow, Project, UserProfile } from "@/types";

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { firebaseUser, notConfigured } = useAuth();
  const toast = useToast();

  const { data: profiles, isLoading } = useLiveQuery<UserProfile>(
    ["profile", username],
    username ? () => query(collection(clientDb(), COLLECTIONS.USER_PROFILES), where("username", "==", username), limit(1)) : null
  );
  const profile = profiles?.[0];

  const { data: follow } = useLiveDoc<Follow>(
    ["follow", firebaseUser?.uid ?? null, profile?.uid ?? null],
    firebaseUser?.uid && profile?.uid ? () => doc(clientDb(), COLLECTIONS.FOLLOWS, `${firebaseUser.uid}_${profile.uid}`) : null
  );

  const { data: projects } = useLiveQuery<Project>(
    ["profile-projects", profile?.uid ?? null],
    profile?.uid
      ? () =>
          query(
            collection(clientDb(), COLLECTIONS.PROJECTS),
            where("memberIds", "array-contains", profile.uid),
            where("isPublic", "==", true),
            orderBy("updatedAt", "desc")
          )
      : null
  );

  const { data: certs } = useLiveQuery<Certificate>(
    ["profile-certs", profile?.uid ?? null],
    profile?.uid
      ? () => query(collection(clientDb(), COLLECTIONS.CERTIFICATES), where("userId", "==", profile.uid), orderBy("issuedAt", "desc"))
      : null
  );

  if (notConfigured) {
    return (
      <div className="container-app py-10">
        <NotConfigured service="Firestore" />
      </div>
    );
  }
  if (isLoading) return <div className="container-app py-10"><Skeleton className="h-64 rounded-2xl" /></div>;
  if (!profile) {
    return (
      <div className="container-app py-12 max-w-xl">
        <EmptyState title="Builder not found" description={`No public profile found for @${username}.`} action={<Button href="/builders">Browse Builders</Button>} />
      </div>
    );
  }

  async function toggleFollow() {
    if (!firebaseUser || !profile) {
      toast.info("Sign in to follow builders");
      return;
    }
    try {
      await api("/api/follows", { method: "POST", body: { targetId: profile.uid, targetType: "user" } });
    } catch (e) {
      toast.error("Couldn't follow", e instanceof Error ? e.message : undefined);
    }
  }

  return (
    <div className="container-app py-8 sm:py-10 max-w-5xl space-y-6">
      {/* Header Card */}
      <div className="card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <Avatar name={profile.displayName} src={profile.photoURL} size="xl" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">{profile.displayName}</h1>
              {profile.lookingForTeam && <span className="badge-green">Looking for team</span>}
            </div>
            <p className="text-sm text-slate-500">@{profile.username}</p>
            {(profile.college || profile.country) && (
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <MapPin size={12} /> {[profile.college, profile.country].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {firebaseUser?.uid !== profile.uid && (
            <Button variant={follow ? "secondary" : "primary"} size="sm" onClick={toggleFollow} leftIcon={<UserPlus size={14} />}>
              {follow ? "Following" : "Follow"}
            </Button>
          )}
          {(profile.socialLinks ?? []).map((s) => (
            <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm capitalize">
              {s.platform} <ExternalLink size={12} />
            </a>
          ))}
        </div>
      </div>

      {profile.bio && (
        <div className="card p-5">
          <p className="text-sm text-slate-700 leading-relaxed">{profile.bio}</p>
        </div>
      )}

      {(profile.skills?.length ?? 0) > 0 && (
        <div className="card p-5 space-y-2">
          <h2 className="font-display font-bold text-sm uppercase tracking-wider text-slate-500">Skills &amp; Stack</h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((s) => (
              <span key={s} className="px-3 py-1 rounded-xl bg-[#EEF4FF] text-[#1565D8] text-xs font-semibold">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5 space-y-3">
          <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
            <Code2 size={17} className="text-[#1565D8]" /> Published Projects ({projects?.length ?? 0})
          </h2>
          {!projects || projects.length === 0 ? (
            <p className="text-xs text-slate-500">No public projects yet.</p>
          ) : (
            <div className="space-y-2.5">
              {projects.map((p) => (
                <Link key={p.id} href={`/projects?highlight=${p.id}`} className="block p-3.5 rounded-xl bg-slate-50 hover:bg-[#EEF4FF]/50 border border-slate-200 transition-colors">
                  <p className="font-semibold text-sm text-slate-900">{p.title}</p>
                  {p.tagline && <p className="text-xs text-slate-600 mt-0.5">{p.tagline}</p>}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5 space-y-3">
          <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
            <Award size={17} className="text-[#1565D8]" /> Verified Certificates ({certs?.length ?? 0})
          </h2>
          {!certs || certs.length === 0 ? (
            <p className="text-xs text-slate-500">No certificates issued yet.</p>
          ) : (
            <div className="space-y-2.5">
              {certs.map((c) => (
                <Link key={c.id} href={`/verify/${c.serialNumber}`} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-[#EEF4FF]/50 border border-slate-200 transition-colors">
                  <div>
                    <p className="font-semibold text-sm text-slate-900">{c.hackathonName}</p>
                    <p className="text-xs text-slate-500 capitalize">{c.type.replace(/_/g, " ")}</p>
                  </div>
                  <Trophy size={16} className="text-amber-500 shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

