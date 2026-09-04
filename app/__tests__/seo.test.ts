import { describe, it, expect } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

const SITE = "https://daily-coding.dev";

describe("robots.txt", () => {
  const rules = robots();

  it("points crawlers at the sitemap", () => {
    expect(rules.sitemap).toBe(`${SITE}/sitemap.xml`);
  });

  it("allows the public pages", () => {
    const rule = Array.isArray(rules.rules) ? rules.rules[0] : rules.rules;
    expect(rule?.allow).toBe("/");
  });

  it.each(["/login", "/register"])("still lets a crawler fetch %s", (path) => {
    const rule = Array.isArray(rules.rules) ? rules.rules[0] : rules.rules;
    const disallow = rule?.disallow;
    const list = Array.isArray(disallow) ? disallow : [disallow];
    expect(list).not.toContain(path);
  });

  it("lets a crawler fetch the task itself, which is the page worth indexing (#287)", () => {
    const rule = Array.isArray(rules.rules) ? rules.rules[0] : rules.rules;
    const disallow = rule?.disallow;
    const list = Array.isArray(disallow) ? disallow : [disallow];
    expect(list).not.toContain("/challenge");
  });

  it.each(["/api/", "/admin", "/challenge/", "/profile", "/settings", "/ranking"])(
    "excludes %s, which sits behind the login",
    (path) => {
      const rule = Array.isArray(rules.rules) ? rules.rules[0] : rules.rules;
      const disallow = rule?.disallow;
      const list = Array.isArray(disallow) ? disallow : [disallow];
      expect(list).toContain(path);
    }
  );
});

describe("sitemap.xml", () => {
  const entries = sitemap();
  const urls = entries.map((e) => e.url);

  it("lists exactly the pages that carry content, in both languages", () => {
    // Sorted: a sitemap gives its entries no order, so the assertion must not invent one.
    expect([...urls].sort()).toEqual(
      [
      // The landing lives on the apex URL since #130 - `/landing` only redirects there.
        `${SITE}/`,
        `${SITE}/de`,
        `${SITE}/challenge`,
        `${SITE}/de/challenge`,
        `${SITE}/changelog`,
        `${SITE}/de/changelog`,
        `${SITE}/impressum`,
        `${SITE}/de/impressum`,
        `${SITE}/datenschutz`,
        `${SITE}/de/datenschutz`,
      ].sort()
    );
  });

  /**
   * Without the pairing the two URLs of a page read as duplicates of each other rather
   * than as two versions of one, and a search engine picks one and drops the other.
   */
  it("names every language of a page on each of its entries", () => {
    for (const entry of entries) {
      expect(Object.keys(entry.alternates?.languages ?? {})).toEqual([
        "de",
        "en",
        "x-default",
      ]);
    }
  });

  /**
   * #132: a sitemap recommends what to index, and nobody searches for a sign-in form.
   * Excluded from the recommendation, not from crawling - the assertion below is the
   * other half of that.
   */
  it.each(["/login", "/register"])("does not recommend the %s form", (path) => {
    expect(urls).not.toContain(`${SITE}${path}`);
  });

  it("uses absolute URLs on the canonical host", () => {
    // `${SITE}` alone, not `${SITE}/`: the English landing is the bare origin.
    for (const url of urls) expect(url.startsWith(SITE)).toBe(true);
  });

  /** `/challenge` is the exception since #287: readable without an account. */
  it("lists no page that requires a login", () => {
    for (const url of urls) {
      expect(url).not.toMatch(/\/(profile|settings|admin|ranking)/);
      expect(url).not.toMatch(/\/challenge\//);
    }
  });
});
