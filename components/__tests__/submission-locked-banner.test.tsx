import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

// Nur das eine Icon, das die Komponente importiert — @nsmr/pixelart-react
// scheitert im Node-Env an einer unauflösbaren ESM-Endung.
vi.mock("@nsmr/pixelart-react", () => ({
  Lock: () => null,
}));

import { SubmissionLockedBanner } from "@/components/submission-locked-banner";

/**
 * #36: Der Editor wurde ausgegraut und gesperrt, ohne Erklärung an der Stelle
 * der Sperre. Der Hinweis stand am Seitenanfang und war beim Scrollen zum Editor
 * längst aus dem Bild.
 */
describe("SubmissionLockedBanner", () => {
  const markup = renderToStaticMarkup(<SubmissionLockedBanner />);

  it("nennt die erfolgte Abgabe", () => {
    expect(markup).toMatch(/abgegeben/i);
  });

  it("nennt, dass auch das Testen gesperrt ist", () => {
    // Ohne diesen Teil sucht man vergeblich, warum „Test ausführen" nicht geht.
    expect(markup).toMatch(/test/i);
    expect(markup).toMatch(/gesperrt|nicht möglich/i);
  });

  it("nennt, bis wann die Sperre gilt", () => {
    expect(markup).toMatch(/morgen/i);
    expect(markup).toMatch(/UTC/);
  });

  it("ist für Screenreader als Statusmeldung ausgezeichnet", () => {
    expect(markup).toContain('role="status"');
  });
});
