import { describe, it, expect } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

const SITE = "https://daily-coding.de";

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

  it.each(["/api/", "/admin", "/challenge", "/profile", "/settings", "/ranking"])(
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

  it("lists exactly the pages that carry content", () => {
    expect(urls).toEqual([
      // The landing lives on the apex URL since #130 — `/landing` only redirects there.
      `${SITE}/`,
      `${SITE}/changelog`,
      `${SITE}/impressum`,
      `${SITE}/datenschutz`,
    ]);
  });

  /**
   * #132: a sitemap recommends what to index, and nobody searches for a sign-in form.
   * Excluded from the recommendation, not from crawling — the assertion below is the
   * other half of that.
   */
  it.each(["/login", "/register"])("does not recommend the %s form", (path) => {
    expect(urls).not.toContain(`${SITE}${path}`);
  });

  it("uses absolute URLs on the canonical host", () => {
    for (const url of urls) expect(url.startsWith(`${SITE}/`)).toBe(true);
  });

  it("lists no page that requires a login", () => {
    for (const url of urls) {
      expect(url).not.toMatch(/\/(challenge|profile|settings|admin|ranking)/);
    }
  });
});
