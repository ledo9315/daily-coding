import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";
import { renderEmail } from "@/lib/server/email-template";

/**
 * #109: the product is „Daily Coding" since the move to daily-coding.de. A leftover
 * „Daily Dev" in a mail subject or a page title is the kind of thing nobody notices until
 * a user does, so the check is mechanical.
 *
 * Deliberately scoped to user-facing sources. Infrastructure identifiers keep the old
 * name on purpose — the Postgres role `daily_dev`, the container `daily-dev-db`, the seed
 * admin `admin@dailydev.local` — renaming those is a migration, not a rebrand.
 */
const ROOTS = ["app", "components", "lib"];
const SKIP = new Set(["generated", "__tests__", "node_modules"]);

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (SKIP.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...sourceFiles(full));
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

describe("branding", () => {
  it("has no 'Daily Dev' left in app, components or lib", () => {
    const offenders: string[] = [];
    for (const root of ROOTS) {
      for (const file of sourceFiles(resolve(process.cwd(), root))) {
        const text = readFileSync(file, "utf8");
        if (/daily[\s\-_]?dev/i.test(text)) offenders.push(file.replace(process.cwd() + "/", ""));
      }
    }
    expect(offenders).toEqual([]);
  });

  /**
   * #111: without `metadataBase`, Next.js emits relative Open-Graph and canonical URLs,
   * and a relative URL in metadata is worthless — Slack, WhatsApp and search engines read
   * it from the outside. A shared link then has no preview card.
   *
   * ponytail: reads the file as text. `app/layout.tsx` imports globals.css and next/font,
   * neither of which loads in the node test environment.
   */
  it("declares the canonical site URL as metadataBase", () => {
    const layout = readFileSync(resolve(process.cwd(), "app", "layout.tsx"), "utf8");
    expect(layout).toContain('metadataBase: new URL("https://daily-coding.de")');
  });

  it("names the product in the mail layout", () => {
    const { html, text } = renderEmail({ heading: "Test", lines: [], footer: "" });
    expect(html).toContain("DAILY CODING");
    expect(text).toContain("DAILY CODING");
  });
});
