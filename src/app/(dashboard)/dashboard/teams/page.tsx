"use client";

import { useState } from "react";
import {
  Users, UserPlus, Copy, Check, Sparkles, Search, Filter,
  Shield, Github, Mail, ExternalLink, Code2, MessageSquare
} from "lucide-react";

interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  github: string;
  skills: string[];
}

interface Team {
  id: string;
  name: string;
  hackathon: string;
  track: string;
  inviteCode: string;
  maxMembers: number;
  members: TeamMember[];
}

interface AvailableBuilder {
  id: string;
  name: string;
  title: string;
  college: string;
  avatar: string;
  skills: string[];
  matchRate: number;
}

const DEMO_MY_TEAMS: Team[] = [
  {
    id: "team-1",
    name: "NeuralSynthetix",
    hackathon: "India AI Innovation Challenge 2026",
    track: "Generative AI & LLMs",
    inviteCode: "NS-9482",
    maxMembers: 4,
    members: [
      {
        name: "Aarav Sharma (You)",
        role: "Team Lead & ML Architect",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        github: "aarav-dev",
        skills: ["PyTorch", "FastAPI", "LangChain"],
      },
      {
        name: "Neha Sundaram",
        role: "Frontend & Design",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
        github: "nehasun",
        skills: ["Next.js 15", "Tailwind CSS", "Figma"],
      },
      {
        name: "Rohan Varma",
        role: "Backend & DevOps",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
        github: "rohan-v",
        skills: ["Docker", "PostgreSQL", "Go"],
      },
    ],
  },
];

const AVAILABLE_BUILDERS: AvailableBuilder[] = [
  {
    id: "b-1",
    name: "Vikram Malhotra",
    title: "CUDA & Systems Engineer",
    college: "IIT Madras",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    skills: ["C++", "CUDA", "TensorRT", "Python"],
    matchRate: 96,
  },
  {
    id: "b-2",
    name: "Ishita Roy",
    title: "AI Product Designer",
    college: "NID Ahmedabad",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
    skills: ["Figma", "Design Systems", "User Research", "Next.js"],
    matchRate: 91,
  },
  {
    id: "b-3",
    name: "Tanmay Bansal",
    title: "Full-Stack Web3 Builder",
    college: "BITS Goa",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80",
    skills: ["TypeScript", "Solidity", "Node.js", "GraphQL"],
    matchRate: 85,
  },
];

export default function TeamsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [invitedBuilders, setInvitedBuilders] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  function copyInvite(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  function inviteBuilder(id: string) {
    setInvitedBuilders([...invitedBuilders, id]);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display">My Squads &amp; Teammate Radar</h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Coordinate with your squad members, share invite codes, or recruit high-match developers for active hackathons.
        </p>
      </div>

      {/* Active Teams */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-violet-400" />
          Active Squad
        </h2>

        {DEMO_MY_TEAMS.map((team) => (
          <div
            key={team.id}
            className="card p-6 sm:p-8 rounded-3xl border border-white/10 bg-surface-1 shadow-xl space-y-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge-violet text-[10px]">{team.hackathon}</span>
                  <span className="badge-gray text-[10px]">{team.track}</span>
                </div>
                <h3 className="text-2xl font-black text-white">{team.name}</h3>
              </div>

              {/* Invite Code Box */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                <div>
                  <span className="text-[10px] text-text-secondary uppercase block">Team Invite Code</span>
                  <span className="font-mono font-bold text-sm text-aqua-400">{team.inviteCode}</span>
                </div>
                <button
                  onClick={() => copyInvite(team.inviteCode)}
                  className="btn-icon text-text-secondary hover:text-white"
                  title="Copy Invite Code"
                >
                  {copiedCode === team.inviteCode ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Member roster */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Roster ({team.members.length} / {team.maxMembers} Members)
                </span>
                {team.members.length < team.maxMembers && (
                  <span className="text-xs font-semibold text-aqua-400">
                    + {team.maxMembers - team.members.length} spot available
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {team.members.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white/3 border border-white/8 hover:border-violet-500/20 transition-all space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={m.avatar}
                        alt={m.name}
                        className="w-10 h-10 rounded-xl object-cover border border-white/10"
                      />
                      <div>
                        <h4 className="font-bold text-xs text-white">{m.name}</h4>
                        <span className="text-[11px] text-violet-400">{m.role}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.skills.map((s) => (
                        <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/8 text-text-secondary">
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                      <a
                        href={`https://github.com/${m.github}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-text-secondary hover:text-white"
                      >
                        <Github className="w-3 h-3" /> @{m.github}
                      </a>
                    </div>
                  </div>
                ))}

                {/* Empty spot card */}
                {team.members.length < team.maxMembers && (
                  <div className="p-6 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-center text-text-secondary hover:border-white/20 transition-colors">
                    <UserPlus className="w-6 h-6 text-text-secondary mb-2" />
                    <span className="text-xs font-semibold text-white">Open Team Slot</span>
                    <p className="text-[11px] text-text-secondary mt-1">
                      Share your invite code or invite from the radar below.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Teammate Matchmaking Radar */}
      <div className="card-glass p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-aqua-400" />
              Teammate Matchmaking Radar
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Verified builders seeking teams for the India AI Challenge with complementary skill sets.
            </p>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search skill (e.g. CUDA, UI)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-violet-500/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {AVAILABLE_BUILDERS.filter(
            (b) =>
              b.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
              b.name.toLowerCase().includes(searchQuery.toLowerCase())
          ).map((builder) => (
            <div
              key={builder.id}
              className="card p-5 rounded-2xl border border-white/8 hover:border-aqua-400/30 transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={builder.avatar}
                    alt={builder.name}
                    className="w-11 h-11 rounded-xl object-cover border border-white/10"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-white">{builder.name}</h4>
                    <p className="text-[11px] text-text-secondary">{builder.title}</p>
                    <span className="text-[10px] text-text-secondary">{builder.college}</span>
                  </div>
                </div>

                <span className="badge-aqua text-[10px] font-bold">
                  {builder.matchRate}% Match
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {builder.skills.map((s) => (
                  <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/8 text-text-secondary">
                    {s}
                  </span>
                ))}
              </div>

              <button
                onClick={() => inviteBuilder(builder.id)}
                disabled={invitedBuilders.includes(builder.id)}
                className={`w-full py-2 rounded-xl text-xs font-semibold transition-all ${
                  invitedBuilders.includes(builder.id)
                    ? "bg-green-500/15 text-green-400 border border-green-500/25 cursor-default"
                    : "btn-primary justify-center"
                }`}
              >
                {invitedBuilders.includes(builder.id) ? "✓ Invite Sent" : "Invite to Squad"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
