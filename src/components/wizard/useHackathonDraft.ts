"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { clientDb, firebaseReady } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useHackathon } from "@/lib/data/hooks";
import type { Hackathon } from "@/types";

export type SaveState = "idle" | "saving" | "saved" | "error";

/**
 * Loads a hackathon draft live via onSnapshot and provides a debounced autosave
 * helper (`patchDraft`) that only updates client-editable fields.
 */
export function useHackathonDraft(hackathonId: string | null) {
  const { data: draft, isLoading, error } = useHackathon(hackathonId);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const timerRef = useRef<number | null>(null);
  const pendingRef = useRef<Record<string, unknown>>({});

  const flush = useCallback(async () => {
    if (!hackathonId || !firebaseReady()) return;
    const payload = pendingRef.current;
    if (Object.keys(payload).length === 0) return;
    pendingRef.current = {};
    setSaveState("saving");
    try {
      await updateDoc(doc(clientDb(), COLLECTIONS.HACKATHONS, hackathonId), {
        ...payload,
        updatedAt: serverTimestamp(),
      });
      setSaveState("saved");
      setLastSavedAt(new Date());
    } catch {
      // Restore pending changes for next retry
      pendingRef.current = { ...payload, ...pendingRef.current };
      setSaveState("error");
    }
  }, [hackathonId]);

  const queuePatch = useCallback(
    (patch: Partial<Hackathon> & Record<string, unknown>, immediate = false) => {
      pendingRef.current = { ...pendingRef.current, ...patch };
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (immediate) {
        void flush();
      } else {
        setSaveState("saving");
        timerRef.current = window.setTimeout(() => {
          void flush();
        }, 700);
      }
    },
    [flush]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  return { draft, isLoading, error, saveState, lastSavedAt, queuePatch, flush };
}

