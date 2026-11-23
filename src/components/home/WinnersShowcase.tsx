"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Trophy, Star, ArrowRight, ExternalLink, Code2, Users } from "lucide-react";

const DEMO_WINNERS = [
  {
    id: "1",
    projectName: "NeuralFlow — AI Workflow Automation",
    hackathon: "India AI Innovation Challenge 2025",
    team: "ByteBusters",
    prize: "₹5,00,000",
    rank: 1,
    coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&auto=format&fit=crop&q=80",
    technologies: ["Python", "LangChain", "FastAPI", "React"],
    slug: "neuralflow-ai",
    members: ["Arjun M.", "Priya S.", "Vikram R."],
  },
  {
    id: "2",
    projectName: "GreenLedger — Carbon Credit Platform",
    hackathon: "Climate Tech Hackathon 2025",
    team: "EcoDevs",
    prize: "$5,000",
    rank: 1,
    coverImage: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80",
    technologies: ["Solidity", "React", "IoT", "IPFS"],
    slug: "greenledger",
    members: ["Sneha K.", "Rahul D."],
  },
  {
    id: "3",
    projectName: "MedAssist AI — Rural Healthcare",
    hackathon: "Healthcare Innovation Sprint 2025",
    team: "HealthHackers",
    prize: "$6,000",
    rank: 1,
    coverImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=600&auto=format&fit=crop&q=80",
    technologies: ["Flutter", "TensorFlow", "Firebase", "Node.js"],
    slug: "medassist-ai",
    members: ["Kavya P.", "Aditya B.", "Meera V."],
  },
];

export function WinnersShowcase() {
  return (
    <section className="py-24 bg-midnight">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="section-tag">
              <Trophy size={13} />
              Hall of Fame
            </span>
            <h2 className="section-title">Winning Projects</h2>
            <p className="section-subtitle">
              Real solutions built by real builders. See what innovation looks like on HACKSYRA.
            </p>
          </div>
          <Link href="/projects" className="btn-outline flex-shrink-0">
            Explore All Projects
            <ArrowRight size={15} />
          </Link>
        </div>

        <p className="text-xs text-text-secondary/40 font-mono mb-6">
          * Sample winning projects for demonstration
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DEMO_WINNERS.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="winner-card group"
            >
              {/* Cover */}
              <div className="relative h-48 -mx-6 -mt-6 mb-6 overflow-hidden rounded-t-2xl">
                <Image
                  src={project.coverImage}
                  alt={project.projectName}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-1/95 via-surface-1/30 to-transparent" />

                {/* Rank badge */}
                <div className="absolute top-4 left-4">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber/20 border border-amber/40 text-amber text-xs font-bold">
                    <Star size={12} className="fill-amber" />
                    {project.rank === 1 ? "🥇 1st Place" : project.rank === 2 ? "🥈 2nd Place" : "🥉 3rd Place"}
                  </span>
                </div>

                {/* Prize */}
                <div className="absolute top-4 right-4">
                  <span className="prize-pill text-xs">{project.prize}</span>
                </div>
              </div>

              {/* Content */}
              <div>
                <p className="text-xs text-text-secondary mb-1.5 font-medium">{project.hackathon}</p>
                <h3 className="font-display font-semibold text-text-primary mb-1 group-hover:text-amber transition-colors duration-200">
                  {project.projectName}
                </h3>

                {/* Team */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="avatar-stack">
                    {project.members.slice(0, 3).map((m, j) => (
                      <div key={j} className="avatar-stack-item text-[10px]">
                        {m[0]}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-text-secondary">{project.team}</span>
                </div>

                {/* Tech tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.technologies.map((t) => (
                    <span key={t} className="badge-gray text-[10px]">{t}</span>
                  ))}
                </div>

                <Link
                  href={`/projects/${project.slug}`}
                  className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors duration-200"
                >
                  <Code2 size={13} />
                  View Project
                  <ExternalLink size={11} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
