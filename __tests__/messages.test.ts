import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { LOCALES } from "@/lib/locale";

const dirOf = (locale: string) => resolve(process.cwd(), "messages", locale);

const namespacesOf = (locale: string) =>
  readdirSync(dirOf(locale))
    .filter((file) => file.endsWith(".json"))
    .map((file) => file.replace(/\.json$/, ""))
    .sort();

const catalogue = (locale: string, namespace: string): unknown =>
  JSON.parse(readFileSync(resolve(dirOf(locale), `${namespace}.json`), "utf8"));

/** Every leaf of a nested message object as a dotted path. */
function keyPaths(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    keyPaths(child, prefix ? `${prefix}.${key}` : key)
  );
}

const read = (messages: unknown, path: string): unknown =>
  path.split(".").reduce<unknown>(
    (node, key) => (node as Record<string, unknown>)?.[key],
    messages
  );

/**
 * The whole catalogue at once, across every namespace and both languages.
 *
 * The per-namespace suites next to the code they serve check the same three invariants for
 * one namespace each, and a namespace added later gets none of them. This walks the
 * directory instead, so `dashboard.json` and a namespace introduced next month are covered
 * by the same test.
 *
 * Nothing here fails loudly at runtime, which is why it is worth a test: a missing key
 * renders as its own dotted path, and a placeholder that only one language interpolates
 * silently drops a name or a number out of a sentence.
 */
describe("the message catalogue", () => {
  const reference = namespacesOf(LOCALES[0]);

  it("holds the same namespaces in every language", () => {
    for (const locale of LOCALES) {
      expect(namespacesOf(locale), locale).toEqual(reference);
    }
  });

  /**
   * The namespaces the request config loads. A file nobody loads is dead weight, and a
   * namespace listed there without files behind it makes every render throw.
   */
  it("matches the namespace list in i18n/request.ts", () => {
    const source = readFileSync(resolve(process.cwd(), "i18n", "request.ts"), "utf8");
    const block = source.match(/const NAMESPACES = \[([^\]]*)\]/);
    const declared = [...(block?.[1] ?? "").matchAll(/"([^"]+)"/g)]
      .map((match) => match[1])
      .sort();
    expect(declared).toEqual(reference);
  });

  describe.each(reference)("%s", (namespace) => {
    const german = catalogue("de", namespace);
    const paths = keyPaths(german).sort();

    it.each(LOCALES)("carries every key in %s", (locale) => {
      expect(keyPaths(catalogue(locale, namespace)).sort()).toEqual(paths);
    });

    it.each(LOCALES)("leaves no message in %s empty", (locale) => {
      const messages = catalogue(locale, namespace);
      const empty = paths.filter((path) => {
        const value = read(messages, path);
        return typeof value !== "string" || value.trim() === "";
      });
      expect(empty).toEqual([]);
    });

    /**
     * `{name}` in one language and nothing in the other is the failure this catches: the
     * sentence still renders, just without whoever it was about.
     *
     * The `[,}]` is what keeps a plural's own branches out of the count: `{vor # Stunde}`
     * is text inside `{count, plural, ...}`, not a second argument.
     */
    it("keeps the same placeholders in every language", () => {
      const placeholders = (text: string) =>
        [...text.matchAll(/\{\s*(\w+)\s*[,}]/g)].map((match) => match[1]).sort();
      const expected = paths.map((path) => placeholders(read(german, path) as string));

      for (const locale of LOCALES) {
        const messages = catalogue(locale, namespace);
        paths.forEach((path, index) => {
          expect(placeholders(read(messages, path) as string), `${locale} ${path}`).toEqual(
            expected[index]
          );
        });
      }
    });
  });
});
