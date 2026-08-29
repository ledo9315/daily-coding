import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SolutionDiff } from "@/components/challenge-result/solution-diff";

describe("SolutionDiff", () => {
  it("marks changed lines with a character, not only with a colour", () => {
    const html = renderToStaticMarkup(
      <SolutionDiff
        mine={"const a = 1;\nreturn a;"}
        mineLanguage="javascript"
        theirs={"const a = 2;\nreturn a;"}
        theirsLanguage="javascript"
      />
    );
    expect(html).toContain(">-<");
    expect(html).toContain(">+<");
    expect(html).toContain("nur bei dir");
    expect(html).toContain("nur hier");
  });

  it("names identical code instead of showing an empty diff", () => {
    const html = renderToStaticMarkup(
      <SolutionDiff
        mine={"const a = 1;\n"}
        mineLanguage="javascript"
        theirs={"const a = 1;"}
        theirsLanguage="javascript"
      />
    );
    expect(html).toContain("Zeile für Zeile");
    expect(html).not.toContain("nur bei dir");
  });

  it("names a different language instead of diffing across it", () => {
    const html = renderToStaticMarkup(
      <SolutionDiff
        mine="const a = 1;"
        mineLanguage="javascript"
        theirs="a = 1"
        theirsLanguage="python"
      />
    );
    expect(html).toContain("Python");
    expect(html).toContain("JavaScript");
    expect(html).not.toContain("nur bei dir");
  });

  it("shows both sides and keeps the long lines inside their own scroller", () => {
    const html = renderToStaticMarkup(
      <SolutionDiff
        mine="a"
        mineLanguage="javascript"
        theirs="b"
        theirsLanguage="javascript"
      />
    );
    expect(html).toContain("Deine Lösung");
    expect(html).toContain("Diese Lösung");
    expect(html.match(/overflow-x-auto/g)).toHaveLength(2);
    expect(html).toContain("md:flex-row");
  });
});
