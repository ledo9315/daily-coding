import { describe, expect, it } from "vitest";
import { SolutionDiff } from "@/components/challenge-result/solution-diff";
import { renderWithIntl as render } from "@/components/__tests__/intl-render";
import de from "@/messages/de/community.json";

describe("SolutionDiff", () => {
  it("marks changed lines with a character, not only with a colour", () => {
    const html = render(
      <SolutionDiff
        mine={"const a = 1;\nreturn a;"}
        mineLanguage="javascript"
        theirs={"const a = 2;\nreturn a;"}
        theirsLanguage="javascript"
      />
    );
    expect(html).toContain(">-<");
    expect(html).toContain(">+<");
    expect(html).toContain(de.solutionDiff.legendOnlyMine);
    expect(html).toContain(de.solutionDiff.legendOnlyTheirs);
  });

  it("names identical code instead of showing an empty diff", () => {
    const html = render(
      <SolutionDiff
        mine={"const a = 1;\n"}
        mineLanguage="javascript"
        theirs={"const a = 1;"}
        theirsLanguage="javascript"
      />
    );
    expect(html).toContain(de.solutionDiff.identical);
    expect(html).not.toContain(de.solutionDiff.legendOnlyMine);
  });

  it("names a different language instead of diffing across it", () => {
    const html = render(
      <SolutionDiff
        mine="const a = 1;"
        mineLanguage="javascript"
        theirs="a = 1"
        theirsLanguage="python"
      />
    );
    expect(html).toContain("Python");
    expect(html).toContain("JavaScript");
    expect(html).not.toContain(de.solutionDiff.legendOnlyMine);
  });

  it("shows both sides and keeps the long lines inside their own scroller", () => {
    const html = render(
      <SolutionDiff
        mine="a"
        mineLanguage="javascript"
        theirs="b"
        theirsLanguage="javascript"
      />
    );
    expect(html).toContain(de.solutionDiff.columnMine);
    expect(html).toContain(de.solutionDiff.columnTheirs);
    expect(html.match(/overflow-x-auto/g)).toHaveLength(2);
    expect(html).toContain("md:flex-row");
  });
});
