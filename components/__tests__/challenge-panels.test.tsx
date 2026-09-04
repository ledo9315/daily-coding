import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import challenge from "@/messages/de/challenge.json";
import { ChallengePanels } from "@/components/challenge-result/challenge-panels";
import type { TestCase } from "@/components/test-results";

const render = (description: string, testResults: TestCase[]) =>
  renderToStaticMarkup(
    <NextIntlClientProvider locale="de" messages={{ challenge }}>
      <ChallengePanels description={description} testResults={testResults} />
    </NextIntlClientProvider>
  );

const testResults: TestCase[] = [
  {
    id: 1,
    name: "Einfaches Array",
    status: "passed",
    input: "[1,2,3]",
    expected: "[1,3,6]",
    actual: "[1,3,6]",
  },
  { id: 2, name: "Leeres Array", status: "failed", input: "[]", expected: "[]", actual: "null" },
];

describe("ChallengePanels", () => {
  it("renders both panels collapsed", () => {
    const html = render("Bilde die Präfixsumme.", testResults);
    expect(html).toContain(challenge.panels.task);
    expect(html).toContain(challenge.panels.testResults);
    expect(html).not.toContain('aria-expanded="true"');
    expect(html.match(/aria-expanded="false"/g)).toHaveLength(2);
  });

  it("shows the score in the trigger, so the panel need not be opened to read it", () => {
    const html = render("Bilde die Präfixsumme.", testResults);
    expect(html).toContain("1/2 bestanden");
  });

  /** The run below already carries input, expected and actual; a second list repeats it. */
  it("has no separate panel for the challenge's own test cases", () => {
    const html = render("Bilde die Präfixsumme.", testResults);
    expect(html).not.toContain("Testfälle");
  });

  it("leaves out the results panel when there was no run to show", () => {
    const html = render("Bilde die Präfixsumme.", []);
    expect(html).not.toContain(challenge.panels.testResults);
    expect(html.match(/aria-expanded="false"/g)).toHaveLength(1);
  });

  it("escapes a description that looks like markup", () => {
    const html = render("<script>alert(1)</script>", []);
    expect(html).not.toContain("<script>");
  });
});
