import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SolutionVotes } from "@/components/challenge-result/solution-votes";
import type { ChallengeSolutionGroup } from "@/lib/api";

function makeGroup(overrides: Partial<ChallengeSolutionGroup> = {}): ChallengeSolutionGroup {
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
    votes: { best_practices: 2, clever: 7 },
    myVotes: { best_practices: false, clever: true },
    ...overrides,
  };
}

describe("SolutionVotes", () => {
  it("shows both counts and which vote the user has already cast", () => {
    const html = renderToStaticMarkup(
      <SolutionVotes challengeId="ch-1" group={makeGroup()} />
    );
    expect(html).toContain("Best Practices");
    expect(html).toContain("Clever");
    expect(html).toContain(">2<");
    expect(html).toContain(">7<");
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(html.match(/aria-pressed="false"/g)).toHaveLength(1);
  });

  it("disables both buttons on the own solution and names the reason", () => {
    const html = renderToStaticMarkup(
      <SolutionVotes challengeId="ch-1" group={makeGroup({ own: true })} />
    );
    expect(html.match(/disabled=""/g)).toHaveLength(2);
    expect(html).toContain("Die eigene Lösung kannst du nicht bewerten.");
  });
});
