import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (...parts: string[]) =>
  readFileSync(resolve(process.cwd(), ...parts), "utf8");

const page = read("app", "datenschutz", "page.tsx");
const layout = read("app", "layout.tsx");

/**
 * #122: the page described the processors as "an external provider" and did not mention
 * Vercel Web Analytics at all, although it runs on every page. Both are the kind of gap
 * nobody notices until someone asks.
 *
 * ponytail: reads the sources as text. The page is a server component pulling in fonts and
 * CSS, so it does not import in the node test environment - and the point here is the
 * coupling between what the code loads and what the page discloses, which text captures.
 */
describe("Datenschutzerklärung", () => {
  it.each([
    ["Vercel", "Hosting und Reichweitenmessung"],
    ["Neon", "Datenbank"],
    ["Hetzner", "Code-Ausführung"],
    ["Resend", "E-Mail-Versand"],
  ])("names %s as the provider for %s", (provider) => {
    expect(page).toContain(provider);
  });

  it("discloses the analytics service for as long as it is loaded", () => {
    // The condition is the point: remove the import and this stops demanding the passage.
    const analyticsLoaded = layout.includes("@vercel/analytics");
    if (analyticsLoaded) {
      expect(page).toContain("Reichweitenmessung");
      expect(page).toContain("Vercel Web Analytics");
    }
  });

  it("no longer claims to store solve durations, removed in #91", () => {
    expect(page).not.toContain("benötigte Zeiten");
  });

  it("mentions what other users can see", () => {
    expect(page).toContain("Community-Feed");
  });

  it("numbers its sections consecutively", () => {
    const numbers = [...page.matchAll(/>\s*(\d+)\.\s[A-ZÄÖÜ]/g)].map((m) => Number(m[1]));
    expect(numbers).toEqual(Array.from({ length: numbers.length }, (_, i) => i + 1));
  });
});
