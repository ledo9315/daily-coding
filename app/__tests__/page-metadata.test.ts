import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { SITEMAP_PATHS } from "@/lib/site";

const APP = resolve(process.cwd(), "app");

/** Every routable page, `api/` and the test folder aside. */
function findPages(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "api" || entry.name === "__tests__") continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) findPages(path, found);
    else if (entry.name === "page.tsx") found.push(path);
  }
  return found;
}

const routeOf = (pagePath: string) =>
  "/" + relative(APP, pagePath).split(sep).slice(0, -1).join("/");

/** The namespace a file translates against, or null. */
function namespaceOf(source: string): string | null {
  const match = /getTranslations\(\s*["']([^"']+)["']/.exec(source);
  return match ? match[1] : null;
}

/**
 * The German text behind a message key. A title read from the catalogue is still a title,
 * so the assertions below stay about what a search result shows rather than about syntax.
 */
function messageFor(namespace: string, key: string): string | null {
  const file = resolve(process.cwd(), "messages", "de", `${namespace}.json`);
  if (!existsSync(file)) return null;
  const value = key.split(".").reduce<unknown>(
    (node, part) =>
      node && typeof node === "object"
        ? (node as Record<string, unknown>)[part]
        : undefined,
    JSON.parse(readFileSync(file, "utf8"))
  );
  return typeof value === "string" ? value : null;
}

/**
 * The title a file declares, or null. `title: { default, template }` in the root layout
 * resolves to its `default`, and a `t("...")` call resolves to the German message.
 */
function declaredTitle(filePath: string): string | null {
  if (!existsSync(filePath)) return null;
  const source = readFileSync(filePath, "utf8");
  if (!/export const metadata|export async function generateMetadata/.test(source)) {
    return null;
  }
  const nested = /title:\s*\{[\s\S]*?default:\s*"([^"]+)"/.exec(source);
  if (nested) return nested[1];
  const plain = /title:\s*"([^"]+)"/.exec(source);
  if (plain) return plain[1];

  const namespace = namespaceOf(source);
  if (!namespace) return null;
  const nestedKey = /title:\s*\{[\s\S]*?default:\s*t\(\s*["']([^"']+)["']/.exec(source);
  const plainKey = /title:\s*t\(\s*["']([^"']+)["']/.exec(source);
  const key = nestedKey?.[1] ?? plainKey?.[1];
  return key ? messageFor(namespace, key) : null;
}

/**
 * Where a route's title comes from: its own `page.tsx`, else the nearest `layout.tsx`
 * walking up to `app/`. Mirrors how Next merges metadata down the tree.
 */
function titleSourceOf(pagePath: string): { title: string; file: string } | null {
  const own = declaredTitle(pagePath);
  if (own) return { title: own, file: relative(APP, pagePath) };

  let dir = join(pagePath, "..");
  for (;;) {
    const title = declaredTitle(join(dir, "layout.tsx"));
    if (title) return { title, file: relative(APP, join(dir, "layout.tsx")) };
    if (resolve(dir) === APP) return null;
    dir = join(dir, "..");
  }
}

/**
 * `/admin` and `/join` only call `redirect()` - they render nothing, so a title on them
 * would never be shown. Detected rather than listed, so a page that grows a body later
 * starts being checked on its own.
 *
 * Matched on a closing JSX tag, not on `<`: `/join` types its props as
 * `Record<string, string | string[]>` and a bare `<` counts that as markup.
 */
const rendersSomething = (pagePath: string) =>
  /<\/[A-Za-z]/.test(readFileSync(pagePath, "utf8"));

const pages = findPages(APP).filter(rendersSomething);

/**
 * #131: no page in the project exported metadata except the root layout, so every route
 * shared one title and one description - the strongest signal a page has, spent once for
 * all of them. `metadataBase` was already set (#111); the canonical URLs were not.
 */
describe("page metadata", () => {
  it("finds the pages to check", () => {
    // Guards the walker itself: a broken recursion would make everything below vacuous.
    expect(pages.map(routeOf)).not.toContain("/join");
    expect(pages.length).toBeGreaterThanOrEqual(15);
  });

  it.each(pages.map((p) => [routeOf(p), p]))(
    "%s declares its own title, not the site-wide default",
    (route, pagePath) => {
      const source = titleSourceOf(pagePath);
      expect(source, `${route} has no metadata of its own`).not.toBeNull();
      // The apex URL is the landing, and the site-wide default is written for it.
      if (route !== "/") expect(source!.file).not.toBe("layout.tsx");
    }
  );

  it("gives no two routes the same title", () => {
    const byTitle = new Map<string, string[]>();
    for (const page of pages) {
      const title = titleSourceOf(page)?.title;
      if (!title) continue;
      byTitle.set(title, [...(byTitle.get(title) ?? []), routeOf(page)]);
    }
    // Routes sharing a title share the layout that declares it - siblings of one feature,
    // never two unrelated pages.
    const shared = [...byTitle.entries()].filter(([, routes]) => routes.length > 1);
    for (const [title, routes] of shared) {
      const files = new Set(
        routes.map((route) => {
          const page = pages.find((p) => routeOf(p) === route)!;
          return titleSourceOf(page)!.file;
        })
      );
      expect(files.size, `"${title}" is declared in more than one place`).toBe(1);
    }
  });

  it("keeps the template that composes the titles", () => {
    const rootLayout = readFileSync(join(APP, "layout.tsx"), "utf8");
    expect(rootLayout).toMatch(/template:\s*"%s · Daily Coding"/);
  });

  it.each([...SITEMAP_PATHS, "/login", "/register"])(
    "%s carries a canonical URL",
    (route) => {
      const pagePath = pages.find((p) => routeOf(p) === route)!;
      const candidates = [pagePath, join(pagePath, "..", "layout.tsx")];
      const sources = candidates
        .filter((f) => existsSync(f))
        .map((f) => readFileSync(f, "utf8"));
      expect(sources.some((s) => s.includes("canonical"))).toBe(true);
    }
  );
});
