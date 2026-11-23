import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, CheckSquare, Compass, Gavel, QrCode, Rocket } from "lucide-react";

export const metadata: Metadata = {
  title: "Resources & Playbooks",
  description: "Guides and checklists for hosting high-impact hackathons and building winning submissions on HACKSYRA.",
};

const GUIDES = [
  {
    icon: Rocket,
    title: "Organizer Launch Checklist",
    badge: "Organizers",
    points: [
      "Draft clear problem tracks, cash/swag prize breakdowns, and weighted rubrics totaling 100%.",
      "Set registration open/close, hackathon start/end, and submission deadlines chronologically in your event timezone.",
      "Submit & complete the listing fee via Razorpay; once admin approves, your page goes live immediately.",
    ],
    ctaLabel: "Open Hackathon Wizard",
    href: "/organizer/create",
  },
  {
    icon: QrCode,
    title: "Day-Of Check-In & Announcements",
    badge: "Operations",
    points: [
      "Open Organizer Console → Participants → Scan / Check-In QR from any phone browser camera.",
      "Use Announcements to pin schedule updates and email all confirmed and waitlisted attendees in one click.",
      "Monitor waitlisted or approval-required registrations directly in the live table.",
    ],
    ctaLabel: "Organizer Console",
    href: "/organizer",
  },
  {
    icon: Gavel,
    title: "Judge Briefing & Rubric Scoring",
    badge: "Judges",
    points: [
      "Add judges by email under Judging & Winners — invited judges automatically receive Judge Portal access.",
      "Toggle Blind Judging when you want to mask team identities during initial evaluation.",
      "Publish winners to update submissions, leaderboards, and unlock bulk PDF certificate issuance.",
    ],
    ctaLabel: "Judge Portal",
    href: "/judge",
  },
  {
    icon: CheckSquare,
    title: "Winning Submission Playbook",
    badge: "Builders",
    points: [
      "Register, form or join a team via invite code, and keep teammates aligned inside real-time Team Messages.",
      "Document your architecture, live demo link, GitHub repo, and 2-minute video walkthrough under My Projects.",
      "Submit at least 15 minutes before the cutoff — every submission records an immutable snapshot.",
    ],
    ctaLabel: "Build Your Project",
    href: "/dashboard/projects",
  },
];

export default function ResourcesPage() {
  return (
    <div className="container-app py-10 sm:py-14 space-y-10 max-w-6xl">
      <div className="max-w-2xl space-y-3">
        <span className="section-tag">
          <BookOpen size={13} /> Playbooks &amp; Guides
        </span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900">Resources for Builders &amp; Organizers</h1>
        <p className="text-sm sm:text-base text-slate-600">
          Practical workflows to launch an unforgettable hackathon or ship a standout winning project on HACKSYRA.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {GUIDES.map((g) => {
          const Icon = g.icon;
          return (
            <div key={g.title} className="card p-6 sm:p-7 flex flex-col justify-between gap-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-11 h-11 rounded-xl bg-[#EEF4FF] text-[#1565D8] flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                  <span className="badge-blue">{g.badge}</span>
                </div>
                <h2 className="font-display font-bold text-lg sm:text-xl text-slate-900">{g.title}</h2>
                <ul className="space-y-2 text-sm text-slate-600">
                  {g.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1565D8] mt-2 shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link href={g.href} className="btn-secondary btn-sm self-start">
                {g.ctaLabel}
              </Link>
            </div>
          );
        })}
      </div>

      <div className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Compass size={22} className="text-[#1565D8] shrink-0" />
          <div>
            <p className="font-display font-bold text-base text-slate-900">Ready to jump in?</p>
            <p className="text-xs sm:text-sm text-slate-600">Explore active hackathons or ask our team any workflow question.</p>
          </div>
        </div>
        <div className="flex gap-2.5">
          <Link href="/hackathons" className="btn-primary btn-sm">
            Explore Hackathons
          </Link>
          <Link href="/help" className="btn-secondary btn-sm">
            FAQ
          </Link>
        </div>
      </div>
    </div>
  );
}
