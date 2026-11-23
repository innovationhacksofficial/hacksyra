"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { collection, limit, orderBy, query, where } from "firebase/firestore";
import {
  Heart,
  Trophy,
  Users,
  ArrowRight,
  ChevronDown,
  Quote,
  MapPin,
  Sparkles,
  Code2,
} from "lucide-react";
import { clientDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useLiveQuery } from "@/lib/data/live";
import { Avatar, EmptyState, Skeleton } from "@/components/ui";
import { useAuth } from "@/components/providers/AuthProvider";
import type { Project, UserProfile } from "@/types";

const LOGOS = [
  { name: "Meta", src: "/logos/meta.svg" },
  { name: "Microsoft", src: "/logos/microsoft.svg" },
  { name: "Amazon", src: "/logos/amazon.svg" },
  { name: "IBM", src: "/logos/ibm.svg" },
  { name: "Google", src: "/logos/google.svg" },
  { name: "Okta", src: "/logos/okta.svg" },
];

export function OrganizersMarquee() {
  const { data: collabs } = useLiveQuery<{ companyName: string; logoUrl?: string }>(
    ["collaborations"],
    () => query(collection(clientDb(), "collaborations"), orderBy("order", "asc"), limit(16))
  );

  const items = useMemo(() => {
    const list = collabs?.length ? collabs.map((c) => ({ name: c.companyName, src: c.logoUrl || "/logos/ih_logo.png" })) : LOGOS;
    return [...list, ...list, ...list];
  }, [collabs]);

  return (
    <section className="py-10 border-b border-slate-200/80 bg-white overflow-hidden">
      <div className="container-app mb-5 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Ecosystem &amp; Technology Stacks Built For
        </p>
      </div>
      <div className="relative overflow-hidden">
        <div className="marquee-track items-center gap-12 sm:gap-16 px-6">
          {items.map((item, idx) => (
            <div key={`${item.name}-${idx}`} className="flex items-center gap-2.5 opacity-75 hover:opacity-100 transition-opacity shrink-0">
              <Image src={item.src} alt={item.name} width={100} height={28} className="h-6 sm:h-7 w-auto object-contain" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LiveCommunityShowcase() {
  const { data: projects, isLoading: projLoading } = useLiveQuery<Project>(["home", "projects"], () =>
    query(
      collection(clientDb(), COLLECTIONS.PROJECTS),
      where("isPublic", "==", true),
      where("status", "==", "published"),
      orderBy("likesCount", "desc"),
      limit(6)
    )
  );

  const { data: builders, isLoading: buildersLoading } = useLiveQuery<UserProfile>(["home", "builders"], () =>
    query(
      collection(clientDb(), COLLECTIONS.USER_PROFILES),
      where("isPublic", "==", true),
      where("lookingForTeam", "==", true),
      limit(6)
    )
  );

  return (
    <section className="py-12 sm:py-16">
      <div className="container-app space-y-14">
        {/* Top Shipped Projects */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="section-tag">Project Gallery</span>
              <h2 className="section-title !mb-1">Shipped by the community</h2>
              <p className="text-sm sm:text-base text-slate-600">
                Real projects built at hackathons on HACKSYRA.
              </p>
            </div>
            <Link href="/projects" className="btn-secondary btn-sm self-start sm:self-auto">
              Explore all projects <ArrowRight size={14} />
            </Link>
          </div>

          {projLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-2xl" />
              ))}
            </div>
          ) : !projects || projects.length === 0 ? (
            <EmptyState
              icon={<Code2 size={22} />}
              title="No public projects published yet"
              description="Join an active hackathon and submit your project to showcase it here."
              action={
                <Link href="/hackathons" className="btn-primary btn-sm">
                  Find a hackathon
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((p) => (
                <Link key={p.id} href={`/projects?highlight=${p.id}`} className="card-hover p-5 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display font-bold text-base text-slate-900 line-clamp-1">{p.title}</h3>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 shrink-0">
                        <Heart size={13} /> {p.likesCount ?? 0}
                      </span>
                    </div>
                    {p.tagline && <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mt-1.5">{p.tagline}</p>}
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                    {(p.technologies ?? []).slice(0, 4).map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-md bg-[#EEF4FF] text-[#1565D8] text-[11px] font-semibold">
                        {t}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Looking for Teammates */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="section-tag">Team Finder</span>
              <h2 className="section-title !mb-1">Builders looking for a team</h2>
              <p className="text-sm sm:text-base text-slate-600">
                Connect with developers, designers, and ML engineers ready to ship.
              </p>
            </div>
            <Link href="/builders" className="btn-secondary btn-sm self-start sm:self-auto">
              Browse builder directory <ArrowRight size={14} />
            </Link>
          </div>

          {buildersLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-36 rounded-2xl" />
              ))}
            </div>
          ) : !builders || builders.length === 0 ? (
            <EmptyState
              icon={<Users size={22} />}
              title="No builders marked looking-for-team yet"
              description="Complete your profile or toggle 'Open to joining teams' in Settings to show up here."
              action={
                <Link href="/dashboard/settings" className="btn-secondary btn-sm">
                  Update profile availability
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {builders.map((b) => (
                <Link key={b.id} href={`/u/${b.username}`} className="card-hover p-4 sm:p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={b.displayName} src={b.photoURL} size="md" />
                    <div className="min-w-0">
                      <p className="font-display font-bold text-sm sm:text-base text-slate-900 truncate">{b.displayName}</p>
                      <p className="text-xs text-slate-500 truncate">
                        @{b.username}
                        {b.college ? ` · ${b.college}` : ""}
                      </p>
                    </div>
                  </div>
                  {b.bio && <p className="text-xs text-slate-600 line-clamp-2">{b.bio}</p>}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 mt-auto">
                    <div className="flex flex-wrap gap-1">
                      {(b.skills ?? []).slice(0, 3).map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                    {b.country && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 shrink-0">
                        <MapPin size={11} /> {b.country}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

type TestimonialDoc = { quote: string; authorName: string; authorRole: string; approved: boolean };

export function LiveTestimonials() {
  const { data } = useLiveQuery<TestimonialDoc>(["home", "testimonials"], () =>
    query(collection(clientDb(), COLLECTIONS.TESTIMONIALS), where("approved", "==", true), limit(6))
  );

  // Never show fake testimonials when none exist
  if (!data || data.length === 0) return null;

  return (
    <section className="py-12 bg-[#F8FAFC] border-t border-slate-200">
      <div className="container-app space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <span className="section-tag">Community Voices</span>
          <h2 className="section-title !mb-1">What organizers &amp; builders say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {data.map((t) => (
            <div key={t.id} className="card p-6 flex flex-col justify-between gap-4">
              <Quote size={20} className="text-[#1565D8]/50" />
              <p className="text-sm text-slate-700 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <div className="pt-3 border-t border-slate-100">
                <p className="text-sm font-bold text-slate-900">{t.authorName}</p>
                <p className="text-xs text-slate-500">{t.authorRole}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  {
    q: "Who can host a hackathon on HACKSYRA?",
    a: "Anyone with a verified account—college clubs, developer communities, startups, or enterprises. Click Host a Hackathon, complete the 9-step wizard, pay the small listing fee, and submit for quick admin approval.",
  },
  {
    q: "Why is there a small listing fee for organizers?",
    a: "The small listing fee keeps HACKSYRA free of spam and ensures every public hackathon is backed by a verified organizer before going live.",
  },
  {
    q: "How do paid hackathon registrations and payouts work?",
    a: "All ticket payments are processed securely through Razorpay in INR with server-side HMAC verification, atomic seat reservation, and QR tickets. Organizer ticket revenue is tracked transparently in your Payments console.",
  },
  {
    q: "How do deadlines and status transitions stay accurate?",
    a: "Every hackathon stores exact UTC timestamps alongside its event timezone. Automated background ticks and server-side deadline guards ensure registrations and submissions close strictly on time.",
  },
];

export function FaqAndFinalCta() {
  const { firebaseUser } = useAuth();
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const hostHref = firebaseUser ? "/organizer/create" : "/signup?role=organizer&next=/organizer/create";

  return (
    <section className="py-12 sm:py-16">
      <div className="container-app space-y-14">
        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <span className="section-tag">FAQ</span>
            <h2 className="section-title !mb-1">Frequently asked questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((item, idx) => {
              const open = openIdx === idx;
              return (
                <div key={item.q} className="card overflow-hidden">
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenIdx(open ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-display font-bold text-sm sm:text-base text-slate-900 hover:bg-slate-50/70 transition-colors"
                  >
                    <span>{item.q}</span>
                    <ChevronDown size={18} className={`text-slate-400 shrink-0 transition-transform ${open ? "rotate-180 text-[#1565D8]" : ""}`} />
                  </button>
                  {open && <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed">{item.a}</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Final CTA */}
        <div className="rounded-3xl bg-gradient-to-br from-[#1565D8] via-[#1359C2] to-[#0B3E86] p-8 sm:p-12 text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-100">
              <Trophy size={14} /> Ready to build or host?
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
              Launch your next hackathon or join one today.
            </h2>
            <p className="text-sm text-blue-100/90">
              Real-time team formation, QR check-ins, weighted rubric judging, and verifiable certificates—all in one place.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <Link href="/hackathons" className="btn bg-white text-[#1565D8] hover:bg-blue-50 px-6 py-3 font-bold">
              Explore Hackathons
            </Link>
            <Link href={hostHref} className="btn bg-[#0B3E86] text-white border border-white/25 hover:bg-[#082D62] px-6 py-3 font-bold">
              <Sparkles size={16} /> Host a Hackathon
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

