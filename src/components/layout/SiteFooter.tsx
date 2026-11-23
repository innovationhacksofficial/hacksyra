import Link from "next/link";
import Image from "next/image";

const COLS = [
  {
    title: "Discover",
    links: [
      { label: "Browse Hackathons", href: "/hackathons" },
      { label: "Project Gallery", href: "/projects" },
      { label: "Find Builders", href: "/builders" },
      { label: "Leaderboard", href: "/leaderboard" },
    ],
  },
  {
    title: "Organizers",
    links: [
      { label: "Host a Hackathon", href: "/host" },
      { label: "Create Event Wizard", href: "/organizer/create" },
      { label: "Pricing & Listing Fee", href: "/pricing" },
      { label: "Organizer Console", href: "/organizer" },
    ],
  },
  {
    title: "Workspace",
    links: [
      { label: "Participant Hub", href: "/dashboard" },
      { label: "My Teams", href: "/dashboard/teams" },
      { label: "Certificates", href: "/dashboard/certificates" },
      { label: "Judge Portal", href: "/judge" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "About Innovation Hacks", href: "/about" },
      { label: "Resources & Guides", href: "/resources" },
      { label: "Help Center & FAQ", href: "/help" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-[#F8FAFC] border-t border-slate-200 mt-16 pt-12 pb-24 md:pb-12 text-slate-600 text-sm">
      <div className="container-app">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 mb-8 border-b border-slate-200">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 p-1 shadow-xs flex items-center justify-center shrink-0">
              <Image src="/logos/ih_logo.png" alt="Innovation Hacks" width={36} height={36} className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-slate-900 tracking-tight">
                HACK<span className="text-[#1565D8]">SYRA</span>
              </span>
              <p className="text-xs text-slate-500">An Innovation Hacks Product · Discover, build &amp; host hackathons</p>
            </div>
          </Link>
          <div className="flex items-center gap-2.5">
            <Link href="/hackathons" className="btn-secondary btn-sm">
              Explore Hackathons
            </Link>
            <Link href="/organizer/create" className="btn-primary btn-sm">
              Host a Hackathon
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {COLS.map((col) => (
            <div key={col.title}>
              <h3 className="font-display font-bold text-slate-900 text-sm mb-3">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-slate-600 hover:text-[#1565D8] transition-colors text-xs sm:text-sm">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} HACKSYRA · Innovation Hacks. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-[#1565D8]">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#1565D8]">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-[#1565D8]">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

