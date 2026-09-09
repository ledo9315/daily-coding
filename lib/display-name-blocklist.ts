/**
 * Display names that glorify Nazism or carry a slur are refused at registration; the OAuth
 * path falls back to the e-mail's local part instead (see `findOrCreateOAuthUser`).
 *
 * Two lists, because substring matching is only safe for long, unambiguous terms:
 * "hitler" appears in no legitimate name, but "nazi" sits inside "Ashkenazi" and "Nazira",
 * so the short terms are matched against whole tokens only. Both lists are compared after
 * `normaliseForBlocklist`, which folds case, diacritics, Cyrillic look-alikes and the usual
 * digit substitutions - "H1TLER" and "Нitler" are the spellings a filter actually meets.
 */

/** Matched as a substring of the name with every separator removed. */
const BLOCKED_SUBSTRINGS = [
  "hitler",
  "swastika",
  "hakenkreuz",
  "holocaust",
  "auschwitz",
  "gestapo",
  "siegheil",
  "heilhitler",
  "waffenss",
  "nigger",
  "nigga",
  "faggot",
  "kanake",
  "judensau",
  "whitepower",
  "zyklonb",
];

/** Matched only as a whole token, because each one hides in ordinary names. */
const BLOCKED_TOKENS = ["nazi", "nazis", "kkk", "1488", "kike", "spic", "chink", "fuhrer"];

/*
  Cyrillic and Greek letters that render like Latin ones. Only the look-alikes are mapped;
  a genuinely Cyrillic name such as "Владислав" keeps its other letters and passes untouched.
*/
const LOOKALIKES: Record<string, string> = {
  а: "a", е: "e", о: "o", р: "p", с: "c", у: "y", х: "x", і: "i", ј: "j", ѕ: "s", һ: "h", к: "k",
  т: "t", м: "m", в: "b", н: "h", ν: "v", ο: "o", α: "a", ε: "e", ι: "i", κ: "k", τ: "t", ρ: "p",
};

const DIGITS: Record<string, string> = {
  "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "8": "b", "@": "a", "$": "s", "!": "i", "|": "l",
};

/** Lower-case Latin letters and spaces; everything that is not a letter becomes a space. */
export function normaliseForBlocklist(name: string): string {
  const folded = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/gu, "")
    .toLowerCase();
  let out = "";
  for (const ch of folded) {
    const mapped = LOOKALIKES[ch] ?? DIGITS[ch] ?? ch;
    out += /[a-z]/u.test(mapped) ? mapped : " ";
  }
  return out.replace(/\s+/gu, " ").trim();
}

export function containsBlockedTerm(name: string): boolean {
  const normalised = normaliseForBlocklist(name);
  if (!normalised) return false;

  const joined = normalised.replace(/ /gu, "");
  if (BLOCKED_SUBSTRINGS.some((term) => joined.includes(term))) return true;

  // Digit-only tokens such as "1488" are turned into letters above, so check the raw form too.
  const rawTokens = name.toLowerCase().split(/[^\p{L}\p{N}]+/u);
  const tokens = new Set([...normalised.split(" "), ...rawTokens]);
  return BLOCKED_TOKENS.some((term) => tokens.has(term));
}
