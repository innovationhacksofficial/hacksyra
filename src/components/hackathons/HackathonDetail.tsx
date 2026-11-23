"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Users, Calendar, Clock, MapPin, Wifi, ExternalLink,
  CheckCircle2, Bookmark, Share2, CalendarPlus, ChevronRight,
  ArrowRight, Star, Tag, Layers, Building, Info, ShieldCheck,
  Gift, Award, FileText, HelpCircle, Check, Copy, Heart,
  Sparkles, Target, Zap, MessageSquare, ArrowUpRight
} from "lucide-react";
import { format } from "date-fns";

const NAV_TABS = [
  { id: "overview", label: "Overview" },
  { id: "prizes", label: "Prizes & Rewards" },
  { id: "tracks", label: "Themes & Tracks" },
  { id: "schedule", label: "Schedule & Timeline" },
  { id: "judges", label: "Judges & Mentors" },
  { id: "sponsors", label: "Sponsors" },
  { id: "rules", label: "Rules & Guidelines" },
  { id: "faq", label: "FAQs" },
];

function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    function calculateTime() {
      const diff = Math.max(0, targetDate.getTime() - Date.now());
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="grid grid-cols-4 gap-2">
      {[
        { label: "DAYS", value: timeLeft.days },
        { label: "HOURS", value: timeLeft.hours },
        { label: "MINS", value: timeLeft.minutes },
        { label: "SECS", value: timeLeft.seconds },
      ].map((item) => (
        <div
          key={item.label}
          className="bg-slate-50 border border-slate-200/80 rounded-xl py-2 px-1 text-center"
        >
          <span className="block text-lg sm:text-xl font-display font-bold text-[#1565D8]">
            {String(item.value).padStart(2, "0")}
          </span>
          <span className="text-[10px] font-semibold text-slate-500 tracking-wider">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function HackathonDetailPage({ event }: { event: any }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(event.registrationDeadline).getTime() - Date.now()) / 86400000)
  );

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const FAQS = [
    {
      q: "Who is eligible to participate?",
      a: "Participation is open to college students, developers, designers, product managers, and working professionals worldwide. Both solo builders and teams of up to " + (event.teamSize || "2-5") + " members can register.",
    },
    {
      q: "Is there any registration fee?",
      a: event.isFree
        ? "No! Registration for this hackathon is 100% free of charge. You get access to all mentorship sessions, API credits, and workshops."
        : `Yes, early bird access is ${event.ticketPrice}. This covers premium judge evaluations, exclusive workshops, and goodies.`,
    },
    {
      q: "Can I participate individually or do I need a team?",
      a: "You can register either individually or with a team. If you don't have a team yet, you can join our Discord / Telegram channel after registration to find teammates.",
    },
    {
      q: "What are the submission requirements?",
      a: "Teams must submit a working prototype/code repository (GitHub/GitLab), a 2-3 minute video demonstration (YouTube/Loom), and a brief pitch deck explaining the problem, architecture, and market impact.",
    },
    {
      q: "Will all participants receive certificates?",
      a: "Yes! All verified participants who submit a valid project will receive a verifiable Digital Certificate of Participation powered by Innovation Hacks.",
    },
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20">
      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-[#1565D8] transition-colors">
              Home
            </Link>
            <ChevronRight size={13} className="text-slate-400" />
            <Link href="/hackathons" className="hover:text-[#1565D8] transition-colors">
              Hackathons
            </Link>
            <ChevronRight size={13} className="text-slate-400" />
            <span className="text-slate-900 font-medium truncate max-w-[240px] sm:max-w-none">
              {event.name}
            </span>
          </div>
        </div>
      </div>

      {/* Hero Header Section (Devpost + Unstop Style) */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Cover & Main Info */}
            <div className="lg:col-span-8 flex flex-col md:flex-row gap-6">
              {/* Cover Image / Thumbnail */}
              <div className="relative w-full md:w-56 h-44 sm:h-52 rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex-shrink-0">
                <Image
                  src={event.coverImage}
                  alt={event.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 224px"
                  className="object-cover"
                  priority
                />
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#1565D8] text-white text-[10px] font-bold shadow-sm">
                    {event.mode === "online" ? "🌐 Online" : event.mode === "offline" ? "📍 In-Person" : "⚡ Hybrid"}
                  </span>
                </div>
              </div>

              {/* Title & Info */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  {/* Organizer pill */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-slate-600">Organized by</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-[#1565D8] text-xs font-bold border border-blue-100">
                      {event.organizer}
                      <CheckCircle2 size={12} className="text-[#1565D8] fill-[#1565D8]" />
                    </span>
                    <span className="text-[11px] text-emerald-600 bg-emerald-50 border border-emerald-200 font-medium px-2 py-0.5 rounded-full">
                      Verified Host
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight leading-tight mb-2">
                    {event.name}
                  </h1>

                  <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    {event.tagline || event.summary}
                  </p>
                </div>

                {/* Quick stats pills */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-3 border-t border-slate-100">
                  <span className="flex items-center gap-1.5 font-medium text-slate-800">
                    <Trophy size={14} className="text-amber-500" />
                    Prize Pool: <strong className="text-amber-600">{event.prizePool}</strong>
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Users size={14} className="text-[#1565D8]" />
                    {event.participants.toLocaleString()} Registered
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar size={14} className="text-slate-500" />
                    {format(new Date(event.startDate), "MMM d")} – {format(new Date(event.endDate), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions / Share Column */}
            <div className="lg:col-span-4 flex items-center lg:justify-end gap-2.5">
              <button
                onClick={() => setBookmarked(!bookmarked)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                  bookmarked
                    ? "bg-amber-50 border-amber-300 text-amber-700"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Bookmark size={14} className={bookmarked ? "fill-amber-500 text-amber-500" : ""} />
                {bookmarked ? "Saved" : "Save"}
              </button>

              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all duration-200"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                {copied ? "Copied!" : "Share"}
              </button>

              <a
                href="#register-box"
                className="lg:hidden flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#1565D8] text-white text-xs font-bold hover:bg-[#0F52B0]"
              >
                Register Now <ArrowRight size={13} />
              </a>
            </div>
          </div>

          {/* Tags row */}
          <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-3 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-400 mr-1">Tags:</span>
            {event.tags?.map((tag: string) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-[#1565D8] text-slate-600 text-xs font-medium transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Tab Navigation (Unstop / Devpost style) */}
      <div className="sticky top-[64px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto no-scrollbar py-2">
            {NAV_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-[#1565D8] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Tab Details (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* About Section */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-xl font-display font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Sparkles className="text-[#1565D8]" size={20} />
                    About This Hackathon
                  </h2>
                  <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-4">
                    <p>{event.description}</p>
                    <p>
                      Organized by <strong>{event.organizer}</strong>, this competition brings together top developers, designers, data scientists, and innovators to build impactful real-world solutions. Teams will receive mentorship from industry leaders, access to cutting-edge developer toolkits, and the chance to present live before executive judges.
                    </p>
                  </div>
                </div>

                {/* Why Participate Card */}
                <div className="bg-gradient-to-br from-[#EEF4FF] via-white to-blue-50/40 border border-blue-200/80 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-display font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Target className="text-[#1565D8]" size={18} />
                    Why Join {event.name}?
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { title: "Direct Investor & Hiring Visibility", desc: "Showcase your project directly to sponsors, angel investors, and tech recruiters." },
                      { title: "Exciting Cash Rewards", desc: `Total prize pool of ${event.prizePool} distributed across grand podium & category tracks.` },
                      { title: "World-Class Mentorship", desc: "1-on-1 technical & pitch reviews by Google, Microsoft, and Innovation Hacks architects." },
                      { title: "Verified Credentials & Swag", desc: "Official verified certificate of participation and exclusive builder merchandise." },
                    ].map((item, i) => (
                      <div key={i} className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm mb-1">
                          <CheckCircle2 size={15} className="text-[#1565D8] flex-shrink-0" />
                          {item.title}
                        </div>
                        <p className="text-xs text-slate-600 pl-5">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Judging Criteria */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-display font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Award className="text-amber-500" size={18} />
                    Evaluation Criteria
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { crit: "Innovation & Originality", weight: "30%", desc: "How novel and creative is the concept compared to existing alternatives?" },
                      { crit: "Technical Execution", weight: "25%", desc: "Architecture, code quality, stability, and depth of technical implementation." },
                      { crit: "Practical Impact & Feasibility", weight: "25%", desc: "Real-world utility, scalability, and market problem-solution fit." },
                      { crit: "UI/UX & Presentation", weight: "20%", desc: "Polish of user interface, ease of use, demo video, and documentation." },
                    ].map((item) => (
                      <div key={item.crit} className="border border-slate-100 bg-slate-50/60 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <h4 className="font-semibold text-slate-900 text-sm">{item.crit}</h4>
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#1565D8] text-xs font-bold">
                            {item.weight}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PRIZES TAB */}
            {activeTab === "prizes" && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
                    <div>
                      <h2 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
                        <Trophy className="text-amber-500" size={22} />
                        Prizes & Rewards Pool
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Cash prizes, sponsor bonuses, cloud credits, and exclusive perks.
                      </p>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-display font-extrabold text-lg text-center sm:text-right">
                      {event.prizePool}
                    </div>
                  </div>

                  {/* Main Prizes Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* 2nd Place */}
                    <div className="border border-slate-200 bg-slate-50/80 rounded-2xl p-5 text-center flex flex-col justify-between order-2 md:order-1">
                      <div>
                        <div className="w-12 h-12 mx-auto rounded-full bg-slate-200 flex items-center justify-center text-2xl mb-3 shadow-inner">
                          🥈
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-bold">
                          Runner Up
                        </span>
                        <h4 className="font-bold text-slate-900 text-base mt-2">2nd Place</h4>
                        <p className="text-xs text-slate-500 mt-1">Cash prize + Mentorship + Perks</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-200">
                        <span className="text-xl font-display font-extrabold text-slate-800">
                          {event.prizes?.[1]?.amount || "₹2,00,000"}
                        </span>
                      </div>
                    </div>

                    {/* 1st Place - Featured */}
                    <div className="border-2 border-amber-400 bg-gradient-to-b from-amber-50/80 via-white to-amber-50/40 rounded-2xl p-6 text-center flex flex-col justify-between shadow-md relative order-1 md:order-2">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
                        Grand Champion
                      </div>
                      <div>
                        <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-3xl mb-3 mt-1 shadow-sm">
                          🥇
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-200/70 text-amber-900 text-xs font-bold">
                          1st Prize
                        </span>
                        <h4 className="font-bold text-slate-900 text-lg mt-2">Overall Winner</h4>
                        <p className="text-xs text-slate-600 mt-1">Grand Cash + Trophy + VC Demo Day</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-amber-200">
                        <span className="text-2xl font-display font-black text-amber-700">
                          {event.prizes?.[0]?.amount || "₹4,00,000"}
                        </span>
                      </div>
                    </div>

                    {/* 3rd Place */}
                    <div className="border border-slate-200 bg-slate-50/80 rounded-2xl p-5 text-center flex flex-col justify-between order-3">
                      <div>
                        <div className="w-12 h-12 mx-auto rounded-full bg-amber-100/50 flex items-center justify-center text-2xl mb-3 shadow-inner">
                          🥉
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                          2nd Runner Up
                        </span>
                        <h4 className="font-bold text-slate-900 text-base mt-2">3rd Place</h4>
                        <p className="text-xs text-slate-500 mt-1">Cash prize + Certificate + Perks</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-200">
                        <span className="text-xl font-display font-extrabold text-slate-800">
                          {event.prizes?.[2]?.amount || "₹1,00,000"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Category & Sponsor Prizes */}
                  <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-3">
                    Track & Special Category Prizes
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {(event.prizes?.slice(3) || [
                      { name: "Best Use of Cloud AI", amount: "₹50,000", sponsor: "Google Cloud" },
                      { name: "Best Student Team", amount: "₹50,000", sponsor: "Innovation Hacks" },
                    ]).map((p: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#1565D8] flex items-center justify-center font-bold text-sm">
                            ⭐
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-xs sm:text-sm">{p.name}</p>
                            <p className="text-[11px] text-slate-500">Sponsored by {p.sponsor}</p>
                          </div>
                        </div>
                        <span className="font-display font-bold text-[#1565D8] text-sm">
                          {p.amount}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Participant Perks */}
                  <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/70">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Gift size={14} className="text-[#1565D8]" />
                      Perks For All Valid Participants
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-600 flex-shrink-0" />
                        Verifiable Digital Certificate
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-600 flex-shrink-0" />
                        Free API & Cloud Sandbox Credits
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-600 flex-shrink-0" />
                        Innovation Hacks Builder Network Invite
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TRACKS TAB */}
            {activeTab === "tracks" && (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-xl font-display font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <Layers className="text-[#1565D8]" size={22} />
                    Hackathon Themes & Tracks
                  </h2>
                  <p className="text-xs text-slate-500 mb-6">
                    Pick a track that aligns with your passion. You can submit to multiple tracks if applicable.
                  </p>

                  <div className="grid grid-cols-1 gap-4">
                    {(event.tracks || [
                      { name: "Generative AI & LLMs", description: "Build autonomous agents, multimodal assistants, or retrieval-augmented systems." },
                      { name: "Computer Vision & Healthcare", description: "Medical image diagnostics, assistive vision tech, and healthcare robotics." },
                      { name: "Open Innovation", description: "Solve any compelling problem using modern technologies of your choice." },
                    ]).map((track: any, i: number) => (
                      <div
                        key={i}
                        className="p-5 rounded-2xl border border-slate-200 hover:border-[#1565D8]/50 hover:bg-blue-50/20 transition-all duration-200 bg-white"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-[#EEF4FF] text-[#1565D8] flex items-center justify-center font-bold text-xs">
                              0{i + 1}
                            </span>
                            <div>
                              <h3 className="font-display font-bold text-slate-900 text-base">
                                {track.name}
                              </h3>
                              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                {track.description}
                              </p>
                            </div>
                          </div>
                          <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                            Track {i + 1}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SCHEDULE TAB */}
            {activeTab === "schedule" && (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-xl font-display font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <Calendar className="text-[#1565D8]" size={22} />
                    Schedule & Important Milestones
                  </h2>
                  <p className="text-xs text-slate-500 mb-6">
                    Timezone: <strong>{event.timezone || "Asia/Kolkata (IST)"}</strong>
                  </p>

                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {[
                      {
                        title: "Registrations Open",
                        date: "Ongoing",
                        desc: "Form your team, explore track problem statements, and access hackathon resources.",
                        status: "active",
                      },
                      {
                        title: "Registration Closes",
                        date: `${format(new Date(event.registrationDeadline), "MMMM d, yyyy")} · 23:59 IST`,
                        desc: "Last day to register teammates and select your chosen challenge track.",
                        status: "upcoming",
                      },
                      {
                        title: "Hacking Starts & Opening Ceremony",
                        date: `${format(new Date(event.startDate), "MMMM d, yyyy")} · 10:00 AM IST`,
                        desc: "Live stream opening keynote, mentor matching, and sprint launch.",
                        status: "upcoming",
                      },
                      {
                        title: "Mentorship Checkpoint & Office Hours",
                        date: `${format(new Date(new Date(event.startDate).getTime() + 86400000), "MMMM d, yyyy")} · 15:00 IST`,
                        desc: "Optional 1-on-1 code reviews with mentors from Innovation Hacks.",
                        status: "upcoming",
                      },
                      {
                        title: "Project Submission Deadline",
                        date: `${format(new Date(event.submissionDeadline || event.endDate), "MMMM d, yyyy")} · 18:00 IST`,
                        desc: "All repositories, video demos, and presentations must be finalized.",
                        status: "upcoming",
                      },
                      {
                        title: "Grand Finale & Winners Announcement",
                        date: `${format(new Date(event.resultsDate || event.endDate), "MMMM d, yyyy")} · 19:00 IST`,
                        desc: "Top 10 finalists pitch live. Winners announced and prizes distributed.",
                        status: "upcoming",
                      },
                    ].map((step, idx) => (
                      <div key={idx} className="relative">
                        <div
                          className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                            step.status === "active" ? "bg-[#1565D8] ring-4 ring-blue-100" : "bg-slate-300"
                          }`}
                        />
                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <h4 className="font-display font-bold text-slate-900 text-sm sm:text-base">
                              {step.title}
                            </h4>
                            <span className="text-xs font-semibold text-[#1565D8]">
                              {step.date}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* JUDGES TAB */}
            {activeTab === "judges" && (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-xl font-display font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <Users className="text-[#1565D8]" size={22} />
                    Judges & Mentors
                  </h2>
                  <p className="text-xs text-slate-500 mb-6">
                    Projects will be reviewed by veteran engineers and founders from leading tech organizations.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(event.judges || [
                      { name: "Dr. Priya Sharma", title: "Principal AI Scientist, Google Research", avatar: "https://ui-avatars.com/api/?name=Priya+Sharma&background=1565D8&color=fff&size=80" },
                      { name: "Rahul Mehta", title: "Engineering Director, Innovation Hacks", avatar: "https://ui-avatars.com/api/?name=Rahul+Mehta&background=0EA5E9&color=fff&size=80" },
                      { name: "Ananya Krishnan", title: "VP of Product, FinTech Labs", avatar: "https://ui-avatars.com/api/?name=Ananya+K&background=D97706&color=fff&size=80" },
                      { name: "Karthik Subramanian", title: "Partner & CTO, Seed Ventures", avatar: "https://ui-avatars.com/api/?name=Karthik+S&background=10B981&color=fff&size=80" },
                    ]).map((judge: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-all"
                      >
                        <Image
                          src={judge.avatar}
                          alt={judge.name}
                          width={52}
                          height={52}
                          className="rounded-xl object-cover border border-slate-200 shadow-sm flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 text-sm truncate">{judge.name}</h4>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{judge.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SPONSORS TAB */}
            {activeTab === "sponsors" && (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-xl font-display font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <Building className="text-[#1565D8]" size={22} />
                    Sponsors & Partners
                  </h2>
                  <p className="text-xs text-slate-500 mb-6">
                    Supported by top technology providers empowering builders.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {(event.sponsors || [
                      { name: "Innovation Hacks", tier: "Title Partner", logo: "https://ui-avatars.com/api/?name=Innovation+Hacks&background=1565D8&color=fff&size=60" },
                      { name: "Google Cloud", tier: "Platinum Sponsor", logo: "https://ui-avatars.com/api/?name=Google+Cloud&background=4285F4&color=fff&size=60" },
                      { name: "NVIDIA", tier: "Gold Sponsor", logo: "https://ui-avatars.com/api/?name=NVIDIA&background=76B900&color=fff&size=60" },
                    ]).map((s: any, i: number) => (
                      <div
                        key={i}
                        className="flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-200 bg-white text-center hover:border-blue-300 transition-all"
                      >
                        <Image
                          src={s.logo}
                          alt={s.name}
                          width={48}
                          height={48}
                          className="rounded-xl mb-3 border border-slate-100"
                        />
                        <h4 className="font-bold text-slate-900 text-sm">{s.name}</h4>
                        <span className="mt-1 px-2 py-0.5 rounded-full bg-blue-50 text-[#1565D8] text-[10px] font-bold">
                          {s.tier}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* RULES TAB */}
            {activeTab === "rules" && (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4 text-sm text-slate-700">
                  <h2 className="text-xl font-display font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <ShieldCheck className="text-[#1565D8]" size={22} />
                    Hackathon Rules & Code of Conduct
                  </h2>
                  <div className="space-y-3 leading-relaxed">
                    <p className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                      <strong>1. Original Work:</strong> All code, design assets, and presentations submitted must be created during the official hackathon timeframe. Utilizing open-source libraries and APIs is allowed and encouraged, but the core solution must be freshly developed.
                    </p>
                    <p className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                      <strong>2. Team Size:</strong> Teams may consist of 1 to {event.teamSize?.split("-")[1] || "5"} members. A person cannot be an active member of more than one team for this competition.
                    </p>
                    <p className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                      <strong>3. Submissions:</strong> Late submissions will not be accepted. Make sure your repository is public and includes a README with clear setup instructions and video demo link.
                    </p>
                    <p className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                      <strong>4. Intellectual Property:</strong> Participants retain 100% full intellectual property ownership of whatever they build during the event.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* FAQ TAB */}
            {activeTab === "faq" && (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-xl font-display font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <HelpCircle className="text-[#1565D8]" size={22} />
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-3">
                    {FAQS.map((faq, idx) => (
                      <div
                        key={idx}
                        className="border border-slate-200 rounded-xl overflow-hidden transition-all"
                      >
                        <button
                          onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                          className="w-full flex items-center justify-between p-4 text-left font-semibold text-slate-900 text-sm hover:bg-slate-50 transition-colors"
                        >
                          <span>{faq.q}</span>
                          <span className="text-slate-400 font-bold text-base ml-2">
                            {activeFaq === idx ? "−" : "+"}
                          </span>
                        </button>
                        {activeFaq === idx && (
                          <div className="p-4 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Registration Box (4 cols) */}
          <div id="register-box" className="lg:col-span-4 space-y-5">
            {/* Main Action Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md sticky top-28">
              {/* Status Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Registration Open
                </span>
                <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                  🔥 {daysLeft} Days Left
                </span>
              </div>

              {/* Price & Entry Fee */}
              <div className="flex items-end justify-between mb-5">
                <div>
                  <span className="text-xs font-medium text-slate-500 block mb-0.5">Total Prize Pool</span>
                  <span className="text-2xl sm:text-3xl font-display font-extrabold text-[#1565D8]">
                    {event.prizePool}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-slate-500 block mb-0.5">Participation</span>
                  <span className="text-base sm:text-lg font-bold text-emerald-600">
                    {event.isFree ? "FREE" : event.ticketPrice}
                  </span>
                </div>
              </div>

              {/* Countdown Clock */}
              <div className="mb-5">
                <span className="text-xs font-semibold text-slate-600 block mb-2">
                  ⏳ Registration Closes In:
                </span>
                <CountdownTimer targetDate={new Date(event.registrationDeadline)} />
              </div>

              {/* Primary Register CTA */}
              <Link
                href={`/hackathons/${event.slug}/register`}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#1565D8] to-[#0F52B0] hover:from-[#0F52B0] hover:to-[#0A3D88] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 group mb-2"
              >
                Register For Hackathon
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <p className="text-[11px] text-center text-slate-500 mb-5">
                ⚡ {event.participants.toLocaleString()} developers registered · Teams of {event.teamSize}
              </p>

              {/* Key Details List */}
              <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Wifi size={13} className="text-slate-400" /> Format
                  </span>
                  <span className="font-semibold text-slate-900 capitalize">{event.mode}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Users size={13} className="text-slate-400" /> Team Size
                  </span>
                  <span className="font-semibold text-slate-900">{event.teamSize} Members</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Calendar size={13} className="text-slate-400" /> Start Date
                  </span>
                  <span className="font-semibold text-slate-900">
                    {format(new Date(event.startDate), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Clock size={13} className="text-slate-400" /> Deadline
                  </span>
                  <span className="font-semibold text-slate-900">
                    {format(new Date(event.registrationDeadline), "MMM d, yyyy")}
                  </span>
                </div>
              </div>

              {/* Host Info Box */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#1565D8] flex items-center justify-center font-bold text-sm flex-shrink-0">
                  IH
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{event.organizer}</p>
                  <p className="text-[11px] text-slate-500">Official Innovation Partner</p>
                </div>
                <Link
                  href="/contact"
                  className="text-xs text-[#1565D8] font-semibold hover:underline"
                >
                  Contact
                </Link>
              </div>
            </div>

            {/* Social Share Box */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-3">
                Share With Friends & Teammates
              </span>
              <div className="grid grid-cols-3 gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out ${event.name} on HACKSYRA! Prize pool: ${event.prizePool}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition-colors"
                >
                  WhatsApp
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition-colors"
                >
                  LinkedIn
                </a>
                <button
                  onClick={handleCopyLink}
                  className="py-2 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
                >
                  {copied ? "Copied" : "Copy Link"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
