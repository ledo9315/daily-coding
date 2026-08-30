import { describe, it, expect } from "vitest";
import { calculateLevel, nextLevelThreshold } from "../level";

describe("calculateLevel", () => {
  it("returns level 1 for 0 points", () => {
    expect(calculateLevel(0)).toBe(1);
  });

  it("returns level 2 at 100 points", () => {
    expect(calculateLevel(100)).toBe(2);
  });

  it("returns level 3 at 300 points", () => {
    expect(calculateLevel(300)).toBe(3);
  });

  it("returns level 4 at 700 points", () => {
    expect(calculateLevel(700)).toBe(4);
  });

  it("returns level 5 at 1500 points", () => {
    expect(calculateLevel(1500)).toBe(5);
  });

  it("returns level 6 at 3100 points", () => {
    expect(calculateLevel(3100)).toBe(6);
  });

  it("level increases monotonically with points", () => {
    const levels = [0, 50, 100, 300, 700, 1500, 3100, 6300].map(calculateLevel);
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i]).toBeGreaterThanOrEqual(levels[i - 1]);
    }
  });

  it("never returns level below 1", () => {
    expect(calculateLevel(0)).toBeGreaterThanOrEqual(1);
  });
});

describe("nextLevelThreshold", () => {
  it("returns 100 for level 1 (next level needs 100 pts)", () => {
    expect(nextLevelThreshold(1)).toBe(100);
  });

  it("returns 300 for level 2", () => {
    expect(nextLevelThreshold(2)).toBe(300);
  });

  it("returns 700 for level 3", () => {
    expect(nextLevelThreshold(3)).toBe(700);
  });

  it("threshold is always greater than previous threshold", () => {
    const thresholds = [1, 2, 3, 4, 5, 6].map(nextLevelThreshold);
    for (let i = 1; i < thresholds.length; i++) {
      expect(thresholds[i]).toBeGreaterThan(thresholds[i - 1]);
    }
  });
});
