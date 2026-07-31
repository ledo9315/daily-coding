"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  CODE_LANGUAGES,
  languageFileName,
  type CodeLanguageId,
} from "@/lib/challenge-languages";
import {
  TerminalAnimationBlinkingCursor,
  TerminalAnimationCommandBar,
  TerminalAnimationContainer,
  TerminalAnimationContent,
  TerminalAnimationOutput,
  TerminalAnimationRoot,
  TerminalAnimationTabList,
  TerminalAnimationTabTrigger,
  TerminalAnimationTrailingPrompt,
  TerminalAnimationWindow,
  type TabContent,
  type TerminalLine,
} from "@/components/ui/terminal-animation";

const DIM = "text-muted-foreground/70";
const PASS = "text-emerald-400";
const CODE = "text-foreground/85";
const RESULT = "text-primary";

/**
 * The solution in each language, plus the entry point the harness actually calls.
 *
 * Switching tabs has to show something that genuinely differs. Four near-identical test logs
 * that changed only after `--lang=` carried no information at all. The signature does: Python
 * is called as `binary_search` and reads the input as a dict, TypeScript carries its types,
 * PHP its sigils. That is the answer to "is my language properly supported, or transpiled?".
 *
 * Entry points match `evaluationConfig.callableByLanguage` in the seed — snake_case for Python,
 * camelCase everywhere else.
 */
const SOLUTIONS: Record<
  CodeLanguageId,
  { entry: string; code: string[]; ms: number[] }
> = {
  javascript: {
    ms: [12, 9, 10, 11, 7],
    entry: "binarySearch",
    code: [
      "function binarySearch({ arr, target }) {",
      "  let low = 0, high = arr.length - 1",
      "  while (low <= high) {",
      "    const mid = (low + high) >> 1",
      "    if (arr[mid] === target) return mid",
      "    if (arr[mid] < target) low = mid + 1",
      "    else high = mid - 1",
      "  }",
      "  return -1",
      "}",
    ],
  },
  typescript: {
    ms: [18, 14, 15, 14, 11],
    entry: "binarySearch",
    code: [
      "type In = { arr: number[]; target: number }",
      "function binarySearch({ arr, target }: In): number {",
      "  let low = 0, high = arr.length - 1",
      "  while (low <= high) {",
      "    const mid = (low + high) >> 1",
      "    if (arr[mid] === target) return mid",
      "    if (arr[mid] < target) low = mid + 1",
      "    else high = mid - 1",
      "  }",
      "  return -1",
      "}",
    ],
  },
  python: {
    ms: [21, 16, 17, 16, 12],
    entry: "binary_search",
    code: [
      "def binary_search(data):",
      '    arr, target = data["arr"], data["target"]',
      "    low, high = 0, len(arr) - 1",
      "    while low <= high:",
      "        mid = (low + high) // 2",
      "        if arr[mid] == target: return mid",
      "        if arr[mid] < target: low = mid + 1",
      "        else: high = mid - 1",
      "    return -1",
    ],
  },
  php: {
    ms: [24, 19, 20, 19, 14],
    entry: "binarySearch",
    code: [
      "function binarySearch($data) {",
      "    $arr = $data['arr']; $target = $data['target'];",
      "    $low = 0; $high = count($arr) - 1;",
      "    while ($low <= $high) {",
      "        $mid = intdiv($low + $high, 2);",
      "        if ($arr[$mid] === $target) return $mid;",
      "        if ($arr[$mid] < $target) $low = $mid + 1;",
      "        else $high = $mid - 1;",
      "    }",
      "    return -1;",
      "}",
    ],
  },
};

/**
 * The five test cases of the Binary Search challenge, verbatim from `prisma/seed.ts:357`, padded
 * to a fixed width so the timings line up — the output renders with `whitespace-pre`.
 */
const TESTS = [
  "Wert in der Mitte",
  "Erstes Element",
  "Letztes Element",
  "Nicht vorhanden",
  "Leeres Array",
];

/** What the challenge is worth in the seed (`prisma/seed.ts:389`) — not a made-up number. */
const POINTS = 120;

/**
 * Derived from CODE_LANGUAGES, so the landing cannot claim a smaller set than the app accepts.
 *
 * Exported for the test: the terminal starts at zero visible lines, so nothing but the tab
 * labels and the command reaches the server-rendered markup. The content is data, and that is
 * where it can be checked.
 */
export const terminalTabs: TabContent[] = CODE_LANGUAGES.map((lang) => ({
  label: lang,
  command: `daily test --lang=${lang}`,
  lines: [
    { text: "", delay: 60 },
    { text: `  ${languageFileName(lang)}`, color: DIM, delay: 240 },
    ...SOLUTIONS[lang].code.map((text) => ({ text: `  ${text}`, color: CODE, delay: 85 })),
    { text: "", delay: 60 },
    ...TESTS.map((name, i) => ({
      text: `  ✔ ${name.padEnd(19)}(${SOLUTIONS[lang].ms[i]} ms)`,
      color: PASS,
      delay: 130,
    })),
    { text: "", delay: 60 },
    {
      text: `  ${TESTS.length}/${TESTS.length} bestanden · aufgerufen als ${SOLUTIONS[lang].entry}()`,
      color: RESULT,
      delay: 280,
    },
    { text: `  +${POINTS} Punkte, Streak +1 🔥`, color: RESULT, delay: 220 },
  ],
}));

export function LandingCodeDemo() {
  return (
    <div className="overflow-hidden py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Text Content */}
          <motion.div
            className="flex-1 space-y-8"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
          >
            <h2 className="font-heading text-3xl sm:text-4xl">
              REALER CODE, <br />
              <span className="text-chart-5 retro-glow">ECHTE ERGEBNISSE</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Keine Drag &amp; Drop Puzzles. Löse echte Probleme in deiner
              Lieblingssprache. Nutze deine vorhandenen Tools oder unseren
              integrierten Editor.
            </p>
          </motion.div>

          {/* Terminal Demo */}
          <motion.div
            className="flex-1 w-full max-w-xl"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
              duration: 0.8,
              type: "spring",
              bounce: 0.3,
              delay: 0.2,
            }}
          >
            {/* alwaysDark: the terminal is a screenshot of a shell, dark in either theme. */}
            <TerminalAnimationRoot
              alwaysDark
              className="relative flex w-full justify-center overflow-clip"
              hideCursorOnComplete={false}
              tabs={terminalTabs}
            >
              {/*
                No BackgroundGradient, and the container's top padding removed. Upstream lets
                the terminal rise out of a full-bleed colour panel (`pt-28` plus `rounded-t-xl`
                only), which in this two-column section left a stray violet slab above a box
                cut off at the bottom. Rounded on all four sides it reads as what it is: a
                terminal window.
              */}
              <TerminalAnimationContainer className="max-w-xl px-0 pt-0 md:pt-0">
                <TerminalAnimationWindow
                  /* Darker than the page and than `bg-card`, so the window reads as a screen. */
                  className="h-[22rem] rounded-xl border border-border shadow-2xl"
                  minHeight="0"
                >
                  {/*
                    The window owns the height; this fills what is left of it. `min-h-0` is the
                    load-bearing part: a flex child defaults to `min-height: auto` and therefore
                    refuses to shrink below its content, which is why a fixed height here grew
                    anyway. With it, `justify-end` keeps the newest line at the bottom, overflow
                    leaves at the top, and the mask fades the edge instead of slicing a line in
                    half. No scroll handler needed.
                  */}
                  <TerminalAnimationContent className="flex min-h-0 flex-col justify-end overflow-hidden mask-[linear-gradient(to_bottom,transparent_0,black_2.5rem)]">
                    <div className="flex items-center gap-2 leading-relaxed">
                      <span className="select-none font-code text-muted-foreground text-xs sm:text-sm">
                        $
                      </span>
                      <TerminalAnimationCommandBar
                        className="font-code text-foreground text-xs sm:text-sm"
                        cursor={<TerminalAnimationBlinkingCursor />}
                      />
                    </div>

                    <TerminalAnimationOutput
                      className="mt-1"
                      renderLine={(line: TerminalLine, _i: number, visible: boolean) =>
                        visible ? (
                          <div className="leading-relaxed">
                            <span
                              className={cn(
                                "font-code text-xs sm:text-sm whitespace-pre",
                                line.color ?? CODE
                              )}
                            >
                              {line.text || " "}
                            </span>
                          </div>
                        ) : null
                      }
                    />
                    <TerminalAnimationTrailingPrompt className="mt-1 flex items-center gap-2 leading-relaxed">
                      <span className="select-none font-code text-muted-foreground text-xs sm:text-sm">
                        $
                      </span>
                      <TerminalAnimationBlinkingCursor />
                    </TerminalAnimationTrailingPrompt>
                  </TerminalAnimationContent>

                  <div className="flex justify-center pb-6">
                    <TerminalAnimationTabList className="inline-flex items-center gap-0 rounded-lg border border-border bg-muted/50 px-1 py-1">
                      {terminalTabs.map((tab, i) => (
                        <TerminalAnimationTabTrigger
                          className={cn(
                            "cursor-pointer rounded-md px-2.5 py-1 font-code text-xs transition-all duration-150 sm:px-3.5 sm:text-sm",
                            "data-[state=active]:bg-primary data-[state=active]:font-medium data-[state=active]:text-primary-foreground",
                            "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
                          )}
                          index={i}
                          key={tab.label}
                        >
                          {tab.label}
                        </TerminalAnimationTabTrigger>
                      ))}
                    </TerminalAnimationTabList>
                  </div>
                </TerminalAnimationWindow>
              </TerminalAnimationContainer>
            </TerminalAnimationRoot>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
