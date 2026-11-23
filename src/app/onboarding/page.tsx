"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  User, Globe, Code2, Zap, ChevronRight, ChevronLeft,
  Check, BookOpen, Target, Rocket, SkipForward,
} from "lucide-react";

const STEPS = [
  { id: 1, title: "Who are you?", icon: User, description: "Tell us a bit about yourself" },
  { id: 2, title: "Your Background", icon: BookOpen, description: "Your college or organization" },
  { id: 3, title: "Your Skills", icon: Code2, description: "What do you build with?" },
  { id: 4, title: "Your Interests", icon: Target, description: "What excites you?" },
  { id: 5, title: "You're all set!", icon: Rocket, description: "Welcome to HACKSYRA" },
];

const SKILL_OPTIONS = [
  "JavaScript", "TypeScript", "Python", "React", "Next.js", "Node.js",
  "FastAPI", "Django", "Flutter", "Kotlin", "Swift", "Java",
  "Rust", "Go", "C++", "TensorFlow", "PyTorch", "Solidity",
  "AWS", "GCP", "Docker", "Kubernetes", "PostgreSQL", "MongoDB",
  "Redis", "GraphQL", "Figma", "Unity", "WebAssembly", "Terraform",
];

const INTEREST_OPTIONS = [
  "Artificial Intelligence", "Machine Learning", "Web3 / Blockchain", "FinTech",
  "HealthTech", "EdTech", "Climate Tech", "Cybersecurity", "Open Source",
  "Developer Tools", "Gaming", "Social Impact", "IoT / Embedded", "AR / VR",
];

const EXPERIENCE_OPTIONS = [
  { value: "beginner", label: "Beginner", description: "0-1 years coding" },
  { value: "intermediate", label: "Intermediate", description: "1-3 years" },
  { value: "advanced", label: "Advanced", description: "3-5 years" },
  { value: "expert", label: "Expert", description: "5+ years" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    bio: "",
    country: "",
    college: "",
    experienceLevel: "",
    skills: [] as string[],
    interests: [] as string[],
    lookingForTeam: false,
    githubUrl: "",
    linkedinUrl: "",
  });

  function toggleItem(arr: string[], item: string, max?: number): string[] {
    if (arr.includes(item)) return arr.filter((i) => i !== item);
    if (max && arr.length >= max) return arr;
    return [...arr, item];
  }

  async function finish() {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, COLLECTIONS.USERS, user.uid), {
        ...formData,
        onboardingComplete: true,
        updatedAt: serverTimestamp(),
      });
      await refreshUser();
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function skip() {
    if (!user) return;
    await updateDoc(doc(db, COLLECTIONS.USERS, user.uid), {
      onboardingComplete: true,
      updatedAt: serverTimestamp(),
    });
    router.push("/dashboard");
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;
  const currentStep = STEPS[step - 1];

  return (
    <div className="min-h-screen bg-midnight flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-violet-gradient flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-display text-xl font-bold text-text-primary">
            HACK<span className="gradient-text">SYRA</span>
          </span>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-text-secondary">
              Step {step} of {STEPS.length}
            </span>
            <button onClick={skip} className="flex items-center gap-1 text-xs text-text-secondary/60 hover:text-text-secondary transition-colors">
              <SkipForward size={13} />
              Skip setup
            </button>
          </div>
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <div className="flex items-center gap-2 mt-4">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                  s.id < step ? "bg-aqua-400" : s.id === step ? "bg-violet-500" : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="card p-8">
          {/* Step header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
              <currentStep.icon size={20} className="text-violet-400" />
            </div>
            <div>
              <h2 className="font-display font-bold text-text-primary">{currentStep.title}</h2>
              <p className="text-xs text-text-secondary">{currentStep.description}</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Step 1 — Basic info */}
              {step === 1 && (
                <div className="flex flex-col gap-4">
                  <div className="form-field">
                    <label className="label">Short bio (optional)</label>
                    <textarea
                      placeholder="I'm a full-stack developer passionate about AI and open source..."
                      rows={3}
                      value={formData.bio}
                      onChange={(e) => setFormData((f) => ({ ...f, bio: e.target.value }))}
                      className="input resize-none"
                      maxLength={200}
                    />
                    <p className="text-xs text-text-secondary/50 text-right mt-1">{formData.bio.length}/200</p>
                  </div>
                  <div className="form-field">
                    <label className="label">Country</label>
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData((f) => ({ ...f, country: e.target.value }))}
                      className="input"
                    >
                      <option value="">Select country</option>
                      <option value="IN">India</option>
                      <option value="US">United States</option>
                      <option value="GB">United Kingdom</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                      <option value="SG">Singapore</option>
                      <option value="DE">Germany</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="label">Experience Level</label>
                    <div className="grid grid-cols-2 gap-2">
                      {EXPERIENCE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFormData((f) => ({ ...f, experienceLevel: opt.value }))}
                          className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                            formData.experienceLevel === opt.value
                              ? "border-violet-500/50 bg-violet-500/10 text-violet-400"
                              : "border-white/10 bg-white/3 text-text-secondary hover:border-white/20 hover:text-text-primary"
                          }`}
                        >
                          <p className="text-sm font-semibold">{opt.label}</p>
                          <p className="text-xs opacity-70 mt-0.5">{opt.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2 — Background */}
              {step === 2 && (
                <div className="flex flex-col gap-4">
                  <div className="form-field">
                    <label className="label">College / University (optional)</label>
                    <input type="text" placeholder="e.g. IIT Delhi, NIT Warangal" value={formData.college} onChange={(e) => setFormData((f) => ({ ...f, college: e.target.value }))} className="input" />
                  </div>
                  <div className="form-field">
                    <label className="label">GitHub URL (optional)</label>
                    <input type="url" placeholder="https://github.com/username" value={formData.githubUrl} onChange={(e) => setFormData((f) => ({ ...f, githubUrl: e.target.value }))} className="input" />
                  </div>
                  <div className="form-field">
                    <label className="label">LinkedIn URL (optional)</label>
                    <input type="url" placeholder="https://linkedin.com/in/username" value={formData.linkedinUrl} onChange={(e) => setFormData((f) => ({ ...f, linkedinUrl: e.target.value }))} className="input" />
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/3 border border-white/8">
                    <input
                      id="looking-for-team"
                      type="checkbox"
                      checked={formData.lookingForTeam}
                      onChange={(e) => setFormData((f) => ({ ...f, lookingForTeam: e.target.checked }))}
                      className="w-4 h-4 rounded accent-violet-500"
                    />
                    <label htmlFor="looking-for-team" className="text-sm text-text-secondary cursor-pointer">
                      <span className="text-text-primary font-medium">Looking for teammates</span>
                      <br />
                      <span className="text-xs">Show up in team discovery for hackathons</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Step 3 — Skills */}
              {step === 3 && (
                <div>
                  <p className="text-sm text-text-secondary mb-4">Select up to 10 technologies you work with:</p>
                  <div className="flex flex-wrap gap-2 max-h-72 overflow-y-auto pr-1">
                    {SKILL_OPTIONS.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => setFormData((f) => ({ ...f, skills: toggleItem(f.skills, skill, 10) }))}
                        className={`skill-tag transition-all duration-150 ${
                          formData.skills.includes(skill)
                            ? "bg-violet-500/20 text-violet-400 border-violet-500/40"
                            : ""
                        }`}
                      >
                        {formData.skills.includes(skill) && <Check size={11} className="text-violet-400" />}
                        {skill}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-text-secondary/50 mt-3">{formData.skills.length}/10 selected</p>
                </div>
              )}

              {/* Step 4 — Interests */}
              {step === 4 && (
                <div>
                  <p className="text-sm text-text-secondary mb-4">What domains excite you? (Select all that apply)</p>
                  <div className="flex flex-wrap gap-2">
                    {INTEREST_OPTIONS.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => setFormData((f) => ({ ...f, interests: toggleItem(f.interests, interest) }))}
                        className={`skill-tag transition-all duration-150 ${
                          formData.interests.includes(interest)
                            ? "bg-aqua-400/20 text-aqua-400 border-aqua-400/40"
                            : ""
                        }`}
                      >
                        {formData.interests.includes(interest) && <Check size={11} className="text-aqua-400" />}
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5 — Done */}
              {step === 5 && (
                <div className="text-center py-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="w-20 h-20 rounded-full bg-violet-gradient flex items-center justify-center mx-auto mb-5 shadow-violet"
                  >
                    <Rocket size={36} className="text-white" />
                  </motion.div>
                  <h3 className="text-xl font-display font-bold text-text-primary mb-2">
                    You're ready, {user?.displayName?.split(" ")[0] ?? "Builder"}! 🎉
                  </h3>
                  <p className="text-sm text-text-secondary mb-6">
                    Your profile is set up. Discover hackathons, find your team, and start building.
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-center mb-2">
                    {[
                      { label: "Skills added", value: formData.skills.length },
                      { label: "Interests", value: formData.interests.length },
                      { label: "Profile", value: "✓" },
                    ].map((s) => (
                      <div key={s.label} className="p-3 rounded-xl bg-white/5 border border-white/8">
                        <p className="text-xl font-display font-bold text-violet-400">{s.value}</p>
                        <p className="text-[10px] text-text-secondary mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="btn-ghost disabled:opacity-30"
            >
              <ChevronLeft size={16} />
              Back
            </button>

            {step < STEPS.length ? (
              <button onClick={() => setStep((s) => s + 1)} className="btn-primary">
                Continue
                <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={finish} disabled={saving} className="btn-aqua">
                {saving ? <div className="w-4 h-4 border-2 border-midnight/40 border-t-midnight rounded-full animate-spin" /> : (<>Go to Dashboard <ChevronRight size={16} /></>)}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
