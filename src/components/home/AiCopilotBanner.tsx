"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Bot,
  RefreshCw,
  Copy,
  Check,
  ArrowRight,
  Flame,
  Award,
  Layers,
  Cpu,
  ShieldAlert,
} from "lucide-react";

interface IdeaBlueprint {
  title: string;
  tagline: string;
  problem: string;
  solution: string;
  stack: string[];
  winningAngle: string;
  matchedHackathon: {
    name: string;
    slug: string;
    prize: string;
    daysLeft: string;
  };
}

const ROLES = [
  { id: "fullstack", label: "⚡ Full-Stack (Next.js/React)" },
  { id: "genai", label: "🤖 GenAI & LLM Agents" },
  { id: "mobile", label: "📱 Mobile (Flutter/React Native)" },
  { id: "web3", label: "⛓️ Web3 & Smart Contracts" },
  { id: "design", label: "🎨 UI/UX & Product Design" },
];

const DOMAINS = [
  { id: "health", label: "🏥 Healthcare & Clinical AI" },
  { id: "fintech", label: "💳 Agentic Fintech & Payments" },
  { id: "climate", label: "🌱 Climate & Clean Tech" },
  { id: "gaming", label: "🎮 Autonomous Gaming & NPC AI" },
  { id: "edtech", label: "🎓 Adaptive EdTech & Upskilling" },
];

const IDEAS_CATALOG: Record<string, IdeaBlueprint> = {
  "genai-health": {
    title: "OmniCare Voice: Real-Time Multilingual Clinical Triage",
    tagline: "Ambient voice AI that listens to patient visits, translates 14 dialects, and drafts instant ICD-10 electronic health records.",
    problem: "Clinicians spend 4+ hours daily doing manual EHR data entry while language barriers cause severe misdiagnoses.",
    solution: "Low-latency Whisper v3 + Claude 3.5 Sonnet pipeline running on edge devices that auto-generates structured clinical notes with zero doctor typing.",
    stack: ["Next.js 15", "FastAPI", "Whisper v3", "Claude 3.5 Sonnet", "Supabase Vector"],
    winningAngle: "Directly solves physician burnout and saves $14,000/month per hospital department in administrative overhead.",
    matchedHackathon: {
      name: "PayPal AI Hackathon: Innovate Commerce & Services",
      slug: "paypal-ai-hackathon",
      prize: "$67,500 in prizes",
      daysLeft: "24 days left",
    },
  },
  "fullstack-fintech": {
    title: "PayAgent Zero: Autonomous AI Expense & Invoice Settlement",
    tagline: "Micro-agents that audit invoices, verify vendor deliverables, and negotiate payment discounts before triggering one-click payouts.",
    problem: "Small businesses lose 3.4% of annual revenue to billing errors, fraud, and missed early-pay discounts.",
    solution: "Multi-agent autonomous workflow with secure PayPal API webhooks, automated OCR ledger syncing, and instant fraud anomaly scoring.",
    stack: ["Next.js", "TypeScript", "PayPal SDK", "LangGraph", "PostgreSQL"],
    winningAngle: "Fully functional payment sandbox integration + demonstrable ROI for CFOs within 60 seconds of demo.",
    matchedHackathon: {
      name: "PayPal AI Hackathon: Innovate Commerce",
      slug: "paypal-ai-hackathon",
      prize: "$67,500 in prizes",
      daysLeft: "24 days left",
    },
  },
  "genai-climate": {
    title: "GreenGrid AI: Hyper-Local Solar & Battery Microgrid Optimizer",
    tagline: "Predictive load-balancing system using computer vision and weather satellite feeds to maximize community renewable energy sharing.",
    problem: "Renewable energy is wasted due to battery curtailment and inability to predict cloud cover shifts in residential microgrids.",
    solution: "Trained vision models predicting rooftop generation 3 hours ahead, routing peer-to-peer excess energy with zero grid curtailment.",
    stack: ["PyTorch", "OpenCV", "AWS IoT Core", "FastAPI", "React 19"],
    winningAngle: "Direct hardware-in-the-loop simulation with real open-source weather sensor feeds.",
    matchedHackathon: {
      name: "OpenCV AI Competition 2026, powered by AWS",
      slug: "opencv-ai-competition-2026",
      prize: "$20,250 in prizes",
      daysLeft: "7 days left",
    },
  },
  "web3-gaming": {
    title: "Elysium World: Zero-Knowledge Autonomous NPC Societies",
    tagline: "On-chain game universe where AI characters have permanent memory, sovereign crypto wallets, and form organic economic alliances.",
    problem: "Game NPCs are scripted, predictable, and cannot own or trade actual game assets with players.",
    solution: "ZK-provable state transitions + LLM decision loops where NPCs accumulate token bounties and hire human players for quests.",
    stack: ["Solidity", "Rust", "Next.js", "Zircuit / Arbitrum", "OpenAI API"],
    winningAngle: "Combines the viral mechanics of simulation games with verifiable web3 cryptographic ownership.",
    matchedHackathon: {
      name: "Web3 Builders Summit: Zero Knowledge Frontiers",
      slug: "web3-summit-2026",
      prize: "$25,000 in prizes",
      daysLeft: "12 days left",
    },
  },
  "mobile-edtech": {
    title: "KuralQuest: Offline Gamified Vernacular STEM Tutor",
    tagline: "Interactive voice-first coding & science tutor designed for low-bandwidth rural schools across India.",
    problem: "Millions of rural students cannot access quality STEM education due to spotty 4G coverage and English-only materials.",
    solution: "On-device quantized LLM running in a Flutter app with voice synthesis in Tamil, Hindi, and Telugu, teaching concepts through interactive code blocks.",
    stack: ["Flutter", "TensorFlow Lite", "Llama 3-8B 4-bit", "SQLite"],
    winningAngle: "Runs 100% offline on a $70 Android smartphone with measurable learning retention metrics.",
    matchedHackathon: {
      name: "India AI Innovation Challenge 2026",
      slug: "india-ai-2026",
      prize: "₹10,00,000 in prizes",
      daysLeft: "8 days left",
    },
  },
};

export function AiCopilotBanner() {
  const [selectedRole, setSelectedRole] = useState("genai");
  const [selectedDomain, setSelectedDomain] = useState("health");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Lookup or fallback generator
  const key = `${selectedRole}-${selectedDomain}`;
  const currentBlueprint: IdeaBlueprint = IDEAS_CATALOG[key] || {
    title: `SynapseAI: Next-Gen ${DOMAINS.find((d) => d.id === selectedDomain)?.label.split(" ")[1] || "Enterprise"} Platform`,
    tagline: `An intelligent multi-agent platform combining ${ROLES.find((r) => r.id === selectedRole)?.label.split(" ")[1] || "AI"} with autonomous real-time analytics.`,
    problem: "Teams waste countless hours executing repetitive manual workflows with zero real-time contextual awareness.",
    solution: "A modern reactive architecture delivering automated decision engines, multi-tenant security, and instant API hooks.",
    stack: ["Next.js 15", "Python FastAPI", "Claude 3.5 Sonnet", "TailwindCSS", "PostgreSQL"],
    winningAngle: "Production-ready MVP architecture with an intuitive UX that wows hackathon judges in the first 30 seconds.",
    matchedHackathon: {
      name: "Nebius x NVIDIA Global AI Hackathon",
      slug: "nebius-nvidia-ai-2026",
      prize: "$50,000 in prizes",
      daysLeft: "10 days left",
    },
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 450);
  };

  const handleCopy = () => {
    const text = `🚀 Hackathon Project Blueprint: ${currentBlueprint.title}\n\nTagline: ${currentBlueprint.tagline}\n\nProblem: ${currentBlueprint.problem}\n\nSolution: ${currentBlueprint.solution}\n\nTech Stack: ${currentBlueprint.stack.join(", ")}\n\nWinning Angle: ${currentBlueprint.winningAngle}\n\nTarget Hackathon: ${currentBlueprint.matchedHackathon.name} (${currentBlueprint.matchedHackathon.prize})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-[#0B1528] to-[#0A2540] border border-blue-500/30 shadow-2xl p-6 sm:p-9 text-white overflow-hidden">
        {/* Ambient glow effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2.5">
              <Sparkles size={14} className="text-amber-400 animate-pulse" />
              <span>Hacksyra AI Copilot &amp; Idea Engine</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-400/20 text-white">
                v2.4
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Don't know what to build? Spark an instant winning project idea.
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Select your tech stack and domain interest. Our AI will synthesize a winning project blueprint + match you with high-prize competitions.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleGenerate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-xs shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <RefreshCw
                size={14}
                className={isGenerating ? "animate-spin" : ""}
              />
              <span>Generate New Idea</span>
            </button>
          </div>
        </div>

        {/* Selectors Bar */}
        <div className="relative z-10 space-y-4 mb-8">
          {/* Step 1: Role/Skill */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              1. Select Your Builder Superpower:
            </label>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => {
                    setSelectedRole(role.id);
                    handleGenerate();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedRole === role.id
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-400/50"
                      : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10"
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Domain */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              2. Choose Target Hackathon Track:
            </label>
            <div className="flex flex-wrap gap-2">
              {DOMAINS.map((domain) => (
                <button
                  key={domain.id}
                  type="button"
                  onClick={() => {
                    setSelectedDomain(domain.id);
                    handleGenerate();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedDomain === domain.id
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30 ring-2 ring-indigo-400/50"
                      : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10"
                  }`}
                >
                  {domain.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Project Blueprint Output Card */}
        <div
          className={`relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 sm:p-7 transition-all duration-300 ${
            isGenerating ? "opacity-50 scale-[0.99]" : "opacity-100 scale-100"
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            {/* Left Blueprint Details */}
            <div className="flex-1 min-w-0 space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-mono font-bold uppercase">
                  🏆 Winning Blueprint
                </span>
                <span className="text-xs text-slate-400">
                  Ready to build &amp; pitch
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                  {currentBlueprint.title}
                </h3>
                <p className="text-sm text-cyan-200/90 font-medium mt-1 leading-relaxed">
                  "{currentBlueprint.tagline}"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-black/30 border border-white/5">
                  <span className="font-bold text-amber-400 uppercase tracking-wider block text-[10px] mb-1">
                    The Problem Judges Care About
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {currentBlueprint.problem}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-black/30 border border-white/5">
                  <span className="font-bold text-emerald-400 uppercase tracking-wider block text-[10px] mb-1">
                    The 48-Hour Hack Solution
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {currentBlueprint.solution}
                  </p>
                </div>
              </div>

              {/* Recommended Stack */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Recommended Tech Stack:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentBlueprint.stack.map((item) => (
                    <span
                      key={item}
                      className="px-2.5 py-1 rounded-md bg-white/10 text-white text-xs font-mono font-semibold border border-white/15"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Why Judges Love This */}
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-start gap-2.5">
                <Flame size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-200">
                  <strong className="text-white font-bold">Winning Angle: </strong>
                  {currentBlueprint.winningAngle}
                </p>
              </div>
            </div>

            {/* Right Matched Hackathon Box */}
            <div className="lg:w-80 rounded-xl bg-white/10 border border-white/15 p-5 flex flex-col justify-between space-y-4 flex-shrink-0">
              <div>
                <span className="text-[10px] font-bold text-sky-300 uppercase tracking-wider block mb-1">
                  🎯 Best Matching Hackathon
                </span>
                <h4 className="font-bold text-base text-white leading-tight">
                  {currentBlueprint.matchedHackathon.name}
                </h4>
                <div className="mt-2.5 space-y-1">
                  <p className="text-xs font-bold text-amber-400">
                    💰 {currentBlueprint.matchedHackathon.prize}
                  </p>
                  <p className="text-xs text-emerald-400 font-semibold">
                    ⏳ {currentBlueprint.matchedHackathon.daysLeft}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-white/10">
                <Link
                  href={`/hackathons/${currentBlueprint.matchedHackathon.slug}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1868D8] hover:bg-[#0F52B0] text-white font-bold text-xs shadow-md transition-all text-center"
                >
                  <span>Join This Hackathon</span>
                  <ArrowRight size={13} />
                </Link>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white font-semibold text-xs border border-white/15 transition-all"
                >
                  {copied ? (
                    <>
                      <Check size={13} className="text-emerald-400" />
                      <span className="text-emerald-400 font-bold">
                        Copied Blueprint! ✓
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy Pitch Blueprint</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
