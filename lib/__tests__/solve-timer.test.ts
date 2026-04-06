import { describe, it, expect } from "vitest";
import { solveTimerStorageKey } from "@/lib/solve-timer";

describe("solveTimerStorageKey", () => {
  it("includes challenge id and UTC day", () => {
    const d = new Date("2026-04-06T12:00:00.000Z");
    expect(solveTimerStorageKey("challenge-array-manipulation", d)).toBe(
      "dcc:solveStart:challenge-array-manipulation:2026-04-06"
    );
  });
});
