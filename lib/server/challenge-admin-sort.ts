import { compareRingEntries, type RingEntry } from "@/lib/server/challenge-ring";

/**
 * The admin list: today on top, then the ring in order, inactive challenges last.
 *
 * The old rule needed three sentences above the table to explain itself ("first upcoming dailies,
 * then past dates, then undated"). This one is a single sentence, and it matches what a visitor
 * gets: row two runs tomorrow.
 */
export type AdminRow = RingEntry & { isActive: boolean };

export function buildAdminOrder<T extends AdminRow>(
  rows: T[],
  liveChallengeId: string | null,
): { active: T[]; inactive: T[] } {
  const sorted = [...rows].sort(compareRingEntries);
  const active = sorted.filter((c) => c.isActive);
  const inactive = sorted.filter((c) => !c.isActive);

  const live = active.findIndex((c) => c.id === liveChallengeId);
  // Rotating the display rather than the stored order: nothing is written when a day passes.
  const rotated = live <= 0 ? active : [...active.slice(live), ...active.slice(0, live)];

  return { active: rotated, inactive };
}
