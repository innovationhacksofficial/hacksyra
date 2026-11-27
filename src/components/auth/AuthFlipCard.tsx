"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  GoogleAuthProvider,
  GithubAuthProvider,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { Eye, EyeOff, AlertCircle, ArrowRight, Users, Trophy } from "lucide-react";
import { clientAuth } from "@/lib/firebase/client";
import { completeSignIn, authErrorMessage } from "@/lib/auth/client-flow";
import { homeForRole, normalizeRole, safeNext } from "@/lib/auth/roles";
import { useAuth } from "@/components/providers/AuthProvider";
import { publicEnv } from "@/lib/env";
import { Button, Input, NotConfigured } from "@/components/ui";
import { AuthStatsPanel } from "@/components/auth/AuthStatsPanel";
import { PasswordStrength } from "@/components/auth/PasswordStrength";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

const signupSchema = z
  .object({
    displayName: z.string().trim().min(2, "Enter your full name (at least 2 characters).").max(80),
    email: z.string().trim().email("Enter a valid email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Z]/, "Include at least one uppercase letter.")
      .regex(/[0-9]/, "Include at least one number."),
    confirmPassword: z.string(),
    terms: z.literal(true, { errorMap: () => ({ message: "Please accept the Terms of Service and Privacy Policy." }) }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55v-2.1c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.89-.39.98 0 1.97.13 2.89.39 2.21-1.49 3.18-1.18 3.18-1.18.63 1.58.23 2.75.11 3.04.74.8 1.19 1.83 1.19 3.08 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.66.79.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

export function AuthFlipCard({ initialMode }: { initialMode: "login" | "signup" }) {
  const params = useSearchParams();
  const reduced = useReducedMotion();
  const { firebaseUser, role: currentRole, loading, notConfigured } = useAuth();

  const nextParam = params.get("next");
  const roleParam = params.get("role") === "organizer" ? "organizer" : "participant";

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [role, setRole] = useState<"participant" | "organizer">(roleParam);
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [autoRedirecting, setAutoRedirecting] = useState(false);
  const activeSubmitRef = useRef(false);
  const triedAutoRef = useRef(false);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { displayName: "", email: "", password: "", confirmPassword: "" },
  });

  // If the visitor already has a Firebase user session (e.g. visited /login while signed in), verify cookie once and enter.
  useEffect(() => {
    if (loading || !firebaseUser || activeSubmitRef.current || triedAutoRef.current) return;
    triedAutoRef.current = true;
    setAutoRedirecting(true);

    (async () => {
      try {
        const sessRes = await fetch("/api/auth/session", { credentials: "same-origin" });
        const sess = (await sessRes.json().catch(() => ({}))) as { authenticated?: boolean; role?: string };
        if (sess.authenticated) {
          const dest = safeNext(nextParam) ?? homeForRole(normalizeRole(sess.role ?? currentRole));
          window.location.assign(dest);
          return;
        }
        const { redirectTo } = await completeSignIn(firebaseUser, { next: nextParam });
        window.location.assign(redirectTo);
      } catch (err) {
        // Stale client session (e.g. auth_time > 5m) — sign out cleanly so the user can sign in again without looping.
        await fbSignOut(clientAuth()).catch(() => {});
        setAutoRedirecting(false);
        setAuthError(authErrorMessage(err));
      }
    })();
  }, [loading, firebaseUser, nextParam, currentRole]);

  function flipTo(target: "login" | "signup") {
    if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setAuthError(null);
    setMode(target);
    const qs = new URLSearchParams(window.location.search);
    const search = qs.toString();
    window.history.replaceState(null, "", `/${target}${search ? `?${search}` : ""}`);
  }

  async function onLoginSubmit(values: LoginValues) {
    setAuthError(null);
    activeSubmitRef.current = true;
    try {
      const cred = await signInWithEmailAndPassword(clientAuth(), values.email, values.password);
      const { redirectTo } = await completeSignIn(cred.user, { next: nextParam });
      window.location.assign(redirectTo);
    } catch (err) {
      activeSubmitRef.current = false;
      setAuthError(authErrorMessage(err));
    }
  }

  async function onSignupSubmit(values: SignupValues) {
    setAuthError(null);
    activeSubmitRef.current = true;
    try {
      const cred = await createUserWithEmailAndPassword(clientAuth(), values.email, values.password);
      await updateProfile(cred.user, { displayName: values.displayName });
      sendEmailVerification(cred.user).catch(() => {});
      const { redirectTo } = await completeSignIn(cred.user, {
        requestedRole: role,
        displayName: values.displayName,
        next: nextParam,
      });
      window.location.assign(redirectTo);
    } catch (err) {
      activeSubmitRef.current = false;
      setAuthError(authErrorMessage(err));
    }
  }

  async function handleOAuth(provider: "google" | "github") {
    setAuthError(null);
    setOauthLoading(provider);
    activeSubmitRef.current = true;
    try {
      const p = provider === "google" ? new GoogleAuthProvider() : new GithubAuthProvider();
      const cred = await signInWithPopup(clientAuth(), p);
      const { redirectTo } = await completeSignIn(cred.user, {
        requestedRole: mode === "signup" ? role : undefined,
        next: nextParam,
      });
      window.location.assign(redirectTo);
    } catch (err) {
      activeSubmitRef.current = false;
      setAuthError(authErrorMessage(err));
    } finally {
      setOauthLoading(null);
    }
  }

  if (notConfigured) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl max-w-xl mx-auto">
        <NotConfigured
          service="Firebase Authentication"
          hint="Configure NEXT_PUBLIC_FIREBASE_* in .env.local or enable NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true and run npm run emulators."
        />
      </div>
    );
  }

  const busy = loginForm.formState.isSubmitting || signupForm.formState.isSubmitting || !!oauthLoading || autoRedirecting;

  const mobileBrandHeader = (
    <div className="md:hidden flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
      <Link href="/" className="inline-flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 p-1">
          <Image src="/logos/ih_logo.png" alt="HACKSYRA" width={28} height={28} className="w-full h-full object-contain" />
        </div>
        <span className="font-display font-bold text-lg text-slate-900">
          HACK<span className="text-[#1565D8]">SYRA</span>
        </span>
      </Link>
      <span className="badge-violet text-[11px]">Innovation Hacks</span>
    </div>
  );

  const errorBanner = authError ? (
    <div
      role="alert"
      aria-live="polite"
      className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700"
    >
      <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
      <span>{authError}</span>
    </div>
  ) : null;

  const oauthButtons = (labelPrefix: string) => (
    <div className={`grid gap-2.5 ${publicEnv.githubAuthEnabled ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
      <Button
        variant="secondary"
        onClick={() => handleOAuth("google")}
        loading={oauthLoading === "google"}
        disabled={busy}
        leftIcon={<GoogleIcon />}
        className="w-full"
      >
        {labelPrefix} with Google
      </Button>
      {publicEnv.githubAuthEnabled && (
        <Button
          variant="secondary"
          onClick={() => handleOAuth("github")}
          loading={oauthLoading === "github"}
          disabled={busy}
          leftIcon={<GithubIcon />}
          className="w-full"
        >
          {labelPrefix} with GitHub
        </Button>
      )}
    </div>
  );

  // 3D flip container: CSS perspective + Framer rotateY 0 <-> 180 (falls back to crossfade under reduced motion)
  const isFlipped = mode === "signup";

  return (
    <div style={{ perspective: 1600 }} className="w-full">
      <motion.div
        initial={false}
        animate={reduced ? { opacity: 1 } : { rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: reduced ? 0.01 : 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={reduced ? undefined : { transformStyle: "preserve-3d" }}
        className="grid w-full"
      >
        {/* ───────────────── FRONT FACE: LOG IN (0 deg) ───────────────── */}
        <section
          inert={isFlipped ? true : undefined}
          style={reduced ? undefined : { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          className={`[grid-area:1/1] ${
            isFlipped ? (reduced ? "hidden" : "pointer-events-none") : ""
          } bg-white rounded-3xl shadow-[0_24px_70px_-15px_rgba(15,23,42,0.14)] border border-slate-200/80 overflow-hidden flex flex-col md:flex-row min-h-[600px]`}
        >
          <AuthStatsPanel mode="login" />

          <div className="w-full md:w-[58%] p-6 sm:p-9 lg:p-10 flex flex-col justify-center">
            {mobileBrandHeader}

            <div className="mb-5">
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
                Log in to HACKSYRA
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Continue competing, managing teams, or hosting your next hackathon.
              </p>
            </div>

            <div className="space-y-4">
              {oauthButtons("Continue")}

              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 border-t border-slate-200" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  or with email
                </span>
                <div className="flex-1 border-t border-slate-200" />
              </div>

              {mode === "login" && errorBanner}

              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-3.5" noValidate>
                <Input
                  label="Email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  error={loginForm.formState.errors.email?.message}
                  {...loginForm.register("email")}
                />

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="login-password" className="label">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <Link href="/forgot-password" className="text-xs font-semibold text-[#1565D8] hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showLoginPw ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      aria-invalid={loginForm.formState.errors.password ? true : undefined}
                      className={`input pr-11 ${loginForm.formState.errors.password ? "input-error" : ""}`}
                      {...loginForm.register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPw((v) => !v)}
                      aria-label={showLoginPw ? "Hide password" : "Show password"}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700"
                    >
                      {showLoginPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password?.message && (
                    <p className="text-xs font-medium text-red-600 mt-1" role="alert">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  loading={loginForm.formState.isSubmitting || autoRedirecting}
                  disabled={busy}
                  rightIcon={<ArrowRight size={16} />}
                  className="w-full"
                >
                  {autoRedirecting ? "Entering workspace..." : "Log in"}
                </Button>
              </form>

              <p className="text-center text-xs sm:text-sm text-slate-600 pt-2 border-t border-slate-100">
                New to HACKSYRA?{" "}
                <button
                  type="button"
                  onClick={() => flipTo("signup")}
                  className="font-bold text-[#1565D8] hover:underline"
                >
                  Create an account
                </button>
              </p>
            </div>
          </div>
        </section>

        {/* ───────────────── BACK FACE: SIGN UP (180 deg) ───────────────── */}
        <section
          inert={!isFlipped ? true : undefined}
          style={
            reduced
              ? undefined
              : {
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }
          }
          className={`[grid-area:1/1] ${
            !isFlipped ? (reduced ? "hidden" : "pointer-events-none") : ""
          } bg-white rounded-3xl shadow-[0_24px_70px_-15px_rgba(15,23,42,0.14)] border border-slate-200/80 overflow-hidden flex flex-col md:flex-row min-h-[600px]`}
        >
          <AuthStatsPanel mode="signup" />

          <div className="w-full md:w-[58%] p-6 sm:p-9 lg:p-10 flex flex-col justify-center">
            {mobileBrandHeader}

            <div className="mb-4">
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
                Create your account
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Start as a participant or organizer — anyone can host a hackathon.
              </p>
            </div>

            {/* Role chooser: Participant / Organizer */}
            <div className="bg-slate-100 p-1 rounded-2xl grid grid-cols-2 gap-1 mb-4 border border-slate-200/70">
              {(
                [
                  { id: "participant", label: "Participant", sub: "Join & build", icon: Users },
                  { id: "organizer", label: "Organizer", sub: "Host hackathons", icon: Trophy },
                ] as const
              ).map((opt) => {
                const active = role === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setRole(opt.id)}
                    className={`relative flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-colors min-h-[44px] ${
                      active ? "text-[#1565D8]" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="signup-role-pill"
                        transition={{ duration: reduced ? 0.01 : 0.2 }}
                        className="absolute inset-0 bg-white rounded-xl shadow-xs border border-slate-200/80"
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <opt.icon size={15} />
                      <span>{opt.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-3.5">
              {oauthButtons("Sign up")}

              <div className="flex items-center gap-3 py-0.5">
                <div className="flex-1 border-t border-slate-200" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  or with email
                </span>
                <div className="flex-1 border-t border-slate-200" />
              </div>

              {mode === "signup" && errorBanner}

              <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-3" noValidate>
                <Input
                  label="Full Name"
                  autoComplete="name"
                  placeholder="Priya Nair"
                  required
                  error={signupForm.formState.errors.displayName?.message}
                  {...signupForm.register("displayName")}
                />

                <Input
                  label="Email"
                  type="email"
                  autoComplete="email"
                  placeholder="priya@example.com"
                  required
                  error={signupForm.formState.errors.email?.message}
                  {...signupForm.register("email")}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Input
                      label="Password"
                      type={showSignupPw ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Min 8 chars"
                      required
                      error={signupForm.formState.errors.password?.message}
                      rightAdornment={
                        <button
                          type="button"
                          onClick={() => setShowSignupPw((v) => !v)}
                          aria-label={showSignupPw ? "Hide password" : "Show password"}
                          className="text-slate-400 hover:text-slate-700 p-1"
                        >
                          {showSignupPw ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      }
                      {...signupForm.register("password")}
                    />
                  </div>
                  <Input
                    label="Confirm Password"
                    type={showSignupPw ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repeat password"
                    required
                    error={signupForm.formState.errors.confirmPassword?.message}
                    {...signupForm.register("confirmPassword")}
                  />
                </div>

                <PasswordStrength password={signupForm.watch("password") || ""} />

                <div>
                  <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      className="mt-0.5 w-4 h-4 rounded accent-[#1565D8]"
                      {...signupForm.register("terms")}
                    />
                    <span>
                      I agree to the{" "}
                      <Link href="/terms" className="text-[#1565D8] font-semibold hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-[#1565D8] font-semibold hover:underline">
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </label>
                  {signupForm.formState.errors.terms?.message && (
                    <p className="text-xs font-medium text-red-600 mt-1" role="alert">
                      {signupForm.formState.errors.terms.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  loading={signupForm.formState.isSubmitting}
                  disabled={busy}
                  rightIcon={<ArrowRight size={16} />}
                  className="w-full"
                >
                  Create {role === "organizer" ? "Organizer" : "Participant"} Account
                </Button>
              </form>

              <p className="text-center text-xs sm:text-sm text-slate-600 pt-2 border-t border-slate-100">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => flipTo("login")}
                  className="font-bold text-[#1565D8] hover:underline"
                >
                  Log in
                </button>
              </p>
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
