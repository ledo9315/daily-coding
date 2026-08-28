import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (...parts: string[]) =>
  readFileSync(resolve(process.cwd(), ...parts), "utf8");

const page = read("app", "u", "[handle]", "page.tsx");
const privacyPolicy = read("app", "datenschutz", "page.tsx");

/**
 * #34: the public profile is the first page that serves another user's data without a
 * login, so two promises made elsewhere have to keep holding here.
 *
 * ponytail: reads the page as text. It is a server component pulling in fonts, CSS and
 * next-auth, so it does not import in the node test environment — and what is at stake
 * is the coupling between two files, which text captures. The behaviour behind the page
 * is covered by `lib/server/__tests__/public-profile.test.ts`.
 */
describe("public profile page", () => {
  it("keeps the noindex the privacy policy promises", () => {
    // The condition is the point: drop the passage and this stops demanding the meta tag.
    if (privacyPolicy.includes("Indexierung durch Suchmaschinen ausgenommen")) {
      expect(page).toMatch(/robots:\s*\{[^}]*index:\s*false/);
    }
  });

  it("reads through the public query, never the full profile one", () => {
    expect(page).toContain("getPublicProfile");
    expect(page).not.toContain("getUserProfileData");
  });
});
