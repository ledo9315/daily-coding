import { describe, it, expect } from "vitest";
import { computeLevelUpBySubmissionId } from "@/lib/server/community-feed-level";

describe("computeLevelUpBySubmissionId", () => {
  const u = "user-a";

  it("is empty when the page row does not appear in the chronological list", () => {
    const page = [{ id: "s1", userId: u, challenge: { points: 100 } }];
    const chronological = [
      { id: "other", userId: u, challenge: { points: 100 } },
    ];
    expect(computeLevelUpBySubmissionId(page, chronological).size).toBe(0);
  });

  it("reports a level-up when this submission crosses the threshold", () => {
    const chronological = [
      { id: "a", userId: u, challenge: { points: 50 } },
      { id: "b", userId: u, challenge: { points: 60 } },
    ];
    const page = [{ id: "b", userId: u, challenge: { points: 60 } }];
    const m = computeLevelUpBySubmissionId(page, chronological);
    expect(m.get("b")).toEqual({ previousLevel: 1, newLevel: 2 });
  });

  it("reports no level-up when the level stays the same", () => {
    const chronological = [
      { id: "a", userId: u, challenge: { points: 20 } },
      { id: "b", userId: u, challenge: { points: 20 } },
    ];
    const page = [{ id: "b", userId: u, challenge: { points: 20 } }];
    expect(computeLevelUpBySubmissionId(page, chronological).size).toBe(0);
  });

  it("keeps users apart: submissions from others do not add to the point total", () => {
    const chronological = [
      { id: "a", userId: "other", challenge: { points: 500 } },
      { id: "b", userId: u, challenge: { points: 150 } },
    ];
    const page = [{ id: "b", userId: u, challenge: { points: 150 } }];
    const m = computeLevelUpBySubmissionId(page, chronological);
    expect(m.get("b")).toEqual({ previousLevel: 1, newLevel: 2 });
  });
});
