"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { collection, limit, orderBy, query, where, getDocs } from "firebase/firestore";
import { Search, Trophy, Code2, Users, ArrowRight, X, Clock, Sparkles } from "lucide-react";
import { clientDb, firebaseReady } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { StatusBadge, Avatar } from "@/components/ui/Primitives";
import type { Hackathon, Project, UserProfile } from "@/types";

type SearchResult =
  | { kind: "hackathon"; id: string; title: string; subtitle: string; href: string; status: string }
  | { kind: "project"; id: string; title: string; subtitle: string; href: string }
  | { kind: "builder"; id: string; title: string; subtitle: string; href: string; photoURL?: string };

const RECENT_KEY = "hacksyra_recent_searches";

export function CommandSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);

  const [term, setTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setActiveIdx(0);
    try {
      const saved = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      if (Array.isArray(saved)) setRecent(saved.slice(0, 5));
    } catch {
      /* ignore */
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(t);
    };
  }, [open]);

  function saveRecent(q: string) {
    const clean = q.trim();
    if (!clean) return;
    try {
      const next = [clean, ...recent.filter((r) => r.toLowerCase() !== clean.toLowerCase())].slice(0, 5);
      setRecent(next);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    if (!open) return;
    const clean = term.trim().toLowerCase();
    if (!clean || !firebaseReady()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const token = clean.split(/\s+/)[0].slice(0, 20);
    if (token.length < 2) {
      setResults([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const db = clientDb();
        const [hSnap, pSnap, bSnap] = await Promise.all([
          getDocs(
            query(
              collection(db, COLLECTIONS.HACKATHONS),
              where("isListed", "==", true),
              where("searchKeywords", "array-contains", token),
              limit(6)
            )
          ).catch(() => null),
          getDocs(
            query(
              collection(db, COLLECTIONS.PROJECTS),
              where("isPublic", "==", true),
              where("status", "==", "published"),
              orderBy("likesCount", "desc"),
              limit(20)
            )
          ).catch(() => null),
          getDocs(
            query(collection(db, COLLECTIONS.USER_PROFILES), where("isPublic", "==", true), limit(25))
          ).catch(() => null),
        ]);

        if (cancelled) return;
        const out: SearchResult[] = [];

        hSnap?.docs.forEach((d) => {
          const h = d.data() as Hackathon;
          out.push({
            kind: "hackathon",
            id: d.id,
            title: h.name,
            subtitle: `${h.mode} · ${h.organizerName || "Organizer"}`,
            href: `/hackathons/${h.slug}`,
            status: h.status,
          });
        });

        pSnap?.docs.forEach((d) => {
          const p = d.data() as Project;
          const hay = `${p.title} ${p.tagline ?? ""} ${(p.technologies ?? []).join(" ")}`.toLowerCase();
          if (hay.includes(clean)) {
            out.push({
              kind: "project",
              id: d.id,
              title: p.title,
              subtitle: p.tagline || (p.technologies ?? []).slice(0, 3).join(" · ") || "Project",
              href: `/projects?highlight=${d.id}`,
            });
          }
        });

        bSnap?.docs.forEach((d) => {
          const u = d.data() as UserProfile;
          const hay = `${u.displayName} ${u.username} ${(u.skills ?? []).join(" ")}`.toLowerCase();
          if (hay.includes(clean)) {
            out.push({
              kind: "builder",
              id: d.id,
              title: u.displayName,
              subtitle: `@${u.username}${u.college ? ` · ${u.college}` : ""}`,
              href: `/u/${u.username}`,
              photoURL: u.photoURL,
            });
          }
        });

        setResults(out.slice(0, 12));
        setActiveIdx(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [term, open]);

  function navigate(href: string) {
    if (term.trim()) saveRecent(term);
    onClose();
    router.push(href);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      onClose();
      return;
    }
    if (e.key === "ArrowDown" && results.length) {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp" && results.length) {
      e.preventDefault();
      setActiveIdx((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[activeIdx]) {
        navigate(results[activeIdx].href);
      } else if (term.trim()) {
        navigate(`/hackathons?q=${encodeURIComponent(term.trim())}`);
      }
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-modal flex items-start justify-center sm:pt-20 sm:px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Global search"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.01 : 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
          />

          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: reduced ? 0.01 : 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full h-full sm:h-auto sm:max-w-2xl bg-white sm:rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Input row */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
              <Search size={19} className="text-[#1565D8] shrink-0" />
              <input
                ref={inputRef}
                type="search"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Search hackathons, projects, or builders..."
                className="flex-1 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
              />
              <kbd className="hidden sm:inline-flex px-2 py-0.5 text-[11px] font-mono text-slate-400 bg-slate-100 rounded-md border border-slate-200">
                ESC
              </kbd>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close search"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Results / Quick picks */}
            <div className="flex-1 overflow-y-auto sm:max-h-[420px] p-2">
              {loading && (
                <div className="px-4 py-8 text-center text-xs text-slate-500">Searching live index...</div>
              )}

              {!loading && term.trim().length >= 2 && results.length === 0 && (
                <div className="px-4 py-10 text-center space-y-3">
                  <p className="text-sm font-medium text-slate-700">No direct matches for &ldquo;{term}&rdquo;</p>
                  <button
                    type="button"
                    onClick={() => navigate(`/hackathons?q=${encodeURIComponent(term.trim())}`)}
                    className="btn-secondary btn-sm"
                  >
                    Search all hackathons for &ldquo;{term}&rdquo; <ArrowRight size={13} />
                  </button>
                </div>
              )}

              {!loading && results.length > 0 && (
                <div className="space-y-1">
                  {results.map((r, i) => (
                    <button
                      key={`${r.kind}-${r.id}`}
                      type="button"
                      onClick={() => navigate(r.href)}
                      onMouseEnter={() => setActiveIdx(i)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                        i === activeIdx ? "bg-[#EEF4FF]" : "hover:bg-slate-50"
                      }`}
                    >
                      {r.kind === "builder" ? (
                        <Avatar name={r.title} src={r.photoURL} size="sm" />
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-slate-100 text-[#1565D8] flex items-center justify-center shrink-0">
                          {r.kind === "hackathon" ? <Trophy size={15} /> : <Code2 size={15} />}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{r.title}</p>
                        <p className="text-xs text-slate-500 truncate">{r.subtitle}</p>
                      </div>
                      {r.kind === "hackathon" ? (
                        <StatusBadge status={r.status} />
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400 uppercase">{r.kind}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {!term.trim() && (
                <div className="p-2 space-y-4">
                  {recent.length > 0 && (
                    <div>
                      <p className="px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Recent searches
                      </p>
                      <div className="flex flex-wrap gap-1.5 px-2">
                        {recent.map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setTerm(r)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#EEF4FF] text-xs font-medium text-slate-700 hover:text-[#1565D8] transition-colors"
                          >
                            <Clock size={12} /> {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Quick jump
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {[
                        { label: "Browse Hackathons", sub: "Live & upcoming events", href: "/hackathons", icon: Trophy },
                        { label: "Explore Projects", sub: "Built by the community", href: "/projects", icon: Code2 },
                        { label: "Find Builders", sub: "Team up with teammates", href: "/builders", icon: Users },
                        { label: "Host a Hackathon", sub: "Create, pay fee & go live", href: "/organizer/create", icon: Sparkles },
                      ].map((q) => (
                        <button
                          key={q.href}
                          type="button"
                          onClick={() => navigate(q.href)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors"
                        >
                          <div className="w-8 h-8 rounded-xl bg-[#EEF4FF] text-[#1565D8] flex items-center justify-center shrink-0">
                            <q.icon size={15} />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-900">{q.label}</p>
                            <p className="text-[11px] text-slate-500">{q.sub}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

