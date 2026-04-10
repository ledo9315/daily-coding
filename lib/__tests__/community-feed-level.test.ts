import { describe, it, expect } from "vitest";
import { computeLevelUpBySubmissionId } from "@/lib/server/community-feed-level";

describe("computeLevelUpBySubmissionId", () => {
  const u = "user-a";

  it("ist leer, wenn die Seitenzeile nicht in der chronologischen Liste vorkommt", () => {
    const page = [{ id: "s1", userId: u, challenge: { points: 100 } }];
    const chronological = [
      { id: "other", userId: u, challenge: { points: 100 } },
    ];
    expect(computeLevelUpBySubmissionId(page, chronological).size).toBe(0);
  });

  it("meldet Levelaufstieg, wenn diese Submission die Schwelle überschreitet", () => {
    const chronological = [
      { id: "a", userId: u, challenge: { points: 50 } },
      { id: "b", userId: u, challenge: { points: 60 } },
    ];
    const page = [{ id: "b", userId: u, challenge: { points: 60 } }];
    const m = computeLevelUpBySubmissionId(page, chronological);
    expect(m.get("b")).toEqual({ previousLevel: 1, newLevel: 2 });
  });

  it("meldet keinen Aufstieg, wenn das Level gleich bleibt", () => {
    const chronological = [
      { id: "a", userId: u, challenge: { points: 20 } },
      { id: "b", userId: u, challenge: { points: 20 } },
    ];
    const page = [{ id: "b", userId: u, challenge: { points: 20 } }];
    expect(computeLevelUpBySubmissionId(page, chronological).size).toBe(0);
  });

  it("trennt Nutzer: fremde Submissions zählen nicht zur Punktesumme", () => {
    const chronological = [
      { id: "a", userId: "other", challenge: { points: 500 } },
      { id: "b", userId: u, challenge: { points: 150 } },
    ];
    const page = [{ id: "b", userId: u, challenge: { points: 150 } }];
    const m = computeLevelUpBySubmissionId(page, chronological);
    expect(m.get("b")).toEqual({ previousLevel: 1, newLevel: 2 });
  });
});
