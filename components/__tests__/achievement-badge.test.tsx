import { describe, expect, it } from "vitest";
import { AchievementBadge } from "@/components/achievement-badge";
import { renderWithIntl } from "./intl-render";

function Icon() {
  return <svg />;
}

function render(
  props: Partial<Parameters<typeof AchievementBadge>[0]> = {},
  locale = "de"
) {
  return renderWithIntl(
    <AchievementBadge
      title="Code-Meister"
      description="10 schwere Challenges gelöst"
      icon={Icon}
      {...props}
    />,
    locale
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
      progress: { current: 5, target: 7, label: "record" },
    });
    expect(html).toContain("Rekord: 5/7");
  });

  // The rules hand the label down as a message key, so it follows the reader's language.
  it("translates the record label", () => {
    const html = render(
      { unlocked: false, progress: { current: 5, target: 7, label: "record" } },
      "en"
    );
    expect(html).toContain("Record: 5/7");
    expect(html).not.toContain("Rekord");
  });

  it("renders no bar without progress", () => {
    const html = render({ unlocked: false });
    expect(html).not.toContain("width:");
  });

  it("renders no bar once unlocked, where the unlock date carries the information", () => {
    const html = render({
      unlocked: true,
      unlockedAtIso: "2026-07-29T10:00:00.000Z",
      progress: { current: 10, target: 10 },
    });
    expect(html).toContain("Freigeschaltet am 29.07.2026");
    expect(html).not.toContain("10/10");
  });

  it("formats the unlock date for the reader's locale", () => {
    const html = render({ unlocked: true, unlockedAtIso: "2026-07-29T10:00:00.000Z" }, "en");
    expect(html).toContain("Unlocked on 07/29/2026");
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
