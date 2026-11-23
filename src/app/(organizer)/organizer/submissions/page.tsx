"use client";

import { useMemo, useState } from "react";
import { collection, doc, orderBy, query, where } from "firebase/firestore";
import { ExternalLink, FileCode2, Github, Trophy, Video } from "lucide-react";
import { clientDb, firebaseReady } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLiveDoc, useLiveQuery } from "@/lib/data/live";
import { useMyHackathons } from "@/lib/data/hooks";
import { formatInZone, toDate } from "@/lib/domain/dates";
import { Markdown } from "@/components/common/Markdown";
import { CardSkeleton, DataList, EmptyState, Modal, NotConfigured, PageHeader, StatusBadge } from "@/components/ui";
import type { SubmissionWithMeta } from "@/types";

type SnapshotDoc = {
  project?: {
    title?: string;
    tagline?: string;
    description?: string;
    howItWorks?: string;
    challenges?: string;
    technologies?: string[];
    repositoryUrl?: string;
    liveUrl?: string;
    demoVideoUrl?: string;
  };
};

export default function OrganizerSubmissionsPage() {
  const { firebaseUser, notConfigured } = useAuth();
  const uid = firebaseUser?.uid;
  const ready = Boolean(uid && firebaseReady());

  const { data: events } = useMyHackathons(uid);
  const [hackathonId, setHackathonId] = useState("all");
  const [selected, setSelected] = useState<SubmissionWithMeta | null>(null);

  const { data: subs, isLoading } = useLiveQuery<SubmissionWithMeta>(
    ["org-submissions", uid ?? null],
    ready ? () => query(collection(clientDb(), COLLECTIONS.SUBMISSIONS), where("organizerId", "==", uid), orderBy("updatedAt", "desc")) : null
  );

  const { data: snapshot } = useLiveDoc<SnapshotDoc>(
    ["org-snap", selected?.snapshotId ?? null],
    selected?.snapshotId && firebaseReady() ? () => doc(clientDb(), COLLECTIONS.SUBMISSION_SNAPSHOTS, selected.snapshotId!) : null
  );

  const filtered = useMemo(() => {
    return (subs ?? []).filter((s) => hackathonId === "all" || s.hackathonId === hackathonId);
  }, [subs, hackathonId]);

  if (notConfigured) return <NotConfigured service="Firestore" />;

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Project Submissions"
        description="Inspect submitted projects and immutable deadline snapshots across your hackathons."
      />

      <div className="flex gap-3">
        <select className="input sm:w-80" value={hackathonId} onChange={(e) => setHackathonId(e.target.value)}>
          <option value="all">All hackathons</option>
          {(events ?? []).map((h) => (
            <option key={h.id} value={h.id}>
              {h.name || "Untitled"}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <CardSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<FileCode2 size={22} />} title="No submissions received yet" description="Teams and solo builders submitting to your hackathons appear here live." />
      ) : (
        <DataList
          items={filtered}
          keyExtractor={(s) => s.id}
          onRowClick={(s) => setSelected(s)}
          columns={[
            {
              key: "title",
              header: "Project",
              cell: (s) => (
                <div>
                  <p className="font-semibold text-slate-900">{s.projectTitle}</p>
                  <p className="text-xs text-slate-500">{s.teamName || "Solo entry"}</p>
                </div>
              ),
            },
            {
              key: "event",
              header: "Hackathon",
              cell: (s) => <span className="text-xs sm:text-sm text-slate-700">{s.hackathonName}</span>,
            },
            {
              key: "status",
              header: "Status",
              cell: (s) => (
                <div className="flex items-center gap-1.5">
                  <StatusBadge status={s.status} />
                  {s.rank && (
                    <span className="badge-amber">
                      <Trophy size={11} /> #{s.rank}
                    </span>
                  )}
                </div>
              ),
            },
            {
              key: "score",
              header: "Score",
              cell: (s) => <span className="font-bold tabular-nums text-[#1565D8]">{typeof s.finalScore === "number" ? s.finalScore.toFixed(1) : "—"}</span>,
            },
            {
              key: "date",
              header: "Submitted",
              cell: (s) => <span className="text-xs text-slate-500">{formatInZone(toDate(s.submittedAt ?? s.updatedAt))}</span>,
            },
          ]}
        />
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.projectTitle} maxWidth="max-w-2xl">
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <StatusBadge status={selected.status} />
              <span>{selected.teamName ? `Team: ${selected.teamName}` : "Solo entry"}</span>
              {typeof selected.finalScore === "number" && <span className="badge-blue">Score: {selected.finalScore.toFixed(1)}</span>}
            </div>
            {snapshot?.project ? (
              <>
                {snapshot.project.tagline && <p className="text-sm font-medium text-slate-700">{snapshot.project.tagline}</p>}
                <div className="flex flex-wrap gap-2">
                  {snapshot.project.liveUrl && (
                    <a href={snapshot.project.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-primary btn-sm">
                      <ExternalLink size={13} /> Live Demo
                    </a>
                  )}
                  {snapshot.project.repositoryUrl && (
                    <a href={snapshot.project.repositoryUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm">
                      <Github size={13} /> Source
                    </a>
                  )}
                  {snapshot.project.demoVideoUrl && (
                    <a href={snapshot.project.demoVideoUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm">
                      <Video size={13} /> Video
                    </a>
                  )}
                </div>
                {snapshot.project.description && <Markdown content={snapshot.project.description} />}
              </>
            ) : (
              <p className="text-sm text-slate-500">Snapshot captured · Track IDs: {(selected.trackIds ?? []).join(", ")}</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
