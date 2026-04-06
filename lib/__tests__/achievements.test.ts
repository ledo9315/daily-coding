import { describe, it, expect } from "vitest";
import { buildUserAchievementsView } from "@/lib/server/achievements";

const def = (id: string) => ({
  id,
  title: id,
  description: "",
  iconKey: "Check",
  rarity: "common" as const,
});

describe("buildUserAchievementsView", () => {
  it("returns all definitions; locked when there is no progress", () => {
    const { achievements, unlockedCount } = buildUserAchievementsView(
      [def("ach-1"), def("ach-2")],
      [],
      []
    );
    expect(achievements).toHaveLength(2);
    expect(achievements.every((a) => !a.unlocked)).toBe(true);
    expect(unlockedCount).toBe(0);
  });

  it("unlocks ach-1 on first completion without a UserAchievement row", () => {
    const completed = [{ createdAt: new Date("2026-04-06T12:00:00Z") }];
    const { achievements, unlockedCount } = buildUserAchievementsView(
      [def("ach-1")],
      [],
      completed
    );
    expect(achievements[0].unlocked).toBe(true);
    expect(achievements[0].unlockedAt).toBeDefined();
    expect(unlockedCount).toBe(1);
  });

  it("unlocks ach-3 (Blitzschnell) when a submission is within 180s", () => {
    const completed = [
      {
        createdAt: new Date("2026-04-06T12:00:00Z"),
        timeTaken: 120,
      },
    ];
    const { achievements } = buildUserAchievementsView(
      [def("ach-1"), def("ach-3")],
      [],
      completed
    );
    expect(achievements.find((a) => a.id === "ach-3")?.unlocked).toBe(true);
  });
});
