import { describe, it, expect } from "vitest";
import { formatTime, formatDate, formatElapsedSince } from "../format";

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
  it("formats date as DD.MM.YYYY", () => {
    expect(formatDate(new Date("2026-03-15T00:00:00Z"))).toBe("15.03.2026");
  });
});

// #47: verstrichene Bearbeitungszeit auf der Aufgabenseite.
describe("formatElapsedSince", () => {
  const start = "2026-07-30T10:00:00.000Z";

  it("formats the elapsed time in the same format as the ranking", () => {
    expect(formatElapsedSince(start, new Date("2026-07-30T10:03:41.000Z"))).toBe("3:41");
    expect(formatElapsedSince(start, new Date("2026-07-30T10:00:07.000Z"))).toBe("0:07");
  });

  it("counts minutes past the hour instead of switching format", () => {
    expect(formatElapsedSince(start, new Date("2026-07-30T12:05:03.000Z"))).toBe("125:03");
  });

  it("returns 0:00 for a start in the future or the same instant", () => {
    expect(formatElapsedSince(start, new Date("2026-07-30T10:00:00.000Z"))).toBe("0:00");
    expect(formatElapsedSince(start, new Date("2026-07-30T09:59:00.000Z"))).toBe("0:00");
  });

  it("returns a dash without a start time", () => {
    expect(formatElapsedSince(null, new Date(start))).toBe("-");
    expect(formatElapsedSince("kaputt", new Date(start))).toBe("-");
  });
});
