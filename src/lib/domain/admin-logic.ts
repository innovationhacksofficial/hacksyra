import { computeLiveStatus, type TimelineDates } from "@/lib/domain/status";
import type { HackathonVisibility, UserRole } from "@/types";

export function canGrantRole(actorRole: UserRole, targetRole: UserRole): boolean {
  if (actorRole === "super_admin") return true;
  if (actorRole === "admin") {
    return targetRole !== "admin" && targetRole !== "super_admin";
  }
  return false;
}

export function nextStatusOnApprove(
  h: TimelineDates & { visibility?: HackathonVisibility; resultsPublished?: boolean },
  now = Date.now()
) {
  return {
    status: computeLiveStatus(h, now),
    isListed: (h.visibility ?? "public") === "public",
  };
}

export function isValidListingFeePaise(v: number): boolean {
  return Number.isInteger(v) && (v === 0 || (v >= 100 && v <= 100_000));
}

