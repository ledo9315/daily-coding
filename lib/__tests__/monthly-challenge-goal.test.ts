import { describe, it, expect } from "vitest";
import { MONTHLY_CHALLENGE_GOAL, countSubmissionsInUtcMonth } from "@/lib/monthly-challenge-goal";

describe("MONTHLY_CHALLENGE_GOAL", () => {
  it("is a positive target count", () => {
    expect(MONTHLY_CHALLENGE_GOAL).toBe(30);
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
