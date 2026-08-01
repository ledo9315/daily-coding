import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LandingFooter } from "@/components/landing/footer";

describe("LandingFooter", () => {
  it("links to the public repository in a safe new tab", () => {
    const html = renderToStaticMarkup(<LandingFooter />);

    expect(html).toMatch(
      /href="https:\/\/github\.com\/ledo9315\/daily-coding-challenge"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/
    );
  });

  it("opens the repository bug-report form", () => {
    const html = renderToStaticMarkup(<LandingFooter />);

    expect(html).toContain(
      'href="https://github.com/ledo9315/daily-coding-challenge/issues/new?template=bug_report.yml"'
    );
    expect(html).toContain("Fehler melden");
  });

  it("offers support through the configured email address", () => {
    const html = renderToStaticMarkup(<LandingFooter />);

    expect(html).toContain('href="mailto:leonid.domahalskyy@icloud.com"');
    expect(html).toContain("Support");
  });
});
