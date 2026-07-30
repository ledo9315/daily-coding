/** Event that makes the header stats (streak, level) reload after relevant actions. */
export const USER_STATS_CHANGED_EVENT = "dcc:user-stats-changed" as const;

export function notifyUserStatsChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(USER_STATS_CHANGED_EVENT));
}
