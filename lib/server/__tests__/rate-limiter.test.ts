import { describe, it, expect, vi, beforeEach } from "vitest";

// We need to reset the module between tests to clear the in-memory store
beforeEach(() => {
  vi.resetModules();
});

describe("checkRateLimit", () => {
  it("allows the first request", async () => {
    const { checkRateLimit } = await import("@/lib/server/rate-limiter");
    expect(checkRateLimit("key1", 3, 60_000)).toBe(true);
  });

  it("allows requests up to the limit", async () => {
    const { checkRateLimit } = await import("@/lib/server/rate-limiter");
    expect(checkRateLimit("key2", 3, 60_000)).toBe(true);
    expect(checkRateLimit("key2", 3, 60_000)).toBe(true);
    expect(checkRateLimit("key2", 3, 60_000)).toBe(true);
  });

  it("blocks the request when limit is exceeded", async () => {
    const { checkRateLimit } = await import("@/lib/server/rate-limiter");
    checkRateLimit("key3", 2, 60_000);
    checkRateLimit("key3", 2, 60_000);
    expect(checkRateLimit("key3", 2, 60_000)).toBe(false);
  });

  it("resets after the window expires", async () => {
    vi.useFakeTimers();
    const { checkRateLimit } = await import("@/lib/server/rate-limiter");
    checkRateLimit("key4", 1, 1_000);
    checkRateLimit("key4", 1, 1_000); // blocked
    vi.advanceTimersByTime(1_001);
    expect(checkRateLimit("key4", 1, 1_000)).toBe(true); // window reset
    vi.useRealTimers();
  });

  it("different keys have independent limits", async () => {
    const { checkRateLimit } = await import("@/lib/server/rate-limiter");
    checkRateLimit("a", 1, 60_000);
    checkRateLimit("a", 1, 60_000); // "a" is now blocked
    expect(checkRateLimit("b", 1, 60_000)).toBe(true); // "b" is unaffected
  });
});
