"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import {
  User,
  BookOpen,
  Code2,
  Target,
  Rocket,
  ChevronRight,
  ChevronLeft,
  Check,
  SkipForward,
  Search,
} from "lucide-react";
import { clientDb, firebaseReady } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/providers/AuthProvider";
import { homeForRole, safeNext } from "@/lib/auth/roles";
import { Button, Input, Select, Textarea, useToast } from "@/components/ui";
import type { SocialLink } from "@/types";

const STEPS = [
  { id: 1, title: "About you", icon: User, description: "Your bio, location and coding level" },
  { id: 2, title: "Background", icon: BookOpen, description: "College, company and social links" },
  { id: 3, title: "Skills", icon: Code2, description: "Tools and languages you build with" },
  { id: 4, title: "Interests", icon: Target, description: "Domains that excite you" },
  { id: 5, title: "All set!", icon: Rocket, description: "Ready to compete or host" },
];

const SKILL_OPTIONS = [
  "JavaScript", "TypeScript", "Python", "React", "Next.js", "Node.js",
  "FastAPI", "Django", "Flutter", "Kotlin", "Swift", "Java",
  "Rust", "Go", "C++", "TensorFlow", "PyTorch", "Solidity",
  "AWS", "GCP", "Docker", "Kubernetes", "PostgreSQL", "MongoDB",
  "Redis", "GraphQL", "Figma", "Unity", "WebAssembly", "Tailwind CSS",
];

const INTEREST_OPTIONS = [
  "Artificial Intelligence", "Machine Learning", "Web3 / Blockchain", "FinTech",
  "HealthTech", "EdTech", "Climate Tech", "Cybersecurity", "Open Source",
  "Developer Tools", "Gaming", "Social Impact", "IoT / Embedded", "AR / VR",
];

const EXPERIENCE_OPTIONS = [
  { value: "beginner", label: "Beginner", description: "0–1 years coding" },
  { value: "intermediate", label: "Intermediate", description: "1–3 years" },
  { value: "advanced", label: "Advanced", description: "3–5 years" },
  { value: "expert", label: "Expert", description: "5+ years" },
] as const;

function OnboardingInner() {
  const router = useRouter();
  const params = useSearchParams();
  const reduced = useReducedMotion();
  const toast = useToast();
  const { firebaseUser, user, role, loading } = useAuth();

  const nextUrl = safeNext(params.get("next")) ?? homeForRole(role);

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [skillSearch, setSkillSearch] = useState("");
  const [formData, setFormData] = useState({
    bio: "",
    country: "IN",
    college: "",
    organization: "",
    experienceLevel: "",
    skills: [] as string[],
    interests: [] as string[],
    lookingForTeam: true,
    githubUrl: "",
    linkedinUrl: "",
  });

  useEffect(() => {
    if (!loading && user?.onboardingComplete) {
      router.replace(nextUrl);
    }
  }, [loading, user?.onboardingComplete, nextUrl, router]);

  function toggleItem(arr: string[], item: string, max?: number): string[] {
    if (arr.includes(item)) return arr.filter((i) => i !== item);
    if (max && arr.length >= max) return arr;
    return [...arr, item];
  }

  async function saveAndContinue(skip = false) {
    const uid = firebaseUser?.uid;
    if (!uid || !firebaseReady()) return;
    setSaving(true);
    try {
      const db = clientDb();
      const now = serverTimestamp();

      if (skip) {
        await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
          onboardingComplete: true,
          updatedAt: now,
        });
      } else {
        const socialLinks: SocialLink[] = [];
        if (formData.githubUrl.trim()) socialLinks.push({ platform: "github", url: formData.githubUrl.trim() });
        if (formData.linkedinUrl.trim()) socialLinks.push({ platform: "linkedin", url: formData.linkedinUrl.trim() });

        const cleanExp = formData.experienceLevel || undefined;
        await Promise.all([
          updateDoc(doc(db, COLLECTIONS.USERS, uid), {
            bio: formData.bio.trim(),
            country: formData.country,
            college: formData.college.trim(),
            organization: formData.organization.trim(),
            ...(cleanExp ? { experienceLevel: cleanExp } : {}),
            skills: formData.skills,
            interests: formData.interests,
            lookingForTeam: formData.lookingForTeam,
            githubUrl: formData.githubUrl.trim(),
            linkedinUrl: formData.linkedinUrl.trim(),
            onboardingComplete: true,
            updatedAt: now,
          }),
          updateDoc(doc(db, COLLECTIONS.USER_PROFILES, uid), {
            bio: formData.bio.trim(),
            country: formData.country,
            college: formData.college.trim(),
            skills: formData.skills,
            interests: formData.interests,
            lookingForTeam: formData.lookingForTeam,
            socialLinks,
            updatedAt: now,
          }),
        ]);
      }

      toast.success("Profile updated", "Welcome to HACKSYRA!");
      router.replace(nextUrl);
    } catch {
      toast.error("Couldn't save profile", "Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;
  const currentStep = STEPS[step - 1];
  const filteredSkills = SKILL_OPTIONS.filter((s) => s.toLowerCase().includes(skillSearch.trim().toLowerCase()));

  return (
    <div className="min-h-screen bg-[#F0F5FF] flex flex-col justify-between py-6 sm:py-10 px-4 pb-24 sm:pb-10">
      <div className="w-full max-w-xl mx-auto">
        {/* Brand */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 p-1 shadow-xs">
              <Image src="/logos/ih_logo.png" alt="HACKSYRA" width={32} height={32} className="w-full h-full object-contain" />
            </div>
            <span className="font-display font-bold text-xl text-slate-900">
              HACK<span className="text-[#1565D8]">SYRA</span>
            </span>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={() => saveAndContinue(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#1565D8] transition-colors py-2 px-3 rounded-xl hover:bg-white/70"
          >
            <SkipForward size={14} /> Skip for now
          </button>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
            <span>
              Step {step} of {STEPS.length}
            </span>
            <span className="text-[#1565D8]">{Math.round(progress)}%</span>
          </div>
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              animate={{ width: `${Math.max(8, progress)}%` }}
              transition={{ duration: reduced ? 0.01 : 0.35 }}
            />
          </div>
        </div>

        {/* Main Card */}
        <div className="card p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-100">
            <div className="w-11 h-11 rounded-2xl bg-[#EEF4FF] text-[#1565D8] flex items-center justify-center shrink-0">
              <currentStep.icon size={21} />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-slate-900">{currentStep.title}</h1>
              <p className="text-xs sm:text-sm text-slate-500">{currentStep.description}</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={reduced ? { opacity: 0 } : { opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, x: -16 }}
              transition={{ duration: reduced ? 0.01 : 0.2 }}
            >
              {step === 1 && (
                <div className="space-y-4">
                  <Textarea
                    label="Short bio"
                    rows={3}
                    maxLength={220}
                    placeholder="Full-stack builder exploring AI agents and developer tools..."
                    value={formData.bio}
                    onChange={(e) => setFormData((f) => ({ ...f, bio: e.target.value }))}
                    hint={`${formData.bio.length}/220 characters`}
                  />

                  <Select
                    label="Country"
                    value={formData.country}
                    onChange={(e) => setFormData((f) => ({ ...f, country: e.target.value }))}
                  >
                    <option value="IN">India</option>
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                    <option value="SG">Singapore</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                    <option value="DE">Germany</option>
                    <option value="Other">Other</option>
                  </Select>

                  <div className="form-field">
                    <span className="label">Experience Level</span>
                    <div className="grid grid-cols-2 gap-2.5">
                      {EXPERIENCE_OPTIONS.map((opt) => {
                        const active = formData.experienceLevel === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setFormData((f) => ({ ...f, experienceLevel: opt.value }))}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              active
                                ? "border-[#1565D8] bg-[#EEF4FF] text-[#1565D8] ring-1 ring-[#1565D8]/20"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            <p className="text-sm font-bold">{opt.label}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{opt.description}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <Input
                    label="College / University"
                    placeholder="e.g. Anna University, IIT Madras, VIT"
                    value={formData.college}
                    onChange={(e) => setFormData((f) => ({ ...f, college: e.target.value }))}
                  />
                  <Input
                    label="Organization / Company (optional)"
                    placeholder="e.g. Innovation Hacks, Acme Corp"
                    value={formData.organization}
                    onChange={(e) => setFormData((f) => ({ ...f, organization: e.target.value }))}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="GitHub URL"
                      type="url"
                      placeholder="https://github.com/username"
                      value={formData.githubUrl}
                      onChange={(e) => setFormData((f) => ({ ...f, githubUrl: e.target.value }))}
                    />
                    <Input
                      label="LinkedIn URL"
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={formData.linkedinUrl}
                      onChange={(e) => setFormData((f) => ({ ...f, linkedinUrl: e.target.value }))}
                    />
                  </div>
                  <label className="flex items-start gap-3 p-4 rounded-2xl bg-[#EEF4FF]/60 border border-[#DCE9FF] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.lookingForTeam}
                      onChange={(e) => setFormData((f) => ({ ...f, lookingForTeam: e.target.checked }))}
                      className="mt-1 w-4 h-4 rounded accent-[#1565D8]"
                    />
                    <span>
                      <span className="text-sm font-semibold text-slate-900 block">Open to joining teams</span>
                      <span className="text-xs text-slate-600">Appear in the Looking-for-Team board so builders can invite you.</span>
                    </span>
                  </label>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <Input
                    placeholder="Filter skills..."
                    leftAdornment={<Search size={15} />}
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                  />
                  <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-1">
                    {filteredSkills.map((skill) => {
                      const active = formData.skills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => setFormData((f) => ({ ...f, skills: toggleItem(f.skills, skill, 10) }))}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all min-h-[38px] ${
                            active
                              ? "bg-[#1565D8] text-white border-[#1565D8] shadow-xs"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:border-[#1565D8]/50"
                          }`}
                        >
                          {active && <Check size={12} />}
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs font-medium text-slate-500">{formData.skills.length}/10 skills selected</p>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">Pick themes and tracks you care about:</p>
                  <div className="flex flex-wrap gap-2">
                    {INTEREST_OPTIONS.map((interest) => {
                      const active = formData.interests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => setFormData((f) => ({ ...f, interests: toggleItem(f.interests, interest) }))}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all min-h-[38px] ${
                            active
                              ? "bg-[#0284C7] text-white border-[#0284C7] shadow-xs"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:border-[#0284C7]/50"
                          }`}
                        >
                          {active && <Check size={12} />}
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="text-center py-4 space-y-5">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#1565D8] to-[#0284C7] text-white flex items-center justify-center mx-auto shadow-brand">
                    <Rocket size={34} />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-2xl text-slate-900">
                      You&apos;re ready, {(user?.displayName || firebaseUser?.displayName || "Builder").split(" ")[0]}!
                    </h2>
                    <p className="text-sm text-slate-600 mt-1.5">
                      Your builder profile is ready. Explore live hackathons or host your own.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Skills", value: formData.skills.length },
                      { label: "Interests", value: formData.interests.length },
                      { label: "Team Ready", value: formData.lookingForTeam ? "Yes" : "Solo" },
                    ].map((s) => (
                      <div key={s.label} className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                        <p className="font-display font-bold text-lg text-[#1565D8]">{s.value}</p>
                        <p className="text-[11px] text-slate-500">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Desktop / Tablet footer actions */}
          <div className="hidden sm:flex items-center justify-between mt-8 pt-5 border-t border-slate-100">
            <Button
              variant="ghost"
              disabled={step === 1 || saving}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              leftIcon={<ChevronLeft size={16} />}
            >
              Back
            </Button>

            {step < STEPS.length ? (
              <Button onClick={() => setStep((s) => s + 1)} rightIcon={<ChevronRight size={16} />}>
                Continue
              </Button>
            ) : (
              <Button onClick={() => saveAndContinue(false)} loading={saving} rightIcon={<Check size={16} />}>
                Finish setup
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Sticky mobile bottom action bar */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 p-3 flex items-center gap-3 z-nav safe-bottom">
        <Button
          variant="secondary"
          disabled={step === 1 || saving}
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          leftIcon={<ChevronLeft size={16} />}
          className="flex-1"
        >
          Back
        </Button>
        {step < STEPS.length ? (
          <Button onClick={() => setStep((s) => s + 1)} rightIcon={<ChevronRight size={16} />} className="flex-1">
            Next
          </Button>
        ) : (
          <Button onClick={() => saveAndContinue(false)} loading={saving} className="flex-1">
            Finish
          </Button>
        )}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F0F5FF] flex items-center justify-center"><div className="w-8 h-8 border-2 border-slate-300 border-t-[#1565D8] rounded-full animate-spin" /></div>}>
      <OnboardingInner />
    </Suspense>
  );
}
