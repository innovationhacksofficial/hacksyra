"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Zap, Trophy, Users, Sparkles } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-24 bg-surface-1">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-surface-2 to-aqua-400/15" />
          <div className="absolute inset-0 border border-white/10 rounded-3xl" />
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-aqua-400/10 blur-3xl" />
          <div className="noise absolute inset-0" />

          {/* Content */}
          <div className="relative z-10 px-8 md:px-16 py-16 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-sm font-medium mb-8">
              <Sparkles size={14} />
              Join 2 million builders worldwide
            </div>

            {/* Headline */}
            <h2 className="text-4xl md:text-5xl font-display font-bold text-text-primary mb-4 text-balance">
              Your Next Big Idea
              <br />
              <span className="gradient-text">Starts Here.</span>
            </h2>

            <p className="text-text-secondary text-lg mb-10 max-w-2xl mx-auto">
              Whether you're a first-time hacker, a seasoned builder, or an organization looking to run the next great innovation challenge — HACKSYRA is your platform.
            </p>

            {/* CTA grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              <Link
                href="/hackathons"
                className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-violet-500/10 hover:border-violet-500/30 transition-all duration-200 group"
              >
                <Trophy size={28} className="text-amber group-hover:scale-110 transition-transform duration-200" />
                <div>
                  <p className="font-semibold text-text-primary text-sm">Explore Hackathons</p>
                  <p className="text-xs text-text-secondary mt-0.5">Find your next competition</p>
                </div>
                <ArrowRight size={16} className="text-text-secondary group-hover:text-violet-400 group-hover:translate-x-1 transition-all duration-200" />
              </Link>

              <Link
                href="/signup"
                className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-violet-gradient border border-violet-500/0 hover:opacity-90 hover:scale-[1.02] transition-all duration-200 group"
              >
                <Users size={28} className="text-white group-hover:scale-110 transition-transform duration-200" />
                <div>
                  <p className="font-semibold text-white text-sm">Create Free Account</p>
                  <p className="text-xs text-white/70 mt-0.5">Join in under 60 seconds</p>
                </div>
                <ArrowRight size={16} className="text-white/70 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>

              <Link
                href="/host"
                className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-aqua-400/10 hover:border-aqua-400/30 transition-all duration-200 group"
              >
                <Zap size={28} className="text-aqua-400 group-hover:scale-110 transition-transform duration-200" />
                <div>
                  <p className="font-semibold text-text-primary text-sm">Host a Hackathon</p>
                  <p className="text-xs text-text-secondary mt-0.5">Free to start, pro when you scale</p>
                </div>
                <ArrowRight size={16} className="text-text-secondary group-hover:text-aqua-400 group-hover:translate-x-1 transition-all duration-200" />
              </Link>
            </div>

            {/* Tagline */}
            <p className="text-xs font-mono text-text-secondary/50 uppercase tracking-widest">
              HACKSYRA · DISCOVER. BUILD. COMPETE. · An Innovation Hacks Product.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
