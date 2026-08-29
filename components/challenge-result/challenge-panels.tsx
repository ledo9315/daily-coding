"use client";

import { TestResults, type TestCase } from "@/components/test-results";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * Task description and the own test run, both folded away.
 *
 * On the result page the code is the point, so neither belongs in the way — but reading a
 * foreign solution without being able to look the task up again is guesswork.
 *
 * The challenge's own test cases are deliberately not a third panel: the run below already
 * shows input and expected output per case, plus what the code actually returned.
 */
export function ChallengePanels({
  description,
  testResults,
}: {
  description: string;
  testResults: TestCase[];
}) {
  const passed = testResults.filter((testCase) => testCase.status === "passed").length;

  return (
    <Accordion type="multiple" className="mt-6 border-2 border-border px-4">
      <AccordionItem value="description" className={testResults.length === 0 ? "border-b-0" : ""}>
        <AccordionTrigger className="text-sm uppercase tracking-wider hover:no-underline">
          Aufgabenstellung
        </AccordionTrigger>
        {/* pre-wrap, so a description may use paragraphs — nothing parses Markdown. */}
        <AccordionContent className="whitespace-pre-wrap text-base text-muted-foreground">
          {description}
        </AccordionContent>
      </AccordionItem>

      {testResults.length > 0 && (
        <AccordionItem value="test-results" className="border-b-0">
          <AccordionTrigger className="text-sm uppercase tracking-wider hover:no-underline">
            Testergebnisse
            <span
              className={`ml-auto mr-2 font-mono text-xs ${
                passed === testResults.length ? "text-emerald-500" : "text-muted-foreground"
              }`}
            >
              {passed}/{testResults.length} bestanden
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <TestResults testCases={testResults} hideHeader className="border-0" />
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  );
}
