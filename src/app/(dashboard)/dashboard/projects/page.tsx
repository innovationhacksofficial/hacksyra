"use client";

import Image from "next/image";
import { useState } from "react";
import { collection, deleteDoc, doc, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { nanoid } from "nanoid";
import { Code2, Edit3, ExternalLink, Github, Plus, Send, Trash2, Upload, Video } from "lucide-react";
import { clientDb, firebaseReady } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLiveQuery } from "@/lib/data/live";
import { uploadToStorage } from "@/lib/storage/upload";
import { slugify } from "@/lib/domain/slug";
import { MarkdownEditor } from "@/components/common/MarkdownEditor";
import {
  Button,
  CardSkeleton,
  ConfirmDialog,
  EmptyState,
  Input,
  Modal,
  NotConfigured,
  PageHeader,
  StatusBadge,
  Textarea,
  useToast,
} from "@/components/ui";
import type { Project } from "@/types";

type ProjectFormState = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  inspiration: string;
  howItWorks: string;
  challenges: string;
  achievements: string;
  lessonsLearned: string;
  futurePlans: string;
  technologies: string;
  repositoryUrl: string;
  liveUrl: string;
  demoVideoUrl: string;
  coverImage: string;
  isPublic: boolean;
  status: "draft" | "published";
  isNew: boolean;
};

const EMPTY_FORM = (): ProjectFormState => ({
  id: `proj_${nanoid(10)}`,
  title: "",
  tagline: "",
  description: "",
  inspiration: "",
  howItWorks: "",
  challenges: "",
  achievements: "",
  lessonsLearned: "",
  futurePlans: "",
  technologies: "",
  repositoryUrl: "",
  liveUrl: "",
  demoVideoUrl: "",
  coverImage: "",
  isPublic: true,
  status: "draft",
  isNew: true,
});

function fromProject(p: Project): ProjectFormState {
  return {
    id: p.id,
    title: p.title ?? "",
    tagline: p.tagline ?? "",
    description: p.description ?? "",
    inspiration: p.inspiration ?? "",
    howItWorks: p.howItWorks ?? "",
    challenges: p.challenges ?? "",
    achievements: p.achievements ?? "",
    lessonsLearned: p.lessonsLearned ?? "",
    futurePlans: p.futurePlans ?? "",
    technologies: (p.technologies ?? []).join(", "),
    repositoryUrl: p.repositoryUrl ?? "",
    liveUrl: p.liveUrl ?? "",
    demoVideoUrl: p.demoVideoUrl ?? "",
    coverImage: p.coverImage ?? "",
    isPublic: Boolean(p.isPublic),
    status: p.status === "published" ? "published" : "draft",
    isNew: false,
  };
}

export default function MyProjectsPage() {
  const { firebaseUser, notConfigured } = useAuth();
  const toast = useToast();
  const uid = firebaseUser?.uid;
  const ready = Boolean(uid && firebaseReady());

  const [form, setForm] = useState<ProjectFormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [delBusy, setDelBusy] = useState(false);

  const { data: projects, isLoading } = useLiveQuery<Project>(
    ["my-projects", uid ?? null],
    ready ? () => query(collection(clientDb(), COLLECTIONS.PROJECTS), where("memberIds", "array-contains", uid), orderBy("updatedAt", "desc")) : null
  );

  async function saveProject(e: React.FormEvent) {
    e.preventDefault();
    if (!form || !uid || !firebaseReady()) return;
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    setSaving(true);
    try {
      const techs = form.technologies
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const baseFields = {
        title: form.title.trim(),
        slug: `${slugify(form.title) || "project"}-${form.id.slice(-4).toLowerCase()}`,
        tagline: form.tagline.trim(),
        description: form.description.trim(),
        inspiration: form.inspiration.trim(),
        howItWorks: form.howItWorks.trim(),
        challenges: form.challenges.trim(),
        achievements: form.achievements.trim(),
        lessonsLearned: form.lessonsLearned.trim(),
        futurePlans: form.futurePlans.trim(),
        technologies: techs,
        repositoryUrl: form.repositoryUrl.trim(),
        liveUrl: form.liveUrl.trim(),
        demoVideoUrl: form.demoVideoUrl.trim(),
        coverImage: form.coverImage.trim(),
        isPublic: form.isPublic,
        status: form.status,
        updatedAt: serverTimestamp(),
      };

      const ref = doc(clientDb(), COLLECTIONS.PROJECTS, form.id);
      if (form.isNew) {
        await setDoc(ref, {
          id: form.id,
          ...baseFields,
          ownerId: uid,
          memberIds: [uid],
          likesCount: 0,
          viewsCount: 0,
          bookmarksCount: 0,
          linkedHackathons: [],
          createdAt: serverTimestamp(),
        });
      } else {
        await updateDoc(ref, baseFields);
      }
      toast.success(form.isNew ? "Project created!" : "Project saved!");
      setForm(null);
    } catch (err) {
      toast.error("Couldn't save project", err instanceof Error ? err.message : undefined);
    } finally {
      setSaving(false);
    }
  }

  async function handleCoverUpload(file: File) {
    if (!form || !uid) return;
    setUploading(1);
    try {
      // If project doc doesn't exist yet, store under users/{uid}/project-covers/ so Storage rules succeed cleanly
      const storagePath = form.isNew
        ? `users/${uid}/project-covers/${form.id}`
        : `projects/${form.id}/cover-${Date.now()}`;
      const res = await uploadToStorage(storagePath, file, {
        maxMb: 5,
        accept: ["image/"],
        onProgress: (p) => setUploading(p),
      });
      setForm({ ...form, coverImage: res.url });
      toast.success("Cover image uploaded");
    } catch (err) {
      toast.error("Upload failed", err instanceof Error ? err.message : undefined);
    } finally {
      setUploading(null);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDelBusy(true);
    try {
      await deleteDoc(doc(clientDb(), COLLECTIONS.PROJECTS, deleting.id));
      toast.success("Project deleted");
      setDeleting(null);
    } catch (err) {
      toast.error("Couldn't delete project", err instanceof Error ? err.message : undefined);
    } finally {
      setDelBusy(false);
    }
  }

  if (notConfigured) return <NotConfigured service="Firestore" />;

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="My Projects"
        description="Build your project story, upload demos, and submit directly to hackathons."
        actions={
          <Button onClick={() => setForm(EMPTY_FORM())} leftIcon={<Plus size={16} />}>
            New Project
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : !projects || projects.length === 0 ? (
        <EmptyState
          icon={<Code2 size={22} />}
          title="No projects built yet"
          description="Create your first project showcase with live demos, GitHub links, and architecture notes."
          action={<Button onClick={() => setForm(EMPTY_FORM())}>Create Your First Project</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => (
            <div key={p.id} className="card overflow-hidden flex flex-col justify-between">
              <div>
                {p.coverImage && (
                  <div className="relative h-36 w-full bg-slate-100">
                    <Image src={p.coverImage} alt={p.title} fill className="object-cover" />
                  </div>
                )}
                <div className="p-5 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display font-bold text-lg text-slate-900 line-clamp-1">{p.title}</h3>
                    <StatusBadge status={p.status} />
                  </div>
                  {p.tagline && <p className="text-xs sm:text-sm text-slate-600 line-clamp-2">{p.tagline}</p>}
                  {(p.technologies ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {p.technologies.slice(0, 4).map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded bg-[#EEF4FF] text-[#1565D8] text-[11px] font-semibold">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                    {p.liveUrl && (
                      <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-[#1565D8]">
                        <ExternalLink size={12} /> Demo
                      </a>
                    )}
                    {p.repositoryUrl && (
                      <a href={p.repositoryUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-[#1565D8]">
                        <Github size={12} /> Repo
                      </a>
                    )}
                    {p.demoVideoUrl && (
                      <a href={p.demoVideoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-[#1565D8]">
                        <Video size={12} /> Video
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                <Button variant="secondary" size="sm" onClick={() => setForm(fromProject(p))} leftIcon={<Edit3 size={13} />}>
                  Edit
                </Button>
                <Button size="sm" href={`/dashboard/submissions?projectId=${p.id}`} leftIcon={<Send size={13} />}>
                  Submit
                </Button>
                {p.ownerId === uid && (
                  <Button variant="ghost" size="sm" onClick={() => setDeleting(p)} aria-label="Delete project" className="ml-auto text-red-600 hover:bg-red-50">
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Project Modal */}
      <Modal open={!!form} onClose={() => setForm(null)} title={form?.isNew ? "Create Project" : "Edit Project"} maxWidth="max-w-3xl">
        {form && (
          <form onSubmit={saveProject} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Project Title *" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. MedScan AI" />
              <Input label="One-line Tagline" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="What makes it stand out?" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="GitHub / Repo URL" type="url" value={form.repositoryUrl} onChange={(e) => setForm({ ...form, repositoryUrl: e.target.value })} placeholder="https://github.com/..." />
              <Input label="Live Demo URL" type="url" value={form.liveUrl} onChange={(e) => setForm({ ...form, liveUrl: e.target.value })} placeholder="https://..." />
              <Input label="Demo Video URL" type="url" value={form.demoVideoUrl} onChange={(e) => setForm({ ...form, demoVideoUrl: e.target.value })} placeholder="https://youtube.com/..." />
            </div>

            <Input
              label="Tech Stack (comma separated)"
              value={form.technologies}
              onChange={(e) => setForm({ ...form, technologies: e.target.value })}
              placeholder="Next.js, Firebase, PyTorch, Tailwind CSS"
            />

            <div className="form-field">
              <label className="label">Cover Image</label>
              <div className="flex flex-wrap items-center gap-3">
                <label className="btn-secondary btn-sm cursor-pointer">
                  <Upload size={14} /> {uploading !== null ? `Uploading ${uploading}%...` : "Upload Cover"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void handleCoverUpload(f);
                    }}
                  />
                </label>
                {form.coverImage && (
                  <span className="text-xs text-emerald-700 font-medium truncate max-w-xs">Cover image attached</span>
                )}
              </div>
            </div>

            <MarkdownEditor
              label="Project Overview & What It Does *"
              required
              rows={6}
              value={form.description}
              onChange={(next) => setForm({ ...form, description: next })}
              placeholder="Explain the problem, architecture, and key features using Markdown..."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Textarea label="Inspiration" rows={3} value={form.inspiration} onChange={(e) => setForm({ ...form, inspiration: e.target.value })} />
              <Textarea label="How We Built It" rows={3} value={form.howItWorks} onChange={(e) => setForm({ ...form, howItWorks: e.target.value })} />
              <Textarea label="Challenges & Lessons" rows={3} value={form.challenges} onChange={(e) => setForm({ ...form, challenges: e.target.value })} />
              <Textarea label="What's Next" rows={3} value={form.futurePlans} onChange={(e) => setForm({ ...form, futurePlans: e.target.value })} />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} className="rounded border-slate-300" />
                  Visible in Project Gallery
                </label>
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.status === "published"}
                    onChange={(e) => setForm({ ...form, status: e.target.checked ? "published" : "draft" })}
                    className="rounded border-slate-300"
                  />
                  Published
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" type="button" onClick={() => setForm(null)}>
                  Cancel
                </Button>
                <Button type="submit" loading={saving}>
                  Save Project
                </Button>
              </div>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={delBusy}
        danger
        title={`Delete "${deleting?.title}"?`}
        message="This removes the project permanently from your portfolio."
        confirmLabel="Delete Project"
      />
    </div>
  );
}
