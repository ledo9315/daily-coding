/**
 * Display names have to be distinguishable: two accounts with the same name and — since
 * the starter avatar is drawn from a set of 20 (#101) — possibly the same picture were
 * indistinguishable in the ranking, the feed and on the podium (#107).
 *
 * `User.nameKey` carries the value below and holds the unique constraint, so the database
 * enforces it rather than the application alone. Postgres would need an index over
 * `lower(name)` for that, and Prisma cannot express a functional index in the schema —
 * one added by hand counts as drift and the next `migrate dev` would drop it.
 */
export function nameKeyOf(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

/** The display form: trimmed, inner whitespace collapsed, case left as typed. */
export function normaliseDisplayName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export const DISPLAY_NAME_MAX_LENGTH = 50;

/**
 * Display names may contain punctuation, spaces and emoji, but those decorations must not
 * be the whole identity. Requiring two Unicode letters or numbers keeps short real names
 * such as "Li" while rejecting placeholders such as ".", "---" or a lone emoji.
 */
export function displayNameValidationError(name: string): string | null {
  const displayName = normaliseDisplayName(name);

  if (!displayName) return "Name darf nicht leer sein.";
  if ([...displayName].length > DISPLAY_NAME_MAX_LENGTH) {
    return `Name darf höchstens ${DISPLAY_NAME_MAX_LENGTH} Zeichen lang sein.`;
  }

  const lettersOrNumbers = displayName.match(/[\p{L}\p{N}]/gu)?.length ?? 0;
  if (lettersOrNumbers < 2) {
    return "Name muss mindestens zwei Buchstaben oder Zahlen enthalten.";
  }

  return null;
}

const MAX_ATTEMPTS = 50;

/**
 * Finds a free variant of `name` by appending a counter.
 *
 * For the OAuth path, where rejecting is not an option: the user comes back from the
 * provider expecting an account, and there is no form left to show an error in. The
 * registration form does reject instead, so the name someone typed is never silently
 * changed underneath them.
 *
 * ponytail: one query per attempt instead of fetching all similar names at once. It stops
 * on the first free variant, so a collision costs two queries — the loop only gets long
 * for a name that dozens of people share, and then a bulk query would be the fix.
 */
export async function uniqueDisplayName(
  name: string,
  isTaken: (key: string) => Promise<boolean>
): Promise<string> {
  const base = normaliseDisplayName(name);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const candidate = attempt === 1 ? base : `${base} ${attempt}`;
    if (!(await isTaken(nameKeyOf(candidate)))) return candidate;
  }

  throw new Error(`No free display name for "${base}" after ${MAX_ATTEMPTS} attempts`);
}
