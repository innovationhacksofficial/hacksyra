"use client";

import Link from "next/link";
import { Twitter, Disc as Discord, Facebook, Linkedin } from "lucide-react";

export function DevpostFooter() {
  return (
    <footer className="bg-[#F8FAFC] border-t border-slate-200 mt-20 pt-16 pb-12 text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand Header with Logo */}
        <div className="flex items-center gap-3 mb-10 pb-8 border-b border-slate-200">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-xs border border-slate-200 bg-white flex items-center justify-center p-0.5 flex-shrink-0">
            <img
              src="/logo-circle.png"
              alt="Innovation Hacks"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="font-display font-black text-lg text-slate-900 tracking-tight">
              HACKSYRA
            </span>
            <p className="text-xs text-slate-500 font-medium">An Innovation Hacks Product</p>
          </div>
        </div>

        {/* 4 Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 sm:gap-12 mb-16">
          {/* Col 1 */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4 tracking-tight">Innovation Hacks</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="hover:text-slate-900 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-slate-900 transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-slate-900 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-slate-900 transition-colors">
                  Help
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4 tracking-tight">Hackathons</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/hackathons" className="hover:text-slate-900 transition-colors">
                  Browse hackathons
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-slate-900 transition-colors">
                  Explore projects
                </Link>
              </li>
              <li>
                <Link href="/organizer" className="hover:text-slate-900 transition-colors">
                  Host a hackathon
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-slate-900 transition-colors">
                  Hackathon guides
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4 tracking-tight">Portfolio</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
                  Your projects
                </Link>
              </li>
              <li>
                <Link href="/dashboard/hackathons" className="hover:text-slate-900 transition-colors">
                  Your hackathons
                </Link>
              </li>
              <li>
                <Link href="/dashboard/settings" className="hover:text-slate-900 transition-colors">
                  Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4 tracking-tight">Connect</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 hover:text-slate-900 transition-colors"
                >
                  <Twitter size={16} />
                  <span>Twitter</span>
                </a>
              </li>
              <li>
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 hover:text-slate-900 transition-colors"
                >
                  <Discord size={16} />
                  <span>Discord</span>
                </a>
              </li>
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 hover:text-slate-900 transition-colors"
                >
                  <Facebook size={16} />
                  <span>Facebook</span>
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 hover:text-slate-900 transition-colors"
                >
                  <Linkedin size={16} />
                  <span>LinkedIn</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="pt-8 border-t border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} HACKSYRA by Innovation Hacks. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-5 sm:gap-8">
            <Link href="/rules" className="hover:underline">
              Community guidelines
            </Link>
            <Link href="/security" className="hover:underline">
              Security
            </Link>
            <Link href="/ca-notice" className="hover:underline">
              CA notice
            </Link>
            <Link href="/privacy" className="hover:underline">
              Privacy policy
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms of service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
