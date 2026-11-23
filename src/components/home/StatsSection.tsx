"use client";

import { motion } from "framer-motion";
import { Users, Trophy, Code2, Globe, TrendingUp, Award } from "lucide-react";

const STATS = [
  { value: "10,000+", label: "Hackathons Hosted", icon: Trophy, color: "text-amber" },
  { value: "2M+", label: "Registered Builders", icon: Users, color: "text-violet-400" },
  { value: "₹50Cr+", label: "Prizes Distributed", icon: Award, color: "text-aqua-400" },
  { value: "500K+", label: "Projects Built", icon: Code2, color: "text-signal-blue" },
  { value: "150+", label: "Countries Reached", icon: Globe, color: "text-violet-400" },
  { value: "98%", label: "Organizer Satisfaction", icon: TrendingUp, color: "text-aqua-400" },
];

export function StatsSection() {
  return (
    <section className="relative py-16 bg-surface-1 border-y border-white/8">
      {/* Background subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/3 via-transparent to-aqua-400/3 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="text-center"
            >
              <div className="flex justify-center mb-2">
                <stat.icon size={20} className={stat.color} />
              </div>
              <div className={`text-2xl md:text-3xl font-display font-bold tabular ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-xs text-text-secondary mt-1 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
