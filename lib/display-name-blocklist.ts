import { LDNOOBW_DE, LDNOOBW_EN } from "@/lib/blocklist/ldnoobw";

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
  // NFKD splits "ö" into "o" plus a combining mark, but "ß" has no decomposition.
  const folded = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/gu, "")
    .toLowerCase()
    .replace(/ß/gu, "ss");
  let out = "";
  for (const ch of folded) {
    const mapped = LOOKALIKES[ch] ?? DIGITS[ch] ?? ch;
    out += /[a-z]/u.test(mapped) ? mapped : " ";
  }
  return out.replace(/\s+/gu, " ").trim();
}

/*
  The dictionary part. LDNOOBW is about profanity, not hate, and a dictionary can only ever be
  matched on whole words in a field that holds surnames (Cassandra, Dickens, Sexauer). Entries
  are normalised the same way as the name, so "Scheiße" and "scheisse" meet as one word; the
  multi-word entries are kept as phrases and looked up with a space on either side.
*/
const DICTIONARY_WORDS = new Set<string>();
const DICTIONARY_PHRASES: string[] = [];
for (const entry of [...LDNOOBW_DE, ...LDNOOBW_EN]) {
  const normalised = normaliseForBlocklist(entry);
  if (!normalised) continue;
  if (normalised.includes(" ")) DICTIONARY_PHRASES.push(normalised);
  else DICTIONARY_WORDS.add(normalised);
}

export function containsBlockedTerm(name: string): boolean {
  const normalised = normaliseForBlocklist(name);
  if (!normalised) return false;

  const joined = normalised.replace(/ /gu, "");
  if (BLOCKED_SUBSTRINGS.some((term) => joined.includes(term))) return true;

  // Digit-only tokens such as "1488" are turned into letters above, so check the raw form too.
  const rawTokens = name.toLowerCase().split(/[^\p{L}\p{N}]+/u);
  const tokens = new Set([...normalised.split(" "), ...rawTokens]);
  if (BLOCKED_TOKENS.some((term) => tokens.has(term))) return true;

  if ([...tokens].some((token) => DICTIONARY_WORDS.has(token))) return true;
  const padded = ` ${normalised} `;
  return DICTIONARY_PHRASES.some((phrase) => padded.includes(` ${phrase} `));
}
