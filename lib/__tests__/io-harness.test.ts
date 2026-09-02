import { describe, it, expect } from "vitest";
import {
  outputsMatch,
  buildGoArguments,
  buildRustArguments,
  buildJavaArguments,
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

describe("buildJavaArguments", () => {
  it("turns object keys into one typed parameter each, in key order", () => {
    // This is what makes binarySearch(int[] arr, int target) read like Java rather than like a
    // bag of values - and it fixes the argument order the harness passes.
    const { decls, names } = buildJavaArguments('{"arr":[1,3,5],"target":5}');
    expect(names).toEqual(["arr", "target"]);
    expect(decls[0]).toContain("int[] arr = new int[]{1,3,5};");
    expect(decls[1]).toContain("int target = 5;");
  });

  it("passes a bare value as a single parameter", () => {
    expect(buildJavaArguments('"hello"').decls[0]).toContain('String __input = "hello";');
    expect(buildJavaArguments("5").decls[0]).toContain("int __input = 5;");
    expect(buildJavaArguments("[]").decls[0]).toContain("int[] __input = new int[]{};");
  });

  it("escapes strings so a quote cannot end the literal", () => {
    expect(buildJavaArguments('"a\\"b"').decls[0]).toContain('"a\\"b"');
  });

  it("rejects shapes it cannot type", () => {
    // Hash Map's [["set","a",1]] and the Binary Tree's nested nodes land here. They must fail
    // loudly rather than compile into something that quietly returns the wrong answer.
    expect(() => buildJavaArguments('[["set","a",1]]')).toThrow();
    expect(() => buildJavaArguments('{"val":1,"left":null}')).toThrow();
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
    // came back as 0/5 - a compiler error where a test result belonged.
    const src = buildWrappedProgram("typescript", "function f(a: number): number { return a; }", "f");
    expect(src).toContain("declare function require(");
    expect(src).toContain("declare const process:");
    expect(src).toContain("f(data)");
    // No blanket switch-off: the user's own type errors must still be reported.
    expect(src).not.toContain("@ts-nocheck");
  });

  it("TypeScript: opens with the ES2020 lib directive, above the user's code", () => {
    // Piston runs plain `tsc`, which checks against ES5: Map, Set and padStart were compiler
    // errors in TypeScript while the same code passed in JavaScript.
    const src = buildWrappedProgram("typescript", "function f(a: number): number { return a; }", "f");
    expect(src.split("\n")[0]).toBe('/// <reference lib="es2020" />');
    expect(src.split("\n")[1]).toBe("function f(a: number): number { return a; }");
  });

  it("Python: invokes callable with JSON-loaded input", () => {
    const src = buildWrappedProgram("python", "def g(x):\n    return x", "g");
    expect(src).toContain("def g(x):");
    expect(src).toContain("json.loads(_raw)");
    expect(src).toContain("g(_data)");
  });

  it("Rust: solution first, serialisation by trait", () => {
    const src = buildWrappedProgram(
      "rust",
      "fn max_sub_array(nums: Vec<i64>) -> i64 { nums[0] }",
      "max_sub_array",
      "[-2,1,-3]"
    );
    // No class to nest in, so the solution starts at line 1 and needs no offset correction.
    expect(src.startsWith("fn max_sub_array")).toBe(true);
    expect(src).toContain("let __input: Vec<i64> = vec![-2, 1, -3];");
    expect(src).toContain("max_sub_array(__input).to_json()");
    // A blanket impl covers nesting, which overloads cannot do in one line.
    expect(src).toContain("impl<T: ToJson> ToJson for Vec<T>");
  });

  it("Rust: escapes a code point with braces", () => {
    // \uXXXX is a syntax error in Rust; the other typed languages all take it.
    const { decls } = buildRustArguments('"a\u00e4"');
    expect(decls[0]).toContain("\\u{e4}");
  });

  it("C#: one serialiser with ordered type tests, no System.Text.Json", () => {
    const src = buildWrappedProgram(
      "csharp",
      "static string ReverseString(string s) { return s; }",
      "ReverseString",
      '"hello"'
    );
    expect(src).toContain("public class Program {");
    expect(src).toContain('string __input = "hello";');
    expect(src).toContain("Console.Write(__json(ReverseString(__input)))");
    // Mono's library has no System.Text.Json, so the harness serialises by hand.
    expect(src).not.toContain("System.Text.Json");
    // A string is itself an IEnumerable of char: tested later, every word becomes a letter list.
    expect(src.indexOf("v is string")).toBeLessThan(src.indexOf("v is IEnumerable"));
  });

  it("C++: pulls in the standard library and serialises by overload", () => {
    const src = buildWrappedProgram(
      "cpp",
      "vector<int> moveZeroes(vector<int> nums) { return nums; }",
      "moveZeroes",
      "[0,1,0]"
    );
    // A solution cannot add its own include; <bits/stdc++.h> covers the standard library at once.
    expect(src).toContain("#include <bits/stdc++.h>");
    expect(src).toContain("using namespace std;");
    expect(src).toContain("vector<int> __input = {0, 1, 0};");
    expect(src).toContain("cout << __json(moveZeroes(__input));");
    // The scalar overloads have to precede the template, or nested vectors fail to resolve.
    expect(src.indexOf("static string __json(int v)")).toBeLessThan(
      src.indexOf("template <class T> static string __json")
    );
  });

  it("Go: bakes the input in and gives the solution the usual packages", () => {
    const src = buildWrappedProgram(
      "go",
      "func fizzBuzz(n int) []string { return nil }",
      "fizzBuzz",
      "5"
    );
    expect(src).toContain("package main");
    // A bare value has no key to take a name from, so it becomes the single parameter __input.
    expect(src).toContain("__input := 5");
    expect(src).toContain("__emit(fizzBuzz(__input))");
    // A solution cannot add imports of its own - without strconv there is no int-to-string
    // conversion and FizzBuzz is unsolvable in idiomatic Go.
    expect(src).toContain('"strconv"');
    expect(src).toContain("_ = strconv.Itoa");
    // json.Marshal would answer null for a nil slice and escape & < > for HTML.
    expect(src).toContain("rv.IsNil()");
    expect(src).toContain("SetEscapeHTML(false)");
  });

  it("Go: declares object keys as separate parameters", () => {
    const { decls, names } = buildGoArguments('{"arr":[1,3],"target":5}');
    expect(names).toEqual(["arr", "target"]);
    expect(decls[0]).toContain("arr := []int{1, 3}");
    expect(decls[1]).toContain("target := 5");
  });

  it("Ruby: reads stdin and serialises with to_json", () => {
    const src = buildWrappedProgram("ruby", "def f(a)\n  a\nend", "f");
    expect(src).toContain("def f(a)");
    expect(src).toContain("JSON.parse(_raw)");
    expect(src).toContain("f(_data)");
    // JSON.generate refuses a bare String or Integer at the top level; half the challenges
    // return exactly that.
    expect(src).toContain("_result.to_json");
    expect(src).not.toContain("JSON.generate");
  });

  it("Java: wraps the method in class Main and bakes the input in", () => {
    const src = buildWrappedProgram(
      "java",
      "static int maxSubArray(int[] nums) { return 0; }",
      "maxSubArray",
      "[-2,1,-3]"
    );
    expect(src).toContain("public class Main {");
    expect(src).toContain("static int maxSubArray(int[] nums)");
    expect(src).toContain("int[] __input = new int[]{-2,1,-3};");
    expect(src).toContain("__out(maxSubArray(__input));");
    // Nothing is read at runtime: Piston's image has no JSON library to read it with.
    expect(src).not.toContain("System.in");
  });

  it("Java: refuses to build without a test input", () => {
    // Every other language produces one program for all cases; Java's differs per case, so a
    // missing input is a programming error rather than something to paper over.
    expect(() => buildWrappedProgram("java", "static int f(int n) { return n; }", "f")).toThrow(
      /Testeingabe/u
    );
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
