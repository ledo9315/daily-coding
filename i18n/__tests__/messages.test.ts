import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { LOCALES } from "@/lib/locale";

const MESSAGES_DIR = path.resolve(__dirname, "../../messages");

function namespaceFiles(locale: string): string[] {
  return readdirSync(path.join(MESSAGES_DIR, locale))
    .filter((file) => file.endsWith(".json"))
    .sort();
}

function read(locale: string, file: string): unknown {
  return JSON.parse(readFileSync(path.join(MESSAGES_DIR, locale, file), "utf8"));
}

/** Every key path in a nested message object, e.g. `form.submit.label`. */
function keyPaths(value: unknown, prefix = ""): string[] {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return [prefix];
  }
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    keyPaths(child, prefix ? `${prefix}.${key}` : key)
  );
}

/**
 * The whole of decision E8 for UI strings: instead of a runtime fallback, the key sets are
 * kept identical, so a key cannot be missing in one language. That only holds if every
 * extraction step writes both languages in the same change - this test is what makes that
 * a rule rather than an intention.
 */
describe("message namespaces", () => {
  const reference = namespaceFiles(LOCALES[0]);

  it("exist for every locale", () => {
    expect(reference.length).toBeGreaterThan(0);
    for (const locale of LOCALES) {
      expect(namespaceFiles(locale), `namespaces of ${locale}`).toEqual(reference);
    }
  });

  it.each(reference)("hold the same key set in every locale: %s", (file) => {
    const keys = LOCALES.map((locale) => keyPaths(read(locale, file)).sort());
    for (const [index, locale] of LOCALES.entries()) {
      expect(keys[index], `keys of ${locale}/${file}`).toEqual(keys[0]);
    }
  });

  it.each(LOCALES.flatMap((l) => reference.map((f) => [l, f] as const)))(
    "are valid JSON objects: %s/%s",
    (locale, file) => {
      const parsed = read(locale, file);
      expect(parsed).toBeTypeOf("object");
      expect(Array.isArray(parsed)).toBe(false);
    }
  );
});
