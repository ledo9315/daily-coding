import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  AchievementsDialog,
  AchievementsDialogBody,
  filterAchievements,
  type AchievementFilter,
} from "@/components/achievements-dialog";
import { Dialog } from "@/components/ui/dialog";
import type { Achievement } from "@/lib/api";

function makeAchievements(count: number, unlocked: number): Achievement[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `ach-${i + 1}`,
    title: `Achievement ${i + 1}`,
    description: `Beschreibung ${i + 1}`,
    iconKey: "Check",
    unlocked: i < unlocked,
    rarity: "rare" as const,
    unlockedAt: i < unlocked ? "01.09.2026" : undefined,
    unlockedAtIso: i < unlocked ? "2026-09-01T10:00:00.000Z" : undefined,
    progress: i < unlocked ? undefined : { current: 1, target: 10 },
  }));
}

/**
 * Radix mounts DialogContent through a portal, which renders nothing on the server, so
 * the body is rendered on its own. The bare Dialog root is only the context provider
 * DialogTitle and DialogDescription read from; it adds no markup of its own.
 */
function renderBody(
  achievements: Achievement[],
  filter: AchievementFilter,
  showProgress = true,
) {
  const unlocked = achievements.filter((a) => a.unlocked).length;
  return renderToStaticMarkup(
    <Dialog open>
      <AchievementsDialogBody
        achievements={achievements}
        unlockedCount={unlocked}
        total={achievements.length}
        filter={filter}
        onFilterChange={() => {}}
        showProgress={showProgress}
      />
    </Dialog>,
  );
}

const badgeCount = (html: string) => (html.match(/<h4/g) ?? []).length;

describe("AchievementsDialogBody", () => {
  it("labels all three filters with their counts", () => {
    const html = renderBody(makeAchievements(23, 4), "all");
    expect(html).toMatch(/Alle <span[^>]*>23<\/span>/);
    expect(html).toMatch(/Freigeschaltet <span[^>]*>4<\/span>/);
    expect(html).toMatch(/Offen <span[^>]*>19<\/span>/);
    expect(html).toContain("Achievements 4/23");
    expect(html).toContain("Alle Achievements im Überblick");
  });

  it("lists every achievement under the all filter", () => {
    const html = renderBody(makeAchievements(23, 4), "all");
    expect(badgeCount(html)).toBe(23);
  });

  it("shows only the locked ones under the open filter", () => {
    const html = renderBody(makeAchievements(23, 4), "locked");
    expect(badgeCount(html)).toBe(19);
    expect(html).not.toContain("Freigeschaltet am");
  });

  it("explains an empty unlocked list instead of showing nothing", () => {
    const html = renderBody(makeAchievements(23, 0), "unlocked");
    expect(badgeCount(html)).toBe(0);
    expect(html).toContain("Noch nichts freigeschaltet. Die erste Challenge wartet.");
  });

  it("congratulates when nothing is left open", () => {
    const html = renderBody(makeAchievements(5, 5), "locked");
    expect(badgeCount(html)).toBe(0);
    expect(html).toContain("Alles freigeschaltet. Respekt.");
  });

  it("drops the progress bars when asked to", () => {
    const list = makeAchievements(6, 2);
    expect(renderBody(list, "locked")).toContain("width:");
    expect(renderBody(list, "locked", false)).not.toContain("width:");
  });
});

describe("filterAchievements", () => {
  const list = makeAchievements(5, 2);

  it("passes everything through for all", () => {
    expect(filterAchievements(list, "all")).toHaveLength(5);
  });

  it("splits unlocked and locked", () => {
    expect(filterAchievements(list, "unlocked").map((a) => a.id)).toEqual(["ach-1", "ach-2"]);
    expect(filterAchievements(list, "locked")).toHaveLength(3);
  });
});

describe("AchievementsDialog", () => {
  it("renders nothing while closed", () => {
    const html = renderToStaticMarkup(
      <AchievementsDialog
        achievements={makeAchievements(5, 2)}
        unlockedCount={2}
        total={5}
        open={false}
        onOpenChange={() => {}}
      />,
    );
    expect(html).toBe("");
  });
});
