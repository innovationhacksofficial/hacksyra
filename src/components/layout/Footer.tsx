"use client";

import Link from "next/link";
import { Zap, ArrowRight, Mail, ExternalLink, MessageCircle, Code, Briefcase } from "lucide-react";

const FOOTER_LINKS = {
  Platform: [
    { label: "Discover Hackathons", href: "/hackathons" },
    { label: "Explore Projects", href: "/projects" },
    { label: "Builders", href: "/builders" },
    { label: "Organizations", href: "/organizations" },
    { label: "Pricing", href: "/pricing" },
  ],
  Organizers: [
    { label: "Host a Hackathon", href: "/host" },
    { label: "Organizer Guide", href: "/resources/organizer-guide" },
    { label: "Pricing for Organizers", href: "/pricing" },
    { label: "Verification", href: "/resources/verification" },
    { label: "Sponsor a Hackathon", href: "/resources/sponsors" },
  ],
  Resources: [
    { label: "Help Center", href: "/help" },
    { label: "Participant Guide", href: "/resources/participant-guide" },
    { label: "API Documentation", href: "/resources/api" },
    { label: "Community Guidelines", href: "/community-guidelines" },
    { label: "Blog", href: "/blog" },
  ],
  Company: [
    { label: "About HACKSYRA", href: "/about" },
    { label: "About Innovation Hacks", href: "/about/innovation-hacks" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
    { label: "Trust & Safety", href: "/trust-safety" },
  ],
};

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Cookie Policy", href: "/cookie-policy" },
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "Accessibility", href: "/accessibility" },
];

const SOCIAL_LINKS = [
  { icon: MessageCircle, href: "https://twitter.com/hacksyra", label: "Twitter / X" },
  { icon: Code, href: "https://github.com/hacksyra", label: "GitHub" },
  { icon: Briefcase, href: "https://linkedin.com/company/hacksyra", label: "LinkedIn" },
  { icon: ExternalLink, href: "https://instagram.com/hacksyra", label: "Instagram" },
  { icon: ExternalLink, href: "https://youtube.com/@hacksyra", label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="bg-surface-1 border-t border-white/8 mt-20">
      {/* Newsletter CTA */}
      <div className="border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-xl font-display font-semibold text-text-primary mb-1.5">
                Stay ahead of innovation.
              </h3>
              <p className="text-text-secondary text-sm">
                Get weekly updates on the best upcoming hackathons, builder stories, and platform news.
              </p>
            </div>
            <form
              className="flex gap-2 w-full md:w-auto"
              onSubmit={(e) => {
                e.preventDefault();
                // TODO: wire to newsletter service
              }}
            >
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex-1 min-w-[280px]">
                <Mail size={16} className="text-text-secondary flex-shrink-0" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  required
                  className="bg-transparent text-text-primary placeholder:text-text-secondary outline-none text-sm flex-1"
                  id="newsletter-email"
                />
              </div>
              <button type="submit" className="btn-primary flex-shrink-0">
                Subscribe
                <ArrowRight size={15} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-violet-gradient flex items-center justify-center">
                <Zap size={16} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display text-xl font-bold text-text-primary">
                HACK<span className="gradient-text">SYRA</span>
              </span>
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed mb-5">
              A Global Platform for Hackathons & Builders.
              <br />
              <span className="text-text-secondary/70 text-xs">An Innovation Hacks Product.</span>
            </p>
            <p className="text-xs text-text-secondary/60 font-mono mb-4">
              DISCOVER. BUILD. COMPETE.
            </p>
            {/* Social links */}
            <div className="flex gap-2">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/10 hover:border-white/15 transition-all duration-200"
                >
                  <social.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-text-secondary/60">
              © {new Date().getFullYear()} Innovation Hacks. All rights reserved.
              HACKSYRA is a platform product of Innovation Hacks.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {LEGAL_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-text-secondary/60 hover:text-text-secondary transition-colors duration-150"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
