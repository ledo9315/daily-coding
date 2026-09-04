import { describe, expect, it } from "vitest";
import { SolutionVotes } from "@/components/challenge-result/solution-votes";
import type { ChallengeSolutionGroup } from "@/lib/api";
import { renderWithIntl } from "@/components/__tests__/intl-render";
import de from "@/messages/de/community.json";

function render(group: ChallengeSolutionGroup) {
  return renderWithIntl(<SolutionVotes challengeId="ch-1" group={group} />);
}

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
    commentCount: 0,
    votes: { best_practices: 2, clever: 7 },
    myVotes: { best_practices: false, clever: true },
    ...overrides,
  };
}

describe("SolutionVotes", () => {
  it("shows both counts and which vote the user has already cast", () => {
    const html = render(makeGroup());
    expect(html).toContain(de.solutionVotes.bestPractices);
    expect(html).toContain(de.solutionVotes.clever);
    expect(html).toContain(">2<");
    expect(html).toContain(">7<");
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(html.match(/aria-pressed="false"/g)).toHaveLength(1);
  });

  it("disables both buttons on the own solution and names the reason", () => {
    const html = render(makeGroup({ own: true }));
    expect(html.match(/disabled=""/g)).toHaveLength(2);
    expect(html).toContain(de.solutionVotes.ownDisabled);
  });
});
