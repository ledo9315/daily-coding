import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mockRun = vi.fn();
vi.mock("@/lib/server/daily-reminder", () => ({
  runDailyReminder: (...args: unknown[]) => mockRun(...args),
}));

const mockPrune = vi.fn();
vi.mock("@/lib/server/notifications", () => ({
  pruneReadNotifications: (...args: unknown[]) => mockPrune(...args),
}));

/**
 * Stubbed rather than left to the real SDK: without a DSN `withMonitor` runs the callback
 * and drops the check-ins silently, so nothing here could tell a monitored run from an
 * unmonitored one. The stub keeps the wrapper's contract - it calls the callback and hands
 * the result back - and records what it was asked to monitor.
 */
const mockWithMonitor = vi.fn(
  (_slug: string, callback: () => unknown, _config?: unknown) => callback()
);
const mockFlush = vi.fn();
const mockLogInfo = vi.fn();
vi.mock("@sentry/nextjs", () => ({
  withMonitor: <T,>(slug: string, callback: () => T, config?: unknown) =>
    mockWithMonitor(slug, callback, config) as T,
  flush: (...args: unknown[]) => mockFlush(...args),
  logger: { info: (...args: unknown[]) => mockLogInfo(...args) },
}));

import { GET } from "@/app/api/cron/daily-reminder/route";
import {
  DAILY_REMINDER_MONITOR,
  DAILY_REMINDER_MONITOR_CONFIG,
} from "@/lib/server/cron-monitor";

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
  mockPrune.mockResolvedValue(5);
  mockFlush.mockResolvedValue(true);
});

afterEach(() => {
  if (ORIGINAL_SECRET === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = ORIGINAL_SECRET;
});

describe("GET /api/cron/daily-reminder", () => {
  it("runs and reports what it sent", async () => {
    const response = await GET(request("Bearer top-secret"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ sent: 3, failed: 0, prunedNotifications: 5 });
  });

  it.each([
    ["no header", undefined],
    ["a wrong secret", "Bearer guessed"],
    ["the secret without the scheme", "top-secret"],
  ])("refuses a call with %s", async (_case, header) => {
    const response = await GET(request(header));

    expect(response.status).toBe(401);
    expect(mockRun).not.toHaveBeenCalled();
    expect(mockPrune).not.toHaveBeenCalled();
  });

  /** An endpoint that mails every user must not fall open when it is misconfigured. */
  it("refuses to run at all without a configured secret", async () => {
    delete process.env.CRON_SECRET;

    const response = await GET(request("Bearer top-secret"));

    expect(response.status).toBe(503);
    expect(mockRun).not.toHaveBeenCalled();
  });
});

/**
 * #288 told Vercel to call this route; nothing told anyone when the call stopped coming.
 * The monitor is that missing half, and it only works if every real run checks in and no
 * stranger's request does.
 */
describe("the cron monitor around the run", () => {
  it("checks in under the configured monitor", async () => {
    await GET(request("Bearer top-secret"));

    expect(mockWithMonitor).toHaveBeenCalledTimes(1);
    const [slug, , config] = mockWithMonitor.mock.calls[0];
    expect(slug).toBe(DAILY_REMINDER_MONITOR);
    expect(config).toBe(DAILY_REMINDER_MONITOR_CONFIG);
  });

  /** A rejected probe is not a run, and must not land in the monitor's history. */
  it.each([
    ["a wrong secret", "Bearer guessed"],
    ["no header", undefined],
  ])("does not check in for a call with %s", async (_case, header) => {
    await GET(request(header));

    expect(mockWithMonitor).not.toHaveBeenCalled();
  });

  /** The work belongs inside the check-in, or the monitor reports on nothing. */
  it("does the sending inside the monitored callback", async () => {
    mockWithMonitor.mockImplementationOnce(() => Promise.resolve({ sent: 0, failed: 0 }));

    await GET(request("Bearer top-secret"));

    expect(mockRun).not.toHaveBeenCalled();
    expect(mockPrune).not.toHaveBeenCalled();
  });

  /**
   * A serverless instance can be frozen as soon as the response leaves. A check-in still
   * sitting in the buffer is a healthy run that Sentry will call a timeout.
   */
  it("waits for the check-in to leave before answering", async () => {
    await GET(request("Bearer top-secret"));

    expect(mockFlush).toHaveBeenCalledTimes(1);
  });

  it("still flushes when the run throws", async () => {
    mockRun.mockRejectedValueOnce(new Error("mail provider down"));

    await expect(GET(request("Bearer top-secret"))).rejects.toThrow("mail provider down");
    expect(mockFlush).toHaveBeenCalledTimes(1);
  });
});
