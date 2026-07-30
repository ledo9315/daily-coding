import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ChallengeHistory } from "@/components/challenge-history";

const entry = {
  id: "1",
  title: "Array Manipulation Challenge mit sehr langem Titel",
  difficulty: "medium" as const,
  status: "completed" as const,
  date: "29.07.2026",
  points: 200,
};

/**
 * #79: this row was what pushed the profile page past the viewport on a phone. The title
 * sat in a flex container without `min-w-0`, so it could not shrink; a grid track derives
 * its minimum from `min-content`, and the whole page grew with it.
 */
describe("ChallengeHistory on narrow screens", () => {
  const html = renderToStaticMarkup(<ChallengeHistory entries={[entry]} />);

  it("allows the title to shrink", () => {
    expect(html).toContain("min-w-0");
  });

  it("wraps the row rather than cutting the title to a stub", () => {
    expect(html).toContain("flex-wrap");
    expect(html).not.toContain("truncate");
    expect(html).toContain(entry.title);
  });

  it("keeps the points chip from being squeezed", () => {
    expect(html).toContain("shrink-0");
  });
});
