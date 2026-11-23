"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Check,
  MapPin,
  Trophy,
  Sparkles,
  ArrowRight,
  Send,
  Code2,
} from "lucide-react";

interface BuilderProfile {
  id: string;
  name: string;
  avatar: string;
  role: string;
  category: "dev" | "ai" | "design";
  location: string;
  wins: number;
  targetHackathon: {
    name: string;
    slug: string;
  };
  lookingFor: string[];
  skills: string[];
  matchScore: string;
}

const BUILDER_PROFILES: BuilderProfile[] = [
  {
    id: "b1",
    name: "Aravind Ramkumar",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "Full-Stack & Cloud Dev",
    category: "dev",
    location: "IIT Madras · Chennai",
    wins: 6,
    targetHackathon: {
      name: "PayPal AI Hackathon 2026",
      slug: "paypal-ai-hackathon",
    },
    lookingFor: ["UI/UX Designer", "Prompt Engineer"],
    skills: ["Next.js 15", "FastAPI", "Python", "AWS"],
    matchScore: "98% Match",
  },
  {
    id: "b2",
    name: "Elena Rostova",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    role: "AI Researcher & RAG Lead",
    category: "ai",
    location: "Berlin, Germany",
    wins: 9,
    targetHackathon: {
      name: "OpenCV AI Competition",
      slug: "opencv-ai-competition-2026",
    },
    lookingFor: ["Frontend Dev", "Pitch Deck Lead"],
    skills: ["PyTorch", "LangChain", "Vector DBs", "Whisper"],
    matchScore: "95% Match",
  },
  {
    id: "b3",
    name: "Priya & Arjun (2/4 Team)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    role: "Backend + Smart Contracts",
    category: "dev",
    location: "Bangalore, India",
    wins: 4,
    targetHackathon: {
      name: "India AI Innovation Challenge",
      slug: "india-ai-2026",
    },
    lookingFor: ["Product Designer", "AI Engineer"],
    skills: ["Solidity", "Go", "Supabase", "Tailwind"],
    matchScore: "92% Match",
  },
  {
    id: "b4",
    name: "David Kim",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    role: "Product Designer & UI Lead",
    category: "design",
    location: "San Francisco, USA",
    wins: 11,
    targetHackathon: {
      name: "Nebius x NVIDIA AI Fest",
      slug: "nebius-nvidia-ai-2026",
    },
    lookingFor: ["Full-Stack Dev", "Computer Vision Specialist"],
    skills: ["Figma", "Design Systems", "Tailwind", "Prototyping"],
    matchScore: "97% Match",
  },
];

export function TeamFinderSection() {
  const [filter, setFilter] = useState<"all" | "dev" | "ai" | "design">("all");
  const [invited, setInvited] = useState<Record<string, boolean>>({});
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  const filteredBuilders =
    filter === "all"
      ? BUILDER_PROFILES
      : BUILDER_PROFILES.filter((b) => b.category === filter);

  const handleInvite = (id: string) => {
    setInvited((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <section id="team-finder" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Users size={13} className="text-blue-600" />
            <span>Speed Squad · Builder Matchmaking</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Don't hack alone. Find your winning squad.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Connect with verified developers, AI researchers, and designers forming teams for this week's active hackathons.
          </p>
        </div>

        {/* Filter Pills (Swipeable on Mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 -mx-3 px-3 sm:mx-0 sm:px-0 flex-nowrap sm:flex-wrap">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${
              filter === "all"
                ? "bg-[#1868D8] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Builders
          </button>
          <button
            type="button"
            onClick={() => setFilter("dev")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${
              filter === "dev"
                ? "bg-[#1868D8] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            💻 Developers
          </button>
          <button
            type="button"
            onClick={() => setFilter("ai")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${
              filter === "ai"
                ? "bg-[#1868D8] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            🤖 AI Researchers
          </button>
          <button
            type="button"
            onClick={() => setFilter("design")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${
              filter === "design"
                ? "bg-[#1868D8] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            🎨 Designers
          </button>
        </div>
      </div>

      {/* Builder Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredBuilders.map((builder) => {
          const isInvited = invited[builder.id];

          return (
            <div
              key={builder.id}
              className="rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 p-5 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Top Row: Avatar & Match Badge */}
              <div>
                <div className="flex items-center justify-between gap-3 mb-3.5">
                  <div className="relative">
                    <div className="w-13 h-13 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-xs">
                      <Image
                        src={builder.avatar}
                        alt={builder.name}
                        width={52}
                        height={52}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                      />
                    </div>
                    {/* Live status dot */}
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    <Sparkles size={11} className="text-emerald-500" />
                    {builder.matchScore}
                  </span>
                </div>

                {/* Name & Title */}
                <div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-[#1868D8] transition-colors leading-tight">
                    {builder.name}
                  </h3>
                  <p className="text-xs font-medium text-slate-600 mt-0.5">
                    {builder.role}
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin size={11} />
                    <span>{builder.location}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-amber-600 font-semibold flex items-center gap-0.5">
                      <Trophy size={11} /> {builder.wins} wins
                    </span>
                  </p>
                </div>

                {/* Target Hackathon */}
                <div className="mt-3.5 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Target Competition:
                  </span>
                  <Link
                    href={`/hackathons/${builder.targetHackathon.slug}`}
                    className="text-xs font-bold text-[#1868D8] hover:underline line-clamp-1 block"
                  >
                    {builder.targetHackathon.name}
                  </Link>
                </div>

                {/* Looking For */}
                <div className="mt-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Looking for teammates:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {builder.lookingFor.map((item) => (
                      <span
                        key={item}
                        className="px-2 py-0.5 rounded-md bg-blue-50 text-[#1868D8] text-[10px] font-bold border border-blue-100"
                      >
                        +{item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div className="mt-3">
                  <div className="flex flex-wrap gap-1">
                    {builder.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-mono font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleInvite(builder.id)}
                  disabled={isInvited}
                  className={`w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                    isInvited
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-300 cursor-default"
                      : "bg-slate-900 hover:bg-[#1868D8] text-white active:scale-98"
                  }`}
                >
                  {isInvited ? (
                    <>
                      <Check size={13} className="text-emerald-600" />
                      <span>Invite Sent! ✓</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={13} />
                      <span>Request to Join Team</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA to post own team request */}
      <div className="mt-8 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 border border-blue-200/80 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1868D8] text-white flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
            <Users size={20} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">
              Need teammates for an upcoming hackathon?
            </h4>
            <p className="text-xs text-slate-600">
              Publish your project idea and find complementary builders in minutes.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setRequestModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#1868D8] hover:bg-[#0F52B0] text-white font-bold text-xs shadow-sm transition-all whitespace-nowrap flex-shrink-0"
        >
          <span>Post Team Request</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Interactive Modal when clicking "Post Team Request" */}
      {requestModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-900">
                Post Team Formation Request
              </h3>
              <button
                type="button"
                onClick={() => setRequestModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Your request will be broadcasted to over 50,000+ active hackers across India, US, and Europe.
            </p>
            <div className="space-y-3 mb-5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Which hackathon are you competing in?
                </label>
                <input
                  type="text"
                  placeholder="e.g. PayPal AI Hackathon, India AI..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Who do you need on your team?
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1 UI Designer + 1 ML Engineer"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRequestModalOpen(false)}
                className="flex-1 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  alert("🎉 Your squad request has been published to the Hacksyra community network!");
                  setRequestModalOpen(false);
                }}
                className="flex-1 py-2 rounded-xl bg-[#1868D8] text-white text-xs font-bold shadow-md hover:bg-[#0F52B0]"
              >
                Publish Request
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
