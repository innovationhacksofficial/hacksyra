"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { sendPasswordResetEmail } from "firebase/auth";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { clientAuth } from "@/lib/firebase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button, Input, NotConfigured } from "@/components/ui";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { notConfigured } = useAuth();
  const reduced = useReducedMotion();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      await sendPasswordResetEmail(clientAuth(), data.email, { url: `${window.location.origin}/login` });
      setSent(true);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/user-not-found") {
        setSent(true);
      } else if (code === "auth/too-many-requests") {
        setError("email", { message: "Too many attempts. Wait a minute and try again." });
      } else if (code === "auth/invalid-email") {
        setError("email", { message: "That email address doesn't look right." });
      } else {
        setError("email", { message: "We couldn't send the reset email. Try again." });
      }
    }
  }

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0.01 : 0.25 }}
      className="max-w-md mx-auto"
    >
      <div className="text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 p-1.5 shadow-sm">
            <Image src="/logos/ih_logo.png" alt="HACKSYRA" width={36} height={36} className="w-full h-full object-contain" />
          </div>
          <span className="font-display font-bold text-2xl text-slate-900">
            HACK<span className="text-[#1565D8]">SYRA</span>
          </span>
        </Link>
        <h1 className="font-display font-bold text-2xl text-slate-900">Reset your password</h1>
        <p className="text-sm text-slate-500 mt-1">We&apos;ll email you a secure link to pick a new password.</p>
      </div>

      {notConfigured ? (
        <NotConfigured service="Firebase Authentication" />
      ) : (
        <div className="card p-6 sm:p-8 shadow-xl">
          {sent ? (
            <div className="text-center py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4 text-emerald-600">
                <CheckCircle2 size={28} />
              </div>
              <h2 className="font-display font-bold text-lg text-slate-900">Check your inbox</h2>
              <p className="text-sm text-slate-600 mt-2 mb-6 leading-relaxed">
                If an account exists for that email, password recovery instructions are on their way.
              </p>
              <Button href="/login" className="w-full">
                Back to log in
              </Button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <Input
                  label="Email Address"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  leftAdornment={<Mail size={16} />}
                  required
                  error={errors.email?.message}
                  {...register("email")}
                />
                <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
                  Send reset link
                </Button>
              </form>
              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#1565D8]">
                  <ArrowLeft size={14} /> Back to log in
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}
