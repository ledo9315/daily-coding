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
  fnRuby: string;
  /** Empty when the challenge has no Java support — see the schema for why that is a state. */
  fnJava: string;
  fnGo: string;
  starterJs: string;
  starterTs: string;
  starterPy: string;
  starterPhp: string;
  starterRuby: string;
  starterJava: string;
  starterGo: string;
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
    fnRuby: typeof cbl?.ruby === "string" ? cbl.ruby : "solve",
    // No "solve" fallback: an invented name would turn every edit into a Java-enabled challenge.
    fnJava: typeof cbl?.java === "string" ? cbl.java : "",
    fnGo: typeof cbl?.go === "string" ? cbl.go : "",
    starterJs: starters.javascript ?? "",
    starterTs: starters.typescript ?? "",
    starterPy: starters.python ?? "",
    starterPhp: starters.php ?? "",
    starterRuby: starters.ruby ?? "",
    starterJava: starters.java ?? "",
    starterGo: starters.go ?? "",
    isActive: ch.isActive,
    dateUtcDay: ch.date ? formatUtcDay(new Date(ch.date)) : "",
  };
}
