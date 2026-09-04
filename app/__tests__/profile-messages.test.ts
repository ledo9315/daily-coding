import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const catalogue = (locale: string): unknown =>
  JSON.parse(
    readFileSync(resolve(process.cwd(), "messages", locale, "profile.json"), "utf8")
  );

/** Every leaf of a nested message object as a dotted path. */
function keyPaths(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    keyPaths(child, prefix ? `${prefix}.${key}` : key)
  );
}

const read = (messages: unknown, path: string) =>
  path
    .split(".")
    .reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], messages) as string;

/**
 * Profile, leaderboard, public profile and settings read every string from this namespace.
 * A key present in one catalogue but not in the other renders the key *path* at runtime
 * instead of text - and no type error catches it, because the app declares no `Messages`
 * type for next-intl.
 */
describe("profile messages", () => {
  const de = keyPaths(catalogue("de")).sort();
  const en = keyPaths(catalogue("en")).sort();

  it("carries the same keys in both languages", () => {
    expect(en).toEqual(de);
  });

  it("leaves no message empty", () => {
    const empty = (locale: string) => {
      const messages = catalogue(locale);
      return keyPaths(messages).filter((path) => {
        const value = read(messages, path);
        return typeof value !== "string" || value.trim() === "";
      });
    };
    expect(empty("de")).toEqual([]);
    expect(empty("en")).toEqual([]);
  });

  it("keeps the same ICU placeholders on both sides", () => {
    const placeholders = (text: string) =>
      [...text.matchAll(/\{(\w+)/g)].map((match) => match[1]).sort();

    const german = catalogue("de");
    const english = catalogue("en");
    for (const path of de) {
      expect(placeholders(read(english, path)), path).toEqual(
        placeholders(read(german, path))
      );
    }
  });

  /**
   * The phrase the delete gate asks for is typed by hand, so it is translated like every
   * other label - and `DELETE /api/user/account` reads it from here rather than from a
   * constant of its own. A language without its own phrase would make the reader type a
   * foreign one.
   */
  it("gives the account-deletion phrase its own wording per language", () => {
    const german = read(catalogue("de"), "settings.account.confirmPhrase");
    const english = read(catalogue("en"), "settings.account.confirmPhrase");

    expect(german).toBe("KONTO LÖSCHEN");
    expect(english).toBe("DELETE ACCOUNT");
  });

  /** The label and the mismatch toast interpolate the phrase instead of spelling it out. */
  it("keeps the phrase out of the sentences around it", () => {
    for (const locale of ["de", "en"]) {
      const messages = catalogue(locale);
      const phrase = read(messages, "settings.account.confirmPhrase");
      for (const path of keyPaths(messages)) {
        if (path === "settings.account.confirmPhrase") continue;
        expect(read(messages, path), path).not.toContain(phrase);
      }
    }
  });
});
