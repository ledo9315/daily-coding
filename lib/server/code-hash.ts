import { createHash } from "node:crypto";

/**
 * What counts as "the same solution".
 *
 * Deliberately narrow: line endings, trailing whitespace and the outer margin are noise a
 * user never sees, so two solutions differing only there are the same one. Anything beyond
 * that — renamed variables, reordered statements — is a similarity heuristic, and merging on
 * a guess would hide solutions their authors consider different.
 */
export function normalizeCodeForHash(code: string): string {
  return code
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/, ""))
    .join("\n")
    .trim();
}

export function codeHash(code: string): string {
  return createHash("sha256").update(normalizeCodeForHash(code)).digest("hex");
}
