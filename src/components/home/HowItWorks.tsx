"use client";

import { motion } from "framer-motion";
import { Search, UserPlus, Code2, Trophy, ArrowRight, Zap } from "lucide-react";

const STEPS = [
  {
    step: "01",
    icon: Search,
    title: "Discover Your Event",
    description:
      "Browse hundreds of hackathons by theme, technology, prize pool, location, and skill level. Filter by what matters to you — free events, student-friendly, or global competitions.",
    color: "violet",
    forWho: "Participants",
  },
  {
    step: "02",
    icon: UserPlus,
    title: "Register & Build Your Team",
    description:
      "Register solo or with a team. Use our built-in team discovery to find collaborators with complementary skills. Chat, plan, and get started together.",
    color: "aqua",
    forWho: "Participants",
  },
  {
    step: "03",
    icon: Code2,
    title: "Build & Submit",
    description:
      "Build your project during the hackathon window. Use our project editor to showcase your solution — video, repo, screenshots, tech stack, and your story.",
    color: "blue",
    forWho: "Participants",
  },
  {
    step: "04",
    icon: Trophy,
    title: "Win & Get Recognized",
    description:
      "Judges evaluate with transparent criteria. Winners are announced publicly. Receive certificates, prizes, and a permanent portfolio entry that showcases your work forever.",
    color: "amber",
    forWho: "Participants",
  },
];

const ORGANIZER_STEPS = [
  {
    step: "01",
    title: "Create Your Hackathon",
    description: "Use our 20-step guided wizard to configure every detail — format, prizes, tickets, judging rubrics, and custom registration forms. Autosaved at every step.",
  },
  {
    step: "02",
    title: "Publish & Promote",
    description: "Get platform approval, publish to our global audience, and share your event page with sponsors, colleges, and developer communities.",
  },
  {
    step: "03",
    title: "Manage & Analyze",
    description: "Track registrations, payments, team formation, submissions, and judging — all from one dashboard. Export detailed reports at any time.",
  },
  {
    step: "04",
    title: "Announce & Celebrate",
    description: "Publish results, issue beautiful certificates, fulfill prizes, and build your reputation as a trusted organizer on the Hacksyra network.",
  },
];

const colorMap: Record<string, { bg: string; border: string; icon: string; step: string }> = {
  violet: {
    bg: "bg-violet-500/10",
    border: "border-violet-500/25",
    icon: "text-violet-400",
    step: "text-violet-400",
  },
  aqua: {
    bg: "bg-aqua-400/10",
    border: "border-aqua-400/25",
    icon: "text-aqua-400",
    step: "text-aqua-400",
  },
  blue: {
    bg: "bg-signal-blue/10",
    border: "border-signal-blue/25",
    icon: "text-signal-blue",
    step: "text-signal-blue",
  },
  amber: {
    bg: "bg-amber/10",
    border: "border-amber/25",
    icon: "text-amber",
    step: "text-amber",
  },
};

export function HowItWorks() {
  return (
    <section className="py-24 bg-surface-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="section-tag">
            <Zap size={13} />
            Simple by Design
          </span>
          <h2 className="section-title">How HACKSYRA Works</h2>
          <p className="section-subtitle mx-auto">
            Whether you're here to compete or to build the next great hackathon — the journey is intuitive from start to finish.
          </p>
        </div>

        {/* Participant journey */}
        <div className="mb-20">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-text-secondary mb-8 flex items-center gap-2">
            <span className="w-6 h-px bg-violet-500" />
            For Participants
            <span className="w-6 h-px bg-violet-500" />
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => {
              const colors = colorMap[step.color];
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className={`relative p-6 rounded-2xl border ${colors.border} ${colors.bg} group`}
                >
                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <div className="absolute top-12 -right-3 w-6 h-px bg-white/10 hidden lg:block" />
                  )}

                  {/* Step number */}
                  <div className={`text-5xl font-display font-black opacity-10 ${colors.step} mb-4`}>
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <step.icon size={20} className={colors.icon} />
                  </div>

                  <h4 className="font-display font-semibold text-text-primary mb-2">{step.title}</h4>
                  <p className="text-sm text-text-secondary leading-relaxed">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Organizer journey */}
        <div className="card p-8 bg-surface-2/50">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-text-secondary mb-8 flex items-center gap-2">
            <span className="w-6 h-px bg-aqua-400" />
            For Organizers
            <span className="w-6 h-px bg-aqua-400" />
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ORGANIZER_STEPS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="relative"
              >
                {i < ORGANIZER_STEPS.length - 1 && (
                  <div className="absolute top-5 -right-3 w-6 h-px bg-white/10 hidden lg:block" />
                )}
                <div className="flex items-center gap-3 mb-3">
                  <span className="step-done text-xs">{step.step}</span>
                  <div className="flex-1 h-px bg-white/5" />
                </div>
                <h4 className="font-display font-semibold text-text-primary text-sm mb-2">{step.title}</h4>
                <p className="text-xs text-text-secondary leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <a href="/host" className="btn-aqua">
              Start Hosting Free
              <ArrowRight size={16} />
            </a>
            <a href="/pricing" className="btn-ghost text-text-secondary hover:text-text-primary">
              View organizer plans →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
