import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

// Header nutzt Client-Hooks (useSession/usePathname) — für den Struktur-Check irrelevant.
vi.mock("@/components/header", () => ({
  Header: () => <nav data-role="header" />,
}));

import ChallengeLoading from "../loading";

/**
 * Regression zu #43: Der Ladezustand der Challenge-Seite hatte
 * `flex items-center justify-center` auf dem Wrapper, der auch den Header
 * enthielt — dadurch landete die Navigation mittig im Viewport statt oben.
 */
describe("Challenge-Ladezustand", () => {
  const markup = renderToStaticMarkup(<ChallengeLoading />);

  it("zentriert den Container mit dem Header nicht", () => {
    const rootClasses = markup.match(/^<div class="([^"]*)"/)?.[1] ?? "";
    expect(rootClasses).toContain("min-h-screen");
    expect(rootClasses).not.toContain("justify-center");
    expect(rootClasses).not.toContain("items-center");
  });

  it("rendert den Header vor dem Inhalt in einem main-Element", () => {
    expect(markup).toContain('data-role="header"');
    expect(markup).toContain("<main");
    expect(markup.indexOf('data-role="header"')).toBeLessThan(
      markup.indexOf("<main"),
    );
  });

  // ponytail: Quell-Check statt Render der Seite — page.tsx zu rendern bräuchte
  // Mocks für react-query, Monaco und das Icon-Paket (ESM-Auflösung bricht im
  // Node-Env). Upgrade auf einen echten Render-Test, wenn die Seite ohnehin
  // testbar zerlegt wird.
  it("definiert in page.tsx keinen eigenen, zentrierten Ladezustand", () => {
    const source = readFileSync(new URL("../page.tsx", import.meta.url), "utf8");
    const loadingBranch = source.slice(
      source.indexOf("if (isLoadingChallenge)"),
      source.indexOf("if (loadError"),
    );
    expect(loadingBranch).toContain("ChallengeLoading");
    expect(loadingBranch).not.toContain("justify-center");
  });
});
