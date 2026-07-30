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

  it("lists exactly the pages a visitor can reach without an account", () => {
    expect(urls).toEqual([
      `${SITE}/landing`,
      `${SITE}/login`,
      `${SITE}/register`,
      `${SITE}/impressum`,
      `${SITE}/datenschutz`,
    ]);
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
