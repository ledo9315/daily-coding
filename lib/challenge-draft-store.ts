import type { CodeLanguageId } from "@/lib/api";

/**
 * The editor's unsent code, kept in `localStorage` so leaving the page does not throw it
 * away. Reported from r/webdev: someone evaluated a solution, went looking for the submit
 * button on another tab, came back and the work was gone - the code lived in React state
 * and nowhere else.
 *
 * `localStorage`, not `sessionStorage`: the whole point is surviving a navigation that
 * closes the page, and a registration detour leaves the tab entirely. Nothing is sent to
 * the server, so a draft never leaves the device it was typed on.
 */
type DraftStorage = Pick<Storage, "getItem" | "setItem" | "removeItem" | "length" | "key">;

const PREFIX = "challenge-draft:";

/**
 * Per challenge *and* per language. Switching from Python to Java must not overwrite the
 * Python attempt - they are two drafts of two different programs.
 */
function keyFor(challengeId: string, language: CodeLanguageId): string {
  return `${PREFIX}${challengeId}:${language}`;
}

export function readDraft(
  storage: DraftStorage,
  challengeId: string,
  language: CodeLanguageId
): string | null {
  try {
    return storage.getItem(keyFor(challengeId, language));
  } catch {
    return null;
  }
}

export function writeDraft(
  storage: DraftStorage,
  challengeId: string,
  language: CodeLanguageId,
  code: string
): void {
  try {
    storage.setItem(keyFor(challengeId, language), code);
  } catch {
    // Private mode, blocked site data, or the quota. A draft is a convenience; failing to
    // keep one must never break the editor around it.
  }
}

/** Every key of the store, so a sweep does not depend on knowing the language list. */
function allKeys(storage: DraftStorage): string[] {
  const keys: string[] = [];
  try {
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);
      if (key?.startsWith(PREFIX)) keys.push(key);
    }
  } catch {
    return [];
  }
  return keys;
}

function removeAll(storage: DraftStorage, keys: string[]): void {
  for (const key of keys) {
    try {
      storage.removeItem(key);
    } catch {
      // Keep going; one stuck key must not leave the rest behind.
    }
  }
}

/** After a submission: what was handed in is no longer a draft. */
export function clearDrafts(storage: DraftStorage, challengeId: string): void {
  removeAll(
    storage,
    allKeys(storage).filter((key) => key.startsWith(`${PREFIX}${challengeId}:`))
  );
}

/**
 * Drops every draft that does not belong to the challenge now on screen. The ring moves
 * on daily, so without this the store would grow by one entry per language per day and
 * never shrink - and yesterday's attempt is of no use to anybody.
 */
export function pruneDrafts(storage: DraftStorage, keepChallengeId: string): void {
  removeAll(
    storage,
    allKeys(storage).filter((key) => !key.startsWith(`${PREFIX}${keepChallengeId}:`))
  );
}
