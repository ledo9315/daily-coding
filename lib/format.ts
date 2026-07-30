/** Formats seconds as "M:SS" string. Returns "-" for null/0. */
export function formatTime(seconds: number | null | undefined): string {
  if (!seconds) return "-";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Elapsed time since `startedAtIso`, in the same format as the ranking
 * (`formatTime`). Returns "-" when the start time is missing or invalid.
 * ponytail: deliberately the same M:SS format as the ranking — past an hour it
 * keeps counting in minutes (125:03). Two formats would confuse more than help.
 */
export function formatElapsedSince(
  startedAtIso: string | null | undefined,
  now: Date = new Date()
): string {
  if (!startedAtIso) return "-";
  const startedMs = new Date(startedAtIso).getTime();
  if (Number.isNaN(startedMs)) return "-";
  const seconds = Math.max(0, Math.floor((now.getTime() - startedMs) / 1000));
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${(seconds % 60).toString().padStart(2, "0")}`;
}

/** Formats a Date as "DD.MM.YYYY" (de-DE locale). */
export function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
