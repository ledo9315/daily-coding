import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const catalogue = (locale: string): unknown =>
  JSON.parse(
    readFileSync(resolve(process.cwd(), "messages", locale, "dashboard.json"), "utf8")
  );

/** Every leaf of a nested message object as a dotted path. */
function keyPaths(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    keyPaths(child, prefix ? `${prefix}.${key}` : key)
  );
}

/**
 * The landing page and the signed-in dashboard read every string from this namespace. A key
 * present in one catalogue but not in the other renders the key *path* at runtime instead of
 * text - visible on the most SEO-relevant page of the site, and never caught by a type error.
 */
describe("dashboard messages", () => {
  const de = keyPaths(catalogue("de")).sort();
  const en = keyPaths(catalogue("en")).sort();

  it("carries the same keys in both languages", () => {
    expect(en).toEqual(de);
  });

  it("leaves no message empty", () => {
    const flat = (locale: string) => {
      const messages = catalogue(locale);
      return keyPaths(messages).filter((path) => {
        const value = path
          .split(".")
          .reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], messages);
        return typeof value !== "string" || value.trim() === "";
      });
    };
    expect(flat("de")).toEqual([]);
    expect(flat("en")).toEqual([]);
  });

  it("keeps the same ICU placeholders on both sides", () => {
    const placeholders = (text: string) =>
      [...text.matchAll(/\{(\w+)/g)].map((match) => match[1]).sort();
    const read = (messages: unknown, path: string) =>
      path
        .split(".")
        .reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], messages) as string;

    const german = catalogue("de");
    const english = catalogue("en");
    for (const path of de) {
      expect(placeholders(read(english, path)), path).toEqual(
        placeholders(read(german, path))
      );
    }
  });
});
