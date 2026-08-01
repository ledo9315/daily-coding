import { startOfUtcDay } from "@/lib/server/ranking-period";

/**
 * The daily as a ring the admin can see and reorder.
 *
 * Before this, the order was `(date, id)` and the position in it was `dayNumber % poolSize` —
 * correct, but invisible, uneditable, and it jumped whenever a challenge was added or
 * deactivated, because `poolSize` is part of the formula. The admin panel needed three sentences
 * to explain what the list meant.
 *
 * Now the order is an explicit `position`, and where the ring currently stands is stored rather
 * than computed: `RotationState` holds the challenge that is live and the UTC day it became
 * live. That is what makes "tomorrow the one below it runs" hold even when the pool changes.
 */

/** How many whole UTC days lie between two instants. Negative if `to` is earlier. */
export function utcDaysBetween(from: Date, to: Date): number {
  const a = startOfUtcDay(from).getTime();
  const b = startOfUtcDay(to).getTime();
  return Math.round((b - a) / 86_400_000);
}

/**
 * Where the ring stands after `days` steps, starting at `fromIndex`.
 *
 * Wraps in both directions: a clock set backwards must not produce a negative index, and the
 * whole point of the ring is that it never runs out.
 */
export function advanceIndex(fromIndex: number, days: number, size: number): number {
  if (size <= 0) return 0;
  const raw = (fromIndex + days) % size;
  return raw < 0 ? raw + size : raw;
}

export type RingEntry = { id: string; position: number };

/** Ring order: `position`, then `id` so equal positions cannot shuffle between requests. */
export function compareRingEntries(a: RingEntry, b: RingEntry): number {
  if (a.position !== b.position) return a.position - b.position;
  return a.id.localeCompare(b.id);
}

/**
 * The index the ring should stand at now, and whether that differs from the stored state.
 *
 * `currentId` missing from the pool is the case that matters in practice: the live challenge got
 * deactivated or deleted. Starting over at 0 would be wrong (it would repeat the front of the
 * list), so the stored position is used as the entry point instead — the ring continues where
 * the removed entry stood.
 */
export function resolveRingIndex(
  pool: RingEntry[],
  state: { challengeId: string | null; day: Date; position: number },
  now: Date
): { index: number; changed: boolean } {
  if (pool.length === 0) return { index: 0, changed: false };

  const days = utcDaysBetween(state.day, now);
  const known = pool.findIndex((c) => c.id === state.challengeId);

  if (known === -1) {
    // Entry point by position: the first entry that is not ahead of where the ring stood.
    const fallback = pool.findIndex((c) => c.position >= state.position);
    const from = fallback === -1 ? 0 : fallback;
    return { index: advanceIndex(from, Math.max(days, 0), pool.length), changed: true };
  }

  if (days === 0) return { index: known, changed: false };
  return { index: advanceIndex(known, days, pool.length), changed: true };
}

/**
 * Label for the admin list, counted from today rather than as a date.
 *
 * A ring has no dates: the same challenge comes round again after `poolSize` days, so
 * "13.08.2026" would be a promise the model cannot keep.
 */
export function ringLabel(offset: number): string {
  if (offset === 0) return "Heute";
  if (offset === 1) return "Morgen";
  if (offset === 2) return "Übermorgen";
  return `in ${offset} Tagen`;
}
