import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (...parts: string[]) =>
  readFileSync(resolve(process.cwd(), ...parts), "utf8");

const profilePage = read("app", "profile", "page.tsx");
const dashboardPage = read("app", "page.tsx");
const feedItem = read("components", "feed-item.tsx");
const resultPage = read("app", "challenge", "[id]", "loesungen", "page.tsx");
const rankingTable = read("components", "ranking-table.tsx");

/**
 * #37: `Trophy` stood for rank, level, badges and — on the result page — points.
 * LEVEL and BADGES sat side by side in the same grid carrying the identical glyph, so
 * the icons made the cards harder to tell apart instead of easier.
 *
 * ponytail: reads the sources as text. Both pages are server components that pull in
 * auth and CSS, so they do not import under the node test environment — and the subject
 * here is which icon a call site names, which text captures exactly.
 */
describe("icon assignments", () => {
  const statsCardIcons = (source: string) =>
    [...source.matchAll(/icon=\{(\w+)\}/g)].map((match) => match[1]);

  it("gives every stats card on the profile a distinct icon", () => {
    const icons = statsCardIcons(profilePage);
    expect(icons.length).toBeGreaterThan(1);
    expect(new Set(icons).size).toBe(icons.length);
  });

  it("gives every stats card on the dashboard a distinct icon", () => {
    const icons = statsCardIcons(dashboardPage);
    expect(icons.length).toBeGreaterThan(1);
    expect(new Set(icons).size).toBe(icons.length);
  });

  it("gives every feed event type a distinct icon", () => {
    const icons = [...feedItem.matchAll(/icon: (\w+),/g)].map((match) => match[1]);
    expect(icons.length).toBeGreaterThan(1);
    expect(new Set(icons).size).toBe(icons.length);
  });

  it("uses the same icon for a level on the profile and in the feed", () => {
    const levelCard = /title="LEVEL"[\s\S]*?icon=\{(\w+)\}/.exec(profilePage);
    const levelUpEvent = /case "level-up":[\s\S]*?icon: (\w+),/.exec(feedItem);
    expect(levelCard?.[1]).toBe(levelUpEvent?.[1]);
  });

  it("keeps Trophy for placements", () => {
    // Rank is the one meaning a trophy carries on its own.
    expect(rankingTable).toContain("Trophy");
    expect(/title="DEIN RANG"[\s\S]*?icon=\{Trophy\}/.test(dashboardPage)).toBe(true);
  });

  it("labels nothing but a placement with Trophy", () => {
    // The iconMap entry stays: it is the glyph of a single achievement, not a card label.
    expect(/icon=\{Trophy\}/.test(profilePage)).toBe(false);
    expect(feedItem).not.toContain("Trophy");
  });

  it("marks points with the star established in #38, not with a trophy", () => {
    expect(resultPage).not.toContain("Trophy");
  });
});
