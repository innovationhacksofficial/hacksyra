import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in | HACKSYRA",
  description: "Sign in or create your HACKSYRA account to join hackathons, form teams, and host events.",
  robots: { index: false, follow: false },
};

const CONSTELLATION_NODES = [
  { pos: "top-[8%] left-[7%]", label: "IH", tone: "from-[#1565D8] to-[#0284C7]", size: "w-11 h-11 text-xs", delay: "0s" },
  { pos: "top-[18%] left-[14%]", label: "AI", tone: "from-indigo-600 to-[#1565D8]", size: "w-8 h-8 text-[10px]", delay: "0.8s" },
  { pos: "bottom-[24%] left-[6%]", label: "AK", tone: "from-sky-500 to-[#1565D8]", size: "w-9 h-9 text-[11px]", delay: "1.4s" },
  { pos: "bottom-[10%] left-[12%]", label: "IH", tone: "from-[#0F52B0] to-cyan-500", size: "w-10 h-10 text-xs", delay: "0.4s" },
  { pos: "top-[10%] right-[10%]", label: "PR", tone: "from-emerald-500 to-teal-600", size: "w-10 h-10 text-xs", delay: "1.1s" },
  { pos: "top-[24%] right-[5%]", label: "IH", tone: "from-[#1565D8] to-indigo-600", size: "w-8 h-8 text-[10px]", delay: "0.2s" },
  { pos: "bottom-[28%] right-[8%]", label: "SK", tone: "from-amber-500 to-orange-500", size: "w-9 h-9 text-[11px]", delay: "1.8s" },
  { pos: "bottom-[10%] right-[14%]", label: "DEV", tone: "from-[#1565D8] to-sky-500", size: "w-11 h-11 text-[10px]", delay: "0.6s" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F0F5FF] flex flex-col justify-center items-center py-6 sm:py-10 px-4 sm:px-6 relative overflow-hidden">
      {/* Radial ambient glow */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(21,101,216,0.10)_0%,_rgba(255,255,255,0.85)_55%,_rgba(240,245,255,1)_100%)] pointer-events-none"
      />

      {/* Lightweight SVG constellation lines (desktop / TV only) */}
      <svg
        aria-hidden
        className="absolute inset-0 w-full h-full pointer-events-none opacity-35 hidden xl:block"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M 90 120 Q 180 180 210 260 T 140 620" fill="none" stroke="#93C5FD" strokeWidth="1.2" strokeDasharray="4 4" />
        <path d="M 1220 90 Q 1340 180 1280 340 T 1360 660" fill="none" stroke="#93C5FD" strokeWidth="1.2" strokeDasharray="4 4" />
        <circle cx="14%" cy="22%" r="3" fill="#1565D8" opacity="0.3" />
        <circle cx="88%" cy="32%" r="3" fill="#0284C7" opacity="0.3" />
        <circle cx="10%" cy="76%" r="3" fill="#1565D8" opacity="0.3" />
        <circle cx="86%" cy="78%" r="3" fill="#0284C7" opacity="0.3" />
      </svg>

      {/* Initials / Brand Constellation Nodes */}
      {CONSTELLATION_NODES.map((n, idx) => (
        <div
          key={idx}
          aria-hidden
          style={{ animationDelay: n.delay }}
          className={`hidden xl:flex items-center justify-center absolute ${n.pos} ${n.size} rounded-full bg-gradient-to-br ${n.tone} text-white font-display font-bold shadow-md ring-4 ring-white/90 pointer-events-none motion-safe:animate-float`}
        >
          {n.label}
        </div>
      ))}

      <main className="relative z-10 w-full max-w-[980px] 3xl:max-w-[1060px] mx-auto my-auto">
        {children}
      </main>

      <footer className="relative z-10 mt-6 text-center text-xs text-slate-500 font-medium">
        © {new Date().getFullYear()} HACKSYRA · An Innovation Hacks Product
      </footer>
    </div>
  );
}
