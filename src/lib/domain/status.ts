import type { HackathonStatus } from "@/types";
import { toMillis, type DateLike } from "./dates";

/** Statuses in which an approved hackathon is visible to the public. */
export const LIVE_STATUSES: HackathonStatus[] = [
  "approved",
  "published",
  "registration_open",
  "registration_closed",
  "ongoing",
  "judging",
  "results_announced",
  "completed",
];

/** Statuses the organizer can still freely edit (no review needed). */
export const EDITABLE_STATUSES: HackathonStatus[] = ["draft", "payment_pending", "more_info_required", "rejected"];

export const STATUS_LABELS: Record<HackathonStatus, string> = {
  draft: "Draft",
  payment_pending: "Awaiting listing fee",
  pending_review: "Pending review",
  more_info_required: "More info required",
  suspended: "Suspended",
  approved: "Approved",
  published: "Published",
  registration_open: "Registration open",
  registration_closed: "Registration closed",
  ongoing: "Live now",
  judging: "Judging",
  results_announced: "Results announced",
  completed: "Completed",
  archived: "Archived",
  cancelled: "Cancelled",
  rejected: "Rejected",
};

/** Allowed manual transitions (server-enforced). Date-driven transitions use computeLiveStatus. */
const TRANSITIONS: Partial<Record<HackathonStatus, HackathonStatus[]>> = {
  draft: ["payment_pending", "pending_review", "cancelled"],
  payment_pending: ["pending_review", "draft", "cancelled"],
  pending_review: ["approved", "rejected", "more_info_required", "draft"],
  more_info_required: ["pending_review", "cancelled", "draft"],
  rejected: ["draft", "pending_review"],
  approved: ["published", "registration_open", "registration_closed", "ongoing", "judging", "results_announced", "completed", "suspended", "cancelled"],
  published: ["registration_open", "registration_closed", "ongoing", "judging", "results_announced", "completed", "suspended", "cancelled"],
  registration_open: ["registration_closed", "ongoing", "judging", "results_announced", "completed", "suspended", "cancelled"],
  registration_closed: ["registration_open", "ongoing", "judging", "results_announced", "completed", "suspended", "cancelled"],
  ongoing: ["judging", "results_announced", "completed", "suspended", "cancelled"],
  judging: ["results_announced", "completed", "suspended"],
  results_announced: ["completed", "archived"],
  completed: ["archived"],
  suspended: ["approved", "published", "registration_open", "registration_closed", "ongoing", "judging", "results_announced", "completed", "cancelled"],
};

export function canTransition(from: HackathonStatus, to: HackathonStatus): boolean {
  if (from === to) return true;
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export type TimelineDates = {
  publicationDate?: DateLike;
  registrationOpenDate?: DateLike;
  registrationCloseDate?: DateLike;
  startDate?: DateLike;
  endDate?: DateLike;
  submissionOpenDate?: DateLike;
  submissionCloseDate?: DateLike;
  judgingStartDate?: DateLike;
  judgingEndDate?: DateLike;
  resultsAnnouncementDate?: DateLike;
};

/**
 * For an approved (live) hackathon, derive the date-correct status.
 * `results_announced` is only entered manually (organizer publishes results) unless
 * the results date passed AND resultsPublished is true.
 */
export function computeLiveStatus(
  h: TimelineDates & { resultsPublished?: boolean },
  now: number = Date.now()
): HackathonStatus {
  const regOpen = toMillis(h.registrationOpenDate);
  const regClose = toMillis(h.registrationCloseDate);
  const start = toMillis(h.startDate);
  const end = toMillis(h.endDate);
  const subClose = toMillis(h.submissionCloseDate);
  const judgingEnd = toMillis(h.judgingEndDate);
  const results = toMillis(h.resultsAnnouncementDate);

  if (h.resultsPublished) {
    // after results, mark completed a week after results date (or after judging end)
    const doneAt = (results ?? judgingEnd ?? end ?? now) + 7 * 86_400_000;
    return now >= doneAt ? "completed" : "results_announced";
  }
  const hackEnd = Math.max(end ?? 0, subClose ?? 0);
  if (hackEnd && now >= hackEnd) return "judging";
  if (start && now >= start) return "ongoing";
  if (regClose && now >= regClose) return "registration_closed";
  if (regOpen && now >= regOpen) return "registration_open";
  return "published";
}

export function isLive(status: HackathonStatus | undefined): boolean {
  return !!status && LIVE_STATUSES.includes(status);
}

export function isRegistrationOpenAt(h: TimelineDates, now = Date.now()): boolean {
  const open = toMillis(h.registrationOpenDate);
  const close = toMillis(h.registrationCloseDate);
  return (open == null || now >= open) && (close == null || now < close);
}

export function isSubmissionOpenAt(h: TimelineDates, now = Date.now()): boolean {
  const open = toMillis(h.submissionOpenDate) ?? toMillis(h.startDate);
  const close = toMillis(h.submissionCloseDate) ?? toMillis(h.endDate);
  return (open == null || now >= open) && (close == null || now < close);
}
