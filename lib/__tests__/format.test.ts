import { describe, it, expect } from "vitest";
import { formatTime, formatDate } from "../format";

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
