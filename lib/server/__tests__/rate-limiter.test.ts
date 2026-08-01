import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUpsert = vi.fn();
const mockUpdateMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    rateLimitBucket: {
      upsert: (...args: unknown[]) => mockUpsert(...args),
      updateMany: (...args: unknown[]) => mockUpdateMany(...args),
    },
  },
}));

import { checkRateLimit } from "@/lib/server/rate-limiter";

beforeEach(() => {
  vi.clearAllMocks();
  mockUpsert.mockResolvedValue({});
  mockUpdateMany.mockResolvedValueOnce({ count: 0 }).mockResolvedValueOnce({ count: 1 });
});

describe("checkRateLimit", () => {
  it("stores only a hash of the identity and allows an atomic increment", async () => {
    await expect(checkRateLimit("login:user@example.com", 3, 60_000)).resolves.toBe(true);

    const key = mockUpsert.mock.calls[0][0].where.key as string;
    expect(key).toMatch(/^[a-f0-9]{64}$/u);
    expect(key).not.toContain("user@example.com");
    expect(mockUpdateMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ count: { lt: 3 } }),
        data: { count: { increment: 1 } },
      })
    );
  });

  it("blocks when the conditional increment updates no row", async () => {
    mockUpdateMany.mockReset();
    mockUpdateMany.mockResolvedValueOnce({ count: 0 }).mockResolvedValueOnce({ count: 0 });

    await expect(checkRateLimit("key", 1, 1_000)).resolves.toBe(false);
  });

  it("resets expired buckets before incrementing", async () => {
    const now = new Date("2026-08-01T12:00:00.000Z");
    await checkRateLimit("key", 2, 1_000, now);

    expect(mockUpdateMany.mock.calls[0][0]).toEqual({
      where: { key: expect.any(String), resetAt: { lte: now } },
      data: { count: 0, resetAt: new Date("2026-08-01T12:00:01.000Z") },
    });
  });
});
