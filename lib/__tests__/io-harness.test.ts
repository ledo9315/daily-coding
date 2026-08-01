import { describe, it, expect } from "vitest";
import {
  outputsMatch,
  buildWrappedProgram,
  extractIoProgramOutput,
} from "@/lib/server/io-harness";

describe("extractIoProgramOutput", () => {
  it("returns full string when it is valid JSON", () => {
    expect(extractIoProgramOutput('  [1,3,6]  ')).toBe("[1,3,6]");
  });

  it("uses last line when PHP noise precedes JSON", () => {
    const raw = "Notice: something\n[1,3,6,10,15]\n";
    expect(extractIoProgramOutput(raw)).toBe("[1,3,6,10,15]");
  });
});

describe("outputsMatch", () => {
  it("trims whitespace", () => {
    expect(outputsMatch("  [1]  \n", "[1]")).toBe(true);
  });

  it("treats equivalent JSON with different formatting as equal", () => {
    expect(outputsMatch("[1,3,6]", "[1, 3, 6]")).toBe(true);
  });

  it("fails when content actually differs", () => {
    expect(outputsMatch("[1]", "[2]")).toBe(false);
  });
});

describe("buildWrappedProgram", () => {
  it("wraps JavaScript with stdin/stdout harness", () => {
    const src = buildWrappedProgram("javascript", "function f(a){return a;}", "f");
    expect(src).toContain("function f(a){return a;}");
    expect(src).toContain("JSON.parse(raw)");
    expect(src).toContain("f(data)");
  });

  it("TypeScript: declares require and process, which Piston's image lacks", () => {
    // Without the declarations every TypeScript submission failed to compile with TS2580 and
    // came back as 0/5 — a compiler error where a test result belonged.
    const src = buildWrappedProgram("typescript", "function f(a: number): number { return a; }", "f");
    expect(src).toContain("declare function require(");
    expect(src).toContain("declare const process:");
    expect(src).toContain("f(data)");
    // No blanket switch-off: the user's own type errors must still be reported.
    expect(src).not.toContain("@ts-nocheck");
  });

  it("Python: invokes callable with JSON-loaded input", () => {
    const src = buildWrappedProgram("python", "def g(x):\n    return x", "g");
    expect(src).toContain("def g(x):");
    expect(src).toContain("json.loads(_raw)");
    expect(src).toContain("g(_data)");
  });

  it("PHP: invokes callable with json_decode and echo", () => {
    const src = buildWrappedProgram(
      "php",
      "<?php\nfunction h($d) { return $d; }",
      "h",
    );
    expect(src).toContain("function h($d)");
    expect(src).toContain("json_decode($__raw, true)");
    expect(src).toContain("h($__data)");
  });
});
