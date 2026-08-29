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
 * including the people who wanted to work it out - and a challenge that awards points and a
 * daily rank should not do that. Collapsed, help costs nothing to whoever does not want it.
 *
 * `type="multiple"`: the steps build on each other, so reading step 2 must not close step 1.
 */
export function ChallengeHints({ hints }: { hints: ChallengeHint[] }) {
  if (hints.length === 0) return null;

  return (
    <div className="border-2 border-amber-500/25 bg-amber-500/[0.04] shadow-[4px_4px_0_0_rgba(245,158,11,0.12)]">
      <div className="flex items-center gap-2 border-b-2 border-amber-500/20 bg-amber-500/[0.06] px-4 py-2">
        <Lightbulb className="h-4 w-4 shrink-0 text-accent" fill="currentColor" />
        <span className="font-sans text-sm uppercase tracking-wider text-accent">Hinweise</span>
        <span className="ml-auto font-mono text-xs text-accent/50">
          {hints.length} {hints.length === 1 ? "Stufe" : "Stufen"}
        </span>
      </div>

      <Accordion type="multiple" className="px-4">
        {hints.map((hint, index) => (
          <AccordionItem key={index} value={`hint-${index}`} className="border-amber-500/15">
            <AccordionTrigger className="group text-accent/90 hover:text-accent hover:no-underline">
              <span className="flex items-center gap-3 font-medium">
                <span className="font-mono text-xs text-accent/40 transition-colors group-hover:text-accent/70">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {hint.title}
              </span>
            </AccordionTrigger>
            {/* Indented to the title, not the number, so the step reads as one block. */}
            <AccordionContent className="whitespace-pre-wrap pl-8 text-base text-accent/80">
              {hint.body}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
