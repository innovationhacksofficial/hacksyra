/** Pure date helpers usable on client and server (Firestore client/admin Timestamps, Date, ISO, millis). */

export type DateLike =
  | Date
  | string
  | number
  | { toDate: () => Date }
  | { seconds: number; nanoseconds?: number }
  | { _seconds: number; _nanoseconds?: number }
  | null
  | undefined;

export function toDate(v: DateLike): Date | null {
  if (v == null) return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  if (typeof v === "string" || typeof v === "number") {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof (v as { toDate?: unknown }).toDate === "function") return (v as { toDate: () => Date }).toDate();
  if (typeof (v as { seconds?: unknown }).seconds === "number") return new Date((v as { seconds: number }).seconds * 1000);
  if (typeof (v as { _seconds?: unknown })._seconds === "number") return new Date((v as { _seconds: number })._seconds * 1000);
  return null;
}

export function toMillis(v: DateLike): number | null {
  return toDate(v)?.getTime() ?? null;
}

/** "in 3d 4h", "2h 10m left", "ended" */
export function timeLeft(target: DateLike, now = Date.now()): { ms: number; label: string; ended: boolean } {
  const t = toMillis(target);
  if (t == null) return { ms: 0, label: "—", ended: true };
  const ms = t - now;
  if (ms <= 0) return { ms: 0, label: "Ended", ended: true };
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (d > 0) return { ms, label: `${d}d ${h}h left`, ended: false };
  if (h > 0) return { ms, label: `${h}h ${m}m left`, ended: false };
  return { ms, label: `${Math.max(1, m)}m left`, ended: false };
}

export function formatInZone(v: DateLike, timeZone?: string, opts: Intl.DateTimeFormatOptions = {}): string {
  const d = toDate(v);
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone,
      ...opts,
    }).format(d);
  } catch {
    return d.toLocaleString();
  }
}

export function zoneAbbr(timeZone: string, at: Date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "short" }).formatToParts(at);
    return parts.find((p) => p.type === "timeZoneName")?.value ?? timeZone;
  } catch {
    return timeZone;
  }
}

export function viewerTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

