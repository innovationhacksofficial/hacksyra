"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { sendEmailVerification } from "firebase/auth";
import { MailCheck, RefreshCw, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { completeSignIn } from "@/lib/auth/client-flow";
import { Button } from "@/components/ui";

function VerifyEmailInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { firebaseUser, loading } = useAuth();
  const [checking, setChecking] = useState(false);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  async function handleResend() {
    if (!firebaseUser || sending || cooldown > 0) return;
    setError(null);
    setMessage(null);
    setSending(true);
    try {
      await sendEmailVerification(firebaseUser);
      setMessage("Verification email sent! Check your inbox and spam folder.");
      setCooldown(60);
    } catch {
      setError("Could not send verification email right now. Try again shortly.");
    } finally {
      setSending(false);
    }
  }

  async function handleCheckVerified() {
    if (!firebaseUser) {
      router.push("/login");
      return;
    }
    setError(null);
    setChecking(true);
    try {
      await firebaseUser.reload();
      if (!firebaseUser.emailVerified) {
        setError("Your email isn't verified yet. Click the link in your inbox first, then try again.");
        return;
      }
      const { redirectTo } = await completeSignIn(firebaseUser, { next: params.get("next") });
      router.replace(redirectTo);
    } catch {
      setError("Could not verify your session. Try signing in again.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 p-1.5 shadow-sm">
            <Image src="/logos/ih_logo.png" alt="HACKSYRA" width={36} height={36} className="w-full h-full object-contain" />
          </div>
          <span className="font-display font-bold text-2xl text-slate-900">
            HACK<span className="text-[#1565D8]">SYRA</span>
          </span>
        </Link>
      </div>

      <div className="card p-7 sm:p-8 shadow-xl text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-[#EEF4FF] text-[#1565D8] flex items-center justify-center mx-auto">
          <MailCheck size={28} />
        </div>

        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900">Verify your email</h1>
          <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
            {firebaseUser?.email ? (
              <>
                We sent a verification link to <strong className="text-slate-900">{firebaseUser.email}</strong>. Click it to confirm your account.
              </>
            ) : (
              "Sign in and click the verification link in your inbox to unlock organizer tools."
            )}
          </p>
        </div>

        {error && (
          <div role="alert" className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 text-left">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {message && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">{message}</div>
        )}

        <div className="space-y-2.5">
          <Button
            onClick={handleCheckVerified}
            loading={checking || loading}
            rightIcon={<ArrowRight size={16} />}
            className="w-full"
            size="lg"
          >
            I&apos;ve verified — continue
          </Button>
          {firebaseUser && (
            <Button
              variant="secondary"
              onClick={handleResend}
              loading={sending}
              disabled={cooldown > 0}
              leftIcon={<RefreshCw size={15} />}
              className="w-full"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend verification email"}
            </Button>
          )}
        </div>

        <Link href="/dashboard" className="block text-xs font-semibold text-slate-500 hover:text-[#1565D8]">
          Continue to dashboard for now →
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto card h-80 skeleton" />}>
      <VerifyEmailInner />
    </Suspense>
  );
}

