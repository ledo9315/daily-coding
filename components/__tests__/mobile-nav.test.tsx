import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { NAV_ITEMS } from "@/lib/navigation";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

import { MobileNav } from "@/components/mobile-nav";

/**
 * #79: the header's nav is `hidden md:flex` and for a while nothing replaced it — on a
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
});

describe("MobileNav", () => {
  /**
   * The sheet's contents only exist in the DOM once it is open, and Radix needs a real
   * browser for that. What is checkable here is the trigger — and it is the part that was
   * missing: without a labelled button there is no way in.
   */
  it("renders a labelled trigger", () => {
    const html = renderToStaticMarkup(<MobileNav />);
    expect(html).toContain('aria-label="Menü öffnen"');
  });

  it("hides the trigger from md upwards, where the nav bar takes over", () => {
    const html = renderToStaticMarkup(<MobileNav />);
    expect(html).toContain("md:hidden");
  });
});
