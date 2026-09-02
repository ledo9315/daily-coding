import { describe, it, expect } from "vitest";
import type { PrismaClient } from "@/lib/generated/prisma/client";
import type { AchievementFacts, FactSubmission } from "@/lib/server/achievement-facts";
import { persistAchievementUnlocks } from "@/lib/server/achievement-unlocks";
import { buildUserAchievementsView } from "@/lib/server/achievements";

/** The row shape `loadAchievementFacts` selects; the stub client hands it back verbatim. */
type CompletedRow = FactSubmission & { codeHash: string | null; submissionDay: Date };

type ExistingRow = { achievementId: string; unlockedAt: Date | null };

type UpsertCall = {
  where: { userId_achievementId: { userId: string; achievementId: string } };
  create: { unlockedAt: Date };
  update: { unlockedAt: Date };
};

/**
 * Stubs the Prisma methods `loadAchievementFacts` and `persistAchievementUnlocks` call, so
 * the test runs the real chain from the rows to the upserts.
 */
function stubClient(state: {
  completed?: CompletedRow[];
  existing?: ExistingRow[];
  streakRecord?: number;
  comments?: { createdAt: Date }[];
  votes?: { kind: "best_practices" | "clever"; createdAt: Date }[];
}) {
  const upserts: UpsertCall[] = [];
  const client = {
    submission: {
      findMany: async () => state.completed ?? [],
      groupBy: async () => [],
    },
    userAchievement: {
      findMany: async () => state.existing ?? [],
      upsert: async (args: UpsertCall) => {
        upserts.push(args);
      },
    },
    user: {
      findUnique: async () => ({ streakRecord: state.streakRecord ?? 0 }),
    },
    comment: { findMany: async () => state.comments ?? [] },
    solutionVote: { findMany: async () => state.votes ?? [] },
  } as unknown as PrismaClient;
  return { client, upserts };
}

// Ten lines keep „Minimalist" and „Romanautor" out of these tests; one challenge id per day
// keeps „Wiederholungstäter" out.
const TEN_LINES = Array.from({ length: 10 }, (_, i) => `line ${i + 1};`).join("\n");

const solve = (day: string, language: string, difficulty = "easy"): CompletedRow => ({
  createdAt: new Date(`${day}T12:00:00Z`),
  language,
  code: TEN_LINES,
  codeHash: `hash-${day}`,
  submissionDay: new Date(`${day}T00:00:00Z`),
  challenge: { id: `ch-${day}`, difficulty, points: 100 },
});

const factsOf = (completed: FactSubmission[]): AchievementFacts => ({
  completed,
  streakRecord: 0,
  comments: [],
  votesReceived: [],
  earliestCompletionByDay: new Map(),
});

const NOW = new Date("2026-08-29T10:00:00Z");

describe("persistAchievementUnlocks", () => {
  it("writes nothing for an account that has reached no rule", async () => {
    const { client, upserts } = stubClient({});
    expect(await persistAchievementUnlocks(client, "user-1", NOW)).toEqual([]);
    expect(upserts).toHaveLength(0);
  });

  it("dates the first solve from that submission rather than from now", async () => {
    const { client, upserts } = stubClient({
      completed: [solve("2026-04-06", "javascript")],
    });

    const frozen = await persistAchievementUnlocks(client, "user-1", NOW);

    expect(frozen).toEqual(["ach-1"]);
    expect(upserts[0].create.unlockedAt).toEqual(new Date("2026-04-06T12:00:00Z"));
  });

  it("falls back to now for the streak rules, which carry no date", async () => {
    const { client, upserts } = stubClient({ streakRecord: 7 });

    // A 7-day record reaches „Wochenend-Krieger" and „Dranbleiber" (3 days) alike.
    expect(await persistAchievementUnlocks(client, "user-1", NOW)).toEqual(["ach-2", "ach-7"]);
    expect(upserts.map((u) => u.create.unlockedAt)).toEqual([NOW, NOW]);
  });

  it("dates a comment achievement from the comment, read through the facts loader", async () => {
    const { client, upserts } = stubClient({
      comments: [{ createdAt: new Date("2026-05-01T08:00:00Z") }],
    });

    expect(await persistAchievementUnlocks(client, "user-1", NOW)).toEqual(["ach-19"]);
    expect(upserts[0].create.unlockedAt).toEqual(new Date("2026-05-01T08:00:00Z"));
  });

  it("leaves an achievement that already carries a date untouched", async () => {
    const { client, upserts } = stubClient({
      completed: [solve("2026-04-06", "javascript")],
      existing: [{ achievementId: "ach-1", unlockedAt: new Date("2026-01-15") }],
    });

    expect(await persistAchievementUnlocks(client, "user-1", NOW)).toEqual([]);
    expect(upserts).toHaveLength(0);
  });

  it("fills in a row the seed created without a date", async () => {
    const { client, upserts } = stubClient({
      completed: [solve("2026-04-06", "javascript")],
      existing: [{ achievementId: "ach-1", unlockedAt: null }],
    });

    expect(await persistAchievementUnlocks(client, "user-1", NOW)).toEqual(["ach-1"]);
    expect(upserts[0].update.unlockedAt).toEqual(new Date("2026-04-06T12:00:00Z"));
  });

  it("writes one row per newly reached achievement", async () => {
    const { client, upserts } = stubClient({
      completed: [
        solve("2026-04-06", "ruby"),
        solve("2026-04-07", "python"),
        solve("2026-04-08", "go"),
      ],
    });

    expect(await persistAchievementUnlocks(client, "user-1", NOW)).toEqual([
      "ach-1",
      "ach-3",
    ]);
    expect(upserts.map((u) => u.where.userId_achievementId.achievementId)).toEqual([
      "ach-1",
      "ach-3",
    ]);
  });
});

/**
 * #205: the rules are recomputed from the submission rows on every read, and since #200 a
 * re-submission overwrites the day's row. Rewriting the only Ruby solve in Python drops the
 * distinct-language count from three to two.
 */
describe("Polyglott after a re-submission changes the language", () => {
  const defs = [
    { id: "ach-3", title: "Polyglott", description: "", iconKey: "Code", rarity: "rare" as const },
  ];

  const afterRewrite = [
    solve("2026-04-06", "ruby"),
    solve("2026-04-07", "python"),
    // was "go" until the day was submitted a second time
    solve("2026-04-08", "python"),
  ];

  it("stays unlocked once the date is frozen", async () => {
    const { client, upserts } = stubClient({
      completed: [
        solve("2026-04-06", "ruby"),
        solve("2026-04-07", "python"),
        solve("2026-04-08", "go"),
      ],
    });
    await persistAchievementUnlocks(client, "user-1", NOW);

    const frozenRow = upserts.find(
      (u) => u.where.userId_achievementId.achievementId === "ach-3"
    )!;
    const { achievements } = buildUserAchievementsView(
      defs,
      [{ achievementId: "ach-3", unlockedAt: frozenRow.create.unlockedAt }],
      factsOf(afterRewrite)
    );

    expect(achievements[0].unlocked).toBe(true);
  });

  it("would be lost without that row - what the fix prevents", () => {
    const { achievements } = buildUserAchievementsView(defs, [], factsOf(afterRewrite));
    expect(achievements[0].unlocked).toBe(false);
  });

  it("is not re-frozen on the next submission, so the original date survives", async () => {
    const { client, upserts } = stubClient({
      completed: afterRewrite,
      existing: [
        { achievementId: "ach-1", unlockedAt: new Date("2026-04-06T12:00:00Z") },
        { achievementId: "ach-3", unlockedAt: new Date("2026-04-08T12:00:00Z") },
      ],
    });

    expect(await persistAchievementUnlocks(client, "user-1", NOW)).toEqual([]);
    expect(upserts).toHaveLength(0);
  });
});
