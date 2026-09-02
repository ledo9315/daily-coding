import type { PrismaClient } from "@/lib/generated/prisma/client";
import { loadAchievementFacts } from "@/lib/server/achievement-facts";
import { deriveAchievementRules } from "@/lib/server/achievements";

/**
 * Writes `unlockedAt` for every achievement the user has reached, and returns the ids
 * this call froze.
 *
 * Until #205 nothing ever wrote those rows outside the seed, so an unlock was only as
 * permanent as the data behind it. Since #200 a second submission overwrites the day's
 * row: changing the language of the only Ruby solve dropped the distinct-language count
 * back to two and took „Polyglott" away again. A written date cannot be recomputed away -
 * `buildUserAchievementsView` gives it precedence over the rules.
 *
 * The date comes from the rule wherever the facts can supply one, so a badge earned
 * months ago keeps its original date instead of today's. The streak rules read
 * `streakRecord`, which carries no date at all; those get `now`.
 *
 * Takes the client as a parameter rather than importing it, like `loadAchievementFacts`
 * and `seedAchievementDefs`: `lib/prisma` is `server-only` and cannot be imported from the
 * backfill script, which needs this same function.
 */
export async function persistAchievementUnlocks(
  client: PrismaClient,
  userId: string,
  now: Date = new Date()
): Promise<string[]> {
  const [facts, existing] = await Promise.all([
    loadAchievementFacts(client, userId),
    client.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true, unlockedAt: true },
    }),
  ]);

  const rules = deriveAchievementRules(facts);
  const frozenAt = new Map(existing.map((row) => [row.achievementId, row.unlockedAt]));

  // `== null` covers both cases worth writing: no row at all, and a row the seed created
  // without a date.
  const pending = Object.entries(rules).filter(
    ([id, rule]) => rule.unlocked && frozenAt.get(id) == null
  );
  if (pending.length === 0) return [];

  for (const [achievementId, rule] of pending) {
    await client.userAchievement.upsert({
      where: { userId_achievementId: { userId, achievementId } },
      create: { userId, achievementId, unlockedAt: rule.at ?? now },
      update: { unlockedAt: rule.at ?? now },
    });
  }

  return pending.map(([id]) => id);
}
