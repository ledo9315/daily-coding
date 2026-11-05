import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}));

import { GET } from "../health/route";
import { prisma } from "@/lib/prisma";

const queryRaw = vi.mocked(prisma.$queryRaw);

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("answers ok while the database replies", async () => {
    queryRaw.mockResolvedValue([{ "?column?": 1 }]);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "ok" });
  });

  /**
   * The point of the route: the container is restarted when the database is gone, not
   * only when Node itself has died.
   */
  it("answers 503 when the database is unreachable", async () => {
    queryRaw.mockRejectedValue(new Error("P1001"));

    const response = await GET();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ status: "degraded" });
  });
});
