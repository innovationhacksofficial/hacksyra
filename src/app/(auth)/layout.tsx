import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | HACKSYRA — Discover. Build. Compete.",
  description: "Sign in to your HACKSYRA account to discover hackathons, competitions, internships, and jobs.",
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // Constellation floating nodes data (Innovation Hacks community)
  const floatingAvatars = [
    // Top right cluster
    { top: "6%", right: "13%", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80", size: "w-11 h-11" },
    { top: "12%", right: "7%", badge: "IH", size: "w-7 h-7" },
    { top: "20%", right: "16%", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80", size: "w-8 h-8" },
    { top: "26%", right: "5%", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=90&auto=format&fit=crop&q=80", size: "w-9 h-9" },
    { top: "35%", right: "8%", badge: "IH", size: "w-7 h-7" },
    { top: "45%", right: "14%", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80", size: "w-8 h-8" },

    // Left cluster
    { top: "10%", left: "10%", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=90&auto=format&fit=crop&q=80", size: "w-9 h-9" },
    { top: "18%", left: "6%", badge: "IH", size: "w-7 h-7" },
    { bottom: "32%", left: "6%", badge: "IH", size: "w-8 h-8" },
    { bottom: "22%", left: "4%", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80", size: "w-8 h-8" },
    { bottom: "14%", left: "12%", img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=90&auto=format&fit=crop&q=80", size: "w-8 h-8" },
    { bottom: "8%", left: "7%", img: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=90&auto=format&fit=crop&q=80", size: "w-11 h-11" },
    { bottom: "2%", left: "15%", badge: "IH", size: "w-7 h-7" },

    // Bottom right
    { bottom: "10%", right: "11%", badge: "IH", size: "w-8 h-8" },
    { bottom: "18%", right: "18%", img: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80", size: "w-8 h-8" },
  ];

  return (
    <div className="min-h-screen bg-[#F0F4FA] flex flex-col justify-center items-center py-6 px-4 sm:px-6 relative overflow-hidden select-none">
      {/* Soft gradient glow vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.9)_0%,_rgba(240,244,250,0.95)_100%)] pointer-events-none" />

      {/* SVG constellation dotted bezier curves */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30 hidden lg:block" xmlns="http://www.w3.org/2000/svg">
        <path d="M 80 180 Q 150 140 220 220 T 350 400" fill="none" stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 3" />
        <path d="M 120 700 Q 180 620 220 750 T 320 850" fill="none" stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 3" />
        <path d="M 1200 80 Q 1350 160 1420 120 T 1500 240" fill="none" stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 3" />
        <path d="M 1280 280 Q 1400 380 1350 480 T 1450 620" fill="none" stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 3" />
        <path d="M 1150 720 Q 1300 800 1400 750" fill="none" stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 3" />
      </svg>

      {/* Constellation Nodes (Avatars + IH blue badges) */}
      {floatingAvatars.map((node, i) => (
        <div
          key={i}
          className="absolute hidden lg:flex items-center justify-center rounded-full pointer-events-none"
          style={{
            top: node.top,
            bottom: node.bottom,
            left: node.left,
            right: node.right,
          }}
        >
          {node.img ? (
            <img
              src={node.img}
              alt="Community member"
              className={`${node.size} rounded-full object-cover border-2 border-white shadow-md ring-1 ring-slate-200/80`}
            />
          ) : (
            <div className={`${node.size} rounded-full bg-[#1C4980] text-white flex items-center justify-center font-bold text-[10px] tracking-tight shadow-md border-2 border-white`}>
              {node.badge}
            </div>
          )}
        </div>
      ))}

      {/* Main Form Center Card */}
      <div className="relative z-10 w-full max-w-[940px] mx-auto my-auto">
        {children}
      </div>

      {/* Clean Footer */}
      <div className="relative z-10 mt-5 text-center text-[11px] text-slate-400 font-medium">
        © 2026 HACKSYRA · Powered by Innovation Hacks · All rights reserved
      </div>
    </div>
  );
}

