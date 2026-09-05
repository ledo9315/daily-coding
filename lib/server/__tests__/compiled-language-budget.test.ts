import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCheckRateLimit = vi.fn();
vi.mock("@/lib/server/rate-limiter", () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
}));

import {
  COMPILED_RUNS_PER_MINUTE,
  reserveCompiledLanguageRun,
} from "@/lib/server/compiled-language-budget";

beforeEach(() => {
  mockCheckRateLimit.mockReset();
  mockCheckRateLimit.mockResolvedValue(true);
});

describe("reserveCompiledLanguageRun", () => {
  it("lets interpreted languages through without touching the bucket", async () => {
    for (const language of ["javascript", "typescript", "python", "php", "ruby"] as const) {
      expect(await reserveCompiledLanguageRun(language)).toBe(true);
    }
    expect(mockCheckRateLimit).not.toHaveBeenCalled();
  });

  it("charges every compiled language to the same global bucket", async () => {
    for (const language of ["java", "go", "cpp", "csharp", "rust"] as const) {
      await reserveCompiledLanguageRun(language);
    }
    const keys = new Set(mockCheckRateLimit.mock.calls.map((c) => c[0]));
    expect(keys.size).toBe(1);
    expect([...keys][0]).toMatch(/^challenge-compiled:/);
    expect(mockCheckRateLimit.mock.calls[0].slice(1)).toEqual([COMPILED_RUNS_PER_MINUTE, 60_000]);
  });

  it("reports an exhausted bucket", async () => {
    mockCheckRateLimit.mockResolvedValueOnce(false);
    expect(await reserveCompiledLanguageRun("java")).toBe(false);
  });
});
