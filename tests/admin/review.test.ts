import { describe, expect, it } from "vitest";
import { canGrantRole, isValidListingFeePaise, nextStatusOnApprove } from "@/lib/domain/admin-logic";

describe("admin logic", () => {
  it("gates admin/super_admin role grants to super_admin", () => {
    expect(canGrantRole("super_admin", "admin")).toBe(true);
    expect(canGrantRole("super_admin", "super_admin")).toBe(true);
    expect(canGrantRole("admin", "admin")).toBe(false);
    expect(canGrantRole("admin", "super_admin")).toBe(false);
    expect(canGrantRole("admin", "organizer")).toBe(true);
    expect(canGrantRole("participant", "organizer")).toBe(false);
  });

  it("computes live status & listing visibility on approval", () => {
    const now = Date.UTC(2026, 5, 1);
    const D = 86_400_000;
    const h = {
      registrationOpenDate: now - D,
      registrationCloseDate: now + 5 * D,
      startDate: now + 6 * D,
      endDate: now + 8 * D,
      submissionOpenDate: now + 6 * D,
      submissionCloseDate: now + 8 * D,
      visibility: "public" as const,
    };
    expect(nextStatusOnApprove(h, now)).toEqual({ status: "registration_open", isListed: true });
    expect(nextStatusOnApprove({ ...h, visibility: "unlisted" }, now)).toEqual({ status: "registration_open", isListed: false });
  });

  it("validates listing fee paise (0 or ₹1..₹1000)", () => {
    expect(isValidListingFeePaise(0)).toBe(true);
    expect(isValidListingFeePaise(200)).toBe(true);
    expect(isValidListingFeePaise(300)).toBe(true);
    expect(isValidListingFeePaise(50)).toBe(false);
    expect(isValidListingFeePaise(-1)).toBe(false);
    expect(isValidListingFeePaise(100.5)).toBe(false);
  });
});

