import { describe, it, expect } from "vitest";
import { adminCreateChallengeSchema } from "@/lib/admin/challenge-schema";

describe("adminCreateChallengeSchema", () => {
  const base = {
    id: "challenge-test-slug",
    title: "T",
    description: "D",
    difficulty: "medium" as const,
    points: 10,
    categoryId: "cat-1",
    examples: [{ input: "1", output: "2" }],
    hints: [{ title: "Ansatz", body: "Modulo." }],
    testCases: [{ name: "t1", input: "a", expected: "b" }],
    evaluationConfig: {
      callableByLanguage: {
        javascript: "fn",
        typescript: "fn",
        python: "fn",
        php: "fn",
      },
    },
    starterCodes: {
      javascript: "js",
      typescript: "ts",
      python: "py",
      php: "p",
    },
  };

  it("accepts valid payload", () => {
    const r = adminCreateChallengeSchema.safeParse(base);
    expect(r.success).toBe(true);
  });

  it("rejects a payload without hints instead of clearing them", () => {
    // Defaulting to [] would let a client that simply forgets the field wipe the hints of an
    // existing challenge on update.
    const { hints: _hints, ...withoutHints } = base;
    expect(adminCreateChallengeSchema.safeParse(withoutHints).success).toBe(false);
  });

  it("rejects a hint without a body", () => {
    const r = adminCreateChallengeSchema.safeParse({
      ...base,
      hints: [{ title: "Ansatz", body: "" }],
    });
    expect(r.success).toBe(false);
  });

  it("rejects invalid id characters", () => {
    const r = adminCreateChallengeSchema.safeParse({
      ...base,
      id: "Bad_Id",
    });
    expect(r.success).toBe(false);
  });
});
