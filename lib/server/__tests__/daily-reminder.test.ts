import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFindMany = vi.fn();
const mockUserUpdate = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      update: (...args: unknown[]) => mockUserUpdate(...args),
    },
  },
}));

const mockFindDailyChallengeRow = vi.fn();
vi.mock("@/lib/server/challenge-day", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/server/challenge-day")>();
  return { ...actual, findDailyChallengeRow: () => mockFindDailyChallengeRow() };
});

// The German columns are the source; a run localizes per recipient and that lookup is
// not what these assertions are about.
vi.mock("@/lib/server/content-translations", () => ({
  localizeChallenge: async <T,>(challenge: T) => challenge,
}));

const mockSend = vi.fn();
vi.mock("@/lib/server/email-service", () => ({
  sendDailyReminderEmail: (...args: unknown[]) => mockSend(...args),
}));

import { REMINDER_INACTIVE_AFTER_DAYS, runDailyReminder } from "@/lib/server/daily-reminder";

const CHALLENGE = {
  id: "challenge-1",
  title: "Array Manipulation",
  description: "…",
  difficulty: "medium" as const,
  points: 30,
};

const NOW = new Date("2026-09-04T17:00:00.000Z");

function user(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "u-1",
    email: "max@example.com",
    locale: "de",
    streak: 4,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.AUTH_SECRET = "test-secret";
  mockFindDailyChallengeRow.mockResolvedValue(CHALLENGE);
  mockFindMany.mockResolvedValue([]);
  mockUserUpdate.mockResolvedValue({});
  mockSend.mockResolvedValue(undefined);
});

describe("runDailyReminder", () => {
  it("sends nothing when the ring holds no active challenge", async () => {
    mockFindDailyChallengeRow.mockResolvedValue(null);

    expect(await runDailyReminder({ now: NOW, pauseMs: 0 })).toEqual({ sent: 0, failed: 0 });
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  /**
   * The five conditions of the selection, read off the query rather than simulated: the
   * whole point of putting them in one `where` is that no row that fails one of them is
   * ever loaded.
   */
  describe("who it asks for", () => {
    beforeEach(async () => {
      await runDailyReminder({ now: NOW, pauseMs: 0 });
    });

    const whereClause = () => mockFindMany.mock.calls[0][0].where;

    it("only writes to confirmed addresses that still want the reminder", () => {
      expect(whereClause()).toMatchObject({
        emailVerified: true,
        notifyDailyReminder: true,
      });
    });

    it("leaves out whoever already submitted today", () => {
      expect(whereClause().submissions).toEqual({
        none: { createdAt: { gte: new Date("2026-09-04T00:00:00.000Z"), lt: new Date("2026-09-05T00:00:00.000Z") } },
      });
    });

    it("leaves out whoever was already reminded today", () => {
      expect(whereClause().OR).toEqual([
        { dailyReminderSentAt: null },
        { dailyReminderSentAt: { lt: new Date("2026-09-04T00:00:00.000Z") } },
      ]);
    });

    it("stops chasing an account that has been quiet for a month", () => {
      const activeSince = new Date(
        NOW.getTime() - REMINDER_INACTIVE_AFTER_DAYS * 24 * 60 * 60 * 1000
      );
      expect(whereClause().AND).toEqual([
        {
          OR: [
            { createdAt: { gte: activeSince } },
            { submissions: { some: { createdAt: { gte: activeSince } } } },
          ],
        },
      ]);
    });
  });

  it("writes to every recipient and records the day", async () => {
    mockFindMany.mockResolvedValue([user(), user({ id: "u-2", email: "b@example.com" })]);

    expect(await runDailyReminder({ now: NOW, pauseMs: 0 })).toEqual({ sent: 2, failed: 0 });
    expect(mockUserUpdate).toHaveBeenNthCalledWith(1, {
      where: { id: "u-1" },
      data: { dailyReminderSentAt: NOW },
    });
  });

  it("writes in the language of the recipient and signs the way out", async () => {
    mockFindMany.mockResolvedValue([user({ locale: "en" })]);

    await runDailyReminder({ now: NOW, pauseMs: 0 });

    const [recipient, challenge] = mockSend.mock.calls[0];
    expect(recipient.locale).toBe("en");
    expect(recipient.streak).toBe(4);
    expect(recipient.unsubscribePath).toMatch(/^\/unsubscribe\?u=u-1&t=[0-9a-f]{64}$/);
    expect(challenge).toEqual({ title: CHALLENGE.title, difficulty: "medium", points: 30 });
  });

  /** One bad address must not cost everyone behind it their reminder. */
  it("counts a failed mail and carries on", async () => {
    mockFindMany.mockResolvedValue([user(), user({ id: "u-2" })]);
    mockSend.mockRejectedValueOnce(new Error("mailbox full"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(await runDailyReminder({ now: NOW, pauseMs: 0 })).toEqual({ sent: 1, failed: 1 });
    // Not marked, so the next run may try again - a day later, not a second time today.
    expect(mockUserUpdate).toHaveBeenCalledTimes(1);
    errorSpy.mockRestore();
  });
});
