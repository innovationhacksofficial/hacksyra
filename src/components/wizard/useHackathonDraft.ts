"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { clientDb, firebaseReady } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { api } from "@/lib/api-client";
import { EDITABLE_STATUSES, isLive } from "@/lib/domain/status";
import { useHackathon } from "@/lib/data/hooks";
import type { Hackathon } from "@/types";
import type { WithId } from "@/lib/data/live";

export type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

function serializeTimestamps(v: unknown): unknown {
  if (v === null || v === undefined) return v;
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "object") {
    const obj = v as { toDate?: () => Date };
    if (typeof obj.toDate === "function") return obj.toDate().toISOString();
    if (Array.isArray(v)) return v.map(serializeTimestamps);
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v)) out[k] = serializeTimestamps(val);
    return out;
  }
  return v;
}

/**
 * Loads a hackathon draft live via onSnapshot and manages autosave (`draft` /
 * `more_info_required`) or explicit atomic save (`live` hackathons).
 */
export function useHackathonDraft(hackathonId: string | null) {
  const { data: rawDraft, isLoading, error } = useHackathon(hackathonId);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [localPatch, setLocalPatch] = useState<Record<string, unknown>>({});
  const timerRef = useRef<number | null>(null);
  const pendingRef = useRef<Record<string, unknown>>({});

  const liveMode = Boolean(rawDraft && isLive(rawDraft.status));

  const draft = useMemo(() => {
    if (!rawDraft) return rawDraft;
    if (Object.keys(localPatch).length === 0) return rawDraft;
    return { ...rawDraft, ...localPatch } as WithId<Hackathon>;
  }, [rawDraft, localPatch]);

  const flush = useCallback(async () => {
    if (!hackathonId || !firebaseReady()) return;
    const payload = pendingRef.current;
    if (Object.keys(payload).length === 0) return;
    pendingRef.current = {};
    setSaveState("saving");
    try {
      const canClientEdit = !rawDraft || EDITABLE_STATUSES.includes(rawDraft.status);
      if (canClientEdit) {
        await updateDoc(doc(clientDb(), COLLECTIONS.HACKATHONS, hackathonId), {
          ...payload,
          updatedAt: serverTimestamp(),
        });
      } else {
        await api(`/api/hackathons/${hackathonId}/edit`, {
          method: "POST",
          body: { patch: serializeTimestamps(payload) },
        });
      }
      setLocalPatch({});
      setSaveState("saved");
      setLastSavedAt(new Date());
    } catch {
      pendingRef.current = { ...payload, ...pendingRef.current };
      setSaveState("error");
    }
  }, [hackathonId, rawDraft]);

  const queuePatch = useCallback(
    (patch: Partial<Hackathon> & Record<string, unknown>, immediate = false) => {
      pendingRef.current = { ...pendingRef.current, ...patch };
      setLocalPatch((prev) => ({ ...prev, ...patch }));

      if (timerRef.current) window.clearTimeout(timerRef.current);

      // For live hackathons, hold non-immediate changes until explicit save so
      // partial typing in sensitive fields doesn't trigger re-review mid-sentence.
      if (rawDraft && !EDITABLE_STATUSES.includes(rawDraft.status) && !immediate) {
        setSaveState("dirty");
        return;
      }

      if (immediate) {
        void flush();
      } else {
        setSaveState("saving");
        timerRef.current = window.setTimeout(() => {
          void flush();
        }, 700);
      }
    },
    [flush, rawDraft]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  return { draft, isLoading, error, saveState, liveMode, lastSavedAt, queuePatch, flush };
}
