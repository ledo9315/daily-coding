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

  /**
   * #91: ach-3 used to be „Blitzschnell" and needed a solve duration. It is now
   * „Polyglott": three different languages across all completed submissions.
   */
  it("unlocks ach-3 (Polyglott) after three different languages", () => {
    const completed = [
      { createdAt: new Date("2026-04-06T12:00:00Z"), language: "javascript" },
      { createdAt: new Date("2026-04-07T12:00:00Z"), language: "python" },
      { createdAt: new Date("2026-04-08T12:00:00Z"), language: "php" },
    ];
    const { achievements } = buildUserAchievementsView(
      [def("ach-1"), def("ach-3")],
      [],
      completed
    );
    expect(achievements.find((a) => a.id === "ach-3")?.unlocked).toBe(true);
  });

  it("keeps ach-3 locked when the same language is used repeatedly", () => {
    const completed = [
      { createdAt: new Date("2026-04-06T12:00:00Z"), language: "javascript" },
      { createdAt: new Date("2026-04-07T12:00:00Z"), language: "javascript" },
      { createdAt: new Date("2026-04-08T12:00:00Z"), language: "javascript" },
    ];
    const { achievements } = buildUserAchievementsView(
      [def("ach-1"), def("ach-3")],
      [],
      completed
    );
    expect(achievements.find((a) => a.id === "ach-3")?.unlocked).toBe(false);
  });

  it("dates ach-3 at the submission that adds the third language", () => {
    const completed = [
      { createdAt: new Date("2026-04-06T12:00:00Z"), language: "javascript" },
      { createdAt: new Date("2026-04-07T12:00:00Z"), language: "python" },
      { createdAt: new Date("2026-04-08T12:00:00Z"), language: "php" },
      { createdAt: new Date("2026-04-09T12:00:00Z"), language: "typescript" },
    ];
    const { achievements } = buildUserAchievementsView(
      [def("ach-1"), def("ach-3")],
      [],
      completed
    );
    expect(achievements.find((a) => a.id === "ach-3")?.unlockedAt).toBe("08.04.2026");
  });

  it("unlocks ach-2 at a 7-day streak record and ach-5 only at 30", () => {
    const at7 = buildUserAchievementsView([def("ach-2"), def("ach-5")], [], [], 7);
    expect(at7.achievements.find((a) => a.id === "ach-2")?.unlocked).toBe(true);
    expect(at7.achievements.find((a) => a.id === "ach-5")?.unlocked).toBe(false);

    const at30 = buildUserAchievementsView([def("ach-2"), def("ach-5")], [], [], 30);
    expect(at30.achievements.find((a) => a.id === "ach-5")?.unlocked).toBe(true);
  });

  it("unlocks ach-4 only after 10 hard challenges", () => {
    const hard = (n: number) =>
      Array.from({ length: n }, (_, i) => ({
        createdAt: new Date(2026, 0, i + 1),
        challenge: { difficulty: "hard" },
      }));

    const nine = buildUserAchievementsView([def("ach-4")], [], hard(9));
    expect(nine.achievements[0].unlocked).toBe(false);

    const ten = buildUserAchievementsView([def("ach-4")], [], hard(10));
    expect(ten.achievements[0].unlocked).toBe(true);
    expect(ten.achievements[0].unlockedAt).toBeDefined();
  });

  it("ignores non-hard challenges for ach-4", () => {
    const easy = Array.from({ length: 12 }, (_, i) => ({
      createdAt: new Date(2026, 0, i + 1),
      challenge: { difficulty: "easy" },
    }));
    const { achievements } = buildUserAchievementsView([def("ach-4")], [], easy);
    expect(achievements[0].unlocked).toBe(false);
  });

  it("unlocks ach-6 after 20 completed challenges", () => {
    const solved = (n: number) =>
      Array.from({ length: n }, (_, i) => ({ createdAt: new Date(2026, 0, i + 1) }));

    expect(
      buildUserAchievementsView([def("ach-6")], [], solved(19)).achievements[0].unlocked
    ).toBe(false);
    expect(
      buildUserAchievementsView([def("ach-6")], [], solved(20)).achievements[0].unlocked
    ).toBe(true);
  });

  it("keeps a persisted unlockedAt even when the inference rule is not met", () => {
    const { achievements } = buildUserAchievementsView(
      [def("ach-5")],
      [{ achievementId: "ach-5", unlockedAt: new Date("2026-02-01T00:00:00Z") }],
      [],
      0
    );
    expect(achievements[0].unlocked).toBe(true);
    expect(achievements[0].unlockedAt).toBeDefined();
  });
});
