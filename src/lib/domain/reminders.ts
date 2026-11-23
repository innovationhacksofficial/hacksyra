export type ReminderWindow = "7d" | "24h" | "1h";

const WINDOWS: { kind: ReminderWindow; ms: number; label: string }[] = [
  { kind: "7d", ms: 7 * 86_400_000, label: "7 days" },
  { kind: "24h", ms: 24 * 3_600_000, label: "24 hours" },
  { kind: "1h", ms: 60 * 60_000, label: "1 hour" },
];

/**
 * Returns which reminder window a future timestamp falls into right now, or null.
 * Each window triggers once target is within `ms` (with a 20-minute tolerance band
 * or anytime before target for 1h so a missed cron tick still notifies before closing).
 */
export function dueReminderWindow(targetMs: number | null, now = Date.now()): { kind: ReminderWindow; label: string } | null {
  if (!targetMs || targetMs <= now) return null;
  const remaining = targetMs - now;
  for (const w of WINDOWS) {
    // trigger once inside the window (closest smaller window wins via order check: check smallest first)
    if (remaining <= w.ms) {
      // Only return 1h if <= 1h; 24h if <= 24h and > 1h; 7d if <= 7d and > 24h (within 2h buffer)
      if (w.kind === "1h") return { kind: "1h", label: w.label };
      if (w.kind === "24h" && remaining > 3_600_000) return { kind: "24h", label: w.label };
      if (w.kind === "7d" && remaining > 24 * 3_600_000) return { kind: "7d", label: w.label };
    }
  }
  return null;
}

/** Checks smallest window first so a deadline 45m away gets "1h", not "7d". */
export function pickReminderWindow(targetMs: number | null, now = Date.now()): { kind: ReminderWindow; label: string } | null {
  if (!targetMs || targetMs <= now) return null;
  const remaining = targetMs - now;
  if (remaining <= 60 * 60_000) return { kind: "1h", label: "1 hour" };
  if (remaining <= 24 * 3_600_000) return { kind: "24h", label: "24 hours" };
  if (remaining <= 7 * 86_400_000) return { kind: "7d", label: "7 days" };
  return null;
}

