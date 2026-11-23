"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText, Plus, ExternalLink, Github, Video, Globe,
  CheckCircle2, Clock, Trophy, Award, MessageSquare, AlertCircle,
  Sparkles, Layers, ChevronRight
} from "lucide-react";

interface Submission {
  id: string;
  title: string;
  tagline: string;
  hackathon: string;
  track: string;
  status: "submitted" | "shortlisted" | "won" | "draft";
  score?: number;
  maxScore?: number;
  prize?: string;
  submittedAt: string;
  githubUrl: string;
  demoUrl: string;
  videoUrl: string;
  techStack: string[];
  judgeFeedback?: string;
}

const DEMO_SUBMISSIONS: Submission[] = [
  {
    id: "sub-1",
    title: "NeuroPulse — Real-Time Agentic ICU Monitoring",
    tagline: "Multimodal AI agent reading vital telemetry and predicting septic shock 6 hours in advance.",
    hackathon: "India AI Innovation Challenge 2026",
    track: "Healthcare & AI for Good",
    status: "shortlisted",
    score: 94,
    maxScore: 100,
    submittedAt: "Oct 16, 2026",
    githubUrl: "https://github.com/hacksyra/neuropulse-icu",
    demoUrl: "https://neuropulse-icu.vercel.app",
    videoUrl: "https://youtube.com/watch?v=demo123",
    techStack: ["Next.js 15", "PyTorch", "FastAPI", "WebSockets", "Tailwind CSS"],
    judgeFeedback: "Exceptional clinical reasoning architecture and clean UI. Real-world latency benchmark was very impressive.",
  },
  {
    id: "sub-2",
    title: "AetherShield — Zero-Knowledge Identity Bridge",
    tagline: "Self-sovereign credential verification protocol without revealing PII on Polygon zkEVM.",
    hackathon: "Autonomous Web3 & Zero-Knowledge Sprint",
    track: "Privacy & Scalability",
    status: "won",
    prize: "1st Place Grand Winner (₹3,00,000)",
    score: 98,
    maxScore: 100,
    submittedAt: "Sep 28, 2026",
    githubUrl: "https://github.com/hacksyra/aethershield-zk",
    demoUrl: "https://aethershield.xyz",
    videoUrl: "https://loom.com/share/demo456",
    techStack: ["Circom", "Solidity", "Rust", "Ethers.js", "TypeScript"],
    judgeFeedback: "Flawless cryptographic circuits and high-caliber documentation. Production-grade execution.",
  },
];

export default function SubmissionsPage() {
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [submissions, setSubmissions] = useState<Submission[]>(DEMO_SUBMISSIONS);

  // Form states
  const [newTitle, setNewTitle] = useState<string>("");
  const [newTagline, setNewTagline] = useState<string>("");
  const [newTrack, setNewTrack] = useState<string>("Generative AI & LLMs");
  const [newGithub, setNewGithub] = useState<string>("");
  const [newDemo, setNewDemo] = useState<string>("");
  const [newVideo, setNewVideo] = useState<string>("");
  const [newStack, setNewStack] = useState<string>("");
  const [newDesc, setNewDesc] = useState<string>("");

  function handleCreateSubmission(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle) return;

    const newSub: Submission = {
      id: `sub-${Date.now()}`,
      title: newTitle,
      tagline: newTagline || "Innovative hackathon solution built on HACKSYRA.",
      hackathon: "India AI Innovation Challenge 2026",
      track: newTrack,
      status: "submitted",
      submittedAt: "Just now",
      githubUrl: newGithub || "https://github.com",
      demoUrl: newDemo || "https://demo.vercel.app",
      videoUrl: newVideo || "https://youtube.com",
      techStack: newStack ? newStack.split(",").map((s) => s.trim()) : ["React", "TypeScript", "Node.js"],
    };

    setSubmissions([newSub, ...submissions]);
    setShowSubmitModal(false);
    setNewTitle("");
    setNewTagline("");
    setNewGithub("");
    setNewDemo("");
    setNewVideo("");
    setNewStack("");
    setNewDesc("");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display">My Project Submissions</h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Submit your hackathon deliverables, track real-time judging evaluations, and view peer feedback.
          </p>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="btn-primary inline-flex items-center gap-2 self-start sm:self-auto text-xs"
        >
          <Plus className="w-4 h-4" /> Submit New Project
        </button>
      </div>

      {/* Submissions List */}
      <div className="space-y-6">
        {submissions.map((sub) => (
          <div
            key={sub.id}
            className="card p-6 rounded-3xl border border-white/10 hover:border-violet-500/30 transition-all duration-300 relative overflow-hidden"
          >
            {/* Top row */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-white/8">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="badge-gray text-[10px] font-semibold">{sub.hackathon}</span>
                  <span className="badge-violet text-[10px]">{sub.track}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      sub.status === "won"
                        ? "bg-amber/20 text-amber border border-amber/30"
                        : sub.status === "shortlisted"
                        ? "bg-aqua-400/15 text-aqua-400 border border-aqua-400/25"
                        : "bg-white/10 text-text-secondary"
                    }`}
                  >
                    {sub.status === "won" ? "🏆 " + sub.prize : "● " + sub.status}
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-white">{sub.title}</h3>
                <p className="text-xs text-text-secondary mt-1 max-w-3xl leading-relaxed">
                  {sub.tagline}
                </p>
              </div>

              {sub.score && (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/8 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-text-secondary uppercase">Judge Score</span>
                    <div className="font-mono font-black text-xl text-aqua-400">
                      {sub.score} <span className="text-xs text-text-secondary">/{sub.maxScore}</span>
                    </div>
                  </div>
                  <Award className="w-6 h-6 text-amber" />
                </div>
              )}
            </div>

            {/* Links and tech stack */}
            <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {sub.techStack.map((tech) => (
                  <span key={tech} className="skill-tag text-[11px]">
                    {tech}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3">
                {sub.githubUrl && (
                  <a
                    href={sub.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-text-secondary hover:text-white border border-white/8 transition-colors"
                  >
                    <Github className="w-3.5 h-3.5" /> Code Repo
                  </a>
                )}
                {sub.demoUrl && (
                  <a
                    href={sub.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-text-secondary hover:text-white border border-white/8 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" /> Live Demo
                  </a>
                )}
                {sub.videoUrl && (
                  <a
                    href={sub.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-text-secondary hover:text-white border border-white/8 transition-colors"
                  >
                    <Video className="w-3.5 h-3.5" /> Pitch Video
                  </a>
                )}
              </div>
            </div>

            {/* Judge Feedback box if available */}
            {sub.judgeFeedback && (
              <div className="mt-4 p-4 rounded-2xl bg-surface-2 border border-violet-500/20 flex items-start gap-3">
                <MessageSquare className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[11px] font-bold text-violet-300 block mb-0.5">Evaluation Feedback from Judges</span>
                  <p className="text-xs text-text-secondary italic leading-relaxed">
                    &ldquo;{sub.judgeFeedback}&rdquo;
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="card-glass max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-white/20 bg-surface-1 my-8 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-white/8">
              <div>
                <h3 className="text-lg font-bold font-display">Submit Hackathon Deliverable</h3>
                <p className="text-xs text-text-secondary">India AI Innovation Challenge 2026</p>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-text-secondary hover:text-white p-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmission} className="space-y-4">
              <div className="form-field">
                <label className="label">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VisionAudit AI"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="input"
                />
              </div>

              <div className="form-field">
                <label className="label">Elevator Pitch / Tagline (1 sentence)</label>
                <input
                  type="text"
                  placeholder="What does it do and why does it matter?"
                  value={newTagline}
                  onChange={(e) => setNewTagline(e.target.value)}
                  className="input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-field">
                  <label className="label">Track</label>
                  <select
                    value={newTrack}
                    onChange={(e) => setNewTrack(e.target.value)}
                    className="input cursor-pointer"
                  >
                    <option value="Generative AI & LLMs" className="bg-surface-1">Generative AI &amp; LLMs</option>
                    <option value="Computer Vision" className="bg-surface-1">Computer Vision</option>
                    <option value="NLP & Translation" className="bg-surface-1">NLP &amp; Translation</option>
                    <option value="AI for Good" className="bg-surface-1">AI for Good</option>
                  </select>
                </div>

                <div className="form-field">
                  <label className="label">Tech Stack (comma separated)</label>
                  <input
                    type="text"
                    placeholder="Next.js, PyTorch, FastAPI"
                    value={newStack}
                    onChange={(e) => setNewStack(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="form-field">
                  <label className="label">GitHub Repo</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={newGithub}
                    onChange={(e) => setNewGithub(e.target.value)}
                    className="input text-xs"
                  />
                </div>

                <div className="form-field">
                  <label className="label">Live Demo URL</label>
                  <input
                    type="url"
                    placeholder="https://myproject.vercel.app"
                    value={newDemo}
                    onChange={(e) => setNewDemo(e.target.value)}
                    className="input text-xs"
                  />
                </div>

                <div className="form-field">
                  <label className="label">Pitch Video Link</label>
                  <input
                    type="url"
                    placeholder="YouTube or Loom URL"
                    value={newVideo}
                    onChange={(e) => setNewVideo(e.target.value)}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div className="form-field">
                <label className="label">Detailed Problem &amp; Architecture</label>
                <textarea
                  rows={3}
                  placeholder="Describe technical challenges solved, API integrations, and potential impact..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="input text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/8">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs"
                >
                  Confirm Final Submission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
