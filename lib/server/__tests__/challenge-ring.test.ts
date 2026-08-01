import { describe, expect, it } from "vitest";
import {
  advanceIndex,
  compareRingEntries,
  resolveRingIndex,
  ringLabel,
  utcDaysBetween,
} from "@/lib/server/challenge-ring";

const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);
const at = (iso: string, time: string) => new Date(`${iso}T${time}Z`);

const pool = [
  { id: "a", position: 0 },
  { id: "b", position: 1 },
  { id: "c", position: 2 },
];

describe("utcDaysBetween", () => {
  it("counts calendar days, not elapsed hours", () => {
    // 23:59 to 00:01 is two minutes and one day: the daily turns at the UTC boundary.
    expect(utcDaysBetween(at("2026-08-01", "23:59:00"), at("2026-08-02", "00:01:00"))).toBe(1);
    expect(utcDaysBetween(at("2026-08-01", "00:01:00"), at("2026-08-01", "23:59:00"))).toBe(0);
  });

  it("is negative when the clock went backwards", () => {
    expect(utcDaysBetween(day("2026-08-05"), day("2026-08-02"))).toBe(-3);
  });
});

describe("advanceIndex", () => {
  it("wraps forwards", () => {
    expect(advanceIndex(2, 1, 3)).toBe(0);
    expect(advanceIndex(0, 7, 3)).toBe(1);
  });

  it("wraps backwards instead of returning a negative index", () => {
    expect(advanceIndex(0, -1, 3)).toBe(2);
  });

  it("survives an empty pool", () => {
    expect(advanceIndex(0, 5, 0)).toBe(0);
  });
});

describe("compareRingEntries", () => {
  it("orders by position, then by id", () => {
    const shuffled = [
      { id: "z", position: 1 },
      { id: "a", position: 1 },
      { id: "m", position: 0 },
    ];
    expect([...shuffled].sort(compareRingEntries).map((c) => c.id)).toEqual(["m", "a", "z"]);
  });
});

describe("resolveRingIndex", () => {
  const state = (
    over: Partial<{ challengeId: string | null; day: Date; position: number }> = {}
  ) => ({
    challengeId: "a" as string | null,
    day: day("2026-08-01"),
    position: 0,
    ...over,
  });

  it("stays put within the same UTC day", () => {
    expect(resolveRingIndex(pool, state(), at("2026-08-01", "23:00:00"))).toEqual({
      index: 0,
      changed: false,
    });
  });

  it("moves one step per day and wraps at the end", () => {
    expect(resolveRingIndex(pool, state(), day("2026-08-02")).index).toBe(1);
    expect(resolveRingIndex(pool, state(), day("2026-08-04")).index).toBe(0);
  });

  it("catches up after days without traffic", () => {
    // Only a request advances the ring, so a quiet week must not cost six days.
    expect(resolveRingIndex(pool, state(), day("2026-08-08")).index).toBe(1);
  });

  it("continues at the gap when the live challenge is gone", () => {
    // Deactivated or deleted: restarting at the front would repeat what the pool just had.
    const withoutB = [pool[0], pool[2]];
    const gone = state({ challengeId: "b", position: 1 });
    expect(resolveRingIndex(withoutB, gone, day("2026-08-01"))).toEqual({
      index: 1,
      changed: true,
    });
    expect(resolveRingIndex(withoutB, gone, day("2026-08-02")).index).toBe(0);
  });

  it("does not walk backwards when the stored day lies in the future", () => {
    const ahead = state({ challengeId: "x", position: 9, day: day("2026-08-10") });
    expect(resolveRingIndex(pool, ahead, day("2026-08-01")).index).toBe(0);
  });

  it("reports no change for an empty pool", () => {
    expect(resolveRingIndex([], state(), day("2026-08-09"))).toEqual({
      index: 0,
      changed: false,
    });
  });
});

describe("ringLabel", () => {
  it("counts from today instead of naming a date", () => {
    expect(ringLabel(0)).toBe("Heute");
    expect(ringLabel(1)).toBe("Morgen");
    expect(ringLabel(2)).toBe("Übermorgen");
    expect(ringLabel(9)).toBe("in 9 Tagen");
  });
});
