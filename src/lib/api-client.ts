"use client";

import { clientAuth, firebaseReady } from "@/lib/firebase/client";

export class ApiClientError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

/**
 * Calls a HACKSYRA API route. Attaches a fresh Firebase ID token (so server
 * role checks see current claims) and the session cookie. Throws ApiClientError
 * with a user-presentable message on failure.
 */
export async function api<T = unknown>(
  path: string,
  init: { method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; body?: unknown; signal?: AbortSignal } = {}
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (init.body !== undefined) headers["Content-Type"] = "application/json";

  if (firebaseReady()) {
    const u = clientAuth().currentUser;
    if (u) {
      try {
        headers.Authorization = `Bearer ${await u.getIdToken()}`;
      } catch {
        /* fall back to cookie */
      }
    }
  }

  let res: Response;
  try {
    res = await fetch(path, {
      method: init.method ?? (init.body !== undefined ? "POST" : "GET"),
      headers,
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      credentials: "same-origin",
      signal: init.signal,
    });
  } catch {
    throw new ApiClientError(0, "network", "You appear to be offline. Check your connection and try again.");
  }

  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    /* empty body */
  }

  if (!res.ok) {
    const e = (json as { error?: { code?: string; message?: string; details?: unknown } } | null)?.error;
    throw new ApiClientError(res.status, e?.code ?? "error", e?.message ?? `Request failed (${res.status}).`, e?.details);
  }
  return json as T;
}

