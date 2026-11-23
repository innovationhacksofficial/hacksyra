"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Flame, Trophy, Users, ArrowRight } from "lucide-react";

const LIVE_EVENTS = [
  {
    icon: Flame,
    color: "text-amber-400",
    text: "Team NeuralByte submitted 'MediFlow AI' to PayPal AI Hackathon",
    time: "2 mins ago",
    linkText: "View Hackathon",
    href: "/hackathons/paypal-ai-hackathon",
  },
  {
    icon: Trophy,
    color: "text-yellow-400",
    text: "DevDynamos claimed 1st Place ($25,000 Grand Prize) in Kiroween Global Fest",
    time: "14 mins ago",
    linkText: "Winner Details",
    href: "/hackathons/kiroween-2026",
  },
  {
    icon: Zap,
    color: "text-blue-400",
    text: "₹10,00,000 Prize Pool unlocked for India AI Innovation Challenge",
    time: "28 mins ago",
    linkText: "Register Now",
    href: "/hackathons/india-ai-2026",
  },
  {
    icon: Users,
    color: "text-emerald-400",
    text: "284 builders formed 42 new hack teams in Bangalore & Chennai today",
    time: "45 mins ago",
    linkText: "Find Teammates",
    href: "#team-finder",
  },
];

export function LivePulseTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % LIVE_EVENTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const event = LIVE_EVENTS[currentIndex];
  const IconComponent = event.icon;

  return (
    <div className="h-[36px] bg-gradient-to-r from-slate-950 via-[#0A1628] to-slate-950 text-white text-xs border-b border-slate-800/90 flex items-center px-3 sm:px-4 relative z-50">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2 sm:gap-4 min-w-0">
        {/* Left Badge + Ticker Message */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 overflow-hidden">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase tracking-wider flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden xs:inline">Live Pulse</span>
            <span className="xs:hidden">Live</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 truncate min-w-0 flex-1">
            <IconComponent size={13} className={`${event.color} flex-shrink-0`} />
            <span className="truncate text-slate-200 font-medium text-[11px] sm:text-xs">
              {event.text}
            </span>
            <span className="hidden md:inline text-slate-500 font-mono text-[11px] flex-shrink-0">
              · {event.time}
            </span>
          </div>
        </div>

        {/* Right CTA + Dots */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 pr-0.5">
          <Link
            href={event.href}
            className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold text-sky-400 hover:text-sky-300 transition-colors"
          >
            <span>{event.linkText}</span>
            <ArrowRight size={11} />
          </Link>

          <div className="flex items-center gap-1">
            {LIVE_EVENTS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentIndex(i)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? "w-3 sm:w-3.5 bg-blue-400"
                    : "w-1 bg-slate-700 hover:bg-slate-500"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
