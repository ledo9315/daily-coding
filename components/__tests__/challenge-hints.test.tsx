import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { NextIntlClientProvider } from "next-intl";
import challenge from "@/messages/de/challenge.json";
import { ChallengeHints } from "@/components/challenge-hints";

const HINTS = [
  { title: "Die Idee", body: "Sortiert heißt: du kannst nach jedem Vergleich die Hälfte ausschließen." },
  { title: "Fallstricke", body: "mid in jedem Durchlauf neu berechnen." },
];

const render = (hints: typeof HINTS) =>
  renderToStaticMarkup(
    <NextIntlClientProvider locale="de" messages={{ challenge }}>
      <ChallengeHints hints={hints} />
    </NextIntlClientProvider>
  );

describe("ChallengeHints", () => {
  it("shows every step as a trigger", () => {
    const html = render(HINTS);
    expect(html).toContain("Die Idee");
    expect(html).toContain("Fallstricke");
  });

  it("keeps the help itself folded away", () => {
    // The point of the accordion: whoever wants to solve it alone must not read the answer
    // by accident. Radix renders a closed item as data-state="closed".
    const html = render(HINTS);
    expect(html).toContain('data-state="closed"');
    expect(html).not.toContain("Hälfte ausschließen");
  });

  it("renders nothing at all without hints", () => {
    // An empty amber box used to be shown for every challenge that had no hint.
    expect(render([])).toBe("");
  });

  it("names the box and counts the steps", () => {
    const html = render(HINTS);
    expect(html).toContain(challenge.hints.title);
    expect(html).toContain("2 Stufen");
  });

  it("renders one item per step", () => {
    const items = render(HINTS).match(/data-slot="accordion-item"/g);
    expect(items?.length).toBe(2);
  });

  it("lets the steps stay open together", () => {
    // The steps build on each other, so opening step 2 must not close step 1. Radix decides
    // that via `type`, which leaves no trace in the markup - hence the source assertion.
    const source = readFileSync(
      resolve(process.cwd(), "components", "challenge-hints.tsx"),
      "utf8"
    );
    expect(source).toContain('type="multiple"');
  });
});
