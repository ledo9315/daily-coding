import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";
import { DEFAULT_LOCALE } from "@/lib/locale";

const ROOTS = ["app", "components", "lib"];
const SKIP = new Set(["__tests__", "node_modules", "generated", "admin"]);

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    if (SKIP.has(entry)) return [];
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(entry) ? [path] : [];
  });
}

const catalogue = (namespace: string): unknown =>
  JSON.parse(
    readFileSync(
      resolve(process.cwd(), "messages", DEFAULT_LOCALE, `${namespace}.json`),
      "utf8"
    )
  );

/** The node at a dotted path, or `undefined` when the path leads nowhere. */
const at = (messages: unknown, path: string): unknown =>
  path
    .split(".")
    .reduce<unknown>(
      (node, key) =>
        typeof node === "object" && node !== null
          ? (node as Record<string, unknown>)[key]
          : undefined,
      messages
    );

/**
 * A key a component asks for that no catalogue answers.
 *
 * next-intl does not throw for one: it logs `MISSING_MESSAGE` and renders the dotted path,
 * so the reader gets `changelog.link.label` where a link label belongs. `messages.test.ts`
 * does not see it either - a key missing from *both* languages is symmetric, and that is
 * exactly how one slipped through: a script wrote the German file, died on the next
 * statement, and the English file plus the key itself were never added. Only `pnpm build`
 * caught it, and only because a prerendered page happened to use it.
 *
 * Read out of the source rather than through a render, so a component behind a login or a
 * click is covered too.
 *
 * A file may load more than one namespace, and its keys are resolved against the *union*
 * of them rather than against one. Binding a key to its own namespace would mean tracking
 * which identifier holds which translator through `const t = …("api")` as well as
 * `const [t, x] = await Promise.all([getTranslations("dashboard"), …])` - parsing that from
 * a regex is where this test would start lying. The union is looser by exactly one case (a
 * key that exists, but under the file's other namespace) and still catches what the test
 * was written for: a key that no catalogue answers at all.
 *
 * What stays undecidable is a computed key - for `t(`difficulty.${level}`)` only the static
 * prefix is checked, which proves `difficulty` exists, not every branch under it.
 */
describe("every message key a component asks for", () => {
  const namespaces = new Map<string, unknown>();
  const load = (namespace: string) => {
    if (!namespaces.has(namespace)) namespaces.set(namespace, catalogue(namespace));
    return namespaces.get(namespace);
  };

  const files = ROOTS.flatMap((root) => sourceFiles(resolve(process.cwd(), root)));

  const missing: string[] = [];
  const skipped: string[] = [];

  for (const file of files) {
    const source = readFileSync(file, "utf8");
    const declared = [
      ...new Set([
        ...[...source.matchAll(/(?:useTranslations|getTranslations)\(\s*"([a-z]+)"/g)].map(
          (match) => match[1]
        ),
        // The explicit-locale form, used where there is no request to read: mails, and the
        // delete route that has to know the phrase of every language.
        ...[...source.matchAll(/namespace:\s*"([a-z]+)"/g)].map((match) => match[1]),
      ]),
    ];
    if (declared.length === 0) continue;

    /**
     * Identifiers that may hold a translator: a plain binding, or any name destructured
     * from a `Promise.all` that loads one. A name that is not a translator - `userStats`
     * next to `t` - simply never appears as `userStats("…")` and matches nothing.
     */
    const holders = new Set<string>();
    for (const [, name] of source.matchAll(
      /\b(?:const|let)\s+(\w+)\s*=\s*(?:await\s+)?(?:useTranslations|getTranslations)\(/g
    )) {
      holders.add(name);
    }
    for (const [, list] of source.matchAll(
      /\b(?:const|let)\s*\[([^\]]+)\]\s*=\s*await\s+Promise\.all\(/g
    )) {
      for (const part of list.split(",")) {
        const name = part.trim();
        if (/^\w+$/.test(name)) holders.add(name);
      }
    }
    if (holders.size === 0) {
      skipped.push(`${file} (${declared.join(", ")})`);
      continue;
    }

    const relative = file.slice(process.cwd().length + 1);
    const label = declared.length === 1 ? declared[0] : `{${declared.join("|")}}`;
    const resolves = (path: string) =>
      declared.some((namespace) => at(load(namespace), path) !== undefined);
    const isGroup = (path: string) =>
      declared.some((namespace) => typeof at(load(namespace), path) === "object");

    for (const name of holders) {
      // t("a.b") / t.rich("a.b") / t.raw("a.b") - the whole key is in the source.
      for (const [, key] of source.matchAll(
        new RegExp(`\\b${name}(?:\\.rich|\\.raw|\\.markup)?\\(\\s*"([^"]+)"`, "g")
      )) {
        if (!resolves(key)) missing.push(`${relative}: ${label}.${key}`);
      }

      // t(`a.b.${x}`) - only the part before the first interpolation is decidable.
      for (const [, prefix] of source.matchAll(
        new RegExp(`\\b${name}(?:\\.rich|\\.raw|\\.markup)?\\(\\s*\`([^\`$]*)\\$\\{`, "g")
      )) {
        const path = prefix.replace(/\.$/, "");
        if (path === "") continue;
        if (!isGroup(path)) missing.push(`${relative}: ${label}.${path}.* (no such group)`);
      }
    }
  }

  it("resolves to something in the catalogue", () => {
    expect(missing).toEqual([]);
  });

  /** A guard on the guard: a regex that matches nothing would pass the test above. */
  it("actually found keys to check", () => {
    expect(namespaces.size).toBeGreaterThan(5);
    expect(files.length).toBeGreaterThan(50);
  });

  it("leaves at most a handful of files unchecked", () => {
    expect(skipped).toEqual([]);
  });
});
