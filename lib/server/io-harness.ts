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
const JAVA_HEADER_LINES = ["import java.util.*;", "", "public class Main {"];
export const JAVA_HARNESS_LINE_OFFSET = JAVA_HEADER_LINES.length;

/*
  Go's header carries more than the harness needs, on purpose.

  Imports live at the top of the file, inside this block — a solution cannot add its own. Without
  strconv there is no int-to-string conversion, which makes FizzBuzz unsolvable in idiomatic Go;
  the same goes for strings, sort and the rest. Go then rejects an import nobody uses, so each
  one is consumed by a blank assignment below.
*/
const GO_HEADER_LINES = [
  "package main",
  "",
  "import (",
  '\t"encoding/json"',
  '\t"fmt"',
  '\t"math"',
  '\t"os"',
  '\t"reflect"',
  '\t"sort"',
  '\t"strconv"',
  '\t"strings"',
  '\t"unicode"',
  ")",
  "",
  "var (",
  "\t_ = fmt.Sprint",
  "\t_ = math.Abs",
  "\t_ = sort.Ints",
  "\t_ = strconv.Itoa",
  "\t_ = strings.ToLower",
  "\t_ = unicode.IsLetter",
  ")",
  "",
];
/** Derived, not counted by hand: the header grows and the offset has to follow. */
export const GO_HARNESS_LINE_OFFSET = GO_HEADER_LINES.length;

/**
 * The shape of one argument, derived from a test case's JSON.
 *
 * Shared by every typed language: the classification — scalar or array, which element type, what
 * counts as unsupported — is the same everywhere, only the literal syntax differs. Java and Go
 * each render this into their own form.
 */
type ScalarKind = "int" | "long" | "double" | "bool" | "string";
type ArgShape =
  | { kind: ScalarKind; value: number | boolean | string }
  | { kind: "array"; elem: ScalarKind; values: (number | boolean | string)[] };

/**
 * Escaped string literal, valid in both Java and Go — they agree on \" \\ \n \r \t and \uXXXX.
 * Everything outside printable ASCII is escaped so the generated source stays byte-safe.
 */
function quoteStringLiteral(s: string): string {
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

function scalarKind(v: unknown): ScalarKind {
  if (typeof v === "number") {
    if (!Number.isInteger(v)) return "double";
    return v > 2147483647 || v < -2147483648 ? "long" : "int";
  }
  if (typeof v === "boolean") return "bool";
  if (typeof v === "string") return "string";
  throw new Error(
    `Typisierter Harness: Eingabewert vom Typ ${v === null ? "null" : typeof v} wird nicht unterstützt.`
  );
}

/** int widens to long widens to double; anything else mixed is a refusal. */
function widestKind(kinds: ScalarKind[]): ScalarKind {
  if (kinds.includes("double")) return "double";
  if (kinds.includes("long")) return "long";
  return kinds[0]!;
}

function classify(v: unknown): ArgShape {
  if (!Array.isArray(v)) return { kind: scalarKind(v), value: v as number | boolean | string };

  // An empty array carries no element type. int is the only sensible guess and matches every
  // seeded challenge whose test cases include one.
  if (v.length === 0) return { kind: "array", elem: "int", values: [] };

  const kinds = v.map(scalarKind);
  const elem = widestKind(kinds);
  const numeric: ScalarKind[] = ["int", "long", "double"];
  const compatible = kinds.every((k) => k === elem || (numeric.includes(k) && numeric.includes(elem)));
  if (!compatible) {
    throw new Error("Typisierter Harness: gemischte Array-Typen werden nicht unterstützt.");
  }
  return { kind: "array", elem, values: v as (number | boolean | string)[] };
}

/**
 * One entry per parameter of the user's function.
 *
 * A JSON object becomes one parameter per key, in key order — that is what makes
 * `binarySearch(int[] arr, int target)` read like Java instead of like a bag of values. Anything
 * else is a single parameter called `__input`.
 */
function inferArguments(input: string, language: string): { name: string; shape: ArgShape }[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch {
    throw new Error(`${language}-Harness: Testeingabe ist kein gültiges JSON: ${input.slice(0, 80)}`);
  }

  if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
    return Object.entries(parsed as Record<string, unknown>).map(([name, value]) => ({
      name,
      shape: classify(value),
    }));
  }
  return [{ name: "__input", shape: classify(parsed) }];
}

const JAVA_TYPE: Record<ScalarKind, string> = {
  int: "int",
  long: "long",
  double: "double",
  bool: "boolean",
  string: "String",
};

function javaLiteral(kind: ScalarKind, value: number | boolean | string): string {
  if (kind === "string") return quoteStringLiteral(String(value));
  if (kind === "long") return `${value}L`;
  return String(value);
}

/** Go's `int` is 64 bit on every platform Piston runs, so long and int are the same type here. */
const GO_TYPE: Record<ScalarKind, string> = {
  int: "int",
  long: "int",
  double: "float64",
  bool: "bool",
  string: "string",
};

function goLiteral(kind: ScalarKind, value: number | boolean | string): string {
  return kind === "string" ? quoteStringLiteral(String(value)) : String(value);
}

/** Java declarations for one test case, plus the names to pass to the user's method. */
export function buildJavaArguments(input: string): { decls: string[]; names: string[] } {
  const args = inferArguments(input, "Java");
  const decls = args.map(({ name, shape }) => {
    if (shape.kind === "array") {
      const t = JAVA_TYPE[shape.elem];
      const items = shape.values.map((v) => javaLiteral(shape.elem, v)).join(",");
      return `        ${t}[] ${name} = new ${t}[]{${items}};`;
    }
    return `        ${JAVA_TYPE[shape.kind]} ${name} = ${javaLiteral(shape.kind, shape.value)};`;
  });
  return { decls, names: args.map((a) => a.name) };
}

/**
 * Go declarations for one test case, plus the names to pass.
 *
 * `:=` everywhere, so no type names are needed except for an empty slice, which has nothing to
 * infer from. Go rejects unused variables, but every declaration here becomes an argument.
 */
export function buildGoArguments(input: string): { decls: string[]; names: string[] } {
  const args = inferArguments(input, "Go");
  const decls = args.map(({ name, shape }) => {
    if (shape.kind === "array") {
      const t = GO_TYPE[shape.elem];
      const items = shape.values.map((v) => goLiteral(shape.elem, v)).join(", ");
      return `\t${name} := []${t}{${items}}`;
    }
    return `\t${name} := ${goLiteral(shape.kind, shape.value)}`;
  });
  return { decls, names: args.map((a) => a.name) };
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
      return `${JAVA_HEADER_LINES.join("\n")}
${indented}
${JAVA_OUTPUT_HELPERS}
    public static void main(String[] args) {
${decls.join("\n")}
        __out(${callable}(${names.join(", ")}));
    }
}
`;
    }
    case "go": {
      if (input == null) {
        throw new Error("Go-Harness: ohne Testeingabe kann kein Programm gebaut werden.");
      }
      const { decls, names } = buildGoArguments(input);
      return `${GO_HEADER_LINES.join("\n")}
${trimmed}

/*
  Two things json.Marshal would get wrong on its own.

  A nil slice marshals to null, but declaring "var out []int" and never appending is ordinary Go
  and means an empty list — every challenge returning one would fail on its empty test case.

  And Marshal escapes the characters & < > for embedding in HTML, which turns a perfectly good
  string answer into a mismatch.
*/
func __emit(v interface{}) {
\trv := reflect.ValueOf(v)
\tif rv.Kind() == reflect.Slice && rv.IsNil() {
\t\tos.Stdout.Write([]byte("[]"))
\t\treturn
\t}
\tenc := json.NewEncoder(os.Stdout)
\tenc.SetEscapeHTML(false)
\tenc.Encode(v)
}

func main() {
${decls.join("\n")}
\t__emit(${callable}(${names.join(", ")}))
}
`;
    }
    case "ruby":
      /*
        `to_json` rather than `JSON.generate`: the latter refuses a bare String or Integer at the
        top level in strict mode, and half the challenges return exactly that.
      */
      return `${trimmed}

require 'json'
_raw = STDIN.read.strip
_data = JSON.parse(_raw)
_result = ${callable}(_data)
STDOUT.write(_result.to_json)
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
