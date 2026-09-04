import { describe, expect, it } from "vitest";
import { solutionLink } from "@/lib/notification-view";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * The solutions page was the last route with a German name. Renaming it is cosmetic; what
 * is not cosmetic is that activity mails carrying the old address have already been sent
 * and cannot be recalled.
 *
 * Two halves have to hold for those links: the redirect in `next.config.mjs` maps the old
 * path, and the page still answers to the old query parameter - because a Next redirect
 * hands the query string on unchanged, so `?loesung=` survives the hop.
 */
describe("the renamed solutions route", () => {
  it("builds new links with the English path and parameter", () => {
    expect(solutionLink("chal-1", "a".repeat(64))).toBe(
      `/challenge/chal-1/solutions?solution=${"a".repeat(64)}`
    );
  });

  it("keeps a redirect for the old path", () => {
    const config = readFileSync(resolve(process.cwd(), "next.config.mjs"), "utf8");
    expect(config).toContain("/challenge/:id/loesungen");
    expect(config).toContain("/challenge/:id/solutions");
  });

  it("still reads the old query parameter, which the redirect passes through", () => {
    const source = readFileSync(
      resolve(process.cwd(), "components", "challenge-result", "solution-list.tsx"),
      "utf8"
    );
    expect(source).toContain('searchParams.get("solution") ?? searchParams.get("loesung")');
  });

  it("anchors the cards under the same id the list scrolls to", () => {
    const card = readFileSync(
      resolve(process.cwd(), "components", "challenge-result", "solution-card.tsx"),
      "utf8"
    );
    const list = readFileSync(
      resolve(process.cwd(), "components", "challenge-result", "solution-list.tsx"),
      "utf8"
    );
    expect(card).toContain("id={`solution-${group.codeHash}`}");
    expect(list).toContain("getElementById(`solution-${focusHash}`)");
  });
});
