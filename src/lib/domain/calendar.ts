import { toDate, type DateLike } from "./dates";

function icsStamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeIcs(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function googleCalendarUrl(opts: {
  title: string;
  start: DateLike;
  end: DateLike;
  details?: string;
  location?: string;
}): string | null {
  const s = toDate(opts.start);
  const e = toDate(opts.end) ?? (s ? new Date(s.getTime() + 3600_000) : null);
  if (!s || !e) return null;
  const u = new URL("https://calendar.google.com/calendar/render");
  u.searchParams.set("action", "TEMPLATE");
  u.searchParams.set("text", opts.title);
  u.searchParams.set("dates", `${icsStamp(s)}/${icsStamp(e)}`);
  if (opts.details) u.searchParams.set("details", opts.details);
  if (opts.location) u.searchParams.set("location", opts.location);
  return u.toString();
}

export function buildIcsContent(opts: {
  uid: string;
  title: string;
  start: DateLike;
  end: DateLike;
  description?: string;
  location?: string;
  url?: string;
}): string | null {
  const s = toDate(opts.start);
  const e = toDate(opts.end) ?? (s ? new Date(s.getTime() + 3600_000) : null);
  if (!s || !e) return null;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//HACKSYRA//Innovation Hacks//EN",
    "BEGIN:VEVENT",
    `UID:${opts.uid}@hacksyra`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(s)}`,
    `DTEND:${icsStamp(e)}`,
    `SUMMARY:${escapeIcs(opts.title)}`,
    opts.description ? `DESCRIPTION:${escapeIcs(opts.description)}` : "",
    opts.location ? `LOCATION:${escapeIcs(opts.location)}` : "",
    opts.url ? `URL:${opts.url}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

