import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (...parts: string[]) =>
  readFileSync(resolve(process.cwd(), ...parts), "utf8");

const homePage = read("app", "page.tsx");
const nextConfig = read("next.config.mjs");

/**
 * #130: `/` answered 307 to `/login?callbackUrl=/` for anyone without a session, so the
 * canonical URL of the site — the one in `metadataBase`, in the OG tags and in every
 * external link — served a login form to crawlers, while the landing sat on `/landing`.
 *
 * ponytail: reads the sources as text. `app/page.tsx` is a server component that awaits
 * `auth()` and three database queries, so it does not import under the node test
 * environment; what this guards is which branch the code takes, which text shows.
 */
describe("home page for visitors without a session", () => {
  it("does not redirect them to the login form", () => {
    expect(homePage).not.toMatch(/redirect\(\s*["'`]\/login/);
  });

  it("renders the landing instead", () => {
    expect(homePage).toContain("LandingPage");
    // Rendered, not redirected to: the point is a 200 on the apex URL. Matched without the
    // closing slash, because the element carries props now (the daily title for the badge).
    expect(homePage).toMatch(/return <LandingPage[\s/>]/);
  });

  it("still sends a signed-out session to the login form", () => {
    // The `userStats` miss means the JWT outlived its user row — that one must sign out.
    expect(homePage).toContain("/api/auth/signout");
  });
});

describe("the old landing URL", () => {
  it("redirects permanently to the apex, because it is in the sitemap Google has", () => {
    expect(nextConfig).toMatch(
      /source:\s*["'`]\/landing["'`],\s*destination:\s*["'`]\/["'`],\s*permanent:\s*true/
    );
  });
});
