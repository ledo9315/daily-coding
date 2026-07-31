import type { Challenge } from "@/lib/generated/prisma/client";
import { parseEvaluationConfig } from "@/lib/server/challenge-execution";
import { normalizeHints } from "@/lib/challenge-hints";

function jsonPretty(value: unknown): string {
  if (value === null || value === undefined) return "[]";
  return JSON.stringify(value, null, 2);
}

/** UTC calendar day as `YYYY-MM-DD`, the format `<input type="date">` expects. */
function formatUtcDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export type ChallengeFormInitial = {
  id: string;
  title: string;
  description: string;
  hintsJson: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  categoryId: string;
  examplesJson: string;
  testsJson: string;
  fnJs: string;
  fnTs: string;
  fnPy: string;
  fnPhp: string;
  starterJs: string;
  starterTs: string;
  starterPy: string;
  starterPhp: string;
  isActive: boolean;
  dateUtcDay: string;
};

export function challengeToFormInitial(ch: Challenge): ChallengeFormInitial {
  const examples = ch.examples;
  const testCases = ch.testCases;
  const evalCfg = parseEvaluationConfig(ch.evaluationConfig);
  const cbl = evalCfg?.callableByLanguage;

  const starters =
    ch.starterCodes &&
    typeof ch.starterCodes === "object" &&
    !Array.isArray(ch.starterCodes)
      ? (ch.starterCodes as Record<string, string>)
      : {};

  return {
    id: ch.id,
    title: ch.title,
    description: ch.description,
    hintsJson: jsonPretty(normalizeHints(ch.hints)),
    difficulty: ch.difficulty,
    points: ch.points,
    categoryId: ch.categoryId,
    examplesJson: jsonPretty(examples),
    testsJson: jsonPretty(testCases),
    fnJs: typeof cbl?.javascript === "string" ? cbl.javascript : "solve",
    fnTs: typeof cbl?.typescript === "string" ? cbl.typescript : "solve",
    fnPy: typeof cbl?.python === "string" ? cbl.python : "solve",
    fnPhp: typeof cbl?.php === "string" ? cbl.php : "solve",
    starterJs: starters.javascript ?? "",
    starterTs: starters.typescript ?? "",
    starterPy: starters.python ?? "",
    starterPhp: starters.php ?? "",
    isActive: ch.isActive,
    dateUtcDay: ch.date ? formatUtcDay(new Date(ch.date)) : "",
  };
}
