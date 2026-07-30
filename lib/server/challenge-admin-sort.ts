import { startOfUtcDay } from "@/lib/server/ranking-period";

type HasDate = { date: Date | null; id?: string };

/**
 * Admin table: whatever is up next goes on top.
 *
 * 1. `date` >= today 00:00 UTC — ascending (today, tomorrow, …)
 * 2. `date` &lt; today — descending (most recent past first)
 * 3. no `date` — last
 */
export function compareChallengesBySchedule(
  a: HasDate,
  b: HasDate,
  now: Date = new Date(),
): number {
  const t0 = startOfUtcDay(now).getTime();

  const tier = (d: Date | null): 0 | 1 | 2 => {
    if (d == null) return 2;
    return d.getTime() < t0 ? 1 : 0;
  };

  const ta = tier(a.date);
  const tb = tier(b.date);
  if (ta !== tb) return ta - tb;

  if (ta === 0 && a.date && b.date) {
    return a.date.getTime() - b.date.getTime();
  }
  if (ta === 1 && a.date && b.date) {
    return b.date.getTime() - a.date.getTime();
  }
  const idA = a.id ?? "";
  const idB = b.id ?? "";
  return idA.localeCompare(idB);
}
