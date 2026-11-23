"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search, Filter, Trophy, Star, ThumbsUp, Github,
  Globe, Video, Code2, Sparkles, ExternalLink, ArrowRight, Eye,
  Heart, Layers, UserCheck
} from "lucide-react";

interface ShowcaseProject {
  id: string;
  title: string;
  tagline: string;
  coverImage: string;
  hackathon: string;
  hackathonSlug: string;
  award?: string;
  author: {
    name: string;
    avatar: string;
    college: string;
  };
  track: string;
  techStack: string[];
  upvotes: number;
  githubUrl: string;
  demoUrl: string;
  videoUrl?: string;
}

const SHOWCASE_PROJECTS: ShowcaseProject[] = [
  {
    id: "proj-1",
    title: "NeuroPulse — Multimodal ICU Telemetry",
    tagline: "Autonomous clinical intelligence agent predicting septic shock 6 hours ahead using continuous waveform telemetry.",
    coverImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80",
    hackathon: "India AI Innovation Challenge 2026",
    hackathonSlug: "india-ai-2026",
    award: "Grand Champion (1st)",
    author: {
      name: "NeuralSynthetix (Aarav, Neha, Rohan)",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      college: "IIT Bombay",
    },
    track: "Generative AI",
    techStack: ["Next.js 15", "PyTorch", "FastAPI", "WebSockets"],
    upvotes: 384,
    githubUrl: "https://github.com/hacksyra/neuropulse-icu",
    demoUrl: "https://neuropulse-icu.vercel.app",
    videoUrl: "https://youtube.com",
  },
  {
    id: "proj-2",
    title: "AetherShield — Zero-Knowledge Identity Bridge",
    tagline: "Cryptographic protocol allowing users to prove age, citizenship, and residency without disclosing raw PII.",
    coverImage: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=80",
    hackathon: "Web3 Builders Summit",
    hackathonSlug: "web3-summit-2026",
    award: "1st Place Winner ($10,000)",
    author: {
      name: "ZeroState Labs (Elena, Tariq)",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
      college: "TU Munich & BITS Pilani",
    },
    track: "Web3",
    techStack: ["Circom", "SnarkJS", "Solidity", "Foundry", "Polygon"],
    upvotes: 512,
    githubUrl: "https://github.com/hacksyra/aethershield-zk",
    demoUrl: "https://aethershield.id",
    videoUrl: "https://youtube.com",
  },
  {
    id: "proj-3",
    title: "EcoGrid — Dynamic EV Fleet Balancing",
    tagline: "Decentralized energy dispatcher rerouting 4,000+ public EV chargers to solar microgrids during demand spikes.",
    coverImage: "https://images.unsplash.com/photo-1558441719-74e1d16715f0?w=800&auto=format&fit=crop&q=80",
    hackathon: "CleanTech & Smart Mobility Hackathon",
    hackathonSlug: "cleantech-mobility-2026",
    award: "Best Sustainability Solution",
    author: {
      name: "VoltFlow Core (Dev, Preethi)",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      college: "Stanford & IIT Delhi",
    },
    track: "CleanTech",
    techStack: ["Python", "Reinforcement Learning", "React", "Mapbox"],
    upvotes: 279,
    githubUrl: "https://github.com/hacksyra/ecogrid-optimizer",
    demoUrl: "https://ecogrid.dev",
  },
  {
    id: "proj-4",
    title: "VocalForge — Multilingual Indic Code Synthesis",
    tagline: "Speech-to-executable architecture allowing developers to dictate complex full-stack code in Hindi, Tamil, and Telugu.",
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    hackathon: "India AI Innovation Challenge 2026",
    hackathonSlug: "india-ai-2026",
    award: "Best Language Innovation",
    author: {
      name: "IndicAI Core (Sneha, Arjun)",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      college: "IIIT Hyderabad",
    },
    track: "Generative AI",
    techStack: ["Whisper-Large", "Transformers", "FastAPI", "Next.js"],
    upvotes: 420,
    githubUrl: "https://github.com/hacksyra/vocalforge",
    demoUrl: "https://vocalforge.ai",
  },
  {
    id: "proj-5",
    title: "RustMemSafe — Kernel Sandbox for WebAssembly",
    tagline: "High-throughput deterministic sandbox executing untrusted tenant code with sub-millisecond cold starts.",
    coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80",
    hackathon: "Systems Hackathon 2026",
    hackathonSlug: "global-open-2026",
    award: "1st Place Systems Track",
    author: {
      name: "Liam & Marcus",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
      college: "NUS Singapore",
    },
    track: "Systems",
    techStack: ["Rust", "Wasmtime", "eBPF", "Linux C"],
    upvotes: 360,
    githubUrl: "https://github.com/hacksyra/rustmemsafe",
    demoUrl: "https://wasm-sandbox.dev",
  },
  {
    id: "proj-6",
    title: "AgriVision — Drone Thermal Crop Diagnostic",
    tagline: "Edge-computed aerial crop health diagnostics identifying pest infestations 14 days before visible leaf discoloration.",
    coverImage: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80",
    hackathon: "CleanTech & Smart Mobility Hackathon",
    hackathonSlug: "cleantech-mobility-2026",
    award: "Agriculture Impact Prize",
    author: {
      name: "AgriEdge Team",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
      college: "IIT Madras",
    },
    track: "CleanTech",
    techStack: ["YOLOv10", "TensorRT", "Flutter", "GCP"],
    upvotes: 215,
    githubUrl: "https://github.com/hacksyra/agrivision-drone",
    demoUrl: "https://agrivision.in",
  },
];

export default function ProjectsShowcasePage() {
  const [selectedTrack, setSelectedTrack] = useState<string>("All");
  const [search, setSearch] = useState<string>("");
  const [upvotesMap, setUpvotesMap] = useState<Record<string, number>>(
    Object.fromEntries(SHOWCASE_PROJECTS.map((p) => [p.id, p.upvotes]))
  );
  const [hasVoted, setHasVoted] = useState<Record<string, boolean>>({});

  const tracks = ["All", "Generative AI", "Web3", "CleanTech", "Systems"];

  function handleVote(id: string) {
    if (hasVoted[id]) {
      setUpvotesMap((prev) => ({ ...prev, [id]: prev[id] - 1 }));
      setHasVoted((prev) => ({ ...prev, [id]: false }));
    } else {
      setUpvotesMap((prev) => ({ ...prev, [id]: prev[id] + 1 }));
      setHasVoted((prev) => ({ ...prev, [id]: true }));
    }
  }

  const filtered = SHOWCASE_PROJECTS.filter((p) => {
    const matchesTrack = selectedTrack === "All" || p.track === selectedTrack;
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.tagline.toLowerCase().includes(search.toLowerCase()) ||
      p.techStack.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
      p.author.name.toLowerCase().includes(search.toLowerCase());
    return matchesTrack && matchesSearch;
  });

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20">
      {/* Devpost-Style Header Banner */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#1565D8] text-xs font-bold border border-blue-100 mb-3">
            <Sparkles size={13} />
            Community Project Showcase
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-slate-900 tracking-tight leading-tight">
            Built by Developers. Shipped to the World.
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto mt-3">
            Explore hundreds of working software prototypes built in 48-hour hackathons on HACKSYRA. Inspect source code, launch live demos, and upvote your favorite engineering.
          </p>

          {/* Devpost Filter & Search Toolbar */}
          <div className="mt-8 max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search projects by name, technology, challenge..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#1565D8] focus:ring-2 focus:ring-blue-50 transition-all shadow-xs"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
              {tracks.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTrack(t)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedTrack === t
                      ? "bg-[#1565D8] text-white shadow-xs font-bold"
                      : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid (Devpost Software Gallery Card Style) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Showing {filtered.length} Projects
          </span>
          <Link
            href="/hackathons"
            className="text-xs font-bold text-[#1565D8] hover:underline flex items-center gap-1"
          >
            Find a Hackathon to submit your project →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project) => (
            <div
              key={project.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-[#1565D8]/40 hover:shadow-lg transition-all duration-300 flex flex-col group"
            >
              {/* Cover Image & Badges */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <Image
                  src={project.coverImage}
                  alt={project.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                {/* Award Badge */}
                {project.award && (
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                      <Trophy size={11} /> {project.award}
                    </span>
                  </div>
                )}

                {/* Track Badge */}
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold">
                    {project.track}
                  </span>
                </div>

                {/* Submitted To Hackathon */}
                <div className="absolute bottom-3 left-3 right-3">
                  <Link
                    href={`/hackathons/${project.hackathonSlug}`}
                    className="text-white/90 text-xs font-semibold hover:text-white hover:underline flex items-center gap-1 truncate"
                  >
                    <span>{project.hackathon}</span>
                    <ExternalLink size={11} className="flex-shrink-0" />
                  </Link>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-base leading-snug group-hover:text-[#1565D8] transition-colors line-clamp-1 mb-1.5">
                    {project.title}
                  </h3>

                  <p className="text-slate-600 text-xs leading-relaxed line-clamp-2 mb-4">
                    {project.tagline}
                  </p>

                  {/* Tech Stack Pills */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Author & Action Footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Image
                      src={project.author.avatar}
                      alt={project.author.name}
                      width={28}
                      height={28}
                      className="rounded-full object-cover border border-slate-200"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {project.author.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {project.author.college}
                      </p>
                    </div>
                  </div>

                  {/* Upvote & Links */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleVote(project.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                        hasVoted[project.id]
                          ? "bg-red-50 text-red-600 border-red-200"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <Heart
                        size={12}
                        className={hasVoted[project.id] ? "fill-red-600 text-red-600" : ""}
                      />
                      <span>{upvotesMap[project.id]}</span>
                    </button>

                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      title="GitHub Repository"
                    >
                      <Github size={13} />
                    </a>

                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-[#1565D8] text-white hover:bg-[#0F52B0]"
                      title="Live Demo"
                    >
                      <ArrowRight size={13} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
