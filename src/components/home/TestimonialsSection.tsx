"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import Image from "next/image";

// Demo testimonials — clearly marked
const TESTIMONIALS = [
  {
    id: "1",
    quote:
      "HACKSYRA made organizing our national hackathon 10x easier. The judging dashboard, payment integration, and real-time analytics saved us weeks of work.",
    name: "Rohan Sharma",
    role: "Tech Lead, IIT Delhi Innovation Cell",
    avatar: "https://ui-avatars.com/api/?name=Rohan+Sharma&background=796CFF&color=fff&size=80",
    rating: 5,
    type: "organizer",
  },
  {
    id: "2",
    quote:
      "I found my co-founder through HACKSYRA's team discovery feature. We won first place at a FinTech hackathon and now we're building a startup together.",
    name: "Priya Venkatesh",
    role: "Founder, Finnovate AI",
    avatar: "https://ui-avatars.com/api/?name=Priya+Venkatesh&background=35DFC7&color=090D1A&size=80",
    rating: 5,
    type: "participant",
  },
  {
    id: "3",
    quote:
      "The judging experience is the best I've seen on any hackathon platform. Blind judging, weighted rubrics, and clear assignment management made it a pleasure.",
    name: "Dr. Amit Patel",
    role: "AI Research Lead, Google India",
    avatar: "https://ui-avatars.com/api/?name=Amit+Patel&background=4D9CFF&color=fff&size=80",
    rating: 5,
    type: "judge",
  },
  {
    id: "4",
    quote:
      "We ran our company hackathon on HACKSYRA for 800 employees across 5 cities. The private event, custom branding, and analytics dashboards worked flawlessly.",
    name: "Meera Krishnan",
    role: "Innovation Manager, Tata Consultancy",
    avatar: "https://ui-avatars.com/api/?name=Meera+Krishnan&background=FFBC70&color=090D1A&size=80",
    rating: 5,
    type: "organizer",
  },
  {
    id: "5",
    quote:
      "As a first-time hackathon participant, the beginner-friendly filters and team formation feature made it so easy to get started. Won a prize on my second event!",
    name: "Kiran Rao",
    role: "CS Student, NIT Warangal",
    avatar: "https://ui-avatars.com/api/?name=Kiran+Rao&background=796CFF&color=fff&size=80",
    rating: 5,
    type: "participant",
  },
  {
    id: "6",
    quote:
      "The Razorpay integration worked perfectly for our paid hackathon. Ticket sales, refund management, and financial reports — all in one place. Highly recommended.",
    name: "Sanjay Gupta",
    role: "Director, DevFest India",
    avatar: "https://ui-avatars.com/api/?name=Sanjay+Gupta&background=35DFC7&color=090D1A&size=80",
    rating: 5,
    type: "organizer",
  },
];

const TYPE_BADGE: Record<string, { label: string; className: string }> = {
  organizer: { label: "Organizer", className: "badge-aqua" },
  participant: { label: "Participant", className: "badge-violet" },
  judge: { label: "Judge", className: "badge-amber" },
};

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-midnight overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="section-tag">
            <Quote size={13} />
            Community Love
          </span>
          <h2 className="section-title">Builders Trust HACKSYRA</h2>
          <p className="section-subtitle mx-auto">
            Hear from the participants, organizers, and judges who make up our global community.
          </p>
          <p className="text-xs text-text-secondary/40 font-mono mt-3">
            * Sample testimonials for demonstration — community reviews coming soon
          </p>
        </div>

        {/* Masonry-style grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
          {TESTIMONIALS.map((t, i) => {
            const badge = TYPE_BADGE[t.type];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="break-inside-avoid card p-6 group hover:border-violet-500/25 transition-all duration-300"
              >
                {/* Quote icon */}
                <Quote size={20} className="text-violet-500/40 mb-4" />

                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} className="text-amber fill-amber" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm text-text-secondary leading-relaxed mb-5">
                  "{t.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    width={40}
                    height={40}
                    className="rounded-xl"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">{t.name}</p>
                    <p className="text-xs text-text-secondary truncate">{t.role}</p>
                  </div>
                  <span className={`badge ${badge.className} flex-shrink-0 text-[10px]`}>
                    {badge.label}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
