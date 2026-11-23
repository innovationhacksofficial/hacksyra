"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { sendPasswordResetEmail } from "firebase/auth";
import { clientAuth } from "@/lib/firebase/client";
import { Mail, Zap, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type FormData = { email: string };

export default function ForgotPasswordPage() {
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
        // Don't reveal whether the account exists
        setSent(true);
      } else if (code === "auth/too-many-requests") {
        setError("email", { message: "Too many attempts. Please wait a minute and try again." });
      } else if (code === "auth/invalid-email") {
        setError("email", { message: "That email address doesn't look right." });
      } else {
        setError("email", { message: "We couldn't send the reset email. Please try again." });
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1565D8] to-[#0EA5E9] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Zap size={20} className="text-white fill-white" />
          </div>
          <span className="font-display font-black text-2xl tracking-tight text-slate-900">
            HACK<span className="text-[#1565D8]">SYRA</span>
          </span>
        </Link>
        <h1 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight">
          Reset Password
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Enter your registered email and we will send password recovery instructions.
        </p>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm">
        {sent ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4 text-emerald-600">
              <CheckCircle2 size={30} />
            </div>
            <h2 className="text-lg font-display font-bold text-slate-900 mb-2">
              Check your inbox
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
              If an account exists with that email address, password reset instructions have been sent. Check your inbox and spam folder.
            </p>
            <Link
              href="/login"
              className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl bg-[#1C4980] text-white text-xs sm:text-sm font-bold hover:bg-[#143763] transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            {errors.root && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 mb-4 text-xs text-red-700">
                <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
                <span>{errors.root.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="developer@example.com"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
                      errors.email ? "border-red-500" : "border-slate-200"
                    } text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#1C4980] focus:ring-2 focus:ring-blue-50 transition-all`}
                    {...register("email")}
                  />
                </div>
                {errors.email?.message && (
                  <p className="text-[11px] text-red-500 font-medium mt-1">
                    {String(errors.email.message)}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1C4980] hover:bg-[#143763] text-white font-bold text-sm shadow-sm transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  "Send Reset Instructions"
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors"
              >
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
