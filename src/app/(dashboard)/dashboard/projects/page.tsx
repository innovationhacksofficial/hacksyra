"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Code, Plus, ExternalLink, Github, Globe, Star,
  Eye, ThumbsUp, Sparkles, Trophy, Layers, CheckCircle2
} from "lucide-react";

interface PortfolioProject {
  id: string;
  title: string;
  tagline: string;
  coverImage: string;
  hackathonWon?: string;
  likes: number;
  stars: number;
  views: number;
  githubUrl: string;
  demoUrl: string;
  tags: string[];
  isPublic: boolean;
}

const DEMO_PROJECTS: PortfolioProject[] = [
  {
    id: "proj-1",
    title: "NeuroPulse — Agentic ICU Monitoring",
    tagline: "Multimodal AI agent reading vital telemetry and predicting septic shock 6 hours in advance.",
    coverImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80",
    hackathonWon: "Shortlisted for Finals • India AI Challenge",
    likes: 142,
    stars: 89,
    views: 1240,
    githubUrl: "https://github.com/hacksyra/neuropulse-icu",
    demoUrl: "https://neuropulse-icu.vercel.app",
    tags: ["Next.js", "PyTorch", "FastAPI", "WebSockets"],
    isPublic: true,
  },
  {
    id: "proj-2",
    title: "AetherShield — Zero-Knowledge Bridge",
    tagline: "Self-sovereign credential verification protocol without revealing PII on Polygon zkEVM.",
    coverImage: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&auto=format&fit=crop&q=80",
    hackathonWon: "1st Place Winner • Autonomous Web3 Sprint",
    likes: 310,
    stars: 215,
    views: 3480,
    githubUrl: "https://github.com/hacksyra/aethershield-zk",
    demoUrl: "https://aethershield.xyz",
    tags: ["Circom", "Solidity", "Rust", "Ethers.js"],
    isPublic: true,
  },
  {
    id: "proj-3",
    title: "EcoGrid Dynamic Load Balancer",
    tagline: "Smart micro-grid battery dispatching using reinforcement learning for urban solar farms.",
    coverImage: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&auto=format&fit=crop&q=80",
    hackathonWon: "Top 5 National Finalist • CleanTech 2026",
    likes: 98,
    stars: 45,
    views: 980,
    githubUrl: "https://github.com/hacksyra/ecogrid-optimizer",
    demoUrl: "https://ecogrid.dev",
    tags: ["Python", "RL", "FastAPI", "React", "Mapbox"],
    isPublic: true,
  },
];

export default function ProjectsPortfolioPage() {
  const [projects, setProjects] = useState<PortfolioProject[]>(DEMO_PROJECTS);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form states
  const [title, setTitle] = useState<string>("");
  const [tagline, setTagline] = useState<string>("");
  const [githubUrl, setGithubUrl] = useState<string>("");
  const [demoUrl, setDemoUrl] = useState<string>("");
  const [tags, setTags] = useState<string>("");

  function handleAddProject(e: React.FormEvent) {
    e.preventDefault();
    if (!title) return;

    const newProject: PortfolioProject = {
      id: `proj-${Date.now()}`,
      title,
      tagline: tagline || "Innovative engineering solution built on HACKSYRA.",
      coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",
      likes: 1,
      stars: 1,
      views: 12,
      githubUrl: githubUrl || "https://github.com",
      demoUrl: demoUrl || "https://demo.vercel.app",
      tags: tags ? tags.split(",").map((t) => t.trim()) : ["React", "TypeScript"],
      isPublic: true,
    };

    setProjects([newProject, ...projects]);
    setShowAddModal(false);
    setTitle("");
    setTagline("");
    setGithubUrl("");
    setDemoUrl("");
    setTags("");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display">Builder Portfolio</h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Showcase your hackathon solutions and shipped products to recruiters and founders.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary inline-flex items-center gap-2 self-start sm:self-auto text-xs"
        >
          <Plus className="w-4 h-4" /> Add Project to Portfolio
        </button>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 rounded-2xl border border-white/8 bg-surface-1">
          <span className="text-[10px] text-text-secondary uppercase">Shipped Projects</span>
          <p className="text-2xl font-black text-white mt-1">{projects.length}</p>
        </div>

        <div className="card p-4 rounded-2xl border border-white/8 bg-surface-1">
          <span className="text-[10px] text-text-secondary uppercase">Podium Finishes</span>
          <p className="text-2xl font-black text-amber mt-1">2 Wins</p>
        </div>

        <div className="card p-4 rounded-2xl border border-white/8 bg-surface-1">
          <span className="text-[10px] text-text-secondary uppercase">Community Upvotes</span>
          <p className="text-2xl font-black text-aqua-400 mt-1">
            {projects.reduce((acc, p) => acc + p.likes, 0)}
          </p>
        </div>

        <div className="card p-4 rounded-2xl border border-white/8 bg-surface-1">
          <span className="text-[10px] text-text-secondary uppercase">Portfolio Views</span>
          <p className="text-2xl font-black text-signal-blue mt-1">
            {projects.reduce((acc, p) => acc + p.views, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="card rounded-3xl border border-white/10 hover:border-violet-500/40 transition-all duration-300 overflow-hidden flex flex-col justify-between group bg-surface-1"
          >
            <div>
              {/* Cover Image */}
              <div className="h-44 relative overflow-hidden bg-surface-2">
                <img
                  src={proj.coverImage}
                  alt={proj.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {proj.hackathonWon && (
                  <div className="absolute top-3 left-3 bg-amber/90 text-midnight text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    <span className="line-clamp-1">{proj.hackathonWon}</span>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-5 space-y-3">
                <h3 className="font-bold text-base text-white group-hover:text-violet-400 transition-colors line-clamp-1">
                  {proj.title}
                </h3>
                <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                  {proj.tagline}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {proj.tags.map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/8 text-text-secondary">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer with links & counts */}
            <div className="px-5 pb-5 pt-3 border-t border-white/8 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 text-text-secondary">
                <span className="flex items-center gap-1 text-[11px]">
                  <ThumbsUp className="w-3.5 h-3.5 text-aqua-400" /> {proj.likes}
                </span>
                <span className="flex items-center gap-1 text-[11px]">
                  <Star className="w-3.5 h-3.5 text-amber" /> {proj.stars}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {proj.githubUrl && (
                  <a
                    href={proj.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-white/5 text-text-secondary hover:text-white transition-colors"
                    title="GitHub"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {proj.demoUrl && (
                  <a
                    href={proj.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-white/5 text-text-secondary hover:text-white transition-colors"
                    title="Live Demo"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="card-glass max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-white/20 bg-surface-1 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/8">
              <h3 className="text-lg font-bold font-display">Add Project to Portfolio</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-text-secondary hover:text-white p-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProject} className="space-y-4">
              <div className="form-field">
                <label className="label">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AgentSwarm IDE"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input"
                />
              </div>

              <div className="form-field">
                <label className="label">Tagline</label>
                <input
                  type="text"
                  placeholder="Brief summary of your build"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-field">
                  <label className="label">GitHub Repo</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="input text-xs"
                  />
                </div>
                <div className="form-field">
                  <label className="label">Demo URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div className="form-field">
                <label className="label">Technologies (comma separated)</label>
                <input
                  type="text"
                  placeholder="Next.js, Python, Tailwind, Supabase"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="input text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/8">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Publish to Portfolio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
