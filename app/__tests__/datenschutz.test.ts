import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (...parts: string[]) =>
  readFileSync(resolve(process.cwd(), ...parts), "utf8");

const de = read("messages", "de", "legal.json");
const en = read("messages", "en", "legal.json");
const layout = read("app", "layout.tsx");

type Section = { title: string } & Record<string, string>;
const privacy = (source: string) =>
  (JSON.parse(source) as { privacy: Record<string, Section> }).privacy;

/**
 * #122: the page described the processors as "an external provider" and did not mention
 * Vercel Web Analytics at all, although it runs on every page. Both are the kind of gap
 * nobody notices until someone asks.
 *
 * ponytail: reads the message catalogue, not the page. Since DAI-202 the prose lives in
 * `messages/<locale>/legal.json`; the page only resolves keys. The German catalogue is the
 * authoritative version, so that is what the disclosure assertions check.
 */
describe("Datenschutzerklärung", () => {
  it.each([
    ["Vercel", "Hosting und Reichweitenmessung"],
    ["Neon", "Datenbank"],
    ["Hetzner", "Code-Ausführung"],
    ["Resend", "E-Mail-Versand"],
  ])("names %s as the provider for %s", (provider) => {
    expect(de).toContain(provider);
    expect(en).toContain(provider);
  });

  it("discloses the analytics service for as long as it is loaded", () => {
    // The condition is the point: remove the import and this stops demanding the passage.
    const analyticsLoaded = layout.includes("@vercel/analytics");
    if (analyticsLoaded) {
      expect(de).toContain("Reichweitenmessung");
      expect(de).toContain("Vercel Web Analytics");
      expect(en).toContain("Vercel Web Analytics");
    }
  });

  it("no longer claims to store solve durations, removed in #91", () => {
    expect(de).not.toContain("benötigte Zeiten");
  });

  it("mentions what other users can see", () => {
    expect(de).toContain("Community-Feed");
    expect(en).toContain("community feed");
  });

  it("numbers its sections consecutively", () => {
    const numbers = Object.values(privacy(de))
      .map((section) => section.title?.match(/^(\d+)\.\s/)?.[1])
      .filter((match): match is string => match !== undefined)
      .map(Number);

    expect(numbers).toEqual(Array.from({ length: numbers.length }, (_, i) => i + 1));
  });

  it("keeps the same section numbers in the English version", () => {
    const titles = (source: string) =>
      Object.entries(privacy(source))
        .map(([key, section]) => [key, section.title?.match(/^\d+\./)?.[0]] as const)
        .filter(([, number]) => number !== undefined);

    expect(titles(en)).toEqual(titles(de));
  });

  /**
   * A key missing on one side does not throw at runtime - next-intl renders the key path
   * instead, which on a legal page reads as a hole in the text.
   */
  it("keeps both catalogues on the same key set", () => {
    const paths = (value: unknown, prefix = ""): string[] =>
      typeof value === "object" && value !== null
        ? Object.entries(value).flatMap(([key, child]) =>
            paths(child, prefix ? `${prefix}.${key}` : key)
          )
        : [prefix];

    expect(paths(JSON.parse(en)).sort()).toEqual(paths(JSON.parse(de)).sort());
  });
});
