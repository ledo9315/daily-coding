import { describe, expect, it, vi } from "vitest";
import { NAV_ITEMS } from "@/lib/navigation";
import { renderWithIntl } from "@/components/__tests__/intl-render";
import de from "@/messages/de/community.json";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

import { MobileNav } from "@/components/mobile-nav";

function render() {
  return renderWithIntl(<MobileNav />);
}

/**
 * #79: the header's nav is `hidden md:flex` and for a while nothing replaced it - on a
 * phone there was no way to reach the challenge or the ranking at all.
 */
describe("NAV_ITEMS", () => {
  it("holds the four primary destinations", () => {
    expect(NAV_ITEMS.map((i) => i.href)).toEqual([
      "/",
      "/challenge",
      "/ranking",
      "/profile",
    ]);
  });

  it("gives every entry a label and an icon", () => {
    for (const item of NAV_ITEMS) {
      expect(item.name.length).toBeGreaterThan(0);
      expect(typeof item.icon).toBe("function");
    }
  });

  /** A destination without a key would render the German label from the list forever. */
  it("has a translated label for every destination", () => {
    expect(Object.keys(de.nav)).toHaveLength(NAV_ITEMS.length);
  });
});

describe("MobileNav", () => {
  /**
   * The sheet's contents only exist in the DOM once it is open, and Radix needs a real
   * browser for that. What is checkable here is the trigger - and it is the part that was
   * missing: without a labelled button there is no way in.
   */
  it("renders a labelled trigger", () => {
    const html = render();
    expect(html).toContain(`aria-label="${de.mobileNav.open}"`);
  });

  it("hides the trigger from md upwards, where the nav bar takes over", () => {
    const html = render();
    expect(html).toContain("md:hidden");
  });
});
