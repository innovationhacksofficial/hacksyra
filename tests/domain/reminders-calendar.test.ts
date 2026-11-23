import { describe, expect, it } from "vitest";
import { pickReminderWindow, dueReminderWindow } from "@/lib/domain/reminders";
import { buildIcsContent, googleCalendarUrl } from "@/lib/domain/calendar";

describe("deadline reminder windows", () => {
  const now = new Date("2026-06-01T12:00:00Z").getTime();

  it("picks 1h, 24h, and 7d thresholds properly", () => {
    expect(pickReminderWindow(now + 30 * 60_000, now)?.kind).toBe("1h");
    expect(pickReminderWindow(now + 5 * 3600_000, now)?.kind).toBe("24h");
    expect(pickReminderWindow(now + 4 * 86_400_000, now)?.kind).toBe("7d");
    expect(pickReminderWindow(now + 14 * 86_400_000, now)).toBeNull();
    expect(pickReminderWindow(now - 1000, now)).toBeNull();
  });

  it("dueReminderWindow matches non-overlapping intervals", () => {
    expect(dueReminderWindow(now + 45 * 60_000, now)?.kind).toBe("1h");
    expect(dueReminderWindow(now + 12 * 3600_000, now)?.kind).toBe("24h");
    expect(dueReminderWindow(now + 3 * 86_400_000, now)?.kind).toBe("7d");
    expect(dueReminderWindow(null, now)).toBeNull();
  });
});

describe("calendar exports", () => {
  it("builds valid Google Calendar URL and ICS payload", () => {
    const start = "2026-08-10T09:00:00.000Z";
    const end = "2026-08-12T18:00:00.000Z";

    const url = googleCalendarUrl({
      title: "AI Builders Hack",
      start,
      end,
      details: "Build intelligent apps",
      location: "Bengaluru",
    });
    expect(url).toContain("https://calendar.google.com/calendar/render");
    expect(url).toContain("AI+Builders+Hack");

    const ics = buildIcsContent({
      uid: "hack_123",
      title: "AI Builders Hack",
      start,
      end,
      description: "Build intelligent apps",
      location: "Bengaluru",
    });
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("UID:hack_123@hacksyra");
    expect(ics).toContain("SUMMARY:AI Builders Hack");
    expect(ics).toContain("END:VCALENDAR");
  });
});

