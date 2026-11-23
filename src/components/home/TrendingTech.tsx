"use client";

import { motion } from "framer-motion";
import { Code2, Cpu, Globe, Database, Shield, Layers, Zap, Terminal } from "lucide-react";

const TECHNOLOGIES = [
  { name: "Artificial Intelligence", icon: Cpu, count: 2840, color: "text-violet-400", bg: "bg-violet-500/10" },
  { name: "Web Development", icon: Globe, count: 3200, color: "text-signal-blue", bg: "bg-signal-blue/10" },
  { name: "Blockchain & Web3", icon: Layers, count: 1100, color: "text-amber", bg: "bg-amber/10" },
  { name: "Cybersecurity", icon: Shield, count: 760, color: "text-red-400", bg: "bg-red-500/10" },
  { name: "Data Science", icon: Database, count: 1900, color: "text-aqua-400", bg: "bg-aqua-400/10" },
  { name: "Developer Tools", icon: Terminal, count: 640, color: "text-text-secondary", bg: "bg-white/5" },
  { name: "Mobile Apps", icon: Zap, count: 1480, color: "text-violet-400", bg: "bg-violet-500/10" },
  { name: "Open Source", icon: Code2, count: 920, color: "text-aqua-400", bg: "bg-aqua-400/10" },
];

const TAGS = [
  "Python", "React", "TypeScript", "Rust", "Go", "Solidity", "TensorFlow",
  "PyTorch", "Node.js", "Next.js", "FastAPI", "Flutter", "SwiftUI",
  "Kotlin", "AWS", "GCP", "Docker", "Kubernetes", "GraphQL", "Figma",
  "Arduino", "RaspberryPi", "FPGA", "Postgres", "MongoDB", "Redis",
  "LangChain", "OpenAI", "Hugging Face", "Terraform", "WebAssembly",
];

export function TrendingTech() {
  return (
    <section className="py-24 bg-midnight overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="section-tag">
            <Code2 size={13} />
            Explore by Technology
          </span>
          <h2 className="section-title">Build With What You Love</h2>
          <p className="section-subtitle mx-auto">
            Find hackathons organized around the technologies and domains you're passionate about.
          </p>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {TECHNOLOGIES.map((tech, i) => (
            <motion.a
              key={tech.name}
              href={`/hackathons?category=${encodeURIComponent(tech.name)}`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className={`flex flex-col items-center gap-3 p-5 rounded-2xl border border-white/8 ${tech.bg} hover:border-white/15 transition-all duration-200 cursor-pointer group text-center`}
            >
              <div className={`w-12 h-12 rounded-xl ${tech.bg} border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                <tech.icon size={22} className={tech.color} />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">{tech.name}</p>
                <p className="text-xs text-text-secondary mt-0.5">{tech.count.toLocaleString()} hackathons</p>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Scrolling tag cloud */}
        <div>
          <p className="text-xs uppercase tracking-widest text-text-secondary/50 font-semibold text-center mb-6">
            Popular Technologies
          </p>
          {/* Row 1 — scroll left */}
          <div className="relative overflow-hidden mb-3">
            <motion.div
              animate={{ x: [0, -1600] }}
              transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
              className="flex gap-3 whitespace-nowrap"
            >
              {[...TAGS, ...TAGS].map((tag, i) => (
                <a
                  key={`${tag}-${i}`}
                  href={`/hackathons?tech=${encodeURIComponent(tag)}`}
                  className="skill-tag text-sm px-4 py-2 flex-shrink-0"
                >
                  {tag}
                </a>
              ))}
            </motion.div>
          </div>
          {/* Row 2 — scroll right */}
          <div className="relative overflow-hidden">
            <motion.div
              animate={{ x: [-1600, 0] }}
              transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
              className="flex gap-3 whitespace-nowrap"
            >
              {[...TAGS.reverse(), ...TAGS].map((tag, i) => (
                <a
                  key={`${tag}-r-${i}`}
                  href={`/hackathons?tech=${encodeURIComponent(tag)}`}
                  className="skill-tag text-sm px-4 py-2 flex-shrink-0"
                >
                  {tag}
                </a>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
