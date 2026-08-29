import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AchievementBadge } from "@/components/achievement-badge";

function Icon() {
  return <svg />;
}

function render(props: Partial<Parameters<typeof AchievementBadge>[0]> = {}) {
  return renderToStaticMarkup(
    <AchievementBadge
      title="Code-Meister"
      description="10 schwere Challenges gelöst"
      icon={Icon}
      {...props}
    />
  );
}

describe("AchievementBadge", () => {
  it("shows the standing and a bar for a locked achievement", () => {
    const html = render({ unlocked: false, progress: { current: 3, target: 10 } });
    expect(html).toContain("3/10");
    // 3 of 10 - the bar has to be readable as a width, not just as a number.
    expect(html).toContain("width:30%");
  });

  it("prefixes the label when the value is a record, not a current run", () => {
    const html = render({
      unlocked: false,
      progress: { current: 5, target: 7, label: "Rekord" },
    });
    expect(html).toContain("Rekord: 5/7");
  });

  it("renders no bar without progress", () => {
    const html = render({ unlocked: false });
    expect(html).not.toContain("width:");
  });

  it("renders no bar once unlocked, where the unlock date carries the information", () => {
    const html = render({
      unlocked: true,
      unlockedAt: "29.07.2026",
      progress: { current: 10, target: 10 },
    });
    expect(html).toContain("Freigeschaltet am 29.07.2026");
    expect(html).not.toContain("10/10");
  });
});

/**
 * #79: the profile page was cut off on the right. Cause: `truncate` on a title inside
 * nested flex containers without `min-w-0` - a flex item defaults to `min-width: auto`,
 * so the title refused to shrink, and a grid track takes its minimum from `min-content`.
 * The card therefore widened the whole page.
 */
describe("AchievementBadge on narrow screens", () => {
  it("lets the title shrink and wrap instead of forcing the card wide", () => {
    const html = render({
      title: "Wochenend-Krieger mit einem sehr langen Namen",
      unlocked: false,
    });
    expect(html).toContain("min-w-0");
    expect(html).toContain("flex-wrap");
    expect(html).not.toContain("truncate");
  });
});
