import { describe, expect, it } from "vitest";
import type { Achievement } from "@/lib/api";
import {
  FEATURED_ACHIEVEMENT_COUNT,
  pickFeaturedAchievements,
  sortAchievementsForDisplay,
} from "@/lib/achievements-featured";

let counter = 0;

function ach(overrides: Partial<Achievement> = {}): Achievement {
  counter += 1;
  return {
    id: `ach-${counter}`,
    title: `Achievement ${counter}`,
    description: "",
    iconKey: "Trophy",
    unlocked: false,
    rarity: "common",
    ...overrides,
  };
}

const ids = (list: Achievement[]) => list.map((a) => a.id);

describe("sortAchievementsForDisplay", () => {
  it("puts unlocked achievements before locked ones", () => {
    const locked = ach({ id: "locked" });
    const unlocked = ach({ id: "unlocked", unlocked: true });

    expect(ids(sortAchievementsForDisplay([locked, unlocked]))).toEqual([
      "unlocked",
      "locked",
    ]);
  });

  it("orders unlocked achievements by recency, newest first", () => {
    const old = ach({ id: "old", unlocked: true, unlockedAtIso: "2026-01-01T10:00:00.000Z" });
    const newest = ach({ id: "newest", unlocked: true, unlockedAtIso: "2026-03-01T10:00:00.000Z" });
    const middle = ach({ id: "middle", unlocked: true, unlockedAtIso: "2026-02-01T10:00:00.000Z" });

    expect(ids(sortAchievementsForDisplay([old, newest, middle]))).toEqual([
      "newest",
      "middle",
      "old",
    ]);
  });

  it("places unlocked achievements without a timestamp after dated ones, in input order", () => {
    const noDateA = ach({ id: "no-date-a", unlocked: true });
    const dated = ach({ id: "dated", unlocked: true, unlockedAtIso: "2026-01-01T10:00:00.000Z" });
    const noDateB = ach({ id: "no-date-b", unlocked: true });

    expect(ids(sortAchievementsForDisplay([noDateA, dated, noDateB]))).toEqual([
      "dated",
      "no-date-a",
      "no-date-b",
    ]);
  });

  it("orders locked achievements by progress ratio, highest first", () => {
    const none = ach({ id: "none" });
    const third = ach({ id: "third", progress: { current: 1, target: 3 } });
    const fiveOfSeven = ach({ id: "five-of-seven", progress: { current: 5, target: 7 } });

    expect(ids(sortAchievementsForDisplay([none, third, fiveOfSeven]))).toEqual([
      "five-of-seven",
      "third",
      "none",
    ]);
  });

  it("treats a target of zero as no progress", () => {
    const zeroTarget = ach({ id: "zero-target", progress: { current: 3, target: 0 } });
    const some = ach({ id: "some", progress: { current: 1, target: 10 } });

    expect(ids(sortAchievementsForDisplay([zeroTarget, some]))).toEqual(["some", "zero-target"]);
  });

  it("keeps input order for locked achievements with equal ratios", () => {
    const a = ach({ id: "a", progress: { current: 1, target: 2 } });
    const b = ach({ id: "b", progress: { current: 2, target: 4 } });
    const c = ach({ id: "c" });
    const d = ach({ id: "d" });

    expect(ids(sortAchievementsForDisplay([a, b, c, d]))).toEqual(["a", "b", "c", "d"]);
    expect(ids(sortAchievementsForDisplay([b, a, d, c]))).toEqual(["b", "a", "d", "c"]);
  });

  it("sorts progress beyond the target ahead of everything else locked", () => {
    const complete = ach({ id: "complete", progress: { current: 10, target: 10 } });
    const over = ach({ id: "over", progress: { current: 12, target: 10 } });

    expect(ids(sortAchievementsForDisplay([complete, over]))).toEqual(["over", "complete"]);
  });

  it("does not mutate the input array", () => {
    const input = [
      ach({ id: "locked" }),
      ach({ id: "unlocked", unlocked: true, unlockedAtIso: "2026-01-01T10:00:00.000Z" }),
    ];
    const snapshot = [...input];

    const result = sortAchievementsForDisplay(input);

    expect(result).not.toBe(input);
    expect(input).toEqual(snapshot);
  });
});

describe("pickFeaturedAchievements", () => {
  it("returns the first n achievements in display order", () => {
    const list = [
      ach({ id: "locked-low", progress: { current: 1, target: 10 } }),
      ach({ id: "unlocked-old", unlocked: true, unlockedAtIso: "2026-01-01T10:00:00.000Z" }),
      ach({ id: "locked-high", progress: { current: 9, target: 10 } }),
      ach({ id: "unlocked-new", unlocked: true, unlockedAtIso: "2026-02-01T10:00:00.000Z" }),
    ];

    expect(ids(pickFeaturedAchievements(list, 3))).toEqual([
      "unlocked-new",
      "unlocked-old",
      "locked-high",
    ]);
  });

  it("returns an empty array for a count of zero or less", () => {
    const list = [ach({ unlocked: true }), ach()];

    expect(pickFeaturedAchievements(list, 0)).toEqual([]);
    expect(pickFeaturedAchievements(list, -1)).toEqual([]);
  });

  it("returns everything when the count exceeds the list", () => {
    const list = [ach(), ach()];

    expect(pickFeaturedAchievements(list, 10)).toHaveLength(2);
  });

  it("exposes a default count of four", () => {
    expect(FEATURED_ACHIEVEMENT_COUNT).toBe(4);
  });
});
