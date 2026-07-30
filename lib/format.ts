/** Formats seconds as "M:SS" string. Returns "-" for null/0. */
export function formatTime(seconds: number | null | undefined): string {
  if (!seconds) return "-";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Formats a Date as "DD.MM.YYYY" (de-DE locale). */
export function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
