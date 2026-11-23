"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Trophy, Users, ArrowRight, Building2 } from "lucide-react";

const DEMO_ORGANIZERS = [
  {
    id: "1",
    name: "IIT Delhi Innovation Cell",
    slug: "iitd-innovation",
    logo: "https://ui-avatars.com/api/?name=IIT+Delhi&background=796CFF&color=fff&size=80&bold=true",
    type: "University",
    verified: true,
    hackathonsHosted: 28,
    participants: 45000,
    country: "India",
  },
  {
    id: "2",
    name: "Innovation Hacks",
    slug: "innovation-hacks",
    logo: "https://ui-avatars.com/api/?name=Innovation+Hacks&background=35DFC7&color=090D1A&size=80&bold=true",
    type: "Platform",
    verified: true,
    hackathonsHosted: 120,
    participants: 200000,
    country: "Global",
  },
  {
    id: "3",
    name: "Razorpay Developer Experience",
    slug: "razorpay-devex",
    logo: "https://ui-avatars.com/api/?name=Razorpay&background=4D9CFF&color=fff&size=80&bold=true",
    type: "Company",
    verified: true,
    hackathonsHosted: 15,
    participants: 38000,
    country: "India",
  },
  {
    id: "4",
    name: "GreenFuture Foundation",
    slug: "greenfuture",
    logo: "https://ui-avatars.com/api/?name=GreenFuture&background=35DFC7&color=090D1A&size=80&bold=true",
    type: "Nonprofit",
    verified: false,
    hackathonsHosted: 8,
    participants: 12000,
    country: "India",
  },
  {
    id: "5",
    name: "CryptoHub India",
    slug: "cryptohub-india",
    logo: "https://ui-avatars.com/api/?name=CryptoHub&background=FFBC70&color=090D1A&size=80&bold=true",
    type: "Community",
    verified: true,
    hackathonsHosted: 22,
    participants: 54000,
    country: "India",
  },
  {
    id: "6",
    name: "MedTech Alliance",
    slug: "medtech-alliance",
    logo: "https://ui-avatars.com/api/?name=MedTech&background=796CFF&color=fff&size=80&bold=true",
    type: "Association",
    verified: true,
    hackathonsHosted: 11,
    participants: 21000,
    country: "India",
  },
];

export function FeaturedOrganizers() {
  return (
    <section className="py-24 bg-surface-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="section-tag">
              <Building2 size={13} />
              Organizer Network
            </span>
            <h2 className="section-title">Trusted Hackathon Organizers</h2>
            <p className="section-subtitle">
              Join India's most active hackathon community — built by colleges, companies, and communities.
            </p>
          </div>
          <Link href="/organizations" className="btn-outline flex-shrink-0">
            All Organizers
            <ArrowRight size={15} />
          </Link>
        </div>

        <p className="text-xs text-text-secondary/40 font-mono mb-6">
          * Sample organizer profiles for demonstration purposes
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEMO_ORGANIZERS.map((org, i) => (
            <motion.div
              key={org.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="card-hover p-5 flex items-start gap-4"
            >
              {/* Logo */}
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10">
                  <Image
                    src={org.logo}
                    alt={org.name}
                    width={56}
                    height={56}
                    className="object-cover"
                  />
                </div>
                {org.verified && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-midnight border-2 border-midnight flex items-center justify-center">
                    <CheckCircle2 size={12} className="text-aqua-400 fill-aqua-400" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    href={`/organizations/${org.slug}`}
                    className="font-display font-semibold text-sm text-text-primary hover:text-violet-400 transition-colors truncate"
                  >
                    {org.name}
                  </Link>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="badge-gray text-[10px]">{org.type}</span>
                  <span className="text-[10px] text-text-secondary">{org.country}</span>
                </div>

                <div className="flex items-center gap-4 text-xs text-text-secondary">
                  <span className="flex items-center gap-1">
                    <Trophy size={11} className="text-amber" />
                    {org.hackathonsHosted} events
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={11} className="text-violet-400" />
                    {org.participants.toLocaleString()} builders
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Host CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 card p-8 bg-gradient-to-r from-violet-500/5 to-aqua-400/5 border-violet-500/20 text-center"
        >
          <h3 className="text-xl font-display font-semibold text-text-primary mb-2">
            Ready to host your hackathon?
          </h3>
          <p className="text-text-secondary text-sm mb-6 max-w-lg mx-auto">
            Join 500+ organizations running hackathons on HACKSYRA. Start free, scale when you need to.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/host" className="btn-primary btn-lg">
              Create Hackathon
              <ArrowRight size={16} />
            </Link>
            <Link href="/resources/organizer-guide" className="btn-ghost">
              Read organizer guide →
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
