import { describe, it, expect } from "vitest";
import {
  utcDayKey,
  consecutiveStreakFromCompletedDaySet,
  currentStreakDayKeys,
} from "@/lib/streak-days";

describe("utcDayKey", () => {
  it("formats UTC date as YYYY-MM-DD", () => {
    expect(utcDayKey(new Date("2026-04-06T15:30:00.000Z"))).toBe("2026-04-06");
    expect(utcDayKey(new Date("2026-01-01T00:00:00.000Z"))).toBe("2026-01-01");
  });
});

describe("consecutiveStreakFromCompletedDaySet", () => {
  const d = (s: string) => new Date(`${s}T12:00:00.000Z`);

  it("is 0 when today is missing from the set", () => {
    const today = d("2026-04-06");
    expect(consecutiveStreakFromCompletedDaySet(today, new Set(["2026-04-05"]))).toBe(0);
  });

  it("is 1 when only today is present", () => {
    const today = d("2026-04-06");
    expect(consecutiveStreakFromCompletedDaySet(today, new Set(["2026-04-06"]))).toBe(1);
  });

  it("counts consecutive days backwards from today", () => {
    const today = d("2026-04-06");
    expect(
      consecutiveStreakFromCompletedDaySet(
        today,
        new Set(["2026-04-06", "2026-04-05", "2026-04-04"])
      )
    ).toBe(3);
  });

  it("stops at the first gap in consecutive days", () => {
    const today = d("2026-04-06");
    expect(
      consecutiveStreakFromCompletedDaySet(
        today,
        new Set(["2026-04-06", "2026-04-05", "2026-04-03"])
      )
    ).toBe(2);
  });
});

describe("currentStreakDayKeys", () => {
  const d = (s: string) => new Date(`${s}T12:00:00.000Z`);

  it("returns the same count as consecutiveStreakFromCompletedDaySet", () => {
    const today = d("2026-04-06");
    const set = new Set(["2026-04-06", "2026-04-05", "2026-04-04"]);
    expect(currentStreakDayKeys(today, set).size).toBe(
      consecutiveStreakFromCompletedDaySet(today, set)
    );
  });
});
