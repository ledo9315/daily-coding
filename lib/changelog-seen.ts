import { CHANGELOG } from "@/lib/changelog";

const STORAGE_KEY = "changelog-seen";

export function latestChangelogVersion(): string | undefined {
  return CHANGELOG[0]?.version;
}

/**
 * Whether the footer should mark the changelog as new.
 *
 * A reader who has never been here gets no badge: everything is new to them, and pointing
 * at the release notes of a site they are seeing for the first time says nothing. The badge
 * is for the second release onwards, which is why an unknown `seen` counts as up to date.
 */
export function hasUnseenChangelog(
  seen: string | null,
  latest: string | undefined
): boolean {
  if (!latest || seen === null) return false;
  return seen !== latest;
}

/** Reads the marker; a browser that refuses storage simply never shows the badge. */
export function readChangelogSeen(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function markChangelogSeen(version = latestChangelogVersion()): void {
  if (!version) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, version);
  } catch {
    /* Private mode, blocked site data - the badge is not worth an error. */
  }
}
