import { describe, expect, it } from "vitest";
import { applyCoupon, formatMoney } from "@/lib/domain/money";
import { validateRubric, weightedScore, aggregateScores, rubricTotal } from "@/lib/domain/rubric";
import { slugify, isValidSlug, buildSearchKeywords } from "@/lib/domain/slug";

const coupon = { type: "percentage" as const, value: 20, isActive: true, usedCount: 0 };

describe("applyCoupon", () => {
  it("applies percentage discounts with integer paise", () => {
    expect(applyCoupon(49900, coupon)).toEqual({ ok: true, discount: 9980, total: 39920 });
  });
  it("caps fixed discounts at subtotal and allows free", () => {
    expect(applyCoupon(5000, { ...coupon, type: "fixed", value: 99999 })).toEqual({ ok: true, discount: 5000, total: 0 });
  });
  it("bumps sub-₹1 totals to Razorpay's ₹1 minimum", () => {
    expect(applyCoupon(150, { ...coupon, type: "fixed", value: 100 })).toEqual({ ok: true, discount: 50, total: 100 });
  });
  it("rejects inactive, expired, exhausted, min-order and wrong-tier coupons", () => {
    expect(applyCoupon(1000, { ...coupon, isActive: false }).ok).toBe(false);
    expect(applyCoupon(1000, { ...coupon, validUntil: 10 }, { now: 20 }).ok).toBe(false);
    expect(applyCoupon(1000, { ...coupon, validFrom: 30 }, { now: 20 }).ok).toBe(false);
    expect(applyCoupon(1000, { ...coupon, usageLimit: 5, usedCount: 5 }).ok).toBe(false);
    expect(applyCoupon(1000, { ...coupon, minOrderAmount: 2000 }).ok).toBe(false);
    expect(applyCoupon(1000, { ...coupon, applicableTierIds: ["a"] }, { tierId: "b" }).ok).toBe(false);
  });
  it("formats INR", () => {
    expect(formatMoney(300)).toMatch(/₹\s?3/);
  });
});

describe("rubric", () => {
  const criteria = [
    { id: "a", name: "Impact", weight: 40, maxScore: 10 },
    { id: "b", name: "Tech", weight: 35, maxScore: 10 },
    { id: "c", name: "Demo", weight: 25, maxScore: 5 },
  ];
  it("requires weights to total 100", () => {
    expect(rubricTotal(criteria)).toBe(100);
    expect(validateRubric(criteria)).toEqual([]);
    expect(validateRubric([{ ...criteria[0], weight: 50 }]).join(" ")).toMatch(/total 100/);
    expect(validateRubric([])).not.toEqual([]);
  });
  it("computes weighted scores and aggregates without conflicts/drafts", () => {
    const s = weightedScore(criteria, [
      { criterionId: "a", score: 10 },
      { criterionId: "b", score: 5 },
      { criterionId: "c", score: 5 },
    ]);
    expect(s).toBe(82.5);
    expect(aggregateScores([{ totalScore: 80 }, { totalScore: 90 }, { totalScore: 10, hasConflict: true }, { totalScore: 0, isDraft: true }])).toBe(85);
    expect(aggregateScores([])).toBeNull();
  });
});

describe("slug", () => {
  it("slugifies and validates", () => {
    expect(slugify("GenAI Hack — Édition 2026!")).toBe("genai-hack-edition-2026");
    expect(isValidSlug("genai-hack-2026")).toBe(true);
    expect(isValidSlug("admin")).toBe(false);
    expect(isValidSlug("-bad")).toBe(false);
  });
  it("builds prefix keywords", () => {
    const k = buildSearchKeywords("Climate Hack", ["React"]);
    expect(k).toEqual(expect.arrayContaining(["climate", "cl", "cli", "hack", "react"]));
  });
});

