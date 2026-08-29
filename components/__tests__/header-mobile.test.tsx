import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { id: "u-1", name: "Lisa Müller", email: "lisa@example.com" } },
    status: "authenticated",
  }),
  signOut: vi.fn(),
}));

import { Header } from "@/components/header";

/**
 * #79: the nav bar is `hidden md:flex`, so on a phone the only way into the challenge or
 * the ranking is the sheet. These assertions are about structure, not looks - the visual
 * check needs a signed-in session in a real browser.
 */
describe("Header on small screens", () => {
  const html = renderToStaticMarkup(<Header />);

  it("offers the sheet trigger below md", () => {
    expect(html).toContain('aria-label="Menü öffnen"');
    expect(html).toMatch(/aria-label="Menü öffnen"[^>]*md:hidden|md:hidden[^>]*aria-label="Menü öffnen"/);
  });

  it("keeps the nav bar for md and up, so the two never show at once", () => {
    expect(html).toContain("md:flex");
  });

  it("reaches every primary destination through one of the two", () => {
    for (const href of ["/", "/challenge", "/ranking", "/profile"]) {
      expect(html).toContain(`href="${href}"`);
    }
  });

  it("drops the STREAK label below sm, where the number alone has to do", () => {
    expect(html).toContain("sm:inline");
  });
});
