import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { LandingHero } from "@/components/landing/hero";

/** Comments stripped: the doc comment names the old hardcoded title to explain the history. */
const source = readFileSync(
  resolve(process.cwd(), "components", "landing", "hero.tsx"),
  "utf8"
)
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\/\/.*$/gm, "");

/**
 * The badge above the headline used to read "Heutige Challenge: Array Manipulation" as a
 * hardcoded string. It claimed to name today's challenge and would have said the same thing
 * forever — the one piece of the landing page that promises to be live.
 */
describe("LandingHero", () => {
  it("names the challenge it is given", () => {
    // EncryptedText scrambles the glyphs while animating but always carries the real text in
    // aria-label, which is also what a screen reader gets.
    const html = renderToStaticMarkup(<LandingHero todaysChallengeTitle="Two Sum" />);
    expect(html).toContain('aria-label="Heutige Challenge: Two Sum"');
  });

  it("drops the badge when there is no challenge", () => {
    // The rotation pool can be empty; a badge announcing nothing is worse than none.
    const html = renderToStaticMarkup(<LandingHero todaysChallengeTitle={null} />);
    expect(html).not.toContain("Heutige Challenge");
  });

  it("hardcodes no challenge name", () => {
    expect(source).not.toContain("Array Manipulation");
  });

  it("still states the daily USP under the headline", () => {
    const html = renderToStaticMarkup(<LandingHero todaysChallengeTitle="Two Sum" />);
    expect(html).toContain("Eine Aufgabe am Tag");
  });

  it("loads the above-the-fold dashboard image eagerly", () => {
    const html = renderToStaticMarkup(<LandingHero todaysChallengeTitle="Two Sum" />);

    expect(html).toContain('fetchPriority="high"');
  });
});
