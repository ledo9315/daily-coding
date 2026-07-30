/** 0–100; returns 0 for `max <= 0` or invalid numbers, never NaN. */
export function progressPercentage(value: number, max: number): number {
  if (!(max > 0)) return 0;
  const v = Number.isFinite(value) ? value : 0;
  return Math.min(Math.round((v / max) * 100), 100);
}
