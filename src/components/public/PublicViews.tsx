"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Award,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  Code2,
  CreditCard,
  Gavel,
  Globe,
  HelpCircle,
  Mail,
  QrCode,
  Search,
  Send,
  Shield,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/components/providers/AuthProvider";
import { DEFAULT_LISTING_FEE_PAISE, usePlatformSettings, usePlatformStats } from "@/lib/data/hooks";
import { formatMoney } from "@/lib/domain/money";
import { AnimatedNumber, Button, Input, Select, Textarea, useToast } from "@/components/ui";

function ContactFormInner() {
  const { user, firebaseUser } = useAuth();
  const params = useSearchParams();
  const toast = useToast();

  const initialTopic = (params.get("intent") === "enterprise" ? "enterprise" : "general") as
    | "general"
    | "organizer"
    | "enterprise"
    | "billing"
    | "report";

  const [name, setName] = useState(user?.displayName || firebaseUser?.displayName || "");
  const [email, setEmail] = useState(user?.email || firebaseUser?.email || "");
  const [topic, setTopic] = useState(initialTopic);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sentId, setSentId] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const res = await api<{ id: string }>("/api/contact", {
        method: "POST",
        body: { name: name.trim(), email: email.trim(), topic, subject: subject.trim(), message: message.trim() },
      });
      setSentId(res.id);
      toast.success("Message received", "Our team will reply by email.");
      setSubject("");
      setMessage("");
    } catch (err) {
      toast.error("Couldn't send message", err instanceof Error ? err.message : undefined);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="container-app py-10 sm:py-14 max-w-5xl space-y-10">
      <div className="max-w-2xl space-y-3">
        <span className="section-tag">Support &amp; Partnerships</span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900">Contact HACKSYRA</h1>
        <p className="text-slate-600 text-sm sm:text-base">
          Questions about hosting a hackathon, Razorpay verification, college partnerships, or reporting an issue? Reach the Innovation Hacks team directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 card p-6 sm:p-8">
          {sentId ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 size={28} />
              </div>
              <h2 className="font-display font-bold text-xl text-slate-900">Message sent!</h2>
              <p className="text-sm text-slate-600">
                Reference ID <span className="font-mono font-semibold text-slate-900">{sentId}</span>. We&apos;ve logged your inquiry and sent an acknowledgement email if email delivery is enabled.
              </p>
              <Button variant="secondary" onClick={() => setSentId(null)}>
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Your Name *" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Priya Nair" />
                <Input label="Email Address *" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select label="Topic" value={topic} onChange={(e) => setTopic(e.target.value as typeof topic)}>
                  <option value="general">General Support</option>
                  <option value="organizer">Hosting &amp; Event Approval</option>
                  <option value="billing">Payments &amp; Refunds</option>
                  <option value="enterprise">Campus / Enterprise Partnership</option>
                  <option value="report">Safety or Moderation Report</option>
                </Select>
                <Input label="Subject *" required minLength={3} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="How can we help?" />
              </div>
              <Textarea label="Message *" required minLength={10} rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Share full details, hackathon slug, or order ID if applicable..." />
              <div className="flex justify-end">
                <Button type="submit" loading={sending} leftIcon={<Send size={15} />}>
                  Send Message
                </Button>
              </div>
            </form>
          )}
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="card p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF4FF] text-[#1565D8] flex items-center justify-center">
              <Mail size={18} />
            </div>
            <h2 className="font-display font-bold text-base text-slate-900">Quick Answers</h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Looking for setup docs, listing fee details, or judging instructions? Check the Help Center first for instant guides.
            </p>
            <Button variant="secondary" size="sm" href="/help" rightIcon={<ArrowRight size={14} />}>
              Browse Help Center
            </Button>
          </div>

          <div className="card p-6 space-y-3 bg-[#EEF4FF]/60 border-[#B3D1FF]">
            <h2 className="font-display font-bold text-base text-slate-900">Want to host right now?</h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Any verified builder can launch a hackathon in minutes through our 9-step organizer wizard.
            </p>
            <Button size="sm" href="/organizer/create">
              Launch a Hackathon
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContactClient() {
  return (
    <Suspense fallback={<div className="container-app py-12" />}>
      <ContactFormInner />
    </Suspense>
  );
}

export function PricingClient() {
  const { data: settings } = usePlatformSettings();
  const feePaise = settings?.listingFeeInPaise ?? DEFAULT_LISTING_FEE_PAISE;

  return (
    <div className="container-app py-10 sm:py-14 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="section-tag">Transparent Pricing</span>
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-slate-900 tracking-tight">
          Free for builders. Simple verification for organizers.
        </h1>
        <p className="text-slate-600 text-sm sm:text-base">
          Participants join hackathons, build teams, submit projects, and earn verifiable certificates for ₹0. Organizers pay only a tiny one-time listing verification fee per event.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <div className="card p-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="badge-green">Builders &amp; Teams</span>
            <div>
              <h2 className="font-display font-bold text-xl text-slate-900">Participant Pass</h2>
              <p className="font-display font-extrabold text-3xl text-slate-900 mt-2">₹0 <span className="text-sm font-normal text-slate-500">forever</span></p>
            </div>
            <ul className="space-y-2.5 text-sm text-slate-600">
              {[
                "Join unlimited free hackathons",
                "Form teams with live chat channels",
                "Publish Devpost-style project portfolios",
                "QR check-in passes & verifiable PDF certificates",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <Button variant="secondary" href="/hackathons" className="w-full">
            Browse Live Hackathons
          </Button>
        </div>

        <div className="card p-7 border-2 border-[#1565D8] bg-gradient-to-b from-[#EEF4FF]/50 to-white flex flex-col justify-between space-y-6 relative">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="badge-blue">Most Popular</span>
              <span className="text-xs font-semibold text-[#1565D8]">Live Platform Rate</span>
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-slate-900">Standard Event Listing</h2>
              <p className="font-display font-extrabold text-3xl text-[#1565D8] mt-2">
                {feePaise === 0 ? "Free" : formatMoney(feePaise)}{" "}
                <span className="text-sm font-normal text-slate-500">one-time / event</span>
              </p>
            </div>
            <ul className="space-y-2.5 text-sm text-slate-600">
              {[
                "9-step autosaved hackathon wizard",
                "Admin quality verification & public directory listing",
                "Paid ticket tiers & promo coupons via Razorpay",
                "0% extra fee on free event registrations",
                "Weighted judge portal, leaderboards & bulk certificates",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check size={16} className="text-[#1565D8] shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <Button href="/organizer/create" className="w-full" rightIcon={<ArrowRight size={15} />}>
            Host a Hackathon
          </Button>
        </div>

        <div className="card p-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="badge-gray">Campus &amp; Corporate</span>
            <div>
              <h2 className="font-display font-bold text-xl text-slate-900">University &amp; Enterprise</h2>
              <p className="font-display font-extrabold text-3xl text-slate-900 mt-2">Custom</p>
            </div>
            <ul className="space-y-2.5 text-sm text-slate-600">
              {[
                "Verified organization badge on all events",
                "Multi-event season leaderboards & sponsor tracks",
                "Dedicated moderation & custom SLA support",
                "Bulk institutional judge & mentor onboarding",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check size={16} className="text-slate-700 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <Button variant="secondary" href="/contact?intent=enterprise" className="w-full">
            Talk to Us
          </Button>
        </div>
      </div>
    </div>
  );
}

const FAQS = [
  {
    q: "How does hackathon approval work on HACKSYRA?",
    a: "Every user can build a hackathon draft across 9 autosaved steps. After completing the listing fee checkout via Razorpay, the event enters our Admin Review queue. Once approved, it goes live immediately on the public directory with real-time registrations.",
  },
  {
    q: "Why is there a small listing fee to publish an event?",
    a: "A nominal listing verification fee helps prevent spam events and keeps prizes, deadlines, and organizers trustworthy for builders.",
  },
  {
    q: "How do participant tickets and QR check-ins work?",
    a: "Confirmed registrants receive a tamper-proof QR ticket in their Dashboard under Tickets. Organizers scan it using the built-in camera scanner or ticket number inside Organizer Console → Participants.",
  },
  {
    q: "Can teams collaborate before submitting a project?",
    a: "Yes. Captains create a team, share the 8-character invite code or email an invite, chat in real time inside Messages, build their project showcase, and lock in an immutable submission snapshot before the cutoff.",
  },
  {
    q: "How do judges score projects without bias?",
    a: "Organizers configure weighted rubrics (summing to 100%) and can enable Blind Judging, which hides team names and member lists from judges while scoring.",
  },
  {
    q: "How can employers or universities verify certificates?",
    a: "Every certificate carries a unique serial number linking to /verify/[serial] with live revocation checks and instant PDF export.",
  },
];

export function HelpClient() {
  const [query, setQuery] = useState("");
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const items = FAQS.filter(
    (f) => !query.trim() || `${f.q} ${f.a}`.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="container-app py-10 sm:py-14 max-w-4xl space-y-8">
      <div className="space-y-3">
        <span className="section-tag">Help Center</span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900">Frequently Asked Questions</h1>
        <p className="text-sm sm:text-base text-slate-600">Answers for hackers, organizers, and judges using HACKSYRA.</p>
      </div>

      <Input
        placeholder="Search questions (e.g. Razorpay, QR, team, certificates)..."
        leftAdornment={<Search size={16} />}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="card p-8 text-center text-sm text-slate-500">
            No matching questions found.{" "}
            <Link href="/contact" className="text-[#1565D8] font-semibold hover:underline">
              Ask our support team
            </Link>
            .
          </div>
        ) : (
          items.map((item, idx) => {
            const open = openIdx === idx;
            return (
              <div key={item.q} className="card overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenIdx(open ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 min-h-[52px]"
                >
                  <span className="font-display font-bold text-sm sm:text-base text-slate-900">{item.q}</span>
                  <ChevronDown size={18} className={`text-slate-400 shrink-0 transition-transform ${open ? "rotate-180 text-[#1565D8]" : ""}`} />
                </button>
                {open && <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">{item.a}</div>}
              </div>
            );
          })
        )}
      </div>

      <div className="card p-6 bg-[#EEF4FF]/60 border-[#B3D1FF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <HelpCircle size={22} className="text-[#1565D8] shrink-0 mt-0.5" />
          <div>
            <h2 className="font-display font-bold text-base text-slate-900">Still need assistance?</h2>
            <p className="text-xs sm:text-sm text-slate-600">Send a message directly to the Innovation Hacks team.</p>
          </div>
        </div>
        <Button href="/contact">Contact Support</Button>
      </div>
    </div>
  );
}

export function AboutClient() {
  const { data: stats } = usePlatformStats();

  return (
    <div className="container-app py-10 sm:py-16 space-y-14">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="section-tag">
          <Zap size={13} /> An Innovation Hacks Product
        </span>
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-slate-900 tracking-tight leading-tight">
          Where Builders Compete, Ship Real Code, and Get Recognized
        </h1>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
          HACKSYRA combines structured event operations, real-time team collaboration, verifiable judging, and authentic builder portfolios into one unified platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: Globe,
            title: "Open Discovery",
            text: "Every public hackathon is admin-verified before going live so deadlines, eligibility, tracks, and prize pools stay transparent.",
          },
          {
            icon: Code2,
            title: "Immutable Submissions",
            text: "Deadline-locked submission snapshots, GitHub repos, demos, and weighted rubric evaluations build provable proof of work.",
          },
          {
            icon: Award,
            title: "Verifiable Credentials",
            text: "Tamper-resistant certificates and live leaderboards ensure achievements can be verified by recruiters anywhere.",
          },
        ].map((p) => {
          const Icon = p.icon;
          return (
            <div key={p.title} className="card p-6 sm:p-7 space-y-3">
              <div className="w-11 h-11 rounded-xl bg-[#EEF4FF] text-[#1565D8] flex items-center justify-center">
                <Icon size={22} />
              </div>
              <h2 className="font-display font-bold text-lg text-slate-900">{p.title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{p.text}</p>
            </div>
          );
        })}
      </div>

      {/* Live Firestore Platform Stats */}
      <div className="card p-7 sm:p-10 bg-gradient-to-br from-[#EEF4FF] via-white to-white border-[#B3D1FF] space-y-6">
        <div className="max-w-2xl space-y-2">
          <span className="badge-blue">Live Platform Telemetry</span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">Built by Innovation Hacks</h2>
          <p className="text-sm text-slate-600">
            Real-time numbers synced directly from live platform activity — zero inflated vanity counters.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 pt-2">
          <div className="p-4 rounded-2xl bg-white border border-slate-200">
            <span className="font-display font-bold text-2xl sm:text-3xl text-[#1565D8] block">
              <AnimatedNumber value={stats?.liveHackathons ?? 0} />
            </span>
            <span className="text-xs font-medium text-slate-500">Live Hackathons</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200">
            <span className="font-display font-bold text-2xl sm:text-3xl text-slate-900 block">
              <AnimatedNumber value={stats?.users ?? 0} />
            </span>
            <span className="text-xs font-medium text-slate-500">Registered Builders</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200">
            <span className="font-display font-bold text-2xl sm:text-3xl text-emerald-700 block">
              <AnimatedNumber value={stats?.totalRegistrations ?? 0} />
            </span>
            <span className="text-xs font-medium text-slate-500">Event Registrations</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200">
            <span className="font-display font-bold text-2xl sm:text-3xl text-indigo-700 block">
              <AnimatedNumber value={stats?.totalProjects ?? 0} />
            </span>
            <span className="text-xs font-medium text-slate-500">Shipped Projects</span>
          </div>
        </div>
      </div>

      <div className="text-center flex flex-wrap justify-center gap-3">
        <Button size="lg" href="/hackathons">
          Explore Hackathons
        </Button>
        <Button size="lg" variant="secondary" href="/host">
          Host an Event
        </Button>
      </div>
    </div>
  );
}

export function HostClient() {
  const { data: settings } = usePlatformSettings();
  const feePaise = settings?.listingFeeInPaise ?? DEFAULT_LISTING_FEE_PAISE;

  const features = [
    { icon: Zap, title: "9-Step Autosaved Wizard", description: "Configure tracks, cash/swag prizes, schedules, eligibility, and custom forms without losing progress." },
    { icon: CreditCard, title: "Razorpay Checkout & Coupons", description: "Launch free or paid ticket tiers with 15-minute seat reservations, percentage/flat coupons, and GST invoices." },
    { icon: QrCode, title: "Built-in QR Check-In", description: "Scan attendee passes from any phone camera right inside the Organizer Console." },
    { icon: Users, title: "Team Formation & Real-Time Chat", description: "Invite-code teams, captain transfer, open recruitment, and synced Firestore team channels." },
    { icon: Gavel, title: "Weighted & Blind Judging", description: "Custom percentage rubrics, conflict-of-interest handling, and instant rank computation." },
    { icon: BarChart3, title: "Live Analytics & Certificates", description: "Real-time registration charts, one-click winner blasts, and verifiable PDF certificates." },
  ];

  return (
    <div className="container-app py-10 sm:py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-5">
        <span className="section-tag">
          <Sparkles size={13} /> For Organizers
        </span>
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-slate-900 tracking-tight leading-tight">
          Host a Hackathon from Draft to Certificates in Minutes
        </h1>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
          Build your hackathon step by step, verify your listing with a one-time {feePaise === 0 ? "free" : formatMoney(feePaise)} fee via Razorpay, and unlock registrations, QR check-in, judging, and payouts.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button size="lg" href="/organizer/create" rightIcon={<ArrowRight size={17} />}>
            Start Building Your Event
          </Button>
          <Button size="lg" variant="secondary" href="/pricing">
            See Pricing Details
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="card p-6 space-y-3">
              <div className="w-11 h-11 rounded-xl bg-[#EEF4FF] text-[#1565D8] flex items-center justify-center">
                <Icon size={20} />
              </div>
              <h2 className="font-display font-bold text-base sm:text-lg text-slate-900">{f.title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{f.description}</p>
            </div>
          );
        })}
      </div>

      <div className="card p-7 sm:p-10 bg-gradient-to-r from-[#1565D8] to-[#0B4EB0] text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-100">
            <Shield size={14} /> Quality-Verified Directory
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl">Ready to launch your next hackathon?</h2>
          <p className="text-sm text-blue-100">
            Admin verification keeps HACKSYRA trusted for sponsors, colleges, and student builders across India and globally.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <Link href="/organizer/create" className="btn bg-white text-[#1565D8] hover:bg-blue-50 btn-lg font-bold">
            <Trophy size={16} /> Launch Hackathon
          </Link>
        </div>
      </div>
    </div>
  );
}
