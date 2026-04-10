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
 * Rohes stdout von Piston (z. B. PHP-Notices vor der JSON-Zeile) auf die nutzbare JSON-Ausgabe reduzieren.
 */
export function extractIoProgramOutput(raw: string): string {
  const t = raw.trim();
  if (!t) return t;

  const tryParse = (s: string): string | null => {
    try {
      JSON.parse(s);
      return s;
    } catch {
      return null;
    }
  };

  const whole = tryParse(t);
  if (whole != null) return whole;

  const lines = t.split(/\r?\n/u);
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i]!.trim();
    if (!line) continue;
    const parsed = tryParse(line);
    if (parsed != null) return parsed;
  }

  return t;
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
    case "php": {
      const body = /^<\?php\b/m.test(trimmed) ? trimmed : `<?php\n\n${trimmed}`;
      return `${body}

$__raw = trim(stream_get_contents(STDIN));
$__data = json_decode($__raw, true);
$__result = ${callable}($__data);
echo json_encode($__result, JSON_UNESCAPED_UNICODE);
`;
    }
    default: {
      const _exhaustive: never = language;
      return _exhaustive;
    }
  }
}
