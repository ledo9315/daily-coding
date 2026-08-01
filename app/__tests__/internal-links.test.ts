import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import nextConfig from "@/next.config.mjs";

const ROOT = process.cwd();

/** Every source file that could carry an internal link. */
function sources(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "__tests__" || entry.name === "node_modules") continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) sources(path, found);
    else if (/\.tsx?$/.test(entry.name)) found.push(path);
  }
  return found;
}

const files = [
  ...sources(resolve(ROOT, "app")),
  ...sources(resolve(ROOT, "components")),
  ...sources(resolve(ROOT, "lib")),
];

/** The `source` paths of every permanent redirect in `next.config.mjs`. */
async function redirectSources(): Promise<string[]> {
  return (await nextConfig.redirects?.() ?? []).map((redirect) =>
    redirect.source.replace("/:path*", "")
  );
}

/**
 * Comments legitimately mention the old path — `landing-page.tsx` explains why it moved.
 * Stripped rather than pattern-matched on link syntax, so the check stays blind to whether
 * the link is a `href`, a `callbackUrl` or a `redirect()`.
 */
const withoutComments = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

/**
 * #130 moved the landing to `/` and left `/landing` as a redirect — but three internal
 * links still pointed at the old path, so the logo and the sign-out took a 308 hop, and a
 * crawler following them saw a redirect where a page should be.
 */
describe("internal links", () => {
  it("knows which paths redirect", async () => {
    expect(await redirectSources()).toContain("/landing");
  });

  it("has no links pointing at redirect-only paths", async () => {
    for (const path of await redirectSources()) {
      const offenders = files
        .filter((file) =>
          new RegExp(`["'\`]${path}["'\`]`).test(withoutComments(readFileSync(file, "utf8")))
        )
        .map((file) => relative(ROOT, file));
      expect(offenders, path).toEqual([]);
    }
  });
});
