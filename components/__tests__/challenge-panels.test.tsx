import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ChallengePanels } from "@/components/challenge-result/challenge-panels";

const testCases = [
  { id: 1, name: "Einfaches Array", input: "[1,2,3]", expected: "[1,3,6]" },
  { id: 2, name: "Leeres Array", input: "[]", expected: "[]" },
];

describe("ChallengePanels", () => {
  it("renders both panels collapsed", () => {
    const html = renderToStaticMarkup(
      <ChallengePanels description="Bilde die Präfixsumme." testCases={testCases} />
    );
    expect(html).toContain("Aufgabenstellung");
    expect(html).toContain("Testfälle");
    expect(html).not.toContain('aria-expanded="true"');
    expect(html.match(/aria-expanded="false"/g)).toHaveLength(2);
  });

  it("leaves out the test-case panel when the challenge has none", () => {
    const html = renderToStaticMarkup(
      <ChallengePanels description="Bilde die Präfixsumme." testCases={[]} />
    );
    expect(html).not.toContain("Testfälle");
    expect(html.match(/aria-expanded="false"/g)).toHaveLength(1);
  });

  it("escapes a description that looks like markup", () => {
    const html = renderToStaticMarkup(
      <ChallengePanels description="<script>alert(1)</script>" testCases={[]} />
    );
    expect(html).not.toContain("<script>");
  });
});
