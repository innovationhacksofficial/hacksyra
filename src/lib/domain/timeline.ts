import { toMillis, type DateLike } from "./dates";

export type TimelineInput = {
  registrationOpenDate?: DateLike;
  registrationCloseDate?: DateLike;
  teamFormationDeadline?: DateLike;
  startDate?: DateLike;
  endDate?: DateLike;
  submissionOpenDate?: DateLike;
  submissionCloseDate?: DateLike;
  judgingStartDate?: DateLike;
  judgingEndDate?: DateLike;
  resultsAnnouncementDate?: DateLike;
  certificateReleaseDate?: DateLike;
};

export type TimelineIssue = { field: keyof TimelineInput; message: string };

const REQUIRED: (keyof TimelineInput)[] = [
  "registrationOpenDate",
  "registrationCloseDate",
  "startDate",
  "endDate",
  "submissionOpenDate",
  "submissionCloseDate",
];

const LABEL: Record<keyof TimelineInput, string> = {
  registrationOpenDate: "Registration opens",
  registrationCloseDate: "Registration closes",
  teamFormationDeadline: "Team formation deadline",
  startDate: "Hackathon starts",
  endDate: "Hackathon ends",
  submissionOpenDate: "Submissions open",
  submissionCloseDate: "Submissions close",
  judgingStartDate: "Judging starts",
  judgingEndDate: "Judging ends",
  resultsAnnouncementDate: "Results announced",
  certificateReleaseDate: "Certificates released",
};

/**
 * Validates the ordering of a hackathon timeline. Returns an empty array when valid.
 * Rules (a ≤ b):
 *  regOpen < regClose ≤ start < end
 *  teamFormation ≤ start (and ≥ regOpen)
 *  submissionOpen ≥ regOpen, submissionOpen < submissionClose, submissionClose ≥ start
 *  judgingStart ≥ submissionClose, judgingStart < judgingEnd
 *  results ≥ judgingEnd (or ≥ submissionClose), certificates ≥ results
 */
export function validateTimeline(t: TimelineInput, opts: { now?: number; requireFuture?: boolean } = {}): TimelineIssue[] {
  const issues: TimelineIssue[] = [];
  const m = (k: keyof TimelineInput) => toMillis(t[k]);

  for (const k of REQUIRED) {
    if (m(k) == null) issues.push({ field: k, message: `${LABEL[k]} date is required.` });
  }

  const lt = (a: keyof TimelineInput, b: keyof TimelineInput, strict = true) => {
    const x = m(a);
    const y = m(b);
    if (x == null || y == null) return;
    if (strict ? !(x < y) : !(x <= y)) {
      issues.push({ field: b, message: `${LABEL[b]} must be ${strict ? "after" : "on or after"} ${LABEL[a].toLowerCase()}.` });
    }
  };

  lt("registrationOpenDate", "registrationCloseDate");
  lt("registrationCloseDate", "startDate", false);
  lt("startDate", "endDate");
  lt("registrationOpenDate", "teamFormationDeadline", false);
  lt("teamFormationDeadline", "startDate", false);
  lt("registrationOpenDate", "submissionOpenDate", false);
  lt("submissionOpenDate", "submissionCloseDate");
  lt("startDate", "submissionCloseDate", false);
  lt("submissionCloseDate", "judgingStartDate", false);
  lt("judgingStartDate", "judgingEndDate");
  if (m("judgingEndDate") != null) lt("judgingEndDate", "resultsAnnouncementDate", false);
  else lt("submissionCloseDate", "resultsAnnouncementDate", false);
  lt("resultsAnnouncementDate", "certificateReleaseDate", false);

  if (opts.requireFuture) {
    const now = opts.now ?? Date.now();
    const close = m("registrationCloseDate");
    if (close != null && close <= now) {
      issues.push({ field: "registrationCloseDate", message: "Registration must close in the future." });
    }
  }

  // de-duplicate per field (keep first message)
  const seen = new Set<string>();
  return issues.filter((i) => (seen.has(i.field) ? false : (seen.add(i.field), true)));
}

