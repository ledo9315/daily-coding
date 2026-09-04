import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mockRun = vi.fn();
vi.mock("@/lib/server/daily-reminder", () => ({
  runDailyReminder: (...args: unknown[]) => mockRun(...args),
}));

import { GET } from "@/app/api/cron/daily-reminder/route";

const ORIGINAL_SECRET = process.env.CRON_SECRET;

function request(authorization?: string) {
  return new NextRequest(new URL("https://daily-coding.dev/api/cron/daily-reminder"), {
    headers: authorization ? { authorization } : {},
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.CRON_SECRET = "top-secret";
  mockRun.mockResolvedValue({ sent: 3, failed: 0 });
});

afterEach(() => {
  if (ORIGINAL_SECRET === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = ORIGINAL_SECRET;
});

describe("GET /api/cron/daily-reminder", () => {
  it("runs and reports what it sent", async () => {
    const response = await GET(request("Bearer top-secret"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ sent: 3, failed: 0 });
  });

  it.each([
    ["no header", undefined],
    ["a wrong secret", "Bearer guessed"],
    ["the secret without the scheme", "top-secret"],
  ])("refuses a call with %s", async (_case, header) => {
    const response = await GET(request(header));

    expect(response.status).toBe(401);
    expect(mockRun).not.toHaveBeenCalled();
  });

  /** An endpoint that mails every user must not fall open when it is misconfigured. */
  it("refuses to run at all without a configured secret", async () => {
    delete process.env.CRON_SECRET;

    const response = await GET(request("Bearer top-secret"));

    expect(response.status).toBe(503);
    expect(mockRun).not.toHaveBeenCalled();
  });
});
