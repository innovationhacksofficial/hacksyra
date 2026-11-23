"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";
import { clientAuth } from "@/lib/firebase/client";
import { completeSignIn, authErrorMessage } from "@/lib/auth/client-flow";

function searchNext(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("next");
}
import {
  Eye,
  EyeOff,
  AlertCircle,
  Users,
  Search,
  Laptop,
  Briefcase,
  Building2,
  Clock,
  Trophy,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Zap
} from "lucide-react";

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export default function LoginPage() {
  const router = useRouter();

  // Screen view: "identify" (the 2 account type cards) vs "login" (the direct credentials form)
  // Default to "login" (Candidate view) since URL is /auth/login, but allow instant toggle
  const [screenView, setScreenView] = useState<"login" | "identify">("login");

  // Role: Candidate vs Employer
  const [role, setRole] = useState<"candidate" | "employer">("candidate");

  // Left banner tab: "jobs" vs "competitions"
  const [leftTab, setLeftTab] = useState<"jobs" | "competitions">("jobs");

  // Mode: OTP vs Password
  const [authMode, setAuthMode] = useState<"otp" | "password">("password");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (authMode !== "password") {
      setError("Email OTP sign-in isn't available yet. Please log in with your password.");
      setAuthMode("password");
      return;
    }
    setIsSubmitting(true);
    try {
      const cred = await signInWithEmailAndPassword(clientAuth(), email, password);
      const { redirectTo } = await completeSignIn(cred.user, { next: searchNext() });
      router.replace(redirectTo);
    } catch (err: unknown) {
      setError(authErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github" | "microsoft" | "linkedin") => {
    setError(null);
    if (provider !== "google" && provider !== "github") {
      setError("This sign-in option isn't available yet. Use Google or email instead.");
      return;
    }
    setOauthLoading(provider);
    try {
      const p = provider === "google" ? googleProvider : githubProvider;
      const cred = await signInWithPopup(clientAuth(), p);
      const { redirectTo } = await completeSignIn(cred.user, {
        requestedRole: role === "employer" ? "organizer" : "participant",
        next: searchNext(),
      });
      router.replace(redirectTo);
    } catch (err: unknown) {
      setError(authErrorMessage(err));
    } finally {
      setOauthLoading(null);
    }
  };

  const selectRoleFromIdentify = (selectedRole: "candidate" | "employer") => {
    setRole(selectedRole);
    setScreenView("login");
  };

  return (
    <div className="bg-white rounded-3xl sm:rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] border border-slate-200/70 overflow-hidden flex flex-col md:flex-row min-h-[640px] transition-all">
      {/* ─────────────────────────────────────────────────────────────
          LEFT SUNFLOWER YELLOW BANNER (Authentic Unstop Branding & Cutout)
         ───────────────────────────────────────────────────────────── */}
      <div className="w-full md:w-[44%] bg-[#FFC200] relative p-6 sm:p-8 flex flex-col justify-between overflow-hidden md:rounded-tr-[44px]">
        {/* Subtle geometric concentric ripple lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-25"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50%" cy="48%" r="60" fill="none" stroke="#D97706" strokeWidth="1.2" />
          <circle cx="50%" cy="48%" r="120" fill="none" stroke="#D97706" strokeWidth="1.2" />
          <circle cx="50%" cy="48%" r="190" fill="none" stroke="#D97706" strokeWidth="1.2" />
          <circle cx="50%" cy="48%" r="270" fill="none" stroke="#D97706" strokeWidth="1.2" />
          <circle cx="50%" cy="48%" r="360" fill="none" stroke="#D97706" strokeWidth="1.2" />
        </svg>

        {/* Top HACKSYRA Brand Logo */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#091E42] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Zap size={18} className="text-[#FFC200] fill-[#FFC200]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[#091E42] font-black text-xl tracking-tight font-display leading-none">
                HACK<span className="text-[#1C4980]">SYRA</span>
              </span>
              <span className="text-[9px] font-bold text-amber-950/80 tracking-wider uppercase mt-0.5">
                Innovation Hacks
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setLeftTab(leftTab === "jobs" ? "competitions" : "jobs")}
            className="text-[10px] font-semibold text-amber-950 bg-amber-300/60 hover:bg-amber-300 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1"
            title="Toggle banner showcase"
          >
            <span>{leftTab === "jobs" ? "Jobs" : "Competitions"}</span>
          </button>
        </div>

        {/* Middle Builder Showcase Illustration (Cutout + Floating Opportunity Badges) */}
        <div className="relative z-10 my-auto py-4 flex flex-col items-center">
          <div className="relative w-full max-w-[310px] flex items-center justify-center">
            {/* Person Cutout Card */}
            <div className="relative w-40 h-52 sm:w-44 sm:h-56 z-10">
              <Image
                src={
                  leftTab === "jobs"
                    ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80"
                    : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
                }
                alt="Professional Talent"
                fill
                className="object-cover rounded-2xl shadow-lg border-2 border-white/60"
                priority
              />
            </div>

            {/* Floating Opportunity Chips with curved arrows (Exact Unstop visual) */}
            <div className="flex flex-col gap-2 ml-3 z-20">
              {leftTab === "jobs" ? (
                <>
                  <div className="bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-xl shadow-md border border-amber-100 flex items-center gap-1.5 hover:scale-105 transition-transform">
                    <div className="w-5 h-5 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
                      <Laptop size={12} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">Virtual</span>
                  </div>

                  <div className="bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-xl shadow-md border border-amber-100 flex items-center gap-1.5 hover:scale-105 transition-transform">
                    <div className="w-5 h-5 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                      <Briefcase size={12} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">Full-Time</span>
                  </div>

                  <div className="bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-xl shadow-md border border-amber-100 flex items-center gap-1.5 hover:scale-105 transition-transform">
                    <div className="w-5 h-5 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                      <Building2 size={12} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">In-Office</span>
                  </div>

                  <div className="bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-xl shadow-md border border-amber-100 flex items-center gap-1.5 hover:scale-105 transition-transform">
                    <div className="w-5 h-5 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <Clock size={12} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">Part-Time</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-xl shadow-md border border-amber-100 flex items-center gap-1.5 hover:scale-105 transition-transform">
                    <div className="w-5 h-5 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Trophy size={12} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">₹10L+ Prizes</span>
                  </div>

                  <div className="bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-xl shadow-md border border-amber-100 flex items-center gap-1.5 hover:scale-105 transition-transform">
                    <div className="w-5 h-5 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Clock size={12} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">48h Sprint</span>
                  </div>

                  <div className="bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-xl shadow-md border border-amber-100 flex items-center gap-1.5 hover:scale-105 transition-transform">
                    <div className="w-5 h-5 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Laptop size={12} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">Global Online</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bottom Card Caption Badge (Unstop style) */}
          <div className="mt-4 bg-white/90 backdrop-blur-sm px-6 py-2 rounded-2xl shadow-sm text-center border border-amber-200/60 max-w-[260px] w-full">
            <h4 className="font-display font-extrabold text-[#0B1A30] text-sm sm:text-base">
              {leftTab === "jobs" ? "Jobs" : "Competitions"}
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              {leftTab === "jobs"
                ? "of various employment types"
                : "across various domains & tech"}
            </p>
          </div>
        </div>

        {/* Bottom Attribution */}
        <div className="relative z-10 text-[11px] text-amber-950/80 font-medium text-center">
          Powered by <strong>Innovation Hacks</strong> Community
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          RIGHT FORM SECTION (Toggle between Identify & Direct Login)
         ───────────────────────────────────────────────────────────── */}
      <div className="w-full md:w-[56%] p-6 sm:p-10 flex flex-col justify-center">
        {screenView === "identify" ? (
          /* ── View 1: Identify your account type (Unstop screen 1) ── */
          <div className="space-y-6 animate-fadeIn">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-[#1C2024] tracking-tight">
                  Identify your account type
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#5B6572] mt-1.5">
                Join Unstop to find your dream job or hire talented candidates
              </p>
            </div>

            {/* Two Large Selection Cards */}
            <div className="space-y-4">
              {/* Card 1: Candidate */}
              <button
                type="button"
                onClick={() => selectRoleFromIdentify("candidate")}
                className="w-full text-left p-5 rounded-2xl bg-[#FFF9E6] border-2 border-transparent hover:border-amber-400/80 transition-all shadow-xs group cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100/90 text-amber-800 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Users size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-bold text-base text-[#1C2024]">
                        I'm a Candidate
                      </h3>
                      <ArrowRight size={16} className="text-amber-800 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-xs text-[#5B6572] mt-1 leading-relaxed">
                      Compete, learn, mentor and apply for jobs and internships
                    </p>
                  </div>
                </div>
              </button>

              {/* Card 2: Employer */}
              <button
                type="button"
                onClick={() => selectRoleFromIdentify("employer")}
                className="w-full text-left p-5 rounded-2xl bg-[#EEF6FF] border-2 border-transparent hover:border-blue-400/80 transition-all shadow-xs group cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100/90 text-[#1C4980] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Search size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-bold text-base text-[#1C2024]">
                        I'm an Employer
                      </h3>
                      <ArrowRight size={16} className="text-[#1C4980] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-xs text-[#5B6572] mt-1 leading-relaxed">
                      Post jobs, hire talent and offer career opportunities
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Direct Login Shortcut */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setScreenView("login")}
                className="text-xs text-[#1C4980] font-semibold hover:underline"
              >
                Or proceed directly to Candidate Login &rarr;
              </button>
            </div>

            {/* Terms */}
            <p className="text-[11.5px] text-center text-[#717D8D] leading-relaxed pt-2">
              By signing in, you accept the{" "}
              <Link href="/terms" className="text-[#1C4980] hover:underline">
                Terms of Service
              </Link>{" "}
              and acknowledge our{" "}
              <Link href="/privacy" className="text-[#1C4980] hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        ) : (
          /* ── View 2: Candidate / Employer Direct Login (Unstop screen 2) ── */
          <div className="space-y-4 animate-fadeIn">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl sm:text-[28px] font-display font-extrabold text-[#1C2024] tracking-tight leading-tight">
                  {role === "candidate"
                    ? "Your Next Opportunity Starts Here"
                    : "Hire the Right Tech Talent"}
                </h2>
                <button
                  type="button"
                  onClick={() => setScreenView("identify")}
                  className="text-[11px] font-semibold text-[#1C4980] hover:underline flex items-center gap-1 flex-shrink-0"
                  title="Switch to Account Type Selector"
                >
                  <ArrowLeft size={12} />
                  <span>Change</span>
                </button>
              </div>
              <p className="text-xs sm:text-[13px] text-[#5B6572] mt-1">
                {role === "candidate"
                  ? "Log in to discover competitions, jobs, and internships built for you."
                  : "Log in to manage hackathons, screen candidate submissions, and post jobs."}
              </p>
            </div>

            {/* Unstop Candidate vs Employer Segmented Pill Switcher */}
            <div className="bg-[#F1F3F6] p-1 rounded-2xl flex gap-1 mt-2">
              <button
                type="button"
                onClick={() => setRole("candidate")}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  role === "candidate"
                    ? "bg-white text-[#1C4980] shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                    : "text-[#5B6572] hover:text-[#1C2024]"
                }`}
              >
                I'm a Candidate
              </button>
              <button
                type="button"
                onClick={() => setRole("employer")}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  role === "employer"
                    ? "bg-white text-[#1C4980] shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                    : "text-[#5B6572] hover:text-[#1C2024]"
                }`}
              >
                I'm an Employer
              </button>
            </div>

            {/* 3 Social Authentication Buttons (Exact Unstop Buttons & Layout) */}
            <div className="space-y-2.5 pt-1">
              {/* Google Button */}
              <button
                type="button"
                onClick={() => handleOAuth("google")}
                disabled={!!oauthLoading || isSubmitting}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-[#DCE2EB] hover:border-slate-400 bg-white hover:bg-slate-50 text-[#1C2024] text-xs sm:text-sm font-semibold transition-colors duration-150"
              >
                {oauthLoading === "google" ? (
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-[#1C4980] rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              {/* LinkedIn Button (Official Unstop) */}
              <button
                type="button"
                onClick={() => handleOAuth("linkedin")}
                disabled={!!oauthLoading || isSubmitting}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-[#DCE2EB] hover:border-slate-400 bg-white hover:bg-slate-50 text-[#1C2024] text-xs sm:text-sm font-semibold transition-colors duration-150"
              >
                <svg className="w-4 h-4 text-[#0077B5] fill-current flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m1.4 9.74v-8.37H5.06v8.37z" />
                </svg>
                <span>Continue with LinkedIn</span>
              </button>

              {/* Microsoft Button (Official Unstop) */}
              <button
                type="button"
                onClick={() => handleOAuth("microsoft")}
                disabled={!!oauthLoading || isSubmitting}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-[#DCE2EB] hover:border-slate-400 bg-white hover:bg-slate-50 text-[#1C2024] text-xs sm:text-sm font-semibold transition-colors duration-150"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 21 21">
                  <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                  <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                  <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                  <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                </svg>
                <span>Continue with Microsoft</span>
              </button>
            </div>

            {/* Unstop OR Divider */}
            <div className="relative flex items-center justify-center py-2">
              <div className="border-t border-[#DCE2EB] w-full" />
              <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-[#8C97A7] absolute">
                OR
              </span>
            </div>

            {/* Error banner */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#1C2024] mb-1">
                  Email <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email"
                  className="w-full px-4 py-3 rounded-xl border border-[#DCE2EB] text-[#1C2024] text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#1C4980] focus:ring-1 focus:ring-[#1C4980] transition-colors"
                />
              </div>

              {/* Password Field (when in password mode) */}
              {authMode === "password" ? (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#1C2024]">
                      Password <span className="text-red-600">*</span>
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-[#1C4980] hover:underline font-semibold"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter Password"
                      className="w-full px-4 py-3 pr-10 rounded-xl border border-[#DCE2EB] text-[#1C2024] text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#1C4980] focus:ring-1 focus:ring-[#1C4980] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 p-1"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {/* Mode switch link */}
                  <div className="text-right mt-1.5">
                    <button
                      type="button"
                      onClick={() => setAuthMode("otp")}
                      className="text-xs text-[#1C4980] hover:underline font-semibold"
                    >
                      Login via OTP instead
                    </button>
                  </div>
                </div>
              ) : (
                /* In OTP mode: link to switch to Password mode */
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setAuthMode("password")}
                    className="text-xs text-[#1C4980] hover:underline font-semibold"
                  >
                    Login via Password
                  </button>
                </div>
              )}

              {/* Primary Action Button (Unstop #1C4980 Navy Blue) */}
              <button
                type="submit"
                disabled={!email || isSubmitting}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-200 mt-2 ${
                  email
                    ? "bg-[#1C4980] hover:bg-[#143763] text-white shadow-sm cursor-pointer"
                    : "bg-[#E5E9F0] text-[#9AA5B5] cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin mx-auto" />
                ) : authMode === "otp" ? (
                  "Continue with OTP"
                ) : (
                  "Log In"
                )}
              </button>
            </form>

            {/* Unstop Legal Notice */}
            <p className="text-[11.5px] text-center text-[#717D8D] leading-relaxed pt-1">
              By signing in, you accept the{" "}
              <Link href="/terms" className="text-[#1C4980] hover:underline">
                Terms of Service
              </Link>{" "}
              and acknowledge our{" "}
              <Link href="/privacy" className="text-[#1C4980] hover:underline">
                Privacy Policy
              </Link>
              .
            </p>

            {/* Don't have an account? Sign up */}
            <div className="mt-4 pt-3 border-t border-[#F1F3F6] text-center">
              <p className="text-xs text-[#5B6572]">
                Don't have an account?{" "}
                <Link href="/signup" className="text-[#1C4980] font-bold hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
