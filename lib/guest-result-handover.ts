import type { ChallengeTestCase, CodeLanguageId } from "@/lib/api";

/**
 * What a guest's attempt hands to the result page.
 *
 * The sibling in `challenge-result-handover.ts` supplements a database row; this one
 * replaces it. A guest has no submission, nothing is written anywhere, so the payload
 * carries everything the page shows - including the task's own headline data, which the
 * page would otherwise have to fetch a second time.
 *
 * Two deliberate differences from that sibling: it lives in `sessionStorage`, so it dies
 * with the tab and is never a record of anything; and it is *not* consumed on read,
 * because here the payload is the page and a reload has to find it again.
 */
export type GuestResultHandover = {
  challengeId: string;
  title: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  language: CodeLanguageId;
  /** Every test passed. The headline the page leads with. */
  passed: boolean;
  testCases: ChallengeTestCase[];
  /** Set when the compiler rejected the program, so no test ever ran. */
  compileError?: string;
};

type HandoverStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/**
 * One key, not one per challenge: a guest has exactly one current attempt, and the next
 * one replaces it. Keeping a history would mean keeping something we just told them we do
 * not keep.
 */
const KEY = "guest-result";

export function storeGuestResult(
  storage: HandoverStorage,
  payload: GuestResultHandover
): void {
  try {
    storage.setItem(KEY, JSON.stringify(payload));
  } catch {
    // Storage access throws in private mode or with site data blocked.
  }
}

/**
 * Shape-checked rather than trusted. The value sits in a store the reader can edit, and
 * the page maps over `testCases` and prints `title` without a further guard; anything
 * that does not look like a result is treated as none at all.
 */
export function readGuestResult(storage: HandoverStorage): GuestResultHandover | null {
  let raw: string | null;
  try {
    raw = storage.getItem(KEY);
  } catch {
    return null;
  }
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<GuestResultHandover>;
    if (
      typeof parsed?.challengeId !== "string" ||
      typeof parsed.title !== "string" ||
      typeof parsed.category !== "string" ||
      typeof parsed.points !== "number" ||
      typeof parsed.language !== "string" ||
      typeof parsed.passed !== "boolean" ||
      !Array.isArray(parsed.testCases) ||
      (parsed.difficulty !== "easy" &&
        parsed.difficulty !== "medium" &&
        parsed.difficulty !== "hard")
    ) {
      return null;
    }
    return {
      challengeId: parsed.challengeId,
      title: parsed.title,
      category: parsed.category,
      difficulty: parsed.difficulty,
      points: parsed.points,
      language: parsed.language,
      passed: parsed.passed,
      testCases: parsed.testCases,
      ...(typeof parsed.compileError === "string"
        ? { compileError: parsed.compileError }
        : {}),
    };
  } catch {
    return null;
  }
}

export function clearGuestResult(storage: HandoverStorage): void {
  try {
    storage.removeItem(KEY);
  } catch {
    // Same as above; nothing depends on the removal succeeding.
  }
}
