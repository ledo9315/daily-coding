import type { Achievement } from "@/lib/api";

export const FEATURED_ACHIEVEMENT_COUNT = 4;

function progressRatio(achievement: Achievement): number {
  const progress = achievement.progress;
  if (!progress || progress.target <= 0) return 0;
  return progress.current / progress.target;
}

function unlockedTime(achievement: Achievement): number | null {
  if (!achievement.unlockedAtIso) return null;
  const time = new Date(achievement.unlockedAtIso).getTime();
  return Number.isNaN(time) ? null : time;
}

/**
 * Orders achievements the way the profile presents them: unlocked ones first, the most
 * recently earned at the top, then the locked ones by how close they are to being earned.
 * The card leads with what was just achieved and with what is within reach, so the same
 * order serves both the short card and the full list. Returns a new array; ties and
 * entries without a usable timestamp or progress keep their input order.
 */
export function sortAchievementsForDisplay(list: Achievement[]): Achievement[] {
  const unlocked = list.filter((a) => a.unlocked);
  const locked = list.filter((a) => !a.unlocked);

  const withTime = unlocked.filter((a) => unlockedTime(a) !== null);
  const withoutTime = unlocked.filter((a) => unlockedTime(a) === null);
  withTime.sort((a, b) => (unlockedTime(b) as number) - (unlockedTime(a) as number));

  locked.sort((a, b) => progressRatio(b) - progressRatio(a));

  return [...withTime, ...withoutTime, ...locked];
}

/** Rarity from plainest to rarest - the order the full list groups by. */
const RARITY_ORDER: Record<Achievement["rarity"], number> = {
  common: 0,
  rare: 1,
  epic: 2,
  legendary: 3,
};

/**
 * Groups achievements by rarity, common first, and leaves everything else alone.
 *
 * Deliberately blind to whether an achievement is unlocked: the full list is a catalogue,
 * and a locked entry that slid behind its unlocked neighbours would move around under the
 * reader every time they earned something. Within a rarity the input order survives -
 * `Array.prototype.sort` is stable, and the API hands the list over in the order of
 * `ACHIEVEMENT_DEFS`, which is the intended display order.
 */
export function sortAchievementsByRarity(list: Achievement[]): Achievement[] {
  return [...list].sort((a, b) => RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity]);
}

/**
 * The first `count` achievements in display order - what the profile card shows before
 * the dialog with the full list. A non-positive count yields an empty array.
 */
export function pickFeaturedAchievements(
  list: Achievement[],
  count: number,
): Achievement[] {
  if (count <= 0) return [];
  return sortAchievementsForDisplay(list).slice(0, count);
}
