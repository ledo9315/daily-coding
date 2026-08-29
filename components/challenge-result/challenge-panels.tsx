"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { ChallengeTestCaseSpec } from "@/lib/api";

/**
 * Task description and test cases, both folded away.
 *
 * On the result page the code is the point, so neither belongs in the way — but reading a
 * foreign solution without being able to look the task up again is guesswork.
 */
export function ChallengePanels({
  description,
  testCases,
}: {
  description: string;
  testCases: ChallengeTestCaseSpec[];
}) {
  return (
    <Accordion type="multiple" className="mt-6 border-2 border-border px-4">
      <AccordionItem value="description">
        <AccordionTrigger className="text-sm uppercase tracking-wider hover:no-underline">
          Aufgabenstellung
        </AccordionTrigger>
        {/* pre-wrap, so a description may use paragraphs — nothing parses Markdown. */}
        <AccordionContent className="whitespace-pre-wrap text-base text-muted-foreground">
          {description}
        </AccordionContent>
      </AccordionItem>

      {testCases.length > 0 && (
        <AccordionItem value="test-cases" className="border-b-0">
          <AccordionTrigger className="text-sm uppercase tracking-wider hover:no-underline">
            Testfälle
            <span className="ml-auto mr-2 font-mono text-xs text-muted-foreground">
              {testCases.length}
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-3">
              {testCases.map((testCase) => (
                <li key={testCase.id} className="border border-border p-3">
                  <p className="text-sm font-bold">{testCase.name}</p>
                  <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                    <div className="min-w-0">
                      <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                        Eingabe
                      </dt>
                      <dd className="mt-1 overflow-x-auto font-code text-xs">
                        <pre>{testCase.input ?? "—"}</pre>
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                        Erwartet
                      </dt>
                      <dd className="mt-1 overflow-x-auto font-code text-xs">
                        <pre>{testCase.expected ?? "—"}</pre>
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  );
}
