"use client";

import { Lightbulb } from "@nsmr/pixelart-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { ChallengeHint } from "@/lib/challenge-hints";

/**
 * Help in unfoldable steps instead of one open box.
 *
 * A single always-visible sentence handed the approach to everyone who opened the page,
 * including the people who wanted to work it out — and a challenge that awards points and a
 * daily rank should not do that. Collapsed, help costs nothing to whoever does not want it.
 *
 * `type="multiple"`: the steps build on each other, so reading step 2 must not close step 1.
 */
export function ChallengeHints({ hints }: { hints: ChallengeHint[] }) {
  if (hints.length === 0) return null;

  return (
    <div className="border border-amber-500/30 bg-amber-500/10 px-4">
      <Accordion type="multiple">
        {hints.map((hint, index) => (
          <AccordionItem
            key={index}
            value={`hint-${index}`}
            className="border-amber-500/20"
          >
            <AccordionTrigger className="text-accent hover:no-underline">
              <span className="flex items-center gap-2 font-medium">
                <Lightbulb className="h-4 w-4 shrink-0" fill="currentColor" />
                {hint.title}
              </span>
            </AccordionTrigger>
            <AccordionContent className="whitespace-pre-wrap text-base text-accent/90">
              {hint.body}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
