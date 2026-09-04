import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSubmissionFindMany = vi.fn();
const mockNotificationCreateMany = vi.fn();
const mockNotificationDeleteMany = vi.fn();
const mockUserFindUnique = vi.fn();
const mockChallengeFindUnique = vi.fn();
const mockCheckRateLimit = vi.fn();
const mockSendActivityEmail = vi.fn();

/**
 * This test is about the query logic, not about language. Stubbed rather than taught to the
 * prisma mock: the German columns are the source, so a request in any other language now
 * reaches for a translation row - a lookup that has nothing to do with what is asserted here.
 */
vi.mock("@/lib/server/content-translations", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/server/content-translations")>();
  return {
    ...actual,
    localizeChallenge: async <T,>(challenge: T) => challenge,
    localizeChallengeTitles: async () => new Map<string, string>(),
    localizeChallengeTitle: async (_id: string, title: string) => title,
    localizeAchievements: async <T,>(defs: T) => defs,
    // Reaches for the mocked prisma, so the catalogue still comes from the fixture.
    findLocalizedAchievementDefs: async () =>
      (await import("@/lib/prisma")).prisma.achievementDef.findMany({
        orderBy: { id: "asc" },
      }),
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: {
    submission: { findMany: (...a: unknown[]) => mockSubmissionFindMany(...a) },
    notification: {
      createMany: (...a: unknown[]) => mockNotificationCreateMany(...a),
      deleteMany: (...a: unknown[]) => mockNotificationDeleteMany(...a),
    },
    user: { findUnique: (...a: unknown[]) => mockUserFindUnique(...a) },
    challenge: { findUnique: (...a: unknown[]) => mockChallengeFindUnique(...a) },
  },
}));

vi.mock("@/lib/server/rate-limiter", () => ({
  checkRateLimit: (...a: unknown[]) => mockCheckRateLimit(...a),
}));

vi.mock("@/lib/server/email-service", () => ({
  sendSolutionActivityEmail: (...a: unknown[]) => mockSendActivityEmail(...a),
}));

import {
  forgetSolutionVote,
  notifySolutionActivity,
} from "@/lib/server/notifications";

const HASH = "b".repeat(64);
const ACTIVITY = {
  challengeId: "chal-1",
  codeHash: HASH,
  actorId: "actor-1",
  kind: "comment" as const,
};

function author(id: string, overrides: Partial<{ notifyByEmail: boolean; emailVerified: boolean }> = {}) {
  return {
    user: {
      id,
      email: `${id}@test.dev`,
      notifyByEmail: true,
      emailVerified: true,
      ...overrides,
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockNotificationCreateMany.mockResolvedValue({ count: 1 });
  mockNotificationDeleteMany.mockResolvedValue({ count: 1 });
  mockCheckRateLimit.mockResolvedValue(true);
  mockSendActivityEmail.mockResolvedValue(undefined);
  mockUserFindUnique.mockResolvedValue({ name: "Leonid" });
  mockChallengeFindUnique.mockResolvedValue({ title: "Two Sum" });
});

describe("notifySolutionActivity", () => {
  it("writes one notification per author of the code group", async () => {
    mockSubmissionFindMany.mockResolvedValue([author("user-a"), author("user-b")]);

    await notifySolutionActivity(ACTIVITY);

    expect(mockNotificationCreateMany).toHaveBeenCalledWith({
      data: [
        { userId: "user-a", actorId: "actor-1", kind: "comment", challengeId: "chal-1", codeHash: HASH },
        { userId: "user-b", actorId: "actor-1", kind: "comment", challengeId: "chal-1", codeHash: HASH },
      ],
    });
  });

  it("excludes the actor from the recipients", async () => {
    mockSubmissionFindMany.mockResolvedValue([]);

    await notifySolutionActivity(ACTIVITY);

    expect(mockSubmissionFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: { not: "actor-1" } }),
      })
    );
    expect(mockNotificationCreateMany).not.toHaveBeenCalled();
  });

  it("mails the recipient with a link to the solution", async () => {
    mockSubmissionFindMany.mockResolvedValue([author("user-a")]);

    await notifySolutionActivity(ACTIVITY);

    expect(mockSendActivityEmail).toHaveBeenCalledWith("user-a@test.dev", {
      actorName: "Leonid",
      kind: "comment",
      challengeTitle: "Two Sum",
      path: `/challenge/chal-1/loesungen?loesung=${HASH}`,
    });
  });

  it("skips the mail when the recipient turned it off or is unverified", async () => {
    mockSubmissionFindMany.mockResolvedValue([
      author("user-a", { notifyByEmail: false }),
      author("user-b", { emailVerified: false }),
    ]);

    await notifySolutionActivity(ACTIVITY);

    expect(mockNotificationCreateMany).toHaveBeenCalled();
    expect(mockSendActivityEmail).not.toHaveBeenCalled();
  });

  it("keeps the notification but drops the mail once the hourly limit is reached", async () => {
    mockSubmissionFindMany.mockResolvedValue([author("user-a")]);
    mockCheckRateLimit.mockResolvedValue(false);

    await notifySolutionActivity(ACTIVITY);

    expect(mockCheckRateLimit).toHaveBeenCalledWith("notify-email:user-a", 5, 3_600_000);
    expect(mockNotificationCreateMany).toHaveBeenCalled();
    expect(mockSendActivityEmail).not.toHaveBeenCalled();
  });
});

describe("forgetSolutionVote", () => {
  it("removes only the unread notification of that actor and kind", async () => {
    await forgetSolutionVote({ ...ACTIVITY, kind: "clever" });

    expect(mockNotificationDeleteMany).toHaveBeenCalledWith({
      where: {
        challengeId: "chal-1",
        codeHash: HASH,
        actorId: "actor-1",
        kind: "clever",
        readAt: null,
      },
    });
  });
});
