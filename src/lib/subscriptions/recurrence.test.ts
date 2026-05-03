import { describe, expect, it } from "vitest";

import {
  formatUtcDayKey,
  monthsSinceAnchor,
  nextOccurrenceDayKeyOnOrAfter,
  parseRenewalYmd,
  recurrenceOccurrenceDayKeysInUtcRange,
  recurrenceTouchesMonth,
  scheduledDayInMonth,
  utcDaysInMonth,
} from "./recurrence";

describe("recurrence", () => {
  it("parses renewal YMD", () => {
    expect(parseRenewalYmd("2025-12-08")).toEqual({ y: 2025, m: 11, d: 8 });
    expect(parseRenewalYmd("2025-13-01")).toBeNull();
  });

  it("monthly: every same day-of-month across months in range (UTC)", () => {
    const start = new Date("2025-01-01T00:00:00.000Z");
    const end = new Date("2025-03-31T00:00:00.000Z");
    const keys = recurrenceOccurrenceDayKeysInUtcRange("2024-12-08", "monthly", start, end);
    expect(keys).toEqual(["2025-01-08", "2025-02-08", "2025-03-08"]);
  });

  it("monthly: clamps to month length (anchor 31)", () => {
    const start = new Date("2025-02-01T00:00:00.000Z");
    const end = new Date("2025-02-28T00:00:00.000Z");
    const keys = recurrenceOccurrenceDayKeysInUtcRange("2025-01-31", "monthly", start, end);
    expect(keys).toEqual(["2025-02-28"]);
  });

  it("yearly: same month each year, aligned to anchor month", () => {
    const start = new Date("2025-01-01T00:00:00.000Z");
    const end = new Date("2026-12-31T00:00:00.000Z");
    const keys = recurrenceOccurrenceDayKeysInUtcRange("2024-12-08", "yearly", start, end);
    expect(keys).toEqual(["2025-12-08", "2026-12-08"]);
  });

  it("quarterly: every three months from anchor", () => {
    const start = new Date("2025-01-01T00:00:00.000Z");
    const end = new Date("2025-12-31T00:00:00.000Z");
    const keys = recurrenceOccurrenceDayKeysInUtcRange("2025-03-08", "quarterly", start, end);
    expect(keys).toEqual(["2025-03-08", "2025-06-08", "2025-09-08", "2025-12-08"]);
  });

  it("custom: single anchor day only", () => {
    const start = new Date("2025-01-01T00:00:00.000Z");
    const end = new Date("2025-12-31T00:00:00.000Z");
    expect(recurrenceOccurrenceDayKeysInUtcRange("2025-06-15", "custom", start, end)).toEqual([
      "2025-06-15",
    ]);
  });

  it("does not emit dates before anchor month phase (monthsSince < 0)", () => {
    const start = new Date("2025-01-01T00:00:00.000Z");
    const end = new Date("2025-06-30T00:00:00.000Z");
    const keys = recurrenceOccurrenceDayKeysInUtcRange("2025-04-08", "monthly", start, end);
    expect(keys).toEqual(["2025-04-08", "2025-05-08", "2025-06-08"]);
    expect(keys).not.toContain("2025-03-08");
  });

  it("recurrenceTouchesMonth", () => {
    expect(recurrenceTouchesMonth("2025-12-08", "monthly", "2026-01")).toBe(true);
    expect(recurrenceTouchesMonth("2025-12-08", "monthly", "2026-02")).toBe(true);
    expect(recurrenceTouchesMonth("2025-04-08", "quarterly", "2025-05")).toBe(false);
    expect(recurrenceTouchesMonth("2025-04-08", "quarterly", "2025-07")).toBe(true);
  });

  it("clips occurrences to start/end bounds (inclusive)", () => {
    const start = new Date("2025-01-01T00:00:00.000Z");
    const end = new Date("2025-12-31T00:00:00.000Z");
    const keys = recurrenceOccurrenceDayKeysInUtcRange("2024-12-08", "monthly", start, end, {
      startDateYmd: "2025-03-01",
      endDateYmd: "2025-06-15",
    });
    expect(keys).toEqual(["2025-03-08", "2025-04-08", "2025-05-08", "2025-06-08"]);
  });

  it("nextOccurrenceDayKeyOnOrAfter returns null when strictly after term end", () => {
    expect(
      nextOccurrenceDayKeyOnOrAfter("2025-01-15", "monthly", new Date("2026-02-01T00:00:00.000Z"), {
        endDateYmd: "2026-01-31",
      })
    ).toBeNull();
  });

  it("recurrenceTouchesMonth respects bounds", () => {
    expect(
      recurrenceTouchesMonth("2025-12-08", "monthly", "2026-01", { endDateYmd: "2025-12-20" })
    ).toBe(false);
    expect(
      recurrenceTouchesMonth("2025-12-08", "monthly", "2025-12", { endDateYmd: "2025-12-20" })
    ).toBe(true);
  });

  it("helpers", () => {
    expect(utcDaysInMonth(2025, 1)).toBe(28);
    expect(monthsSinceAnchor(2024, 11, 2025, 0)).toBe(1);
    expect(scheduledDayInMonth(31, 2025, 1)).toBe(28);
    expect(formatUtcDayKey(2025, 0, 8)).toBe("2025-01-08");
  });
});
