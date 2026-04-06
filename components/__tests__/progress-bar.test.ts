import { describe, it, expect } from "vitest";
import { progressBarPercentage } from "@/components/progress-bar";

describe("progressBarPercentage", () => {
  it("returns 0 when max is 0 (no NaN)", () => {
    expect(progressBarPercentage(0, 0)).toBe(0);
  });

  it("caps at 100", () => {
    expect(progressBarPercentage(10, 5)).toBe(100);
  });

  it("rounds half-up style", () => {
    expect(progressBarPercentage(1, 3)).toBe(33);
    expect(progressBarPercentage(2, 3)).toBe(67);
  });
});
