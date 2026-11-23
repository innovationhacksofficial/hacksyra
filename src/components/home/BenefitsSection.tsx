"use client";

import { motion } from "framer-motion";
import { Trophy, Users, Zap, Globe, Shield, BarChart3, CheckCircle, Star } from "lucide-react";

const PARTICIPANT_BENEFITS = [
  { icon: Trophy, title: "Win Real Prizes", description: "Compete for cash prizes, internships, job offers, and product credits from top companies." },
  { icon: Users, title: "Find Your Team", description: "Use our smart team discovery to connect with builders who complement your skills." },
  { icon: Star, title: "Build Your Portfolio", description: "Every project becomes a permanent portfolio entry — searchable by recruiters and companies." },
  { icon: Globe, title: "Global Reach", description: "Compete with builders from 150+ countries and get noticed by international companies." },
  { icon: CheckCircle, title: "Earn Certificates", description: "Get verifiable certificates for participation, finalist, and winner achievements." },
  { icon: Zap, title: "Learn by Doing", description: "Access workshops, mentors, and learning resources as part of each event." },
];

const ORGANIZER_BENEFITS = [
  { icon: BarChart3, title: "Powerful Analytics", description: "Real-time dashboards for registrations, payments, submissions, and judge progress." },
  { icon: Shield, title: "Secure Payments", description: "Integrated Razorpay & Stripe with atomic ticketing, webhooks, and automatic reconciliation." },
  { icon: Users, title: "Full Participant Management", description: "Registration forms, approvals, waitlists, check-in QR codes, and team management in one place." },
  { icon: Trophy, title: "Judging Made Easy", description: "Configurable rubrics, weighted scoring, conflict declarations, and automatic score aggregation." },
  { icon: Globe, title: "Global Audience", description: "Your event reaches 2M+ builders worldwide through search, recommendations, and community sharing." },
  { icon: CheckCircle, title: "Certificate Engine", description: "Automated certificate generation with unique serial numbers and public verification links." },
];

function BenefitGrid({ items, color }: { items: typeof PARTICIPANT_BENEFITS; color: "violet" | "aqua" }) {
  const iconColor = color === "violet" ? "text-violet-400" : "text-aqua-400";
  const bgColor = color === "violet" ? "bg-violet-500/10" : "bg-aqua-400/10";
  const borderColor = color === "violet" ? "border-violet-500/20" : "border-aqua-400/20";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item, i) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08, duration: 0.4 }}
          className={`p-5 rounded-2xl border ${borderColor} ${bgColor}`}
        >
          <div className={`w-10 h-10 rounded-xl ${bgColor} border ${borderColor} flex items-center justify-center mb-4`}>
            <item.icon size={20} className={iconColor} />
          </div>
          <h4 className="font-display font-semibold text-text-primary text-sm mb-1.5">{item.title}</h4>
          <p className="text-xs text-text-secondary leading-relaxed">{item.description}</p>
        </motion.div>
      ))}
    </div>
  );
}

export function BenefitsSection() {
  return (
    <section className="py-24 bg-surface-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="section-tag">
            <CheckCircle size={13} />
            Why HACKSYRA?
          </span>
          <h2 className="section-title">Built for Everyone in the Builder Economy</h2>
          <p className="section-subtitle mx-auto">
            Whether you're a weekend hacker or a Fortune 500 company running internal innovation programs — HACKSYRA is designed for you.
          </p>
        </div>

        {/* Participant benefits */}
        <div className="mb-16">
          <h3 className="flex items-center gap-2 text-base font-semibold text-text-primary mb-6">
            <span className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/25 flex items-center justify-center">
              <Users size={16} className="text-violet-400" />
            </span>
            For Participants & Builders
          </h3>
          <BenefitGrid items={PARTICIPANT_BENEFITS} color="violet" />
        </div>

        {/* Organizer benefits */}
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold text-text-primary mb-6">
            <span className="w-8 h-8 rounded-lg bg-aqua-400/10 border border-aqua-400/25 flex items-center justify-center">
              <Trophy size={16} className="text-aqua-400" />
            </span>
            For Organizers & Companies
          </h3>
          <BenefitGrid items={ORGANIZER_BENEFITS} color="aqua" />
        </div>
      </div>
    </section>
  );
}
