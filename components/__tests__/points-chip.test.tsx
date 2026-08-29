import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { PointsChip } from "@/components/points-chip";

/**
 * #38: points were shown with a coin icon, which promises a currency you can spend.
 * There is no shop and no unlock priced in points - the number is a pure score, so it
 * now carries a star. `@nsmr/pixelart-react` ships no plain star (only `MoonStar`),
 * hence the hand-drawn inline SVG rather than a second icon library.
 */
describe("PointsChip", () => {
  const markup = renderToStaticMarkup(<PointsChip points={520} />);

  it("draws its own pixel star instead of importing an icon", () => {
    expect(markup).toContain('viewBox="0 0 9 9"');
  });

  it("keeps the star blocky rather than antialiased", () => {
    expect(markup).toContain('shape-rendering="crispEdges"');
  });

  it("hides the star from screen readers - the number carries the meaning", () => {
    expect(markup).toContain('aria-hidden="true"');
  });

  it("no longer renders the coin, which had a 24-unit viewBox", () => {
    expect(markup).not.toContain('viewBox="0 0 24 24"');
  });

  it("keeps the German thousands separator", () => {
    expect(renderToStaticMarkup(<PointsChip points={1234} />)).toContain("1.234");
  });

  it("renders every size with the star", () => {
    for (const size of ["sm", "md", "lg"] as const) {
      expect(
        renderToStaticMarkup(<PointsChip points={7} size={size} />),
      ).toContain('viewBox="0 0 9 9"');
    }
  });
});
