import type { CodeLanguageId } from "@/lib/challenge-languages";

/**
 * Vergleicht Programmausgabe mit Erwartung (trim, optional JSON-Normalisierung).
 */
export function outputsMatch(actual: string, expected: string): boolean {
  const a = actual.trim();
  const b = expected.trim();
  if (a === b) return true;
  try {
    const ja = JSON.parse(a);
    const jb = JSON.parse(b);
    return JSON.stringify(ja) === JSON.stringify(jb);
  } catch {
    return false;
  }
}

/**
 * User-Code zu einem vollständigen Programm: liest eine JSON-Zeile von stdin, ruft callable(data), schreibt JSON.stringify(result) nach stdout.
 */
export function buildWrappedProgram(
  language: CodeLanguageId,
  userCode: string,
  callable: string
): string {
  const trimmed = userCode.replace(/\s+$/u, "");
  switch (language) {
    case "javascript":
      return `${trimmed}

const fs = require('fs');
const raw = fs.readFileSync(0, 'utf8').trim();
const data = JSON.parse(raw);
const result = ${callable}(data);
process.stdout.write(JSON.stringify(result));
`;
    case "typescript":
      return `${trimmed}

const fs = require('fs');
const raw = fs.readFileSync(0, 'utf8').trim();
const data = JSON.parse(raw);
const result = ${callable}(data);
process.stdout.write(JSON.stringify(result));
`;
    case "python":
      return `${trimmed}

import sys, json
_raw = sys.stdin.read().strip()
_data = json.loads(_raw)
_result = ${callable}(_data)
sys.stdout.write(json.dumps(_result))
`;
    default: {
      const _exhaustive: never = language;
      return _exhaustive;
    }
  }
}
