/**
 * What counts as "the same solution".
 *
 * Deliberately narrow: line endings, trailing whitespace and the outer margin are noise a
 * user never sees, so two solutions differing only there are the same one. Anything beyond
 * that, be it renamed variables or reordered statements, is a similarity heuristic, and merging on
 * a guess would hide solutions their authors consider different.
 *
 * Lives apart from the hashing so the client can ask the same question without `node:crypto`.
 */
export function normalizeCode(code: string): string {
  return code
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/, ""))
    .join("\n")
    .trim();
}
