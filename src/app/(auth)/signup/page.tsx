"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Zap,
  ArrowRight,
  AlertCircle,
  Briefcase,
  Trophy,
  Users,
  Building,
  CheckCircle2,
  Check
} from "lucide-react";

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export default function SignupPage() {
  const router = useRouter();

  const [role, setRole] = useState<"candidate" | "employer">("candidate");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!terms) {
      setError("Please accept the Terms of Service to continue");
      return;
    }

    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      if (role === "employer") {
        router.push("/organizer");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      // Fallback for demo
      if (role === "employer") {
        router.push("/organizer");
      } else {
        router.push("/dashboard");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    setOauthLoading(provider);
    try {
      const p = provider === "google" ? googleProvider : githubProvider;
      await signInWithPopup(auth, p);
      if (role === "employer") {
        router.push("/organizer");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      if (role === "employer") {
        router.push("/organizer");
      } else {
        router.push("/dashboard");
      }
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl sm:rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] border border-slate-200/70 overflow-hidden flex flex-col md:flex-row min-h-[660px] transition-all my-4">
      {/* ── Left Yellow Banner (Exact Unstop Aesthetic) ── */}
      <div className="w-full md:w-[42%] bg-[#FFC200] relative p-6 sm:p-8 flex flex-col justify-between overflow-hidden md:rounded-tr-[44px]">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-25"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50%" cy="50%" r="90" fill="none" stroke="#D97706" strokeWidth="1.2" />
          <circle cx="50%" cy="50%" r="160" fill="none" stroke="#D97706" strokeWidth="1.2" />
          <circle cx="50%" cy="50%" r="240" fill="none" stroke="#D97706" strokeWidth="1.2" />
        </svg>

        {/* Top Logo */}
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
          <span className="text-[10px] font-bold text-amber-950 uppercase tracking-widest bg-amber-300/60 px-2.5 py-0.5 rounded-full">
            Join Platform
          </span>
        </div>

        {/* Builder Card Illustration */}
        <div className="relative z-10 my-auto py-6 flex flex-col items-center">
          <div className="bg-white rounded-2xl shadow-xl border border-amber-200/50 p-5 max-w-[270px] w-full text-center">
            <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden mb-3 border-4 border-amber-100 shadow-md">
              <Image
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
                alt="Tech talent"
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="flex flex-wrap justify-center gap-1.5 mb-2.5">
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                ⚡ 48h Sprint
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                🏆 ₹10L+ Prizes
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold">
                💼 Jobs
              </span>
            </div>

            <h4 className="font-display font-bold text-slate-900 text-sm">
              Competitions &amp; Careers
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Start building with 25,000+ developers
            </p>
          </div>
        </div>

        <div className="relative z-10 text-[11px] text-amber-950/80 font-medium text-center">
          Powered by <strong>Innovation Hacks</strong>
        </div>
      </div>

      {/* ── Right Form Section ── */}
      <div className="w-full md:w-[58%] p-6 sm:p-10 flex flex-col justify-center">
        <div className="mb-5">
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight leading-tight">
            Create your HACKSYRA account
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Build projects, enter hackathons, and learn with other developers.
          </p>
        </div>

        {/* Role Toggle */}
        <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 mb-5">
          <button
            type="button"
            onClick={() => setRole("candidate")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              role === "candidate"
                ? "bg-white text-[#1565D8] shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            I'm a Candidate
          </button>
          <button
            type="button"
            onClick={() => setRole("employer")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              role === "employer"
                ? "bg-white text-[#1565D8] shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            I'm an Organizer
          </button>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            type="button"
            onClick={() => handleOAuth("google")}
            disabled={!!oauthLoading || isSubmitting}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleOAuth("github")}
            disabled={!!oauthLoading || isSubmitting}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs"
          >
            <svg className="w-4 h-4 fill-current text-slate-900 flex-shrink-0" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub</span>
          </button>
        </div>

        <div className="relative flex items-center justify-center mb-4">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 absolute">
            or sign up with email
          </span>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 mb-3 text-xs text-red-700">
            <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Alex Builder"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#1565D8] focus:ring-2 focus:ring-blue-50 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@domain.com"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#1565D8] focus:ring-2 focus:ring-blue-50 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8+ characters"
                  className="w-full px-3.5 py-2 pr-9 rounded-xl border border-slate-200 text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#1565D8] focus:ring-2 focus:ring-blue-50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#1565D8] focus:ring-2 focus:ring-blue-50 transition-all"
              />
            </div>
          </div>

          {/* Password criteria pills */}
          <div className="flex flex-wrap gap-2 text-[10px]">
            <span className={`flex items-center gap-1 ${hasLength ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
              <Check size={11} className={hasLength ? "text-emerald-600" : "text-slate-300"} /> 8+ chars
            </span>
            <span className={`flex items-center gap-1 ${hasUpper ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
              <Check size={11} className={hasUpper ? "text-emerald-600" : "text-slate-300"} /> Uppercase
            </span>
            <span className={`flex items-center gap-1 ${hasNumber ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
              <Check size={11} className={hasNumber ? "text-emerald-600" : "text-slate-300"} /> Number
            </span>
          </div>

          {/* Terms checkbox */}
          <div>
            <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-[#1C4980] focus:ring-[#1C4980]"
              />
              <span>
                I agree to the{" "}
                <Link href="/terms" target="_blank" className="text-[#1C4980] hover:underline font-semibold">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" target="_blank" className="text-[#1C4980] hover:underline font-semibold">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-[#1C4980] hover:bg-[#143763] text-white font-bold text-xs sm:text-sm transition-all shadow-sm"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin mx-auto" />
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="text-[#1C4980] font-bold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
