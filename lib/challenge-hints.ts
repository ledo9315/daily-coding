/** One unfoldable step of help. `title` labels the step, `body` is the help itself. */
export interface ChallengeHint {
  title: string;
  body: string;
}

/** Longest title the admin form accepts - it has to stay readable as an accordion trigger. */
export const HINT_TITLE_MAX = 120;

/**
 * `Challenge.hints` is a Json column, so its shape is whatever was written into it - a legacy
 * row, a hand-edited record, a botched import. Normalizing here keeps the accordion from
 * mapping over something that is not an array.
 *
 * Entries without a body are dropped: an empty step is a trigger that unfolds to nothing.
 */
export function normalizeHints(value: unknown): ChallengeHint[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry) => {
    if (typeof entry !== "object" || entry === null) return [];
    const { title, body } = entry as Record<string, unknown>;
    if (typeof body !== "string" || body.trim() === "") return [];
    const label = typeof title === "string" && title.trim() !== "" ? title.trim() : "Hinweis";
    return [{ title: label.slice(0, HINT_TITLE_MAX), body: body.trim() }];
  });
}
