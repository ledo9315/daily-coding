import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SolutionCard } from "@/components/challenge-result/solution-card";
import type { ChallengeSolutionGroup } from "@/lib/api";

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
    votes: { best_practices: 0, clever: 0 },
    myVotes: { best_practices: false, clever: false },
    ...overrides,
  };
}

describe("SolutionCard", () => {
  it("links the name to the public profile path", () => {
    const html = renderToStaticMarkup(<SolutionCard challengeId="ch-1" group={makeGroup()} />);
    expect(html).toContain('href="/u/lisa%20m%C3%BCller"');
  });

  it("keeps the code out of the markup while collapsed", () => {
    const html = renderToStaticMarkup(<SolutionCard challengeId="ch-1" group={makeGroup()} />);
    expect(html).not.toContain("const answer = 42;");
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain("Code anzeigen");
  });

  it("lists every named author and sums up the rest", () => {
    const html = renderToStaticMarkup(
      <SolutionCard
        challengeId="ch-1"
        group={makeGroup({
          authors: [
            { name: "Lisa Müller", initials: "LM", avatar: "", level: 4 },
            { name: "Bob Bauer", initials: "BB", avatar: "", level: 2 },
          ],
          submissionCount: 40,
        })}
      />
    );
    expect(html).toContain("Lisa Müller");
    expect(html).toContain("Bob Bauer");
    expect(html).toContain("+38 weitere");
    expect(html).toContain("40 Abgaben");
  });

  it("leaves out the rest count when the group is fully named", () => {
    const html = renderToStaticMarkup(<SolutionCard challengeId="ch-1" group={makeGroup()} />);
    expect(html).not.toContain("weitere");
    expect(html).toContain("1 Abgabe");
  });

  it("marks a revised single solution and leaves an unrevised one unmarked", () => {
    const revised = renderToStaticMarkup(
      <SolutionCard challengeId="ch-1" group={makeGroup({ revised: true })} />
    );
    const plain = renderToStaticMarkup(<SolutionCard challengeId="ch-1" group={makeGroup()} />);
    expect(revised).toContain("überarbeitet");
    expect(plain).not.toContain("überarbeitet");
  });

  it("does not claim a group of many was revised", () => {
    const html = renderToStaticMarkup(
      <SolutionCard challengeId="ch-1" group={makeGroup({ revised: true, submissionCount: 7 })} />
    );
    expect(html).not.toContain("überarbeitet");
  });

  it("marks the group the own solution belongs to", () => {
    const own = renderToStaticMarkup(<SolutionCard challengeId="ch-1" group={makeGroup({ own: true })} />);
    const other = renderToStaticMarkup(<SolutionCard challengeId="ch-1" group={makeGroup()} />);
    expect(own).toContain("Deine Lösung");
    expect(other).not.toContain("Deine Lösung");
  });

  it("escapes code that looks like markup", () => {
    const html = renderToStaticMarkup(
      <SolutionCard challengeId="ch-1" group={makeGroup({ code: "<script>alert(1)</script>" })} defaultOpen />
    );
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
