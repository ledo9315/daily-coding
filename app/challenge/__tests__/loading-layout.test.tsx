import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

// The header uses client hooks (useSession/usePathname), irrelevant for a structural check.
vi.mock("@/components/header", () => ({
  Header: () => <nav data-role="header" />,
}));

import ChallengeLoading from "../loading";

/**
 * Regression test for #43: the challenge page's loading state had
 * `flex items-center justify-center` on the wrapper that also contained the header,
 * which put the navigation in the middle of the viewport instead of at the top.
 */
describe("challenge loading state", () => {
  const markup = renderToStaticMarkup(<ChallengeLoading />);

  it("does not center the container that holds the header", () => {
    const rootClasses = markup.match(/^<div class="([^"]*)"/)?.[1] ?? "";
    expect(rootClasses).toContain("min-h-screen");
    expect(rootClasses).not.toContain("justify-center");
    expect(rootClasses).not.toContain("items-center");
  });

  it("renders the header before the content inside a main element", () => {
    expect(markup).toContain('data-role="header"');
    expect(markup).toContain("<main");
    expect(markup.indexOf('data-role="header"')).toBeLessThan(
      markup.indexOf("<main"),
    );
  });

  // ponytail: a source check instead of rendering the page - rendering page.tsx
  // would need mocks for react-query, Monaco and the icon package (ESM resolution
  // breaks in the node env). Upgrade to a real render test once the page is split
  // up for testability anyway.
  it("defines no separate, centered loading state in page.tsx", () => {
    const source = readFileSync(new URL("../page.tsx", import.meta.url), "utf8");
    const loadingBranch = source.slice(
      source.indexOf("if (isLoadingChallenge)"),
      source.indexOf("if (loadError"),
    );
    expect(loadingBranch).toContain("ChallengeLoading");
    expect(loadingBranch).not.toContain("justify-center");
  });
});
