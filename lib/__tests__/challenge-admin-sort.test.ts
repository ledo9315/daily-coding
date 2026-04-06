import { describe, it, expect } from "vitest";
import { compareChallengesBySchedule } from "@/lib/server/challenge-admin-sort";

describe("compareChallengesBySchedule", () => {
  const now = new Date("2026-04-10T12:00:00.000Z");

  it("sorts today before tomorrow (UTC day boundary)", () => {
    const today = { id: "a", date: new Date("2026-04-10T08:00:00.000Z") };
    const tomorrow = { id: "b", date: new Date("2026-04-11T00:00:00.000Z") };
    expect(compareChallengesBySchedule(today, tomorrow, now)).toBeLessThan(0);
  });

  it("sorts upcoming before past", () => {
    const past = { id: "p", date: new Date("2026-04-09T12:00:00.000Z") };
    const next = { id: "n", date: new Date("2026-04-12T00:00:00.000Z") };
    expect(compareChallengesBySchedule(next, past, now)).toBeLessThan(0);
  });

  it("sorts null dates last", () => {
    const withDate = { id: "w", date: new Date("2026-04-09T12:00:00.000Z") };
    const noDate = { id: "x", date: null };
    expect(compareChallengesBySchedule(withDate, noDate, now)).toBeLessThan(0);
  });
});
