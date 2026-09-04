import { describe, it, expect } from "vitest";
import {
  formatTime,
  formatDate,
  formatLongDate,
  formatMonthYearShort,
  formatMonthYearLong,
  formatNumber,
  formatTimeOfDay,
  formatWeekdayDate,
} from "../format";

describe("formatTime", () => {
  it("formats seconds as M:SS", () => {
    expect(formatTime(263)).toBe("4:23");
    expect(formatTime(312)).toBe("5:12");
    expect(formatTime(120)).toBe("2:00");
  });

  it("zero-pads seconds below 10", () => {
    expect(formatTime(362)).toBe("6:02");
    expect(formatTime(65)).toBe("1:05");
  });

  it("returns '-' for null", () => {
    expect(formatTime(null)).toBe("-");
  });

  it("returns '-' for undefined", () => {
    expect(formatTime(undefined)).toBe("-");
  });

  it("returns '-' for 0", () => {
    expect(formatTime(0)).toBe("-");
  });
});

describe("formatDate", () => {
  it("formats German as DD.MM.YYYY", () => {
    expect(formatDate(new Date("2026-03-15T12:00:00Z"), "de")).toBe("15.03.2026");
  });

  it("formats English as MM/DD/YYYY", () => {
    expect(formatDate(new Date("2026-03-15T12:00:00Z"), "en")).toBe("03/15/2026");
  });

  it("falls back to German without a locale - the caller has yet to be migrated", () => {
    expect(formatDate(new Date("2026-03-15T12:00:00Z"))).toBe("15.03.2026");
  });

  it("falls back to German for a locale the app does not serve", () => {
    expect(formatDate(new Date("2026-03-15T12:00:00Z"), "fr")).toBe("15.03.2026");
  });
});

describe("formatNumber", () => {
  it("groups thousands with a dot in German", () => {
    expect(formatNumber(1500, "de")).toBe("1.500");
  });

  it("groups thousands with a comma in English", () => {
    expect(formatNumber(1500, "en")).toBe("1,500");
  });

  it("leaves a number below the grouping threshold alone in both locales", () => {
    expect(formatNumber(520, "de")).toBe("520");
    expect(formatNumber(520, "en")).toBe("520");
  });

  it("falls back to German without a locale", () => {
    expect(formatNumber(1500)).toBe("1.500");
  });
});

describe("formatLongDate", () => {
  it("spells the month out per locale", () => {
    const date = new Date("2026-03-15T12:00:00Z");
    expect(formatLongDate(date, "de")).toBe("15. März 2026");
    expect(formatLongDate(date, "en")).toBe("March 15, 2026");
  });
});

describe("formatWeekdayDate", () => {
  it("names the weekday per locale and drops the year", () => {
    const date = new Date("2026-03-15T12:00:00Z");
    expect(formatWeekdayDate(date, "de")).toBe("Sonntag, 15. März");
    expect(formatWeekdayDate(date, "en")).toBe("Sunday, March 15");
  });
});

describe("formatMonthYearShort", () => {
  it("abbreviates the month per locale", () => {
    const date = new Date("2026-10-15T12:00:00Z");
    expect(formatMonthYearShort(date, "de")).toBe("Okt. 2026");
    expect(formatMonthYearShort(date, "en")).toBe("Oct 2026");
  });

  /**
   * The month label is read in UTC, like every stored day key in the app: local time
   * would push a midnight timestamp into the neighbouring month for half the world.
   */
  it("reads the month in UTC, not in the server timezone", () => {
    expect(formatMonthYearShort(new Date("2026-11-01T00:30:00Z"), "en")).toBe("Nov 2026");
    expect(formatMonthYearShort(new Date("2026-10-31T23:30:00Z"), "en")).toBe("Oct 2026");
  });
});

describe("formatMonthYearLong", () => {
  it("spells the month out per locale", () => {
    const date = new Date("2026-10-15T12:00:00Z");
    expect(formatMonthYearLong(date, "de")).toBe("Oktober 2026");
    expect(formatMonthYearLong(date, "en")).toBe("October 2026");
  });
});

describe("formatTimeOfDay", () => {
  it("is 24-hour in German and 12-hour in English", () => {
    const date = new Date("2026-03-15T09:05:00Z");
    expect(formatTimeOfDay(date, "de")).toMatch(/^\d{2}:\d{2}$/);
    expect(formatTimeOfDay(date, "en")).toMatch(/(AM|PM)$/);
  });
});
