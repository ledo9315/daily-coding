export const COMMENT_MAX_LENGTH = 2000;

/**
 * Control and format characters. Both are stripped rather than rejected: a NUL reaches
 * Postgres as a byte the `text` type refuses, which would surface as a 500 instead of a
 * message, and the format characters are invisible - a body of nothing but U+200B passed
 * `trim()` and rendered as an empty paragraph.
 */
const CONTROL_OR_FORMAT = /[\p{Cc}\p{Cf}]/gu;

/** Anything that actually shows up: not whitespace, not a control, not a combining mark. */
const VISIBLE = /[^\s\p{Cc}\p{Cf}\p{M}]/u;

/**
 * Returns either the cleaned body or a message, so a route can never store the raw value.
 *
 * Measured in characters, not UTF-8 bytes: nothing downstream truncates - unlike bcrypt,
 * Postgres `text` has no hard ceiling - so the limit only serves readability, and a comment
 * full of Umlauts must not run out of room earlier than one in plain ASCII.
 */
export function normalizeCommentBody(
  raw: unknown
): { body: string } | { error: string } {
  if (typeof raw !== "string") return { error: "Kommentar darf nicht leer sein." };

  // Newline and tab survive the sweep; they are the only layout the thread renders.
  const body = raw
    .replace(CONTROL_OR_FORMAT, (char) => (char === "\n" || char === "\t" ? char : ""))
    .trim();

  if (!VISIBLE.test(body)) return { error: "Kommentar darf nicht leer sein." };
  if ([...body].length > COMMENT_MAX_LENGTH) {
    return { error: `Kommentar darf höchstens ${COMMENT_MAX_LENGTH} Zeichen lang sein.` };
  }
  return { body };
}
