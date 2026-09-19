import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./intl-render";
import { LandingHero } from "../landing/hero";
import { ProductTour } from "../landing/product-tour";
import {
  MiniChallenge,
  evaluateDemo,
  DEMO_CASES,
} from "../landing/mini-challenge";

describe("landing registration journey", () => {
  it.each(["de", "en"])(
    "offers registration and a working tour anchor in %s",
    (locale) => {
      const html = renderWithIntl(
        <LandingHero todaysChallengeTitle={null} />,
        locale,
      );
      expect(html).toContain('href="/register"');
      expect(html).toContain('href="#product-tour"');
      expect(html).not.toContain('aria-label="Heutige Challenge:');
    },
  );

  it("starts the product tour with an accessible dashboard tab and an honest preview label", () => {
    const html = renderWithIntl(<ProductTour />);
    expect(html).toContain('id="product-tour"');
    expect(html).toContain('role="tablist"');
    expect(html).toContain('aria-selected="true"');
    expect(html).toContain("Beispielansichten");
    expect(html).toContain("Dashboard");
  });

  it("does not show a success result before trying the demo", () => {
    const html = renderWithIntl(<MiniChallenge />);
    expect(html).toContain('type="radio"');
    expect(html).toContain('disabled=""');
    expect(html).not.toContain("Alle Tests bestanden");
  });
});

describe("mini challenge feedback", () => {
  it("passes the even-number solution including zero and negative numbers", () => {
    expect(evaluateDemo("even").every(Boolean)).toBe(true);
    expect(DEMO_CASES.some(({ input }) => input.includes(0))).toBe(true);
    expect(DEMO_CASES.some(({ input }) => input.some((n) => n < 0))).toBe(true);
  });
  it.each(["odd", "positive"] as const)(
    "rejects the %s distractor",
    (choice) => {
      expect(evaluateDemo(choice).every(Boolean)).toBe(false);
      expect(evaluateDemo(choice)).toHaveLength(DEMO_CASES.length);
    },
  );
  it("does not award a pass to an unknown selection", () => {
    expect(evaluateDemo("invalid")).toEqual(DEMO_CASES.map(() => false));
  });
});
