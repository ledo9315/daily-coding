import { describe, it, expect } from "vitest";
import { countSubmissionsInUtcMonth, utcDaysInMonth } from "@/lib/monthly-challenge-goal";

describe("utcDaysInMonth", () => {
  it("returns 31 for January", () => {
    expect(utcDaysInMonth(new Date(Date.UTC(2026, 0, 15)))).toBe(31);
  });

  it("returns 28 for February in a non-leap year", () => {
    expect(utcDaysInMonth(new Date(Date.UTC(2025, 1, 1)))).toBe(28);
  });

  it("returns 29 for February in a leap year", () => {
    expect(utcDaysInMonth(new Date(Date.UTC(2024, 1, 1)))).toBe(29);
  });

  it("returns 30 for April", () => {
    expect(utcDaysInMonth(new Date(Date.UTC(2026, 3, 6)))).toBe(30);
  });
});

describe("countSubmissionsInUtcMonth", () => {
  const anchor = new Date("2026-04-06T15:00:00.000Z");

  it("counts submissions in the same UTC month", () => {
    const n = countSubmissionsInUtcMonth(
      [
        { createdAt: new Date("2026-04-01T00:00:00.000Z") },
        { createdAt: new Date("2026-04-30T23:59:59.000Z") },
      ],
      anchor
    );
    expect(n).toBe(2);
  });

  it("excludes submissions in other UTC months", () => {
    const n = countSubmissionsInUtcMonth(
      [
        { createdAt: new Date("2026-03-31T23:59:59.000Z") },
        { createdAt: new Date("2026-05-01T00:00:00.000Z") },
        { createdAt: new Date("2026-04-15T12:00:00.000Z") },
      ],
      anchor
    );
    expect(n).toBe(1);
  });
});
