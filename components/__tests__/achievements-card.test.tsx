import { describe, expect, it } from "vitest";
import { AchievementsCard } from "@/components/achievements-card";
import { renderWithIntl as renderToStaticMarkup } from "./intl-render";
import type { Achievement } from "@/lib/api";

function makeAchievements(count: number, unlocked = 1): Achievement[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `ach-${i + 1}`,
    title: `Achievement ${i + 1}`,
    description: `Beschreibung ${i + 1}`,
    iconKey: "Check",
    unlocked: i < unlocked,
    rarity: "common" as const,
    unlockedAtIso: i < unlocked ? "2026-09-01T10:00:00.000Z" : undefined,
    progress: i < unlocked ? undefined : { current: i, target: 30 },
  }));
}

const badgeCount = (html: string) => (html.match(/<h4/g) ?? []).length;

describe("AchievementsCard", () => {
  it("shows at most four badges and a button to open the rest", () => {
    const html = renderToStaticMarkup(
      <AchievementsCard achievements={makeAchievements(23)} unlockedCount={1} total={23} />,
    );
    expect(badgeCount(html)).toBe(4);
    expect(html).toContain("Alle 23 anzeigen");
  });

  it("shows the unlocked-of-total count in the title", () => {
    const html = renderToStaticMarkup(
      <AchievementsCard achievements={makeAchievements(23)} unlockedCount={1} total={23} />,
    );
    expect(html).toContain("Achievements 1/23");
  });

  it("renders no button when everything already fits into the card", () => {
    const html = renderToStaticMarkup(
      <AchievementsCard achievements={makeAchievements(4)} unlockedCount={1} total={4} />,
    );
    expect(badgeCount(html)).toBe(4);
    expect(html).not.toContain("anzeigen");
  });

  it("leads with the unlocked achievement, then the closest locked ones", () => {
    const list = makeAchievements(23);
    const html = renderToStaticMarkup(
      <AchievementsCard achievements={list} unlockedCount={1} total={23} />,
    );
    // ach-1 is unlocked; ach-23, ach-22, ach-21 have the highest progress ratios.
    expect(html).toContain("Achievement 1");
    expect(html).toContain("Achievement 23");
    expect(html).toContain("Achievement 22");
    expect(html).toContain("Achievement 21");
    expect(html).not.toContain("Achievement 2<");
  });

  it("hides progress bars when asked to", () => {
    const list = makeAchievements(23);
    const withBars = renderToStaticMarkup(
      <AchievementsCard achievements={list} unlockedCount={1} total={23} />,
    );
    const withoutBars = renderToStaticMarkup(
      <AchievementsCard
        achievements={list}
        unlockedCount={1}
        total={23}
        showProgress={false}
      />,
    );
    expect(withBars).toContain("width:");
    expect(withoutBars).not.toContain("width:");
  });
});
