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
 * On the result page the code is the point, so neither belongs in the way. But reading a
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
  const allPassed = testResults.length > 0 && passed === testResults.length;

  return (
    <Accordion type="multiple" className="mt-6 border-2 border-border bg-card px-4">
      <AccordionItem
        value="description"
        className={testResults.length === 0 ? "border-b-0" : ""}
      >
        <AccordionTrigger className="py-4 text-base uppercase tracking-wider hover:no-underline data-[state=open]:text-primary">
          Aufgabenstellung
        </AccordionTrigger>
        {/* pre-wrap, so a description may use paragraphs. Nothing parses Markdown. */}
        <AccordionContent className="whitespace-pre-wrap pb-5 text-lg leading-relaxed text-foreground/80">
          {description}
        </AccordionContent>
      </AccordionItem>

      {testResults.length > 0 && (
        <AccordionItem value="test-results" className="border-b-0">
          <AccordionTrigger className="py-4 text-base uppercase tracking-wider hover:no-underline data-[state=open]:text-primary">
            Testergebnisse
            <span
              className={`ml-auto mr-3 shrink-0 border px-2 py-0.5 font-code text-xs ${
                allPassed
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-secondary text-muted-foreground"
              }`}
            >
              {passed}/{testResults.length} bestanden
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-5">
            <TestResults testCases={testResults} hideHeader className="border-0" />
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  );
}
