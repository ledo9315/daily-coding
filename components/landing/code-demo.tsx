"use client";

import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from "@/components/ui/terminal";

export function LandingCodeDemo() {
  return (
    <section className="py-24 bg-card/50 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Text Content */}
          <div className="flex-1 space-y-8">
            <h2 className="font-heading text-3xl sm:text-4xl">
              REALER CODE, <br />
              <span className="text-chart-5 retro-glow">ECHTE ERGEBNISSE</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Keine Drag & Drop Puzzles. Löse echte Probleme in deiner
              Lieblingssprache. Nutze deine vorhandenen Tools oder unseren
              integrierten Editor.
            </p>
          </div>

          {/* Terminal Demo */}
          <div className="flex-1 w-full max-w-lg">
            <Terminal className="w-full bg-black/90 shadow-2xl border-border">
              <TypingAnimation>&gt; test transform-array</TypingAnimation>

              <AnimatedSpan delay={1500} className="text-muted-foreground">
                <span>Running tests for &quot;Array Manipulation&quot;...</span>
              </AnimatedSpan>

              <AnimatedSpan delay={2500} className="text-success font-bold">
                <span>✔ Test 1: Einfaches Array passed (12ms)</span>
              </AnimatedSpan>

              <AnimatedSpan delay={3000} className="text-success font-bold">
                <span>✔ Test 2: Leeres Array passed (8ms)</span>
              </AnimatedSpan>

              <AnimatedSpan delay={3500} className="text-success font-bold">
                <span>✔ Test 3: Negative Zahlen passed (10ms)</span>
              </AnimatedSpan>

              <AnimatedSpan delay={4000} className="text-success font-bold">
                <span>✔ Test 4: Großes Array passed (45ms)</span>
              </AnimatedSpan>

              <AnimatedSpan
                delay={4500}
                className="text-primary font-bold mt-2"
              >
                <span>All tests passed! +150 XP. Streak updated. 🔥</span>
              </AnimatedSpan>
              <TypingAnimation delay={5500}>&gt; </TypingAnimation>
            </Terminal>
          </div>
        </div>
      </div>
    </section>
  );
}
