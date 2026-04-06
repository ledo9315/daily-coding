/** Event, damit die Header-Stats (Streak, Level) nach relevanten Aktionen neu geladen werden. */
export const USER_STATS_CHANGED_EVENT = "dcc:user-stats-changed" as const;

export function notifyUserStatsChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(USER_STATS_CHANGED_EVENT));
}
