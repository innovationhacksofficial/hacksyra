"use client";

import {
  collection,
  doc,
  limit as qLimit,
  orderBy,
  query,
  where,
  type QueryConstraint,
} from "firebase/firestore";
import { clientDb } from "@/lib/firebase/client";
import { COLLECTIONS, DOCS } from "@/lib/firebase/collections";
import { useLiveDoc, useLiveQuery } from "@/lib/data/live";
import type { Hackathon, Notification, PlatformSettings, PlatformStats } from "@/types";

// ─────────────────────────────────────────────────────────────
// Hackathons
// ─────────────────────────────────────────────────────────────

export type ListedSort = "startDate" | "registrationCloseDate" | "createdAt" | "registrationCount" | "totalPrizeInPaise";

/** Public, approved hackathons only (isListed is server-maintained, enforced by rules). */
export function useListedHackathons(opts: { sort?: ListedSort; direction?: "asc" | "desc"; limit?: number; featured?: boolean } = {}) {
  const { sort = "startDate", direction = sort === "startDate" || sort === "registrationCloseDate" ? "asc" : "desc", limit = 60, featured } = opts;
  return useLiveQuery<Hackathon>(["hackathons", "listed", sort, direction, limit, featured ?? null], () => {
    const c: QueryConstraint[] = [where("isListed", "==", true)];
    if (featured) c.push(where("isFeatured", "==", true));
    c.push(orderBy(sort, direction), qLimit(limit));
    return query(collection(clientDb(), COLLECTIONS.HACKATHONS), ...c);
  });
}

export function useHackathonBySlug(slug: string | null | undefined) {
  return useLiveQuery<Hackathon>(["hackathons", "slug", slug ?? null], slug
    ? () => query(collection(clientDb(), COLLECTIONS.HACKATHONS), where("slug", "==", slug), where("isListed", "==", true), qLimit(1))
    : null);
}

export function useHackathon(id: string | null | undefined) {
  return useLiveDoc<Hackathon>(["hackathon", id ?? null], id ? () => doc(clientDb(), COLLECTIONS.HACKATHONS, id) : null);
}

/** Organizer's own hackathons (all statuses). */
export function useMyHackathons(uid: string | null | undefined) {
  return useLiveQuery<Hackathon>(["hackathons", "owner", uid ?? null], uid
    ? () => query(collection(clientDb(), COLLECTIONS.HACKATHONS), where("organizerId", "==", uid), orderBy("updatedAt", "desc"))
    : null);
}

// ─────────────────────────────────────────────────────────────
// Platform
// ─────────────────────────────────────────────────────────────

export const DEFAULT_LISTING_FEE_PAISE = 300;

export function usePlatformSettings() {
  return useLiveDoc<PlatformSettings>(["platformSettings"], () => doc(clientDb(), COLLECTIONS.PLATFORM_SETTINGS, DOCS.PLATFORM_SETTINGS));
}

export function usePlatformStats() {
  return useLiveDoc<PlatformStats>(["platformStats"], () => doc(clientDb(), COLLECTIONS.STATS, DOCS.PLATFORM_STATS));
}

// ─────────────────────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────────────────────

export function useNotifications(uid: string | null | undefined, max = 50) {
  return useLiveQuery<Notification>(["notifications", uid ?? null, max], uid
    ? () => query(collection(clientDb(), COLLECTIONS.NOTIFICATIONS), where("userId", "==", uid), orderBy("createdAt", "desc"), qLimit(max))
    : null);
}
