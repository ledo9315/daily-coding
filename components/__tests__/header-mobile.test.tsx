import { describe, expect, it, vi } from "vitest";
import { renderWithIntl } from "@/components/__tests__/intl-render";
import de from "@/messages/de/community.json";

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
  const html = renderWithIntl(<Header />);

  it("offers the sheet trigger below md", () => {
    const label = de.mobileNav.open;
    expect(html).toContain(`aria-label="${label}"`);
    expect(html).toMatch(
      new RegExp(`aria-label="${label}"[^>]*md:hidden|md:hidden[^>]*aria-label="${label}"`)
    );
  });

  it("keeps the nav bar for md and up, so the two never show at once", () => {
    expect(html).toContain("md:flex");
  });

  // Rendered in German, so the two paths with a language pair carry the prefix (#287).
  it("reaches every primary destination through one of the two", () => {
    for (const href of ["/de", "/de/challenge", "/ranking", "/profile"]) {
      expect(html).toContain(`href="${href}"`);
    }
  });

  it("drops the STREAK label below sm, where the number alone has to do", () => {
    expect(html).toContain("sm:inline");
    expect(html).toContain(de.header.streakLabel);
  });

  it("names every primary destination in the reader's language", () => {
    for (const label of Object.values(de.nav)) {
      expect(html).toContain(label);
    }
  });
});
