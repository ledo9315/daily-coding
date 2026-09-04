import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import challenge from "@/messages/de/challenge.json";
import { ChallengeHistory } from "@/components/challenge-history";
import type { ChallengeHistoryEntry } from "@/lib/api";

const render = (entries: ChallengeHistoryEntry[]) =>
  renderToStaticMarkup(
    <NextIntlClientProvider locale="de" messages={{ challenge }}>
      <ChallengeHistory entries={entries} />
    </NextIntlClientProvider>
  );

const entry = {
  id: "1",
  challengeId: "chal-1",
  title: "Array Manipulation Challenge mit sehr langem Titel",
  difficulty: "medium" as const,
  status: "completed" as const,
  date: "29.07.2026",
  points: 200,
};

/**
 * #79: this row was what pushed the profile page past the viewport on a phone. The title
 * sat in a flex container without `min-w-0`, so it could not shrink; a grid track derives
 * its minimum from `min-content`, and the whole page grew with it.
 */
describe("ChallengeHistory on narrow screens", () => {
  const html = render([entry]);

  it("allows the title to shrink", () => {
    expect(html).toContain("min-w-0");
  });

  it("wraps the row rather than cutting the title to a stub", () => {
    expect(html).toContain("flex-wrap");
    expect(html).not.toContain("truncate");
    expect(html).toContain(entry.title);
  });

  it("keeps the points chip from being squeezed", () => {
    expect(html).toContain("shrink-0");
  });
});

describe("ChallengeHistory announces the status", () => {
  // The icon was the only carrier of it, and a shape says nothing to a screen reader.
  it("names the status in text", () => {
    expect(render([entry])).toContain(challenge.history.status.completed);
    expect(render([{ ...entry, status: "failed" as const }])).toContain(
      challenge.history.status.failed
    );
  });
});

describe("ChallengeHistory links to the result page", () => {
  it("links a solved entry", () => {
    const html = render([entry]);
    expect(html).toContain('href="/challenge/chal-1/loesungen"');
  });

  it("leaves an unsolved entry unlinked", () => {
    const html = render([{ ...entry, status: "failed" as const }]);
    expect(html).not.toContain("href=");
  });
});
