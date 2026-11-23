import { describe, expect, it } from "vitest";
import { validateTimeline } from "@/lib/domain/timeline";
import { computeLiveStatus, canTransition, isRegistrationOpenAt, isSubmissionOpenAt } from "@/lib/domain/status";

const D = 86_400_000;
const base = Date.UTC(2026, 0, 1);
const valid = {
  registrationOpenDate: base,
  registrationCloseDate: base + 10 * D,
  teamFormationDeadline: base + 9 * D,
  startDate: base + 11 * D,
  endDate: base + 13 * D,
  submissionOpenDate: base + 11 * D,
  submissionCloseDate: base + 13 * D,
  judgingStartDate: base + 13 * D,
  judgingEndDate: base + 15 * D,
  resultsAnnouncementDate: base + 16 * D,
  certificateReleaseDate: base + 17 * D,
};

describe("validateTimeline", () => {
  it("accepts a well-ordered timeline", () => {
    expect(validateTimeline(valid)).toEqual([]);
  });

  it("requires core dates", () => {
    const issues = validateTimeline({});
    expect(issues.map((i) => i.field)).toEqual(
      expect.arrayContaining(["registrationOpenDate", "registrationCloseDate", "startDate", "endDate", "submissionOpenDate", "submissionCloseDate"])
    );
  });

  it("rejects registration closing after the start", () => {
    const issues = validateTimeline({ ...valid, registrationCloseDate: base + 12 * D });
    expect(issues.some((i) => i.field === "startDate")).toBe(true);
  });

  it("rejects submission close before start", () => {
    const issues = validateTimeline({ ...valid, submissionOpenDate: base + 5 * D, submissionCloseDate: base + 6 * D });
    expect(issues.some((i) => i.field === "submissionCloseDate")).toBe(true);
  });

  it("rejects end before start", () => {
    const issues = validateTimeline({ ...valid, endDate: base + 10.5 * D });
    expect(issues.some((i) => i.field === "endDate")).toBe(true);
  });

  it("rejects judging before submissions close and certificates before results", () => {
    const a = validateTimeline({ ...valid, judgingStartDate: base + 12 * D });
    expect(a.some((i) => i.field === "judgingStartDate")).toBe(true);
    const b = validateTimeline({ ...valid, certificateReleaseDate: base + 15.5 * D });
    expect(b.some((i) => i.field === "certificateReleaseDate")).toBe(true);
  });

  it("can require registration to close in the future", () => {
    const issues = validateTimeline(valid, { requireFuture: true, now: base + 20 * D });
    expect(issues.some((i) => i.field === "registrationCloseDate")).toBe(true);
  });
});

describe("computeLiveStatus", () => {
  it("walks the lifecycle by date", () => {
    expect(computeLiveStatus(valid, base - D)).toBe("published");
    expect(computeLiveStatus(valid, base + D)).toBe("registration_open");
    expect(computeLiveStatus(valid, base + 10.5 * D)).toBe("registration_closed");
    expect(computeLiveStatus(valid, base + 12 * D)).toBe("ongoing");
    expect(computeLiveStatus(valid, base + 14 * D)).toBe("judging");
  });

  it("only reaches results/completed when results are published", () => {
    expect(computeLiveStatus(valid, base + 30 * D)).toBe("judging");
    expect(computeLiveStatus({ ...valid, resultsPublished: true }, base + 17 * D)).toBe("results_announced");
    expect(computeLiveStatus({ ...valid, resultsPublished: true }, base + 40 * D)).toBe("completed");
  });

  it("deadline helpers", () => {
    expect(isRegistrationOpenAt(valid, base + D)).toBe(true);
    expect(isRegistrationOpenAt(valid, base + 10 * D)).toBe(false);
    expect(isSubmissionOpenAt(valid, base + 12 * D)).toBe(true);
    expect(isSubmissionOpenAt(valid, base + 13 * D)).toBe(false);
  });
});

describe("canTransition", () => {
  it("enforces the review flow", () => {
    expect(canTransition("draft", "pending_review")).toBe(true);
    expect(canTransition("draft", "published")).toBe(false);
    expect(canTransition("pending_review", "approved")).toBe(true);
    expect(canTransition("rejected", "published")).toBe(false);
    expect(canTransition("ongoing", "suspended")).toBe(true);
    expect(canTransition("completed", "registration_open")).toBe(false);
  });
});
