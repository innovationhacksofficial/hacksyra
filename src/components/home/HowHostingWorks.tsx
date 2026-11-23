"use client";

import Link from "next/link";
import { FileEdit, CreditCard, ShieldCheck, Rocket, ArrowRight } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { DEFAULT_LISTING_FEE_PAISE, usePlatformSettings } from "@/lib/data/hooks";
import { formatMoney } from "@/lib/domain/money";

export function HowHostingWorks() {
  const { firebaseUser } = useAuth();
  const { data: settings } = usePlatformSettings();
  const feePaise = settings?.listingFeeInPaise ?? DEFAULT_LISTING_FEE_PAISE;
  const feeText = feePaise === 0 ? "Free" : formatMoney(feePaise, "INR");

  const hostHref = firebaseUser ? "/organizer/create" : "/signup?role=organizer&next=/organizer/create";

  const steps = [
    {
      step: "01",
      title: "Create your event",
      description: "Build tracks, prizes, judging rubrics, timelines and custom registration questions in our autosaved 9-step wizard.",
      icon: FileEdit,
      tone: "bg-blue-50 text-[#1565D8]",
    },
    {
      step: "02",
      title: `Pay ${feeText} listing fee`,
      description: `Complete a tiny ${feeText} platform listing payment via Razorpay to verify your event and prevent spam.`,
      icon: CreditCard,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      step: "03",
      title: "Admin review",
      description: "Our moderation team reviews your details, dates, and prize commitments, then notifies you immediately by email and in-app.",
      icon: ShieldCheck,
      tone: "bg-indigo-50 text-indigo-700",
    },
    {
      step: "04",
      title: "Go live in real time",
      description: "Once approved, your hackathon goes live instantly—accepting registrations, teams, submissions, judging & certificates.",
      icon: Rocket,
      tone: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-[#F8FAFC] border-y border-slate-200">
      <div className="container-app">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="section-tag">Host on HACKSYRA</span>
            <h2 className="section-title !mb-1">From idea to live hackathon in 4 steps</h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
              Anyone with an account—colleges, startups, communities, or enterprises—can host on HACKSYRA.
            </p>
          </div>
          <Link href={hostHref} className="btn-primary self-start md:self-auto">
            Start hosting now <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s) => (
            <div key={s.step} className="card p-5 sm:p-6 flex flex-col justify-between hover:border-[#1565D8]/40 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${s.tone}`}>
                    <s.icon size={21} />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-400">STEP {s.step}</span>
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900">{s.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

