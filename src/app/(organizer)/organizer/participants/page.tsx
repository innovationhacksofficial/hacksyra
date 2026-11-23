"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { collection, orderBy, query, where } from "firebase/firestore";
import jsQR from "jsqr";
import { Check, Download, QrCode, Search, Users, X } from "lucide-react";
import { clientDb, firebaseReady } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLiveQuery } from "@/lib/data/live";
import { useMyHackathons } from "@/lib/data/hooks";
import { api } from "@/lib/api-client";
import { formatInZone, toDate } from "@/lib/domain/dates";
import {
  Button,
  CardSkeleton,
  DataList,
  EmptyState,
  Input,
  Modal,
  NotConfigured,
  PageHeader,
  StatusBadge,
  useToast,
} from "@/components/ui";
import type { Registration } from "@/types";

function ParticipantsInner() {
  const { firebaseUser, notConfigured } = useAuth();
  const params = useSearchParams();
  const toast = useToast();
  const uid = firebaseUser?.uid;
  const ready = Boolean(uid && firebaseReady());

  const { data: events } = useMyHackathons(uid);
  const [hackathonId, setHackathonId] = useState(params.get("hackathonId") ?? "all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  // Check-in Modal + QR Camera Scanner state
  const [scanOpen, setScanOpen] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastCheckIn, setLastCheckIn] = useState<{ attendeeName: string; ticketNumber: string; alreadyCheckedIn: boolean } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lockRef = useRef(false);

  const { data: regs, isLoading } = useLiveQuery<Registration>(
    ["org-participants", uid ?? null],
    ready ? () => query(collection(clientDb(), COLLECTIONS.REGISTRATIONS), where("organizerId", "==", uid), orderBy("createdAt", "desc")) : null
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (regs ?? []).filter((r) => {
      if (hackathonId !== "all" && r.hackathonId !== hackathonId) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (q && !`${r.userName ?? ""} ${r.userEmail ?? ""} ${r.hackathonName ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [regs, hackathonId, statusFilter, search]);

  async function decide(regId: string, decision: "approve" | "reject") {
    setBusyId(regId);
    try {
      await api(`/api/registrations/${regId}/decision`, { method: "POST", body: { decision } });
      toast.success(decision === "approve" ? "Participant approved" : "Registration rejected");
    } catch (e) {
      toast.error("Action failed", e instanceof Error ? e.message : undefined);
    } finally {
      setBusyId(null);
    }
  }

  function exportCsv() {
    const headers = ["Name", "Email", "Hackathon", "Status", "Type", "Registered At"];
    const escape = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = filtered.map((r) =>
      [
        r.userName ?? "",
        r.userEmail ?? "",
        r.hackathonName ?? "",
        r.status,
        r.registrationType,
        formatInZone(toDate(r.createdAt)),
      ]
        .map(escape)
        .join(",")
    );
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `participants-${hackathonId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function submitCheckIn(code: string) {
    if (!code.trim() || lockRef.current) return;
    lockRef.current = true;
    setScanning(true);
    try {
      const res = await api<{ attendeeName: string; ticketNumber: string; alreadyCheckedIn: boolean }>("/api/tickets/check-in", {
        method: "POST",
        body: { code: code.trim() },
      });
      setLastCheckIn(res);
      setManualCode("");
      toast.success(res.alreadyCheckedIn ? "Already checked in" : "Checked in!", res.attendeeName);
    } catch (e) {
      toast.error("Check-in failed", e instanceof Error ? e.message : undefined);
    } finally {
      setScanning(false);
      window.setTimeout(() => {
        lockRef.current = false;
      }, 1500);
    }
  }

  useEffect(() => {
    if (!scanOpen) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      return;
    }

    let cancelled = false;
    let raf = 0;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    async function startCamera() {
      setCameraError(null);
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Camera not available — enter ticket code manually below.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        const tick = () => {
          if (cancelled) return;
          const v = videoRef.current;
          if (v && v.readyState === v.HAVE_ENOUGH_DATA && ctx && !lockRef.current) {
            canvas.width = v.videoWidth;
            canvas.height = v.videoHeight;
            ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
            const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const found = jsQR(img.data, img.width, img.height);
            if (found?.data) {
              void submitCheckIn(found.data);
            }
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch {
        setCameraError("Camera permission denied or unavailable — enter ticket number manually below.");
      }
    }

    void startCamera();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanOpen]);

  if (notConfigured) return <NotConfigured service="Firestore" />;

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Participants & Check-In"
        description="Manage attendees in real time, approve pending applications, export CSVs, and scan QR passes."
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button variant="secondary" onClick={exportCsv} disabled={filtered.length === 0} leftIcon={<Download size={15} />}>
              Export CSV ({filtered.length})
            </Button>
            <Button onClick={() => setScanOpen(true)} leftIcon={<QrCode size={16} />}>
              Scan / Check-In QR
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input placeholder="Search name or email..." leftAdornment={<Search size={15} />} value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input" value={hackathonId} onChange={(e) => setHackathonId(e.target.value)}>
          <option value="all">All my hackathons</option>
          {(events ?? []).map((h) => (
            <option key={h.id} value={h.id}>
              {h.name || "Untitled"}
            </option>
          ))}
        </select>
        <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="checked_in">Checked in</option>
          <option value="pending_approval">Pending approval</option>
          <option value="waitlisted">Waitlisted</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {isLoading ? (
        <CardSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Users size={22} />} title="No participants found" description="Registrations update live as builders join your hackathons." />
      ) : (
        <DataList
          items={filtered}
          keyExtractor={(r) => r.id}
          columns={[
            {
              key: "user",
              header: "Participant",
              cell: (r) => (
                <div>
                  <p className="font-semibold text-slate-900">{r.userName || "Builder"}</p>
                  <p className="text-xs text-slate-500">{r.userEmail}</p>
                </div>
              ),
            },
            {
              key: "event",
              header: "Hackathon",
              cell: (r) => <span className="text-xs sm:text-sm font-medium text-slate-700">{r.hackathonName}</span>,
            },
            {
              key: "status",
              header: "Status",
              cell: (r) => <StatusBadge status={r.status} />,
            },
            {
              key: "date",
              header: "Registered",
              cell: (r) => <span className="text-xs text-slate-500">{formatInZone(toDate(r.createdAt))}</span>,
            },
            {
              key: "actions",
              header: "Actions",
              cell: (r) =>
                r.status === "pending_approval" ? (
                  <div className="flex items-center gap-1.5">
                    <Button size="sm" loading={busyId === r.id} onClick={() => void decide(r.id, "approve")} leftIcon={<Check size={13} />}>
                      Approve
                    </Button>
                    <Button size="sm" variant="danger" loading={busyId === r.id} onClick={() => void decide(r.id, "reject")} leftIcon={<X size={13} />}>
                      Reject
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">{r.teamId ? "In Team" : "Solo"}</span>
                ),
            },
          ]}
        />
      )}

      {/* QR Scanner & Check-In Modal */}
      <Modal open={scanOpen} onClose={() => setScanOpen(false)} title="Attendee QR Check-In" maxWidth="max-w-md">
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center">
            <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
            {cameraError && (
              <p className="absolute inset-0 flex items-center justify-center p-4 text-center text-xs text-slate-200 bg-slate-900/80">
                {cameraError}
              </p>
            )}
          </div>

          {lastCheckIn && (
            <div className="rounded-xl p-3.5 bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-0.5">
              <p className="font-bold">
                {lastCheckIn.alreadyCheckedIn ? "Already Checked In" : "Successfully Checked In ✓"}
              </p>
              <p>
                <strong>{lastCheckIn.attendeeName}</strong> · <span className="font-mono">{lastCheckIn.ticketNumber}</span>
              </p>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submitCheckIn(manualCode);
            }}
            className="flex items-end gap-2"
          >
            <div className="flex-1">
              <Input
                label="Or enter Ticket Number / Code"
                placeholder="e.g. TKT-..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
              />
            </div>
            <Button type="submit" loading={scanning}>
              Verify
            </Button>
          </form>
        </div>
      </Modal>
    </div>
  );
}

export default function OrganizerParticipantsPage() {
  return (
    <Suspense fallback={<CardSkeleton />}>
      <ParticipantsInner />
    </Suspense>
  );
}
