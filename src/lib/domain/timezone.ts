/**
 * Pure timezone conversion helpers using the built-in Intl API.
 * Converts `<input type="datetime-local">` ("YYYY-MM-DDTHH:mm") interpreted in an
 * IANA timezone (e.g. "Asia/Kolkata") into an exact UTC Date, and back.
 */

const FALLBACK_TIMEZONES = [
  "Asia/Kolkata",
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export function listTimeZones(): string[] {
  try {
    const intl = Intl as unknown as { supportedValuesOf?: (key: string) => string[] };
    if (typeof intl.supportedValuesOf === "function") {
      const vals = intl.supportedValuesOf("timeZone");
      if (vals.length) return vals;
    }
  } catch {
    /* ignore */
  }
  return FALLBACK_TIMEZONES;
}

function partsInZone(utcMs: number, timeZone: string) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const map: Record<string, number> = {};
  for (const p of fmt.formatToParts(new Date(utcMs))) {
    if (p.type !== "literal") map[p.type] = Number(p.value);
  }
  return {
    year: map.year,
    month: map.month,
    day: map.day,
    hour: map.hour === 24 ? 0 : map.hour,
    minute: map.minute,
    second: map.second,
  };
}

/** Converts "YYYY-MM-DDTHH:mm" (wall clock in `timeZone`) → UTC Date, or null if malformed. */
export function zonedTimeToUtc(localInput: string, timeZone: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(localInput.trim());
  if (!m) return null;
  const [, yy, mo, dd, hh, mm, ss = "0"] = m;
  const targetUtcAsWall = Date.UTC(Number(yy), Number(mo) - 1, Number(dd), Number(hh), Number(mm), Number(ss));

  // Two-pass fixed-point iteration resolves DST boundaries and half-hour offsets accurately.
  let guess = targetUtcAsWall;
  for (let i = 0; i < 2; i++) {
    const p = partsInZone(guess, timeZone);
    const asWall = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    guess += targetUtcAsWall - asWall;
  }
  const d = new Date(guess);
  return isNaN(d.getTime()) ? null : d;
}

/** Formats a Date/millis into "YYYY-MM-DDTHH:mm" in `timeZone` for `<input type="datetime-local">`. */
export function utcToZonedInput(value: Date | number | string | null | undefined, timeZone: string): string {
  if (value == null) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return "";
  const p = partsInZone(d.getTime(), timeZone);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

