"use client";

import { useMemo, useState } from "react";
import { addDoc, collection, limit, orderBy, query, serverTimestamp, where } from "firebase/firestore";
import { Code2, Heart, Search, ExternalLink, Github, Video, MessageSquare, Send } from "lucide-react";
import { clientDb, firebaseReady } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLiveQuery } from "@/lib/data/live";
import { api } from "@/lib/api-client";
import { formatInZone, toDate } from "@/lib/domain/dates";
import { Button, EmptyState, Input, Modal, NotConfigured, CardSkeleton, useToast } from "@/components/ui";
import { Markdown } from "@/components/common/Markdown";
import type { Project } from "@/types";

type CommentDoc = { authorId: string; authorName: string; body: string; createdAt: unknown };

export default function ProjectsGalleryPage() {
  const { firebaseUser, user, notConfigured } = useAuth();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [techFilter, setTechFilter] = useState("all");
  const [selected, setSelected] = useState<Project | null>(null);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);

  const { data: projects, isLoading } = useLiveQuery<Project>(["public-projects"], () =>
    query(
      collection(clientDb(), COLLECTIONS.PROJECTS),
      where("isPublic", "==", true),
      where("status", "==", "published"),
      orderBy("likesCount", "desc"),
      limit(80)
    )
  );

  const { data: comments } = useLiveQuery<CommentDoc>(
    ["project-comments", selected?.id ?? null],
    selected?.id
      ? () => query(collection(clientDb(), COLLECTIONS.PROJECTS, selected.id, "comments"), orderBy("createdAt", "desc"))
      : null
  );

  const allTechs = useMemo(() => {
    const s = new Set<string>();
    (projects ?? []).forEach((p) => (p.technologies ?? []).forEach((t) => s.add(t)));
    return Array.from(s).slice(0, 12);
  }, [projects]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (projects ?? []).filter((p) => {
      if (techFilter !== "all" && !(p.technologies ?? []).includes(techFilter)) return false;
      if (q && !`${p.title} ${p.tagline ?? ""} ${(p.technologies ?? []).join(" ")}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [projects, search, techFilter]);

  async function toggleLike(e: React.MouseEvent, projectId: string) {
    e.stopPropagation();
    if (!firebaseUser) {
      toast.info("Sign in to like projects");
      return;
    }
    try {
      await api(`/api/projects/${projectId}/like`, { method: "POST", body: {} });
    } catch {
      toast.error("Couldn't update like");
    }
  }

  async function addComment(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !firebaseUser || !firebaseReady() || !commentText.trim()) return;
    setPosting(true);
    try {
      await addDoc(collection(clientDb(), COLLECTIONS.PROJECTS, selected.id, "comments"), {
        authorId: firebaseUser.uid,
        authorName: user?.displayName || firebaseUser.displayName || "Builder",
        body: commentText.trim(),
        createdAt: serverTimestamp(),
      });
      setCommentText("");
    } catch {
      toast.error("Couldn't post comment");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="container-app py-8 sm:py-10 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="section-tag">Showcase</span>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900">Project Gallery</h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">Real builds shipped at HACKSYRA hackathons.</p>
        </div>
        <Button href="/dashboard/projects">Publish Your Project</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input placeholder="Search projects or technologies..." leftAdornment={<Search size={16} />} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select value={techFilter} onChange={(e) => setTechFilter(e.target.value)} className="input sm:w-48">
          <option value="all">All technologies</option>
          {allTechs.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {notConfigured ? (
        <NotConfigured service="Firestore" />
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Code2 size={22} />} title="No projects published yet" description="Be the first builder to publish a project!" action={<Button href="/dashboard/projects">Create Project</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <div key={p.id} onClick={() => setSelected(p)} className="card-hover p-5 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display font-bold text-lg text-slate-900 line-clamp-1">{p.title}</h3>
                  <button
                    type="button"
                    onClick={(e) => void toggleLike(e, p.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100 shrink-0"
                  >
                    <Heart size={13} /> {p.likesCount ?? 0}
                  </button>
                </div>
                {p.tagline && <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mt-1">{p.tagline}</p>}
              </div>
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                {(p.technologies ?? []).slice(0, 4).map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded bg-[#EEF4FF] text-[#1565D8] text-[11px] font-semibold">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.title} maxWidth="max-w-2xl">
        {selected && (
          <div className="space-y-5">
            {selected.tagline && <p className="text-sm font-medium text-slate-700">{selected.tagline}</p>}
            <div className="flex flex-wrap gap-2">
              {selected.liveUrl && (
                <a href={selected.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-primary btn-sm">
                  <ExternalLink size={13} /> Live Demo
                </a>
              )}
              {selected.repositoryUrl && (
                <a href={selected.repositoryUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm">
                  <Github size={13} /> Source Code
                </a>
              )}
              {selected.demoVideoUrl && (
                <a href={selected.demoVideoUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm">
                  <Video size={13} /> Video Pitch
                </a>
              )}
            </div>

            <Markdown content={selected.description} />

            {[
              ["Inspiration", selected.inspiration],
              ["How we built it", selected.howItWorks],
              ["Challenges", selected.challenges],
              ["What's next", selected.futurePlans],
            ]
              .filter(([, text]) => Boolean(text))
              .map(([heading, text]) => (
                <div key={String(heading)} className="pt-3 border-t border-slate-100">
                  <h4 className="font-display font-bold text-sm text-slate-900 mb-1">{heading}</h4>
                  <p className="text-xs sm:text-sm text-slate-600 whitespace-pre-wrap">{text}</p>
                </div>
              ))}

            <div className="pt-4 border-t border-slate-200 space-y-3">
              <h4 className="font-display font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <MessageSquare size={15} /> Comments ({comments?.length ?? 0})
              </h4>
              {firebaseUser && (
                <form onSubmit={addComment} className="flex gap-2">
                  <Input placeholder="Leave feedback..." value={commentText} onChange={(e) => setCommentText(e.target.value)} />
                  <Button type="submit" size="sm" loading={posting} leftIcon={<Send size={13} />}>
                    Post
                  </Button>
                </form>
              )}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(comments ?? []).map((c, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 text-xs space-y-0.5">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-900">{c.authorName}</span>
                      <span className="text-slate-400">{formatInZone(toDate(c.createdAt as never))}</span>
                    </div>
                    <p className="text-slate-700">{c.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
