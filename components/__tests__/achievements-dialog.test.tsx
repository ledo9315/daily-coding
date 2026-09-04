import { describe, expect, it } from "vitest";
import {
  AchievementsDialog,
  AchievementsDialogBody,
} from "@/components/achievements-dialog";
import { Dialog } from "@/components/ui/dialog";
import { renderWithIntl as renderToStaticMarkup } from "./intl-render";
import type { Achievement } from "@/lib/api";
import de from "@/messages/de/profile.json";

function makeAchievements(count: number, unlocked: number): Achievement[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `ach-${i + 1}`,
    title: `Achievement ${i + 1}`,
    description: `Beschreibung ${i + 1}`,
    iconKey: "Check",
    unlocked: i < unlocked,
    rarity: "rare" as const,
    unlockedAtIso: i < unlocked ? "2026-09-01T10:00:00.000Z" : undefined,
    progress: i < unlocked ? undefined : { current: 1, target: 10 },
  }));
}

/**
 * Radix mounts DialogContent through a portal, which renders nothing on the server, so
 * the body is rendered on its own. The bare Dialog root is only the context provider
 * DialogTitle and DialogDescription read from; it adds no markup of its own.
 */
function renderBody(achievements: Achievement[], showProgress = true) {
  const unlocked = achievements.filter((a) => a.unlocked).length;
  return renderToStaticMarkup(
    <Dialog open>
      <AchievementsDialogBody
        achievements={achievements}
        unlockedCount={unlocked}
        total={achievements.length}
        showProgress={showProgress}
      />
    </Dialog>,
  );
}

const badgeCount = (html: string) => (html.match(/<h4/g) ?? []).length;

describe("AchievementsDialogBody", () => {
  it("lists every achievement at once", () => {
    const html = renderBody(makeAchievements(23, 4));
    expect(badgeCount(html)).toBe(23);
    expect(html).toContain("Achievements 4/23");
    expect(html).toContain(de.achievements.dialogDescription);
  });

  it("offers no filters", () => {
    // The three tabs split a list short enough to read in full; what they were for -
    // seeing what is still open - the rarity grouping answers in place.
    const html = renderBody(makeAchievements(23, 4));
    expect(html).not.toContain("role=\"tablist\"");
    expect(html).not.toContain("Freigeschaltet <span");
    expect(html).not.toContain("Offen <span");
  });

  it("shows the locked ones alongside the unlocked", () => {
    const html = renderBody(makeAchievements(5, 2));
    expect(badgeCount(html)).toBe(5);
    expect(html).toContain("Freigeschaltet am");
    expect(html).toContain("width:");
  });

  it("groups by rarity and leaves the order within a rarity alone", () => {
    const list = makeAchievements(4, 0);
    const rarities = ["epic", "common", "legendary", "common"] as const;
    const mixed = list.map((a, i) => ({ ...a, rarity: rarities[i], title: `T${i + 1}` }));
    const titles = [...renderBody(mixed).matchAll(/<h4[^>]*>([^<]+)<\/h4>/g)].map((m) => m[1]);
    // The two commons keep their input order; nothing reorders by unlock state.
    expect(titles).toEqual(["T2", "T4", "T1", "T3"]);
  });

  it("drops the progress bars when asked to", () => {
    const list = makeAchievements(6, 2);
    expect(renderBody(list)).toContain("width:");
    expect(renderBody(list, false)).not.toContain("width:");
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
