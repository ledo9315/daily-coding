import { describe, expect, it } from "vitest";
import { SolutionCard } from "@/components/challenge-result/solution-card";
import type { ChallengeSolutionGroup } from "@/lib/api";
import { renderWithIntl } from "@/components/__tests__/intl-render";
import de from "@/messages/de/community.json";

function makeGroup(
  overrides: Partial<ChallengeSolutionGroup> = {}
): ChallengeSolutionGroup {
  return {
    codeHash: "hash-a",
    submissionId: "sub-1",
    language: "javascript",
    code: "const answer = 42;",
    createdAt: "2026-08-01T10:00:00.000Z",
    revised: false,
    authors: [{ name: "Lisa Müller", initials: "LM", avatar: "", level: 4 }],
    submissionCount: 1,
    own: false,
    commentCount: 0,
    votes: { best_practices: 0, clever: 0 },
    myVotes: { best_practices: false, clever: false },
    ...overrides,
  };
}

function render(group: ChallengeSolutionGroup, focused = false) {
  return renderWithIntl(
    <SolutionCard
      challengeId="ch-1"
      group={group}
      ownCode="const answer = 1;"
      ownLanguage="javascript"
      focused={focused}
    />
  );
}

describe("SolutionCard", () => {
  it("links the name to the public profile path", () => {
    const html = render(makeGroup());
    expect(html).toContain('href="/u/lisa%20m%C3%BCller"');
  });

  /** The page exists to be read; a click in front of every solution makes that a chore. */
  it("shows the code without a toggle", () => {
    const html = render(makeGroup());
    expect(html).toContain("answer");
    expect(html).not.toContain("Code anzeigen");
  });

  it("offers the comments behind a toggle that carries the count", () => {
    const html = render(makeGroup({ commentCount: 6 }));
    expect(html).toContain(de.solutionCard.comments);
    expect(html).toContain(">6<");
    // Two collapsed toggles: the comments and the comparison.
    expect(html.match(/aria-expanded="false"/g)).toHaveLength(2);
    expect(html).not.toContain(de.comments.placeholder);
  });

  it("names the level of every author", () => {
    const html = render(
      makeGroup({
        authors: [
          { name: "Lisa Müller", initials: "LM", avatar: "", level: 4 },
          { name: "Bob Bauer", initials: "BB", avatar: "", level: 9 },
        ],
        submissionCount: 2,
      })
    );
    expect(html).toContain("Level 4");
    expect(html).toContain("Level 9");
  });

  it("lists every named author and sums up the rest", () => {
    const html = render(
      makeGroup({
        authors: [
          { name: "Lisa Müller", initials: "LM", avatar: "", level: 4 },
          { name: "Bob Bauer", initials: "BB", avatar: "", level: 2 },
        ],
        submissionCount: 40,
      })
    );
    expect(html).toContain("Lisa Müller");
    expect(html).toContain("Bob Bauer");
    expect(html).toContain("und 38 weitere");
    expect(html).toContain("40 identische Abgaben");
    expect(html).toContain("Level 4");
  });

  it("leaves out the rest count and the tally when the group is a single solution", () => {
    const html = render(makeGroup());
    expect(html).not.toContain("weitere");
    expect(html).not.toContain("Abgabe");
  });

  it("marks a revised single solution and leaves an unrevised one unmarked", () => {
    const revised = render(makeGroup({ revised: true }));
    const plain = render(makeGroup());
    expect(revised).toContain(de.solutionCard.revised);
    expect(plain).not.toContain(de.solutionCard.revised);
  });

  it("does not claim a group of many was revised", () => {
    const html = render(makeGroup({ revised: true, submissionCount: 7 }));
    expect(html).not.toContain(de.solutionCard.revised);
  });

  it("marks the group the own solution belongs to", () => {
    const own = render(makeGroup({ own: true }));
    const other = render(makeGroup());
    expect(own).toContain(de.solutionCard.ownSolution);
    expect(other).not.toContain(de.solutionCard.ownSolution);
  });

  it("escapes code that looks like markup", () => {
    const html = render(makeGroup({ code: "<script>alert(1)</script>" }));
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});

describe("a card a notification links to", () => {
  it("carries the anchor the link scrolls to", () => {
    expect(render(makeGroup())).toContain('id="solution-hash-a"');
  });

  it("has its discussion open, since that is what the notification was about", () => {
    const focused = render(makeGroup(), true);
    expect(focused).toContain('aria-expanded="true"');
    expect(render(makeGroup())).not.toContain('aria-expanded="true"');
  });
});
