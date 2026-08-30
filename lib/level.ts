/**
 * Exponential level formula: each level requires double the points of the previous.
 *
 * Thresholds:
 *   Level 1:      0 pts
 *   Level 2:    100 pts
 *   Level 3:    300 pts
 *   Level 4:    700 pts
 *   Level 5:  1.500 pts
 *   Level 6:  3.100 pts
 *   Level 7:  6.300 pts
 *   ...
 */
export function calculateLevel(points: number): number {
  return Math.floor(Math.log2(points / 100 + 1)) + 1;
}

/** Points required to reach the next level (used as progress bar max). */
export function nextLevelThreshold(level: number): number {
  return Math.round(100 * (Math.pow(2, level) - 1));
}
