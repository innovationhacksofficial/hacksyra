"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, CheckCircle2, Trophy, Users, Shield, Sparkles,
  CreditCard, Zap, Code, Mail, AlertCircle, ArrowRight, Download, QrCode
} from "lucide-react";

export default function RegisterHackathonPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "india-ai-2026";
  const router = useRouter();

  const [step, setStep] = useState<number>(1);
  const [regType, setRegType] = useState<"team" | "join" | "solo">("team");
  const [teamName, setTeamName] = useState<string>("NeuralSynthetix");
  const [joinCode, setJoinCode] = useState<string>("");
  const [track, setTrack] = useState<string>("Generative AI & LLMs");
  const [ticketTier, setTicketTier] = useState<string>("free");
  const [fullName, setFullName] = useState<string>("Aarav Sharma");
  const [email, setEmail] = useState<string>("aarav.sharma@gmail.com");
  const [github, setGithub] = useState<string>("aarav-dev");
  const [college, setCollege] = useState<string>("IIT Bombay");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  function handleCompleteRegistration() {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 1200);
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-midnight text-text-primary pt-24 pb-20 px-4">
        <div className="max-w-xl mx-auto card-glass p-8 rounded-3xl border border-aqua-400/40 text-center bg-gradient-to-b from-aqua-400/10 via-surface-1 to-transparent">
          <div className="w-16 h-16 rounded-2xl bg-aqua-400/20 text-aqua-400 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="badge-aqua mb-2">Registration Confirmed</span>
          <h2 className="text-2xl font-black font-display mb-2">You&apos;re Officially in the Hackathon!</h2>
          <p className="text-xs text-text-secondary mb-6 leading-relaxed">
            Welcome to the <strong>India AI Innovation Challenge 2026</strong>.
            Your ticket pass and team workspace have been generated.
          </p>

          {/* Ticket Pass preview */}
          <div className="p-5 rounded-2xl bg-surface-2 border border-white/10 text-left mb-6 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/8 pb-3 mb-3">
              <div>
                <span className="text-[10px] text-text-secondary uppercase">Attendee Pass</span>
                <h4 className="font-bold text-sm text-white">{fullName}</h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-500/20 text-violet-300 border border-violet-500/30">
                #HACK-8849
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-text-secondary uppercase">Team</span>
                <p className="font-semibold text-aqua-400">{regType === "solo" ? "Solo Hacker" : teamName}</p>
              </div>
              <div>
                <span className="text-[10px] text-text-secondary uppercase">Track</span>
                <p className="font-semibold text-white">{track}</p>
              </div>
              <div>
                <span className="text-[10px] text-text-secondary uppercase">Affiliation</span>
                <p className="text-text-secondary">{college}</p>
              </div>
              <div>
                <span className="text-[10px] text-text-secondary uppercase">Event Format</span>
                <p className="text-text-secondary">Online (Global)</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/8 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] text-text-secondary">
                <QrCode className="w-6 h-6 text-white" />
                <span>Check-in QR active in your dashboard</span>
              </div>
              <span className="text-[11px] font-mono text-green-400 font-bold">STATUS: CONFIRMED</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
            <Link
              href="/dashboard"
              className="btn-primary w-full sm:w-auto text-xs"
            >
              Open Builder Dashboard
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
            <Link
              href={`/hackathons/${slug}`}
              className="btn-secondary w-full sm:w-auto text-xs"
            >
              Back to Hackathon
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight text-text-primary pt-24 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/hackathons/${slug}`}
          className="inline-flex items-center gap-2 text-text-secondary hover:text-white text-xs mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Hackathon Details
        </Link>

        <div className="card-glass p-6 sm:p-8 rounded-3xl border border-white/10">
          <div className="flex items-center justify-between pb-6 border-b border-white/8 mb-6">
            <div>
              <span className="badge-violet text-[10px] uppercase font-bold tracking-wider mb-2">
                HACKSYRA REGISTRATION
              </span>
              <h1 className="text-2xl font-extrabold font-display">
                India AI Innovation Challenge 2026
              </h1>
              <p className="text-xs text-text-secondary mt-1">
                48 Hours • ₹10,00,000 Prize Pool • An Innovation Hacks Event
              </p>
            </div>
          </div>

          {/* Step 1: Participation Mode */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="font-bold text-sm text-white">Select Participation Mode</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setRegType("team")}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    regType === "team"
                      ? "bg-violet-500/20 border-violet-500 text-white shadow-violet"
                      : "bg-white/5 border-white/8 text-text-secondary hover:bg-white/10"
                  }`}
                >
                  <Users className="w-5 h-5 text-violet-400 mb-2" />
                  <div className="font-bold text-xs text-white">Create a Team</div>
                  <div className="text-[11px] text-text-secondary mt-1">Lead a squad of 2-5 builders</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRegType("join")}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    regType === "join"
                      ? "bg-aqua-400/20 border-aqua-400 text-white shadow-aqua"
                      : "bg-white/5 border-white/8 text-text-secondary hover:bg-white/10"
                  }`}
                >
                  <Sparkles className="w-5 h-5 text-aqua-400 mb-2" />
                  <div className="font-bold text-xs text-white">Join via Code</div>
                  <div className="text-[11px] text-text-secondary mt-1">Have an invite code from team lead</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRegType("solo")}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    regType === "solo"
                      ? "bg-signal-blue/20 border-signal-blue text-white shadow-lg"
                      : "bg-white/5 border-white/8 text-text-secondary hover:bg-white/10"
                  }`}
                >
                  <Code className="w-5 h-5 text-signal-blue mb-2" />
                  <div className="font-bold text-xs text-white">Solo Builder</div>
                  <div className="text-[11px] text-text-secondary mt-1">Compete independently or match later</div>
                </button>
              </div>

              {regType === "team" && (
                <div className="form-field">
                  <label className="label">Team Name</label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. ByteBusters"
                    className="input"
                  />
                </div>
              )}

              {regType === "join" && (
                <div className="form-field">
                  <label className="label">Team Invite Code</label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Enter 6-character code (e.g. AI-994)"
                    className="input font-mono uppercase"
                  />
                </div>
              )}

              <div className="form-field">
                <label className="label">Primary Track Interest</label>
                <select
                  value={track}
                  onChange={(e) => setTrack(e.target.value)}
                  className="input cursor-pointer"
                >
                  <option value="Generative AI & LLMs" className="bg-surface-1">Generative AI &amp; LLMs</option>
                  <option value="Computer Vision" className="bg-surface-1">Computer Vision</option>
                  <option value="NLP & Translation" className="bg-surface-1">NLP &amp; Translation</option>
                  <option value="AI for Social Impact" className="bg-surface-1">AI for Social Impact</option>
                  <option value="Open AI Track" className="bg-surface-1">Open AI Track</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-primary w-full justify-center"
                >
                  Continue to Builder Profile <ArrowRight className="w-4 h-4 ml-1.5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Builder Profile & Details */}
          {step === 2 && (
            <div className="space-y-5">
              <h3 className="font-bold text-sm text-white">Your Developer Profile</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-field">
                  <label className="label">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input"
                  />
                </div>
                <div className="form-field">
                  <label className="label">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-field">
                  <label className="label">GitHub Username</label>
                  <div className="flex items-center rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs">
                    <span className="text-text-secondary">github.com/</span>
                    <input
                      type="text"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      className="bg-transparent text-white font-mono focus:outline-none flex-1 ml-1"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label className="label">College / Organization</label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="input"
                    placeholder="e.g. IIT Delhi, Freelancer, TechCorp"
                  />
                </div>
              </div>

              {/* Pass Tier Selection */}
              <div className="form-field pt-2">
                <label className="label">Select Ticket Tier</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    onClick={() => setTicketTier("free")}
                    className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between ${
                      ticketTier === "free"
                        ? "bg-violet-500/15 border-violet-500/50"
                        : "bg-white/5 border-white/8"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-white">Free Standard Pass</span>
                        <span className="badge-green text-[10px]">₹0</span>
                      </div>
                      <p className="text-[11px] text-text-secondary">
                        Full 48-hr tournament access, discord channel, project submission &amp; certificates.
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => setTicketTier("vip")}
                    className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between ${
                      ticketTier === "vip"
                        ? "bg-amber/15 border-amber/50"
                        : "bg-white/5 border-white/8"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-white">VIP Hacker Kit Pass</span>
                        <span className="badge-amber text-[10px]">₹499</span>
                      </div>
                      <p className="text-[11px] text-text-secondary">
                        Includes official HACKSYRA T-shirt, stickers, and 1:1 mentor code review session.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary text-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
                </button>

                <button
                  type="button"
                  onClick={handleCompleteRegistration}
                  disabled={isProcessing}
                  className="btn-primary text-xs"
                >
                  {isProcessing ? "Confirming Registration..." : "Confirm & Claim Ticket"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
