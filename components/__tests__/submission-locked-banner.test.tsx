import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

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

  // #59: Belegt, dass Icons ohne Mock auflösbar sind — vorher scheiterte der
  // Import von @nsmr/pixelart-react im Node-Env an einer fehlenden ESM-Endung.
  it("rendert das echte Schloss-Icon ohne Mock", () => {
    expect(markup).toContain("<svg");
  });
});
