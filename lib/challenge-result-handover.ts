import type { UnlockedAchievement } from "@/lib/api";

/**
 * Payload handed from the challenge page to the result page, keyed by submission
 * id and consumed on read so a reload cannot replay it.
 */
export type ChallengeResultHandover = {
  unlockedAchievements: UnlockedAchievement[];
};

type HandoverStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function keyFor(submissionId: string): string {
  return `challenge-result-handover:${submissionId}`;
}

export function storeResultHandover(
  storage: HandoverStorage,
  submissionId: string,
  payload: ChallengeResultHandover,
): void {
  try {
    storage.setItem(keyFor(submissionId), JSON.stringify(payload));
  } catch {
    // Storage access throws in private mode or with site data blocked.
  }
}

export function takeResultHandover(
  storage: HandoverStorage,
  submissionId: string,
): ChallengeResultHandover | null {
  const key = keyFor(submissionId);
  let raw: string | null;

  try {
    raw = storage.getItem(key);
  } catch {
    return null;
  }

  try {
    storage.removeItem(key);
  } catch {
    // Removal may fail on its own; the parse below still decides the result.
  }

  if (!raw) return null;

  try {
    // Shape-checked rather than trusted: the value survives in the browser between two
    // navigations, and the caller maps over the array without a further guard.
    const parsed = JSON.parse(raw) as Partial<ChallengeResultHandover>;
    return Array.isArray(parsed?.unlockedAchievements)
      ? { unlockedAchievements: parsed.unlockedAchievements }
      : null;
  } catch {
    return null;
  }
}
