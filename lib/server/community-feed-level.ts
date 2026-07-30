import { calculateLevel } from "@/lib/level";

export type SubmissionPointsRow = {
  id: string;
  userId: string;
  challenge: { points: number };
};

/**
 * For every row of a feed page: checks whether this completed submission caused
 * the level change, comparing lifetime points before and after.
 */
export function computeLevelUpBySubmissionId(
  pageRows: SubmissionPointsRow[],
  chronological: SubmissionPointsRow[],
): Map<string, { previousLevel: number; newLevel: number }> {
  const byUser = new Map<string, SubmissionPointsRow[]>();
  for (const s of chronological) {
    let list = byUser.get(s.userId);
    if (!list) {
      list = [];
      byUser.set(s.userId, list);
    }
    list.push(s);
  }

  const out = new Map<string, { previousLevel: number; newLevel: number }>();
  for (const row of pageRows) {
    const list = byUser.get(row.userId);
    if (!list?.length) continue;
    const idx = list.findIndex((x) => x.id === row.id);
    if (idx === -1) continue;
    let pointsBefore = 0;
    for (let i = 0; i < idx; i++) {
      pointsBefore += list[i].challenge.points;
    }
    const pts = list[idx].challenge.points;
    const levelBefore = calculateLevel(pointsBefore);
    const levelAfter = calculateLevel(pointsBefore + pts);
    if (levelAfter > levelBefore) {
      out.set(row.id, { previousLevel: levelBefore, newLevel: levelAfter });
    }
  }
  return out;
}
