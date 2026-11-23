import type { JudgingCriterion } from "@/types";

export function rubricTotal(criteria: Pick<JudgingCriterion, "weight">[]): number {
  return criteria.reduce((s, c) => s + (Number.isFinite(c.weight) ? c.weight : 0), 0);
}

export function validateRubric(criteria: Pick<JudgingCriterion, "name" | "weight" | "maxScore">[]): string[] {
  const errors: string[] = [];
  if (!criteria.length) errors.push("Add at least one judging criterion.");
  criteria.forEach((c, i) => {
    if (!c.name?.trim()) errors.push(`Criterion ${i + 1} needs a name.`);
    if (!Number.isInteger(c.weight) || c.weight <= 0) errors.push(`Criterion ${i + 1} weight must be a positive whole number.`);
    if (!Number.isInteger(c.maxScore) || c.maxScore < 1 || c.maxScore > 100) errors.push(`Criterion ${i + 1} max score must be 1–100.`);
  });
  const total = rubricTotal(criteria);
  if (criteria.length && total !== 100) errors.push(`Weights must total 100 (currently ${total}).`);
  return errors;
}

/** Weighted score out of 100 for one evaluation. */
export function weightedScore(
  criteria: Pick<JudgingCriterion, "id" | "weight" | "maxScore">[],
  scores: { criterionId: string; score: number }[]
): number {
  let total = 0;
  for (const c of criteria) {
    const s = scores.find((x) => x.criterionId === c.id)?.score ?? 0;
    const clamped = Math.min(Math.max(s, 0), c.maxScore);
    total += (clamped / c.maxScore) * c.weight;
  }
  return Math.round(total * 100) / 100;
}

/** Average of judges' weighted scores, ignoring conflicted evaluations. */
export function aggregateScores(evals: { totalScore: number; hasConflict?: boolean; isDraft?: boolean }[]): number | null {
  const valid = evals.filter((e) => !e.hasConflict && !e.isDraft);
  if (!valid.length) return null;
  return Math.round((valid.reduce((s, e) => s + e.totalScore, 0) / valid.length) * 100) / 100;
}

