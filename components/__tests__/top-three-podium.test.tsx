import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { TopThreePodium } from "@/components/top-three-podium";

/**
 * #81: the ranking page crashed with "Cannot read properties of undefined
 * (reading 'avatar')" as soon as a period had fewer than three placements. The page
 * passes index accesses (ranking[1], ranking[2]) and only checks for at least one
 * entry.
 */
const first = { name: "Leonid", initials: "L", points: 100, level: 2 };
const second = { name: "Lisa Müller", initials: "LM", points: 90, level: 2 };
const third = { name: "Max Mustermann", initials: "MM", points: 80, level: 1 };

describe("TopThreePodium", () => {
  it("renders only first place when there is one entry", () => {
    const markup = renderToStaticMarkup(<TopThreePodium first={first} />);

    expect(markup).toContain("Leonid");
    expect(markup).not.toContain("Lisa Müller");
    expect(markup).not.toContain("Max Mustermann");
  });

  it("renders first and second place when there are two entries", () => {
    const markup = renderToStaticMarkup(
      <TopThreePodium first={first} second={second} />,
    );

    expect(markup).toContain("Leonid");
    expect(markup).toContain("Lisa Müller");
    expect(markup).not.toContain("Max Mustermann");
  });

  it("renders all three places when there are three entries", () => {
    const markup = renderToStaticMarkup(
      <TopThreePodium first={first} second={second} third={third} />,
    );

    expect(markup).toContain("Leonid");
    expect(markup).toContain("Lisa Müller");
    expect(markup).toContain("Max Mustermann");
  });

  it("tolerates undefined in second and third position, exactly as the page passes them", () => {
    const ranking = [first];

    expect(() =>
      renderToStaticMarkup(
        <TopThreePodium
          first={ranking[0]}
          second={ranking[1]}
          third={ranking[2]}
        />,
      ),
    ).not.toThrow();
  });

  it("links every placement to its public profile (#34)", () => {
    const markup = renderToStaticMarkup(
      <TopThreePodium first={first} second={second} third={third} />,
    );

    expect(markup).toContain('href="/u/leonid"');
    expect(markup).toContain('href="/u/lisa%20m%C3%BCller"');
    expect(markup).toContain('href="/u/max%20mustermann"');
  });
});
