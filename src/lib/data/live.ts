"use client";

/**
 * Real-time data hooks. Every list/doc in the app reads through these.
 * - Subscribes with onSnapshot and mirrors results into the TanStack Query cache,
 *   so navigating back renders instantly from cache, then stays live.
 * - Pass `null` as the query factory to disable (e.g. while auth is loading).
 */
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  onSnapshot,
  type DocumentData,
  type DocumentReference,
  type Query,
  type QueryDocumentSnapshot,
  type DocumentSnapshot,
} from "firebase/firestore";
import { firebaseReady } from "@/lib/firebase/client";

export type WithId<T> = T & { id: string };

export function mapDoc<T>(snap: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>): WithId<T> {
  return { id: snap.id, ...(snap.data() as T) };
}

export type LiveResult<T> = {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  /** true when Firebase is not configured in this environment */
  notConfigured: boolean;
};

export function useLiveQuery<T>(
  key: readonly unknown[],
  build: (() => Query<DocumentData>) | null
): LiveResult<WithId<T>[]> {
  const qc = useQueryClient();
  const keyStr = JSON.stringify(key);
  const enabled = build !== null;
  const [error, setError] = useState<Error | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);
  const queryKey = useMemo(() => ["live", ...key], [keyStr]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!build) return;
    if (!firebaseReady()) {
      setNotConfigured(true);
      return;
    }
    setError(null);
    let q: Query<DocumentData>;
    try {
      q = build();
    } catch (e) {
      setError(e as Error);
      return;
    }
    const unsub = onSnapshot(
      q,
      (snap) => qc.setQueryData(queryKey, snap.docs.map((d) => mapDoc<T>(d))),
      (e) => {
        console.warn("[live] query error", keyStr, e);
        setError(e);
      }
    );
    return unsub;
  }, [keyStr, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data } = useQuery<WithId<T>[]>({
    queryKey,
    queryFn: () => new Promise<WithId<T>[]>(() => {}), // filled by onSnapshot
    enabled: false,
    staleTime: Infinity,
    gcTime: 5 * 60_000,
  });

  return {
    data,
    isLoading: enabled && !notConfigured && data === undefined && !error,
    error,
    notConfigured,
  };
}

export function useLiveDoc<T>(
  key: readonly unknown[],
  build: (() => DocumentReference<DocumentData>) | null
): LiveResult<WithId<T> | null> {
  const qc = useQueryClient();
  const keyStr = JSON.stringify(key);
  const enabled = build !== null;
  const [error, setError] = useState<Error | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);
  const queryKey = useMemo(() => ["live-doc", ...key], [keyStr]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!build) return;
    if (!firebaseReady()) {
      setNotConfigured(true);
      return;
    }
    setError(null);
    let ref: DocumentReference<DocumentData>;
    try {
      ref = build();
    } catch (e) {
      setError(e as Error);
      return;
    }
    const unsub = onSnapshot(
      ref,
      (snap) => qc.setQueryData(queryKey, snap.exists() ? mapDoc<T>(snap) : null),
      (e) => {
        console.warn("[live] doc error", keyStr, e);
        setError(e);
      }
    );
    return unsub;
  }, [keyStr, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data } = useQuery<WithId<T> | null>({
    queryKey,
    queryFn: () => new Promise<WithId<T> | null>(() => {}),
    enabled: false,
    staleTime: Infinity,
    gcTime: 5 * 60_000,
  });

  return {
    data,
    isLoading: enabled && !notConfigured && data === undefined && !error,
    error,
    notConfigured,
  };
}
