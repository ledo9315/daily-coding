import type { CodeLanguageId } from "@/lib/challenge-languages";

/**
 * Compares program output against the expectation (trimmed, optionally with JSON
 * normalisation).
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
 * Reduces raw Piston stdout — which may carry e.g. PHP notices before the JSON
 * line — down to the usable JSON output.
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
 * Lines the Java wrapper puts above the user's code: the import, a blank line, the class header.
 * javac counts from the top of the generated file, so its line numbers are off by exactly this
 * much until someone subtracts it again.
 */
export const JAVA_HARNESS_LINE_OFFSET = 3;

/** Java literal plus the type it has, derived from one JSON value. */
type JavaTyped = { type: string; literal: string };

function javaStringLiteral(s: string): string {
  let out = '"';
  for (const ch of s) {
    const code = ch.codePointAt(0)!;
    if (ch === '"') out += '\\"';
    else if (ch === "\\") out += "\\\\";
    else if (ch === "\n") out += "\\n";
    else if (ch === "\r") out += "\\r";
    else if (ch === "\t") out += "\\t";
    else if (code < 0x20 || code > 0x7e) out += `\\u${code.toString(16).padStart(4, "0")}`;
    else out += ch;
  }
  return `${out}"`;
}

function javaNumber(n: number): JavaTyped {
  if (!Number.isInteger(n)) return { type: "double", literal: String(n) };
  if (n > 2147483647 || n < -2147483648) return { type: "long", literal: `${n}L` };
  return { type: "int", literal: String(n) };
}

function javaScalar(v: unknown): JavaTyped {
  if (typeof v === "number") return javaNumber(v);
  if (typeof v === "boolean") return { type: "boolean", literal: String(v) };
  if (typeof v === "string") return { type: "String", literal: javaStringLiteral(v) };
  throw new Error(
    `Java-Harness: Eingabewert vom Typ ${v === null ? "null" : typeof v} wird nicht unterstützt.`
  );
}

function javaTyped(v: unknown): JavaTyped {
  if (!Array.isArray(v)) return javaScalar(v);

  // An empty array carries no element type. int[] is the only sensible guess and matches every
  // seeded challenge whose test cases include one.
  if (v.length === 0) return { type: "int[]", literal: "new int[]{}" };

  const parts = v.map(javaScalar);
  const elem = parts.some((p) => p.type === "double")
    ? "double"
    : parts.some((p) => p.type === "long")
      ? "long"
      : parts[0]!.type;
  if (parts.some((p) => p.type !== elem && !(elem === "long" && p.type === "int") && !(elem === "double" && (p.type === "int" || p.type === "long")))) {
    throw new Error("Java-Harness: gemischte Array-Typen werden nicht unterstützt.");
  }
  const cast = elem === "long" ? (l: string) => (l.endsWith("L") ? l : `${l}L`) : (l: string) => l;
  return {
    type: `${elem}[]`,
    literal: `new ${elem}[]{${parts.map((p) => cast(p.literal)).join(",")}}`,
  };
}

/**
 * Arguments for one test case, as Java declarations plus the names to pass.
 *
 * A JSON object becomes one parameter per key, in key order — that is what makes
 * `binarySearch(int[] arr, int target)` read like Java instead of like a bag of values. Anything
 * else is a single parameter.
 */
export function buildJavaArguments(input: string): { decls: string[]; names: string[] } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch {
    throw new Error(`Java-Harness: Testeingabe ist kein gültiges JSON: ${input.slice(0, 80)}`);
  }

  if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
    const decls: string[] = [];
    const names: string[] = [];
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      const { type, literal } = javaTyped(value);
      decls.push(`        ${type} ${key} = ${literal};`);
      names.push(key);
    }
    return { decls, names };
  }

  const { type, literal } = javaTyped(parsed);
  return { decls: [`        ${type} __input = ${literal};`], names: ["__input"] };
}

/*
  Printing is resolved by overload, not by inference.

  The wrapper would otherwise have to know the return type to serialise it, which means a second
  schema next to the input types. Java picks the matching __out at compile time instead: an int
  prints bare, a String gets quotes, an int[] becomes a JSON array. Whatever is left lands on the
  Object overload.
*/
const JAVA_OUTPUT_HELPERS = String.raw`
    static void __out(int v) { System.out.print(v); }
    static void __out(long v) { System.out.print(v); }
    static void __out(double v) { System.out.print(v); }
    static void __out(boolean v) { System.out.print(v); }
    static void __out(char v) { System.out.print(__jsonStr(String.valueOf(v))); }
    static void __out(String v) { System.out.print(__jsonStr(v)); }
    static void __out(int[] v) { System.out.print(__joinInts(v)); }
    static void __out(long[] v) { StringBuilder b = new StringBuilder("["); for (int i = 0; i < v.length; i++) { if (i > 0) b.append(','); b.append(v[i]); } System.out.print(b.append(']')); }
    static void __out(double[] v) { StringBuilder b = new StringBuilder("["); for (int i = 0; i < v.length; i++) { if (i > 0) b.append(','); b.append(v[i]); } System.out.print(b.append(']')); }
    static void __out(boolean[] v) { StringBuilder b = new StringBuilder("["); for (int i = 0; i < v.length; i++) { if (i > 0) b.append(','); b.append(v[i]); } System.out.print(b.append(']')); }
    static void __out(String[] v) { StringBuilder b = new StringBuilder("["); for (int i = 0; i < v.length; i++) { if (i > 0) b.append(','); b.append(__jsonStr(v[i])); } System.out.print(b.append(']')); }
    static void __out(java.util.List<?> v) { System.out.print(__any(v)); }
    static void __out(Object v) { System.out.print(__any(v)); }

    static String __joinInts(int[] v) { StringBuilder b = new StringBuilder("["); for (int i = 0; i < v.length; i++) { if (i > 0) b.append(','); b.append(v[i]); } return b.append(']').toString(); }

    static String __any(Object v) {
        if (v == null) return "null";
        if (v instanceof String || v instanceof Character) return __jsonStr(v.toString());
        if (v instanceof Number || v instanceof Boolean) return v.toString();
        if (v instanceof int[]) return __joinInts((int[]) v);
        if (v instanceof java.util.List<?>) {
            StringBuilder b = new StringBuilder("[");
            boolean first = true;
            for (Object o : (java.util.List<?>) v) { if (!first) b.append(','); b.append(__any(o)); first = false; }
            return b.append(']').toString();
        }
        if (v instanceof Object[]) {
            StringBuilder b = new StringBuilder("[");
            Object[] arr = (Object[]) v;
            for (int i = 0; i < arr.length; i++) { if (i > 0) b.append(','); b.append(__any(arr[i])); }
            return b.append(']').toString();
        }
        return __jsonStr(v.toString());
    }

    static String __jsonStr(String s) {
        if (s == null) return "null";
        StringBuilder b = new StringBuilder("\"");
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '"') b.append("\\\"");
            else if (c == '\\') b.append("\\\\");
            else if (c == '\n') b.append("\\n");
            else if (c == '\r') b.append("\\r");
            else if (c == '\t') b.append("\\t");
            else if (c < 0x20) b.append(String.format("\\u%04x", (int) c));
            else b.append(c);
        }
        return b.append('"').toString();
    }
`;

/**
 * Wraps user code into a complete program: reads one JSON line from stdin, calls
 * callable(data), writes JSON.stringify(result) to stdout.
 *
 * Java is the exception. It has no untyped `data`, and Piston's image ships no JSON library, so
 * the test input is baked in as typed literals instead of parsed at runtime — which is why this
 * function needs `input` for Java and ignores it everywhere else.
 */
export function buildWrappedProgram(
  language: CodeLanguageId,
  userCode: string,
  callable: string,
  input?: string
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
      /*
        Piston type-checks TypeScript before running it, and its image has no @types/node, so
        the `require` and `process` the harness needs failed with TS2580 — every TypeScript
        submission came back as 0/5 with a compiler error instead of a test result. Declaring
        exactly the two members used is enough and keeps the user's own type errors reportable,
        which `// @ts-nocheck` would swallow.
      */
      return `${trimmed}

declare function require(id: string): { readFileSync(fd: number, encoding: string): string };
declare const process: { stdout: { write(text: string): void } };

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
    case "java": {
      if (input == null) {
        throw new Error("Java-Harness: ohne Testeingabe kann kein Programm gebaut werden.");
      }
      const { decls, names } = buildJavaArguments(input);
      const indented = trimmed
        .split("\n")
        .map((line) => (line.trim() ? `    ${line}` : line))
        .join("\n");
      return `import java.util.*;

public class Main {
${indented}
${JAVA_OUTPUT_HELPERS}
    public static void main(String[] args) {
${decls.join("\n")}
        __out(${callable}(${names.join(", ")}));
    }
}
`;
    }
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
