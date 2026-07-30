import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { TopThreePodium } from "@/components/top-three-podium";

/**
 * #81: Die Rangliste stürzte mit "Cannot read properties of undefined
 * (reading 'avatar')" ab, sobald eine Periode weniger als drei Platzierungen
 * hatte. Die Seite übergibt Indexzugriffe (ranking[1], ranking[2]) und prüft
 * nur auf mindestens einen Eintrag.
 */
const first = { name: "Leonid", initials: "L", points: 100, level: 2, time: "30:21" };
const second = { name: "Lisa Müller", initials: "LM", points: 90, level: 2 };
const third = { name: "Max Mustermann", initials: "MM", points: 80, level: 1 };

describe("TopThreePodium", () => {
  it("rendert nur Platz 1, wenn es einen Eintrag gibt", () => {
    const markup = renderToStaticMarkup(<TopThreePodium first={first} />);

    expect(markup).toContain("Leonid");
    expect(markup).not.toContain("Lisa Müller");
    expect(markup).not.toContain("Max Mustermann");
  });

  it("rendert Platz 1 und 2, wenn es zwei Einträge gibt", () => {
    const markup = renderToStaticMarkup(
      <TopThreePodium first={first} second={second} />,
    );

    expect(markup).toContain("Leonid");
    expect(markup).toContain("Lisa Müller");
    expect(markup).not.toContain("Max Mustermann");
  });

  it("rendert alle drei Plätze, wenn es drei Einträge gibt", () => {
    const markup = renderToStaticMarkup(
      <TopThreePodium first={first} second={second} third={third} />,
    );

    expect(markup).toContain("Leonid");
    expect(markup).toContain("Lisa Müller");
    expect(markup).toContain("Max Mustermann");
  });

  it("verträgt undefined an zweiter und dritter Stelle — so übergibt die Seite es", () => {
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

  it("zeigt in variant='time' die Lösezeit statt der Punkte", () => {
    const markup = renderToStaticMarkup(
      <TopThreePodium first={first} variant="time" />,
    );

    expect(markup).toContain("30:21");
  });
});
