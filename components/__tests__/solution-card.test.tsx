import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SolutionCard } from "@/components/challenge-result/solution-card";
import type { ChallengeSolution } from "@/lib/api";

function makeSolution(overrides: Partial<ChallengeSolution> = {}): ChallengeSolution {
  return {
    id: "sub-1",
    user: { name: "Lisa Müller", initials: "LM", avatar: "", level: 4 },
    language: "javascript",
    code: "const answer = 42;",
    createdAt: "2026-08-01T10:00:00.000Z",
    revised: false,
    ...overrides,
  };
}

describe("SolutionCard", () => {
  it("links the name to the public profile path", () => {
    const html = renderToStaticMarkup(<SolutionCard solution={makeSolution()} />);
    expect(html).toContain('href="/u/lisa%20m%C3%BCller"');
  });

  it("keeps the code out of the markup while collapsed", () => {
    const html = renderToStaticMarkup(<SolutionCard solution={makeSolution()} />);
    expect(html).not.toContain("const answer = 42;");
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain("Code anzeigen");
  });

  it("marks a revised solution and leaves an unrevised one unmarked", () => {
    const revised = renderToStaticMarkup(
      <SolutionCard solution={makeSolution({ revised: true })} />
    );
    const plain = renderToStaticMarkup(<SolutionCard solution={makeSolution()} />);
    expect(revised).toContain("überarbeitet");
    expect(plain).not.toContain("überarbeitet");
  });

  it("escapes code that looks like markup", () => {
    const html = renderToStaticMarkup(
      <SolutionCard
        solution={makeSolution({ code: "<script>alert(1)</script>" })}
        defaultOpen
      />
    );
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
