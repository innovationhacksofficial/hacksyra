import { describe, expect, it } from "vitest";
import { zonedTimeToUtc, utcToZonedInput } from "@/lib/domain/timezone";
import { validateAllWizardSteps } from "@/lib/domain/hackathon-schema";

describe("timezone conversions", () => {
  it("converts Asia/Kolkata wall clock (+05:30) to UTC and back", () => {
    const utc = zonedTimeToUtc("2026-06-15T09:30", "Asia/Kolkata");
    expect(utc).not.toBeNull();
    expect(utc!.toISOString()).toBe("2026-06-15T04:00:00.000Z");
    expect(utcToZonedInput(utc, "Asia/Kolkata")).toBe("2026-06-15T09:30");
  });

  it("handles UTC directly", () => {
    const utc = zonedTimeToUtc("2026-06-15T18:00", "UTC");
    expect(utc!.toISOString()).toBe("2026-06-15T18:00:00.000Z");
  });
});

describe("validateAllWizardSteps", () => {
  const now = Date.UTC(2026, 0, 1);
  const D = 86_400_000;
  const good = {
    name: "Buildathon India 2026",
    slug: "buildathon-india-2026",
    tagline: "Ship real products in 48 hours",
    category: "ai_ml",
    themes: ["AI"],
    technologies: ["Next.js"],
    difficulty: "open",
    mode: "online",
    visibility: "public",
    onlinePlatform: "Discord",
    summary: "A 48-hour online hackathon bringing developers together to ship AI products.",
    description: "## About\nBuild something useful and ship a working demo with your team over 48 hours.",
    rules: "All code written during the event.",
    contactEmail: "team@example.com",
    eventTimezone: "Asia/Kolkata",
    registrationOpenDate: now + D,
    registrationCloseDate: now + 10 * D,
    startDate: now + 11 * D,
    endDate: now + 13 * D,
    submissionOpenDate: now + 11 * D,
    submissionCloseDate: now + 13 * D,
    allowSolo: true,
    minTeamSize: 1,
    maxTeamSize: 4,
    hasWaitlist: true,
    registrationMode: "open",
    tracks: [{ id: "t1", name: "Main", description: "Open track" }],
    prizes: [{ id: "p1", name: "Winner", type: "cash", cashAmount: 50000, currency: "INR", winnersCount: 1 }],
    judgingCriteria: [
      { id: "c1", name: "Impact", description: "", weight: 50, maxScore: 10 },
      { id: "c2", name: "Tech", description: "", weight: 50, maxScore: 10 },
    ],
    pricingDraft: { isFree: true, currency: "INR", tiers: [], coupons: [] },
  };

  it("passes on a complete hackathon", () => {
    expect(validateAllWizardSteps(good, { requireFutureDates: true, now })).toEqual([]);
  });

  it("flags rubric not summing to 100 and invalid slug", () => {
    const issues = validateAllWizardSteps({
      ...good,
      slug: "admin",
      judgingCriteria: [{ id: "c1", name: "Only", description: "", weight: 60, maxScore: 10 }],
    });
    expect(issues.some((i) => i.step === 1)).toBe(true);
    expect(issues.some((i) => i.step === 7)).toBe(true);
  });
});

