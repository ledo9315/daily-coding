import { describe, expect, it } from "vitest";
import { diffLines, DIFF_MAX_LINES } from "@/lib/line-diff";

const types = (left: string, right: string) => diffLines(left, right).map((l) => l.type);

describe("diffLines", () => {
  it("marks every line of identical texts as unchanged", () => {
    expect(types("a\nb\nc", "a\nb\nc")).toEqual(["same", "same", "same"]);
  });

  it("marks an inserted line as added", () => {
    expect(diffLines("a\nc", "a\nb\nc")).toEqual([
      { type: "same", text: "a" },
      { type: "added", text: "b" },
      { type: "same", text: "c" },
    ]);
  });

  it("marks a deleted line as removed", () => {
    expect(diffLines("a\nb\nc", "a\nc")).toEqual([
      { type: "same", text: "a" },
      { type: "removed", text: "b" },
      { type: "same", text: "c" },
    ]);
  });

  it("reads a replaced line as removed then added", () => {
    expect(types("a\nx\nc", "a\ny\nc")).toEqual(["same", "removed", "added", "same"]);
  });

  it("keeps the common lines instead of rewriting the whole text", () => {
    const result = types("a\nb\nc\nd", "a\nB\nc\nD");
    expect(result.filter((t) => t === "same")).toHaveLength(2);
  });

  it("handles an empty side", () => {
    expect(types("", "a\nb")).toEqual(["removed", "added", "added"]);
    expect(types("a\nb", "")).toEqual(["removed", "removed", "added"]);
  });

  it("normalizes CRLF so line endings alone are no difference", () => {
    expect(types("a\r\nb", "a\nb")).toEqual(["same", "same"]);
  });

  it("keeps the order of the left text readable back to back", () => {
    const left = "def f():\n  return 1";
    const right = "def f():\n  x = 1\n  return x";
    expect(diffLines(left, right).filter((l) => l.type !== "added").map((l) => l.text)).toEqual([
      "def f():",
      "  return 1",
    ]);
  });

  it("cuts off beyond the line cap instead of building a huge table", () => {
    const long = Array.from({ length: DIFF_MAX_LINES + 50 }, (_, i) => `line ${i}`).join("\n");
    expect(diffLines(long, long)).toHaveLength(DIFF_MAX_LINES);
  });
});
