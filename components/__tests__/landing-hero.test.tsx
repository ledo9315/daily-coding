import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { LandingHero } from "@/components/landing/hero";
import { renderWithIntl } from "./intl-render";

/** Comments stripped: the doc comment names the old hardcoded title to explain the history. */
const source = readFileSync(
  resolve(process.cwd(), "components", "landing", "hero.tsx"),
  "utf8"
)
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\/\/.*$/gm, "");

/** The German copy the assertions below are written against. */
const hero: Record<string, string> = JSON.parse(
  readFileSync(resolve(process.cwd(), "messages", "de", "dashboard.json"), "utf8")
).hero;

/**
 * The badge above the headline used to read "Heutige Challenge: Array Manipulation" as a
 * hardcoded string. It claimed to name today's challenge and would have said the same thing
 * forever - the one piece of the landing page that promises to be live.
 */
describe("LandingHero", () => {
  it("names the challenge it is given", () => {
    // EncryptedText scrambles the glyphs while animating but always carries the real text in
    // aria-label, which is also what a screen reader gets.
    const html = renderWithIntl(<LandingHero todaysChallengeTitle="Two Sum" />);
    const badge = hero.todaysChallenge.replace("{title}", "Two Sum");

    expect(badge).toContain("Two Sum");
    expect(html).toContain(`aria-label="${badge}"`);
  });

  it("drops the badge when there is no challenge", () => {
    // The rotation pool can be empty; a badge announcing nothing is worse than none.
    const html = renderWithIntl(<LandingHero todaysChallengeTitle={null} />);
    expect(html).not.toContain(hero.todaysChallenge.replace(" {title}", ""));
  });

  it("hardcodes no challenge name", () => {
    expect(source).not.toContain("Array Manipulation");
  });

  it("reads its copy from the catalogue instead of the markup", () => {
    // A German string left in the JSX would never reach the English catalogue.
    expect(source).not.toMatch(/EINE CHALLENGE|CHALLENGE STARTEN|SO LÄUFT EIN TAG/);
  });

  it("still states the daily USP under the headline", () => {
    const html = renderWithIntl(<LandingHero todaysChallengeTitle="Two Sum" />);

    expect(hero.subline).toContain("Eine Aufgabe am Tag");
    expect(html).toContain("Eine Aufgabe am Tag");
  });

  it("loads the above-the-fold dashboard image eagerly", () => {
    const html = renderWithIntl(<LandingHero todaysChallengeTitle="Two Sum" />);

    expect(html).toContain('fetchPriority="high"');
  });
});
