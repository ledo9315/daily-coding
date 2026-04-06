/** 0–100; bei `max <= 0` oder ungültigen Zahlen 0 (kein NaN). */
export function progressPercentage(value: number, max: number): number {
  if (!(max > 0)) return 0;
  const v = Number.isFinite(value) ? value : 0;
  return Math.min(Math.round((v / max) * 100), 100);
}
