import { describe, expect, it, vi } from "vitest";
import { createTranslator } from "next-intl";
import de from "@/messages/de/community.json";

/**
 * `getTranslations` needs a request scope, which a bare render has not got. The mock hands
 * out the real German namespace instead, so the assertions below read the same file the
 * page does.
 */
vi.mock("next-intl/server", () => ({
  getTranslations: async (namespace: "community") =>
    createTranslator({ locale: "de", messages: { community: de }, namespace }),
}));

import { SiteFooter } from "@/components/site-footer";
import { renderWithIntl } from "./intl-render";

async function render(): Promise<string> {
  return renderWithIntl(await SiteFooter());
}

describe("SiteFooter", () => {
  it("links to the public repository in a safe new tab", async () => {
    const html = await render();

    expect(html).toMatch(
      /href="https:\/\/github\.com\/ledo9315\/daily-coding-challenge"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/
    );
  });

  it("opens the repository bug-report form", async () => {
    const html = await render();

    expect(html).toContain(
      'href="https://github.com/ledo9315/daily-coding-challenge/issues/new?template=bug_report.yml"'
    );
    expect(html).toContain(de.footer.bugReport);
  });

  it("offers support through the configured email address", async () => {
    const html = await render();

    expect(html).toContain('href="mailto:leonid.domahalskyy@icloud.com"');
    expect(html).toContain(de.footer.support);
  });

  it("keeps the legal pages one click away from every page", async () => {
    const html = await render();

    expect(html).toContain('href="/impressum"');
    expect(html).toContain(de.footer.imprint);
    expect(html).toContain('href="/datenschutz"');
    expect(html).toContain(de.footer.privacy);
  });

  /** As an ICU number argument the year would come out grouped, as „2.026". */
  it("prints the year without thousands grouping", async () => {
    const html = await render();

    expect(html).toContain(`© ${new Date().getFullYear()} Daily Coding`);
  });
});
