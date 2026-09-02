import { describe, it, expect } from "vitest";
import { buildUserAchievementsView, deriveAchievementRules } from "@/lib/server/achievements";
import type { AchievementFacts, FactSubmission } from "@/lib/server/achievement-facts";

const def = (id: string) => ({
  id,
  title: id,
  description: "",
  iconKey: "Check",
  rarity: "common" as const,
});

type SubOverrides = Partial<Omit<FactSubmission, "challenge">> & {
  challenge?: Partial<FactSubmission["challenge"]>;
};

const sub = (overrides: SubOverrides = {}): FactSubmission => ({
  createdAt: new Date("2026-04-06T12:00:00Z"),
  language: "javascript",
  code: "// solved",
  ...overrides,
  challenge: { id: "c1", difficulty: "easy", points: 100, ...overrides.challenge },
});

const facts = (overrides: Partial<AchievementFacts> = {}): AchievementFacts => ({
  completed: [],
  streakRecord: 0,
  comments: [],
  votesReceived: [],
  earliestCompletionByDay: new Map(),
  ...overrides,
});

/** `n` submissions on consecutive days from 2026-01-01, each on its own challenge. */
const solved = (n: number, overrides: SubOverrides = {}) =>
  Array.from({ length: n }, (_, i) =>
    sub({
      createdAt: new Date(Date.UTC(2026, 0, i + 1, 12)),
      ...overrides,
      challenge: { id: `c${i + 1}`, ...overrides.challenge },
    })
  );

describe("buildUserAchievementsView", () => {
  it("returns all definitions; locked when there is no progress", () => {
    const { achievements, unlockedCount } = buildUserAchievementsView(
      [def("ach-1"), def("ach-2")],
      [],
      facts()
    );
    expect(achievements).toHaveLength(2);
    expect(achievements.every((a) => !a.unlocked)).toBe(true);
    expect(unlockedCount).toBe(0);
  });

  it("unlocks ach-1 on first completion without a UserAchievement row", () => {
    const { achievements, unlockedCount } = buildUserAchievementsView(
      [def("ach-1")],
      [],
      facts({ completed: [sub({ createdAt: new Date("2026-04-06T12:00:00Z") })] })
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
      sub({ createdAt: new Date("2026-04-06T12:00:00Z"), language: "javascript" }),
      sub({ createdAt: new Date("2026-04-07T12:00:00Z"), language: "python" }),
      sub({ createdAt: new Date("2026-04-08T12:00:00Z"), language: "php" }),
    ];
    const { achievements } = buildUserAchievementsView(
      [def("ach-1"), def("ach-3")],
      [],
      facts({ completed })
    );
    expect(achievements.find((a) => a.id === "ach-3")?.unlocked).toBe(true);
  });

  it("keeps ach-3 locked when the same language is used repeatedly", () => {
    const completed = [
      sub({ createdAt: new Date("2026-04-06T12:00:00Z"), language: "javascript" }),
      sub({ createdAt: new Date("2026-04-07T12:00:00Z"), language: "javascript" }),
      sub({ createdAt: new Date("2026-04-08T12:00:00Z"), language: "javascript" }),
    ];
    const { achievements } = buildUserAchievementsView(
      [def("ach-1"), def("ach-3")],
      [],
      facts({ completed })
    );
    expect(achievements.find((a) => a.id === "ach-3")?.unlocked).toBe(false);
  });

  it("dates ach-3 at the submission that adds the third language", () => {
    const completed = [
      sub({ createdAt: new Date("2026-04-06T12:00:00Z"), language: "javascript" }),
      sub({ createdAt: new Date("2026-04-07T12:00:00Z"), language: "python" }),
      sub({ createdAt: new Date("2026-04-08T12:00:00Z"), language: "php" }),
      sub({ createdAt: new Date("2026-04-09T12:00:00Z"), language: "typescript" }),
    ];
    const { achievements } = buildUserAchievementsView(
      [def("ach-1"), def("ach-3")],
      [],
      facts({ completed })
    );
    expect(achievements.find((a) => a.id === "ach-3")?.unlockedAt).toBe("08.04.2026");
  });

  it("unlocks ach-2 at a 7-day streak record and ach-5 only at 30", () => {
    const defs = [def("ach-2"), def("ach-5")];
    const at7 = buildUserAchievementsView(defs, [], facts({ streakRecord: 7 }));
    expect(at7.achievements.find((a) => a.id === "ach-2")?.unlocked).toBe(true);
    expect(at7.achievements.find((a) => a.id === "ach-5")?.unlocked).toBe(false);

    const at30 = buildUserAchievementsView(defs, [], facts({ streakRecord: 30 }));
    expect(at30.achievements.find((a) => a.id === "ach-5")?.unlocked).toBe(true);
  });

  it("unlocks ach-4 only after 10 hard challenges", () => {
    const hard = (n: number) => solved(n, { challenge: { difficulty: "hard" } });

    const nine = buildUserAchievementsView([def("ach-4")], [], facts({ completed: hard(9) }));
    expect(nine.achievements[0].unlocked).toBe(false);

    const ten = buildUserAchievementsView([def("ach-4")], [], facts({ completed: hard(10) }));
    expect(ten.achievements[0].unlocked).toBe(true);
    expect(ten.achievements[0].unlockedAt).toBeDefined();
  });

  it("ignores non-hard challenges for ach-4", () => {
    const easy = solved(12, { challenge: { difficulty: "easy" } });
    const { achievements } = buildUserAchievementsView([def("ach-4")], [], facts({ completed: easy }));
    expect(achievements[0].unlocked).toBe(false);
  });

  it("unlocks ach-6 after 20 completed challenges", () => {
    expect(
      buildUserAchievementsView([def("ach-6")], [], facts({ completed: solved(19) })).achievements[0]
        .unlocked
    ).toBe(false);
    expect(
      buildUserAchievementsView([def("ach-6")], [], facts({ completed: solved(20) })).achievements[0]
        .unlocked
    ).toBe(true);
  });

  it("keeps a persisted unlockedAt even when the inference rule is not met", () => {
    const { achievements } = buildUserAchievementsView(
      [def("ach-5")],
      [{ achievementId: "ach-5", unlockedAt: new Date("2026-02-01T00:00:00Z") }],
      facts({ streakRecord: 0 })
    );
    expect(achievements[0].unlocked).toBe(true);
    expect(achievements[0].unlockedAt).toBeDefined();
  });

  describe("unlockedAtIso", () => {
    it("carries the instant of an inferred unlock unformatted", () => {
      const at = new Date("2026-04-06T21:30:15.000Z");
      const { achievements } = buildUserAchievementsView(
        [def("ach-1")],
        [],
        facts({ completed: [sub({ createdAt: at })] })
      );
      expect(achievements[0].unlockedAtIso).toBe(at.toISOString());
      expect(achievements[0].unlockedAt).toBe("06.04.2026");
    });

    it("carries the frozen instant of a UserAchievement row", () => {
      const frozen = new Date("2026-02-01T08:15:00.000Z");
      const { achievements } = buildUserAchievementsView(
        [def("ach-5")],
        [{ achievementId: "ach-5", unlockedAt: frozen }],
        facts({ streakRecord: 0 })
      );
      expect(achievements[0].unlockedAtIso).toBe(frozen.toISOString());
    });

    it("is absent while locked and for streak unlocks without a date", () => {
      const { achievements } = buildUserAchievementsView(
        [def("ach-1"), def("ach-2")],
        [],
        facts({ streakRecord: 7 })
      );
      expect(achievements.find((a) => a.id === "ach-1")?.unlockedAtIso).toBeUndefined();
      expect(achievements.find((a) => a.id === "ach-2")?.unlocked).toBe(true);
      expect(achievements.find((a) => a.id === "ach-2")?.unlockedAtIso).toBeUndefined();
    });
  });

  describe("ordering", () => {
    /** The rows arrive ordered by id, and "ach-10" sorts before "ach-2" as a string. */
    it("orders by the position in ACHIEVEMENT_DEFS, not by id string", () => {
      const { achievements } = buildUserAchievementsView(
        [def("ach-10"), def("ach-2"), def("ach-1")],
        [],
        facts()
      );
      expect(achievements.map((a) => a.id)).toEqual(["ach-1", "ach-2", "ach-10"]);
    });

    it("puts unknown ids last, keeping their relative order", () => {
      const { achievements } = buildUserAchievementsView(
        [def("ach-99"), def("ach-3"), def("ach-42"), def("ach-1")],
        [],
        facts()
      );
      expect(achievements.map((a) => a.id)).toEqual(["ach-1", "ach-3", "ach-99", "ach-42"]);
    });
  });

  /** #96: locked achievements name their target but not the current standing. */
  describe("progress", () => {
    it("counts hard challenges towards ach-4", () => {
      const { achievements } = buildUserAchievementsView(
        [def("ach-4")],
        [],
        facts({
          completed: [
            ...solved(3, { challenge: { difficulty: "hard" } }),
            ...solved(5, { challenge: { difficulty: "easy" } }),
          ],
        })
      );
      expect(achievements[0].progress).toEqual({ current: 3, target: 10 });
    });

    it("counts distinct languages towards ach-3", () => {
      const { achievements } = buildUserAchievementsView(
        [def("ach-3")],
        [],
        facts({
          completed: [
            sub({ createdAt: new Date(2026, 0, 1), language: "python" }),
            sub({ createdAt: new Date(2026, 0, 2), language: "python" }),
            sub({ createdAt: new Date(2026, 0, 3), language: "php" }),
          ],
        })
      );
      expect(achievements[0].progress).toEqual({ current: 2, target: 3 });
    });

    it("labels the streak achievements as a record, because that is what they measure", () => {
      const { achievements } = buildUserAchievementsView(
        [def("ach-2"), def("ach-5")],
        [],
        facts({ streakRecord: 5 })
      );
      expect(achievements[0].progress).toEqual({
        current: 5,
        target: 7,
        label: "Rekord",
      });
      expect(achievements[1].progress).toEqual({
        current: 5,
        target: 30,
        label: "Rekord",
      });
    });

    it("omits progress once unlocked - the unlock date says more than a full bar", () => {
      const { achievements } = buildUserAchievementsView(
        [def("ach-4")],
        [],
        facts({ completed: solved(10, { challenge: { difficulty: "hard" } }) })
      );
      expect(achievements[0].unlocked).toBe(true);
      expect(achievements[0].progress).toBeUndefined();
    });

    it("omits progress for ach-1, whose target is a single challenge", () => {
      const { achievements } = buildUserAchievementsView([def("ach-1")], [], facts());
      expect(achievements[0].unlocked).toBe(false);
      expect(achievements[0].progress).toBeUndefined();
    });

    it("omits progress for a definition without a rule", () => {
      const { achievements } = buildUserAchievementsView(
        [def("ach-99")],
        [],
        facts({ completed: solved(4) })
      );
      expect(achievements[0].progress).toBeUndefined();
    });

    it("stays below the target while locked, so a bar can never overflow", () => {
      const { achievements } = buildUserAchievementsView(
        [def("ach-6")],
        [],
        facts({ completed: solved(19) })
      );
      const progress = achievements[0].progress;
      expect(progress).toEqual({ current: 19, target: 20 });
      expect(progress!.current).toBeLessThan(progress!.target);
    });
  });
});

/** #271: the seventeen achievements added on top of ach-1..ach-6. */
describe("deriveAchievementRules", () => {
  const rule = (id: string, f: AchievementFacts) => deriveAchievementRules(f)[id];
  const day = (d: number, hour = 12) => new Date(Date.UTC(2026, 0, d, hour));

  describe("ach-7 Dranbleiber", () => {
    it("unlocks at a 3-day streak record, undated", () => {
      expect(rule("ach-7", facts({ streakRecord: 3 }))).toEqual({
        unlocked: true,
        at: null,
        current: 3,
        target: 3,
        label: "Rekord",
      });
    });

    it("stays locked at 2 and reports the record", () => {
      expect(rule("ach-7", facts({ streakRecord: 2 }))).toMatchObject({
        unlocked: false,
        current: 2,
        target: 3,
        label: "Rekord",
      });
    });
  });

  describe("ach-8 Ohne Stützräder", () => {
    it("unlocks at the first hard solve, dated there", () => {
      const completed = [
        sub({ createdAt: day(1), challenge: { difficulty: "easy" } }),
        sub({ createdAt: day(3), challenge: { difficulty: "hard" } }),
        sub({ createdAt: day(2), challenge: { difficulty: "hard" } }),
      ];
      expect(rule("ach-8", facts({ completed }))).toMatchObject({ unlocked: true, at: day(2) });
    });

    it("stays locked without a hard solve", () => {
      const completed = solved(5, { challenge: { difficulty: "medium" } });
      expect(rule("ach-8", facts({ completed }))).toMatchObject({
        unlocked: false,
        current: 0,
        target: 1,
      });
    });
  });

  describe("ach-9 Allrounder", () => {
    it("unlocks at the solve that adds the third difficulty", () => {
      const completed = [
        sub({ createdAt: day(1), challenge: { difficulty: "easy" } }),
        sub({ createdAt: day(2), challenge: { difficulty: "easy" } }),
        sub({ createdAt: day(3), challenge: { difficulty: "hard" } }),
        sub({ createdAt: day(4), challenge: { difficulty: "medium" } }),
        sub({ createdAt: day(5), challenge: { difficulty: "medium" } }),
      ];
      expect(rule("ach-9", facts({ completed }))).toMatchObject({
        unlocked: true,
        at: day(4),
        current: 3,
        target: 3,
      });
    });

    it("counts distinct difficulties while locked", () => {
      const completed = [
        sub({ createdAt: day(1), challenge: { difficulty: "easy" } }),
        sub({ createdAt: day(2), challenge: { difficulty: "medium" } }),
        sub({ createdAt: day(3), challenge: { difficulty: "medium" } }),
      ];
      expect(rule("ach-9", facts({ completed }))).toMatchObject({
        unlocked: false,
        current: 2,
        target: 3,
      });
    });
  });

  describe("ach-10 Halbes Hundert", () => {
    it("unlocks at the 50th solve by date", () => {
      const completed = solved(52).reverse();
      expect(rule("ach-10", facts({ completed }))).toMatchObject({ unlocked: true, at: day(50) });
    });

    it("stays locked at 49", () => {
      expect(rule("ach-10", facts({ completed: solved(49) }))).toMatchObject({
        unlocked: false,
        current: 49,
        target: 50,
      });
    });
  });

  describe("ach-11 Hundertschaft", () => {
    it("unlocks at the 100th solve by date", () => {
      const completed = solved(101);
      expect(rule("ach-11", facts({ completed }))).toMatchObject({
        unlocked: true,
        at: completed[99].createdAt,
      });
    });

    it("stays locked at 99", () => {
      expect(rule("ach-11", facts({ completed: solved(99) }))).toMatchObject({
        unlocked: false,
        current: 99,
        target: 100,
      });
    });
  });

  describe("ach-12 Dreistellig", () => {
    it("unlocks at a 100-day streak record, undated", () => {
      expect(rule("ach-12", facts({ streakRecord: 100 }))).toEqual({
        unlocked: true,
        at: null,
        current: 100,
        target: 100,
        label: "Rekord",
      });
    });

    it("stays locked at 99 and reports the record", () => {
      expect(rule("ach-12", facts({ streakRecord: 99 }))).toMatchObject({
        unlocked: false,
        current: 99,
        target: 100,
        label: "Rekord",
      });
    });
  });

  describe("ach-13 Weltenbummler", () => {
    const languages = ["javascript", "python", "php", "typescript", "ruby", "java", "go"];

    it("unlocks at the submission that adds the sixth language", () => {
      const completed = languages.map((language, i) => sub({ createdAt: day(i + 1), language }));
      expect(rule("ach-13", facts({ completed }))).toMatchObject({ unlocked: true, at: day(6) });
    });

    it("stays locked at five languages, repeats included", () => {
      const completed = [
        ...languages.slice(0, 5).map((language, i) => sub({ createdAt: day(i + 1), language })),
        sub({ createdAt: day(6), language: "python" }),
      ];
      expect(rule("ach-13", facts({ completed }))).toMatchObject({
        unlocked: false,
        current: 5,
        target: 6,
      });
    });
  });

  describe("ach-14 Rostfrei", () => {
    it("unlocks at the first Rust solve", () => {
      const completed = [
        sub({ createdAt: day(1), language: "python" }),
        sub({ createdAt: day(3), language: "rust" }),
        sub({ createdAt: day(2), language: "rust" }),
      ];
      expect(rule("ach-14", facts({ completed }))).toMatchObject({ unlocked: true, at: day(2) });
    });

    it("stays locked without Rust", () => {
      const completed = [sub({ createdAt: day(1), language: "go" })];
      expect(rule("ach-14", facts({ completed }))).toMatchObject({
        unlocked: false,
        current: 0,
        target: 1,
      });
    });
  });

  describe("ach-15 Wiederholungstäter", () => {
    it("unlocks at the second solve of the same challenge", () => {
      const completed = [
        sub({ createdAt: day(1), challenge: { id: "a" } }),
        sub({ createdAt: day(2), challenge: { id: "b" } }),
        sub({ createdAt: day(3), challenge: { id: "a" } }),
        sub({ createdAt: day(4), challenge: { id: "a" } }),
      ];
      expect(rule("ach-15", facts({ completed }))).toMatchObject({
        unlocked: true,
        at: day(3),
        current: 2,
        target: 2,
      });
    });

    it("dates the repeat correctly when the input is unsorted", () => {
      const completed = [
        sub({ createdAt: day(5), challenge: { id: "a" } }),
        sub({ createdAt: day(1), challenge: { id: "a" } }),
        sub({ createdAt: day(3), challenge: { id: "b" } }),
      ];
      expect(rule("ach-15", facts({ completed }))).toMatchObject({ unlocked: true, at: day(5) });
    });

    it("stays locked while every challenge is solved once", () => {
      expect(rule("ach-15", facts({ completed: solved(4) }))).toMatchObject({
        unlocked: false,
        current: 1,
        target: 2,
      });
    });
  });

  describe("ach-16 Comeback", () => {
    it("unlocks after exactly 30 calendar days, dated at the return", () => {
      const completed = [sub({ createdAt: day(1) }), sub({ createdAt: day(31) })];
      expect(rule("ach-16", facts({ completed }))).toMatchObject({ unlocked: true, at: day(31) });
    });

    it("stays locked at 29 days", () => {
      const completed = [sub({ createdAt: day(1) }), sub({ createdAt: day(30) })];
      expect(rule("ach-16", facts({ completed }))).toMatchObject({
        unlocked: false,
        current: 0,
        target: 1,
      });
    });

    it("measures calendar days across the day boundary, not 30 x 24 hours", () => {
      // 29 days and 40 minutes apart in milliseconds, but 30 UTC calendar days.
      const late = new Date("2026-01-01T23:30:00Z");
      const early = new Date("2026-01-31T00:10:00Z");
      expect(rule("ach-16", facts({ completed: [sub({ createdAt: late }), sub({ createdAt: early })] })))
        .toMatchObject({ unlocked: true, at: early });

      // Almost 30 x 24 hours apart, but only 29 calendar days.
      const first = new Date("2026-01-01T00:10:00Z");
      const last = new Date("2026-01-30T23:50:00Z");
      expect(rule("ach-16", facts({ completed: [sub({ createdAt: first }), sub({ createdAt: last })] })))
        .toMatchObject({ unlocked: false });
    });

    it("sorts before measuring gaps", () => {
      const completed = [sub({ createdAt: day(31) }), sub({ createdAt: day(1) })];
      expect(rule("ach-16", facts({ completed }))).toMatchObject({ unlocked: true, at: day(31) });
    });

    it("only counts a gap between consecutive solves", () => {
      const completed = [sub({ createdAt: day(1) }), sub({ createdAt: day(20) }), sub({ createdAt: day(40) })];
      expect(rule("ach-16", facts({ completed }))).toMatchObject({ unlocked: false });
    });
  });

  describe("ach-17 Last Minute", () => {
    it("unlocks at the first solve in the 23rd UTC hour", () => {
      const completed = [
        sub({ createdAt: day(1, 22) }),
        sub({ createdAt: new Date("2026-01-03T23:59:59Z") }),
        sub({ createdAt: new Date("2026-01-02T23:00:00Z") }),
      ];
      expect(rule("ach-17", facts({ completed }))).toMatchObject({
        unlocked: true,
        at: new Date("2026-01-02T23:00:00Z"),
      });
    });

    it("stays locked at 22:59", () => {
      const completed = [sub({ createdAt: new Date("2026-01-01T22:59:59Z") })];
      expect(rule("ach-17", facts({ completed }))).toMatchObject({
        unlocked: false,
        current: 0,
        target: 1,
      });
    });
  });

  describe("ach-18 Früher Vogel", () => {
    it("unlocks when the own solve is the day's earliest", () => {
      const own = new Date("2026-01-02T06:00:00Z");
      const completed = [sub({ createdAt: day(1) }), sub({ createdAt: own })];
      const earliestCompletionByDay = new Map([
        ["2026-01-01", new Date("2026-01-01T05:00:00Z")],
        ["2026-01-02", own],
      ]);
      expect(rule("ach-18", facts({ completed, earliestCompletionByDay }))).toMatchObject({
        unlocked: true,
        at: own,
      });
    });

    it("stays locked when someone else was first that day", () => {
      const own = new Date("2026-01-02T06:00:00Z");
      const earliestCompletionByDay = new Map([["2026-01-02", new Date("2026-01-02T05:59:59Z")]]);
      expect(
        rule("ach-18", facts({ completed: [sub({ createdAt: own })], earliestCompletionByDay }))
      ).toMatchObject({ unlocked: false, current: 0, target: 1 });
    });

    it("stays locked when the day has no entry", () => {
      expect(rule("ach-18", facts({ completed: [sub({ createdAt: day(1) })] }))).toMatchObject({
        unlocked: false,
      });
    });
  });

  describe("ach-19 Wortmeldung", () => {
    it("unlocks at the earliest comment", () => {
      const comments = [{ createdAt: day(5) }, { createdAt: day(2) }];
      expect(rule("ach-19", facts({ comments }))).toMatchObject({ unlocked: true, at: day(2) });
    });

    it("stays locked without a comment", () => {
      expect(rule("ach-19", facts())).toMatchObject({ unlocked: false, current: 0, target: 1 });
    });
  });

  const votes = (kind: "best_practices" | "clever", n: number, offset = 0) =>
    Array.from({ length: n }, (_, i) => ({ kind, createdAt: day(i + 1 + offset) }));

  describe("ach-20 Vorbild", () => {
    it("unlocks at the 10th best-practices vote by date", () => {
      const votesReceived = [...votes("best_practices", 11), ...votes("clever", 3, 20)].reverse();
      expect(rule("ach-20", facts({ votesReceived }))).toMatchObject({
        unlocked: true,
        at: day(10),
      });
    });

    it("ignores clever votes", () => {
      const votesReceived = [...votes("best_practices", 9), ...votes("clever", 5, 20)];
      expect(rule("ach-20", facts({ votesReceived }))).toMatchObject({
        unlocked: false,
        current: 9,
        target: 10,
      });
    });
  });

  describe("ach-21 Trickreich", () => {
    it("unlocks at the 5th clever vote by date", () => {
      const votesReceived = [...votes("clever", 6), ...votes("best_practices", 10, 20)];
      expect(rule("ach-21", facts({ votesReceived }))).toMatchObject({
        unlocked: true,
        at: day(5),
      });
    });

    it("ignores best-practices votes", () => {
      const votesReceived = [...votes("clever", 4), ...votes("best_practices", 10, 20)];
      expect(rule("ach-21", facts({ votesReceived }))).toMatchObject({
        unlocked: false,
        current: 4,
        target: 5,
      });
    });
  });

  const lines = (n: number, blankEvery = 0) =>
    Array.from({ length: n }, (_, i) =>
      blankEvery && i % blankEvery === 0 ? `const a${i} = ${i};\n   \n` : `const a${i} = ${i};\n`
    ).join("");

  describe("ach-22 Romanautor", () => {
    it("unlocks at the first solution of 100 non-empty lines", () => {
      const completed = [
        sub({ createdAt: day(1), code: lines(99) }),
        sub({ createdAt: day(3), code: lines(150) }),
        sub({ createdAt: day(2), code: lines(100, 3) }),
      ];
      expect(rule("ach-22", facts({ completed }))).toMatchObject({ unlocked: true, at: day(2) });
    });

    it("counts CRLF-terminated lines", () => {
      const crlf = Array.from({ length: 100 }, (_, i) => `line ${i}`).join("\r\n");
      expect(rule("ach-22", facts({ completed: [sub({ code: crlf })] }))).toMatchObject({ unlocked: true });
    });

    it("does not count blank lines", () => {
      const padded = lines(99, 2);
      expect(padded.split("\n").length).toBeGreaterThan(100);
      expect(rule("ach-22", facts({ completed: [sub({ code: padded })] }))).toMatchObject({
        unlocked: false,
        current: 0,
        target: 1,
      });
    });
  });

  describe("ach-23 Minimalist", () => {
    it("unlocks with 5 non-empty lines, blank lines between them ignored", () => {
      const code = "a\n\nb\n  \nc\nd\n\n\ne\n";
      expect(rule("ach-23", facts({ completed: [sub({ createdAt: day(4), code })] }))).toMatchObject(
        { unlocked: true, at: day(4) }
      );
    });

    it("does not reward empty or whitespace-only code", () => {
      for (const code of ["", "   \n\t\n"]) {
        expect(rule("ach-23", facts({ completed: [sub({ code })] }))).toMatchObject({ unlocked: false });
      }
    });

    it("stays locked with 6 non-empty lines", () => {
      expect(rule("ach-23", facts({ completed: [sub({ code: lines(6) })] }))).toMatchObject({
        unlocked: false,
        current: 0,
        target: 1,
      });
    });
  });
});
