"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trophy, Calendar, Users, DollarSign, Award, Layers,
  CheckCircle2, ArrowRight, ArrowLeft, Plus, Trash2, Sparkles,
  UploadCloud, Globe, Eye, ShieldCheck, HelpCircle
} from "lucide-react";

interface Track {
  name: string;
  description: string;
}

interface Prize {
  title: string;
  amount: string;
  sponsor: string;
}

interface RubricItem {
  criterion: string;
  weight: number;
}

export default function CreateHackathonPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Form states
  const [name, setName] = useState<string>("GenAI Global Odyssey 2026");
  const [slug, setSlug] = useState<string>("genai-global-odyssey-2026");
  const [tagline, setTagline] = useState<string>("Architect Autonomous Systems with Next-Gen LLMs");
  const [mode, setMode] = useState<string>("online");
  const [city, setCity] = useState<string>("Bengaluru, India");
  const [description, setDescription] = useState<string>(
    "A 48-hour global sprint bringing together over 3,000 developers, AI researchers, and students to build agentic workflows, open-source AI tools, and enterprise intelligence systems."
  );
  const [teamSizeMin, setTeamSizeMin] = useState<number>(1);
  const [teamSizeMax, setTeamSizeMax] = useState<number>(4);
  const [isFree, setIsFree] = useState<boolean>(true);
  const [ticketPrice, setTicketPrice] = useState<string>("0");
  const [currency, setCurrency] = useState<string>("INR (₹)");

  // Tracks
  const [tracks, setTracks] = useState<Track[]>([
    { name: "Agentic Workflows", description: "Multi-agent systems, Tool-use, ReAct frameworks" },
    { name: "Local LLM Fine-tuning", description: "Quantization, LoRA adapters, Ollama integrations" },
    { name: "AI for Social Impact", description: "Healthcare, climate resilience, accessibility" },
  ]);

  // Prizes
  const [prizes, setPrizes] = useState<Prize[]>([
    { title: "Grand Champion (1st)", amount: "₹3,00,000", sponsor: "Innovation Hacks" },
    { title: "Runner Up (2nd)", amount: "₹1,50,000", sponsor: "Tech Partner" },
    { title: "Best Solo Hacker", amount: "₹50,000", sponsor: "Community Fund" },
  ]);

  // Rubric
  const [rubric, setRubric] = useState<RubricItem[]>([
    { criterion: "Technical Complexity & Execution", weight: 35 },
    { criterion: "Novelty & Innovation", weight: 30 },
    { criterion: "User Experience & Design", weight: 20 },
    { criterion: "Pitch & Demonstration", weight: 15 },
  ]);

  const steps = [
    { id: 1, title: "Overview", desc: "Basic event identity" },
    { id: 2, title: "Timeline", desc: "Dates & deadlines" },
    { id: 3, title: "Tracks & Prizes", desc: "Themes & rewards" },
    { id: 4, title: "Evaluation", desc: "Judging criteria" },
    { id: 5, title: "Review & Publish", desc: "Launch event" },
  ];

  function addTrack() {
    setTracks([...tracks, { name: "", description: "" }]);
  }

  function removeTrack(index: number) {
    setTracks(tracks.filter((_, i) => i !== index));
  }

  function addPrize() {
    setPrizes([...prizes, { title: "", amount: "", sponsor: "" }]);
  }

  function removePrize(index: number) {
    setPrizes(prizes.filter((_, i) => i !== index));
  }

  async function handlePublish() {
    setIsSubmitting(true);
    // Simulate API call to save hackathon to Firestore / backend
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-midnight text-text-primary flex items-center justify-center p-6">
        <div className="card-glass max-w-lg w-full p-8 rounded-3xl border border-aqua-400/30 text-center bg-gradient-to-b from-aqua-400/10 via-surface-1 to-transparent">
          <div className="w-16 h-16 rounded-2xl bg-aqua-400/20 text-aqua-400 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-display mb-2">Hackathon Successfully Published!</h2>
          <p className="text-text-secondary text-sm mb-6">
            <strong className="text-white">{name}</strong> is now live on HACKSYRA. Builders can now discover, register, and prepare their teams.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
            <Link
              href={`/hackathons`}
              className="btn-primary w-full sm:w-auto"
            >
              View Public Page
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
            <Link
              href="/organizer/events"
              className="btn-secondary w-full sm:w-auto"
            >
              Organizer Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 text-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/organizer" className="text-slate-500 hover:text-slate-800 text-xs">
                Organizer Console
              </Link>
              <span className="text-slate-400 text-xs">/</span>
              <span className="text-[#1565D8] text-xs font-semibold">Create Event</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">Create a New Hackathon</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/organizer" className="btn-secondary text-xs">
              Save Draft
            </Link>
          </div>
        </div>

        {/* Stepper Progress */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-10">
          {steps.map((s) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(s.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                currentStep === s.id
                  ? "bg-[#EEF4FF] border-[#1565D8] text-[#1565D8] shadow-sm font-bold"
                  : currentStep > s.id
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold tracking-wider">STEP 0{s.id}</span>
                {currentStep > s.id && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </div>
              <div className="font-bold text-xs">{s.title}</div>
            </button>
          ))}
        </div>

        {/* Step Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Overview */}
            {currentStep === 1 && (
              <div className="card-glass p-6 sm:p-8 rounded-3xl border border-white/10 space-y-5">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                  Event Identity &amp; Format
                </h3>

                <div className="form-field">
                  <label className="label">Hackathon Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
                    }}
                    className="input"
                    placeholder="e.g. NextGen Web3 Summit 2026"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-field">
                    <label className="label">Custom URL Slug</label>
                    <div className="flex items-center rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs">
                      <span className="text-slate-500">hacksyra.com/hackathons/</span>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="bg-transparent text-slate-900 font-mono focus:outline-none flex-1 ml-1"
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="label">Event Format</label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value)}
                      className="input cursor-pointer"
                    >
                      <option value="online" className="bg-surface-1">Online (Virtual Worldwide)</option>
                      <option value="in_person" className="bg-surface-1">In-Person (Onsite)</option>
                      <option value="hybrid" className="bg-surface-1">Hybrid (Online + Onsite)</option>
                    </select>
                  </div>
                </div>

                {mode !== "online" && (
                  <div className="form-field">
                    <label className="label">Physical Venue / City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="input"
                      placeholder="e.g. KTPO Convention Centre, Bengaluru, India"
                    />
                  </div>
                )}

                <div className="form-field">
                  <label className="label">Catchy Tagline</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="input"
                    placeholder="One sentence that excites builders"
                  />
                </div>

                <div className="form-field">
                  <label className="label">Detailed Description &amp; Mission</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input"
                    placeholder="Describe problem statements, rules, perks, and expectations..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="form-field">
                    <label className="label">Team Size Limit</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={teamSizeMin}
                        onChange={(e) => setTeamSizeMin(parseInt(e.target.value) || 1)}
                        className="input text-center"
                      />
                      <span className="text-text-secondary text-xs">to</span>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={teamSizeMax}
                        onChange={(e) => setTeamSizeMax(parseInt(e.target.value) || 4)}
                        className="input text-center"
                      />
                      <span className="text-text-secondary text-xs">members</span>
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="label">Registration Fee</label>
                    <div className="flex items-center gap-4 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs">
                        <input
                          type="radio"
                          name="isFree"
                          checked={isFree}
                          onChange={() => setIsFree(true)}
                          className="accent-violet-500"
                        />
                        <span>Free for all builders</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs">
                        <input
                          type="radio"
                          name="isFree"
                          checked={!isFree}
                          onChange={() => setIsFree(false)}
                          className="accent-violet-500"
                        />
                        <span>Paid Entry</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Timeline */}
            {currentStep === 2 && (
              <div className="card-glass p-6 sm:p-8 rounded-3xl border border-white/10 space-y-5">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-aqua-400" />
                  Tournament Timeline &amp; Deadlines
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-field">
                    <label className="label">Registration Opens</label>
                    <input type="datetime-local" defaultValue="2026-11-01T09:00" className="input" />
                  </div>
                  <div className="form-field">
                    <label className="label">Registration Closes</label>
                    <input type="datetime-local" defaultValue="2026-11-20T23:59" className="input" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-field">
                    <label className="label">Hacking Begins (Kickoff)</label>
                    <input type="datetime-local" defaultValue="2026-11-25T10:00" className="input" />
                  </div>
                  <div className="form-field">
                    <label className="label">Project Submission Deadline</label>
                    <input type="datetime-local" defaultValue="2026-11-27T18:00" className="input" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-field">
                    <label className="label">Judging Period Ends</label>
                    <input type="datetime-local" defaultValue="2026-11-29T15:00" className="input" />
                  </div>
                  <div className="form-field">
                    <label className="label">Winners Announcement</label>
                    <input type="datetime-local" defaultValue="2026-11-30T19:00" className="input" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/8 text-xs text-text-secondary">
                  💡 <strong>Tip:</strong> HACKSYRA automatically generates localized countdown timers on your event page for all global participants based on their respective device timezones.
                </div>
              </div>
            )}

            {/* Step 3: Tracks & Prizes */}
            {currentStep === 3 && (
              <div className="card-glass p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Layers className="w-5 h-5 text-violet-400" />
                      Hackathon Tracks / Themes
                    </h3>
                    <button
                      type="button"
                      onClick={addTrack}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Track
                    </button>
                  </div>
                  <div className="space-y-3">
                    {tracks.map((t, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/8 space-y-2 relative">
                        <div className="flex items-center justify-between gap-3">
                          <input
                            type="text"
                            placeholder="Track Name (e.g. HealthTech AI)"
                            value={t.name}
                            onChange={(e) => {
                              const updated = [...tracks];
                              updated[idx].name = e.target.value;
                              setTracks(updated);
                            }}
                            className="input font-semibold"
                          />
                          {tracks.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTrack(idx)}
                              className="text-text-secondary hover:text-red-400 p-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder="Brief guidelines / suggested use cases"
                          value={t.description}
                          onChange={(e) => {
                            const updated = [...tracks];
                            updated[idx].description = e.target.value;
                            setTracks(updated);
                          }}
                          className="input text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/8">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber" />
                      Prizes &amp; Bounties
                    </h3>
                    <button
                      type="button"
                      onClick={addPrize}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-amber hover:text-amber-300"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Prize
                    </button>
                  </div>
                  <div className="space-y-3">
                    {prizes.map((p, idx) => (
                      <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center p-3 rounded-2xl bg-white/5 border border-white/8">
                        <div className="sm:col-span-5">
                          <input
                            type="text"
                            placeholder="Prize Title"
                            value={p.title}
                            onChange={(e) => {
                              const updated = [...prizes];
                              updated[idx].title = e.target.value;
                              setPrizes(updated);
                            }}
                            className="input text-xs"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <input
                            type="text"
                            placeholder="Amount (e.g. ₹50,000)"
                            value={p.amount}
                            onChange={(e) => {
                              const updated = [...prizes];
                              updated[idx].amount = e.target.value;
                              setPrizes(updated);
                            }}
                            className="input text-xs font-bold text-amber"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <input
                            type="text"
                            placeholder="Sponsor Name"
                            value={p.sponsor}
                            onChange={(e) => {
                              const updated = [...prizes];
                              updated[idx].sponsor = e.target.value;
                              setPrizes(updated);
                            }}
                            className="input text-xs"
                          />
                        </div>
                        <div className="sm:col-span-1 text-center">
                          {prizes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePrize(idx)}
                              className="text-text-secondary hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Rubric */}
            {currentStep === 4 && (
              <div className="card-glass p-6 sm:p-8 rounded-3xl border border-white/10 space-y-5">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Award className="w-5 h-5 text-signal-blue" />
                  Judging Rubric &amp; Scoring Matrix
                </h3>
                <p className="text-xs text-text-secondary">
                  Define how judges will evaluate submissions. Total weight must equal 100%.
                </p>

                <div className="space-y-3">
                  {rubric.map((r, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/5 border border-white/8">
                      <input
                        type="text"
                        value={r.criterion}
                        onChange={(e) => {
                          const updated = [...rubric];
                          updated[idx].criterion = e.target.value;
                          setRubric(updated);
                        }}
                        className="input text-xs flex-1"
                      />
                      <div className="flex items-center gap-2 w-28">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={r.weight}
                          onChange={(e) => {
                            const updated = [...rubric];
                            updated[idx].weight = parseInt(e.target.value) || 0;
                            setRubric(updated);
                          }}
                          className="input text-xs text-center font-bold text-violet-400"
                        />
                        <span className="text-xs font-semibold">%</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-xs font-semibold">Total Evaluation Weight:</span>
                  <span className={`text-sm font-bold ${
                    rubric.reduce((acc, curr) => acc + curr.weight, 0) === 100 ? "text-green-400" : "text-amber"
                  }`}>
                    {rubric.reduce((acc, curr) => acc + curr.weight, 0)}%
                  </span>
                </div>
              </div>
            )}

            {/* Step 5: Review & Publish */}
            {currentStep === 5 && (
              <div className="card-glass p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-green-400" />
                  Ready to Launch on HACKSYRA
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-white/8">
                    <span className="text-text-secondary">Event Name:</span>
                    <span className="font-bold">{name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/8">
                    <span className="text-text-secondary">Mode &amp; City:</span>
                    <span className="font-bold capitalize">{mode} {mode !== "online" && `(${city})`}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/8">
                    <span className="text-text-secondary">Total Tracks:</span>
                    <span className="font-bold">{tracks.length} Tracks</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/8">
                    <span className="text-text-secondary">Prize Count:</span>
                    <span className="font-bold">{prizes.length} Rewards Listed</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/8">
                    <span className="text-text-secondary">Team Limits:</span>
                    <span className="font-bold">{teamSizeMin} - {teamSizeMax} Members</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/8">
                    <span className="text-text-secondary">Ticket Tier:</span>
                    <span className="font-bold">{isFree ? "Free Registration" : `Paid (${ticketPrice})`}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-aqua-400/10 border border-aqua-400/20 text-xs text-aqua-300">
                  ⚡ <strong>Innovation Hacks Guarantee:</strong> Your event will receive automated registration reminders, automated anti-plagiarism checks on project code, and integrated judge scoring.
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="btn-secondary"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
                </button>
              ) : <div />}

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="btn-primary"
                >
                  Next Step <ArrowRight className="w-4 h-4 ml-1.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isSubmitting}
                  className="btn-primary bg-gradient-to-r from-aqua-400 to-violet-500 text-midnight font-bold hover:brightness-110"
                >
                  {isSubmitting ? "Publishing Hackathon..." : "🚀 Launch Hackathon Live"}
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Live Card Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-text-secondary">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-aqua-400" /> Live Discovery Preview
              </span>
              <span className="badge-gray">Public View</span>
            </div>

            <div className="card rounded-2xl border border-white/10 overflow-hidden bg-surface-1 shadow-xl">
              <div className="h-32 bg-gradient-to-br from-violet-600/40 via-surface-2 to-midnight relative p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="badge-aqua text-[10px] uppercase font-bold tracking-wider">
                    {mode === "online" ? "Virtual" : mode}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber/20 text-amber text-[10px] font-bold border border-amber/30">
                    {prizes[0]?.amount || "Prize Pool"}
                  </span>
                </div>
                <div className="text-[11px] text-text-secondary flex items-center gap-1">
                  <Globe className="w-3 h-3 text-text-secondary" />
                  Innovation Hacks Partner
                </div>
              </div>

              <div className="p-4 space-y-3">
                <h4 className="font-bold text-sm text-text-primary line-clamp-1">{name || "Untitled Hackathon"}</h4>
                <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                  {tagline || "Describe your hackathon and attract the top developers worldwide."}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tracks.slice(0, 2).map((t, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/8 text-text-secondary">
                      {t.name || `Track ${i + 1}`}
                    </span>
                  ))}
                  {tracks.length > 2 && (
                    <span className="text-[10px] px-1.5 py-0.5 text-text-secondary">+{tracks.length - 2} more</span>
                  )}
                </div>

                <div className="pt-3 border-t border-white/8 flex items-center justify-between text-[11px]">
                  <span className="text-text-secondary">Team: {teamSizeMin}-{teamSizeMax}</span>
                  <span className="font-semibold text-aqua-400">{isFree ? "Free Registration" : "Paid"}</span>
                </div>
              </div>
            </div>

            {/* Quick checklist */}
            <div className="p-4 rounded-2xl bg-white/3 border border-white/8 space-y-2 text-xs">
              <span className="font-bold text-text-primary block">Organizer Best Practices</span>
              <ul className="space-y-1.5 text-text-secondary">
                <li className="flex items-center gap-1.5">✓ Add at least 2 clear problem tracks</li>
                <li className="flex items-center gap-1.5">✓ Specify transparent evaluation rubric</li>
                <li className="flex items-center gap-1.5">✓ Allow min 48 hours for team formation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
