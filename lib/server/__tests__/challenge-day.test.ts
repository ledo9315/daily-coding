import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSubmissionFindFirst = vi.fn();
const mockChallengeFindMany = vi.fn();
const mockChallengeFindUnique = vi.fn();
const mockRotationFindUnique = vi.fn();
const mockRotationCreate = vi.fn();
const mockRotationUpdate = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    submission: {
      findFirst: (...args: unknown[]) => mockSubmissionFindFirst(...args),
    },
    challenge: {
      findFirst: vi.fn(),
      findMany: (...args: unknown[]) => mockChallengeFindMany(...args),
      findUnique: (...args: unknown[]) => mockChallengeFindUnique(...args),
    },
    rotationState: {
      findUnique: (...args: unknown[]) => mockRotationFindUnique(...args),
      create: (...args: unknown[]) => mockRotationCreate(...args),
      update: (...args: unknown[]) => mockRotationUpdate(...args),
    },
  },
}));

import { findDailyChallengeRow, findTodaySubmission } from "@/lib/server/challenge-day";

/** The ring as the database now hands it over: two columns, in order. */
const RING = [
  { id: "ch-a", position: 1 },
  { id: "ch-b", position: 2 },
  { id: "ch-c", position: 3 },
];

const startOfToday = () => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

beforeEach(() => {
  vi.clearAllMocks();
  mockSubmissionFindFirst.mockResolvedValue(null);
  mockChallengeFindMany.mockResolvedValue(RING);
  mockChallengeFindUnique.mockImplementation(({ where }: { where: { id: string } }) =>
    Promise.resolve({ id: where.id, title: "Aufgabe", category: { id: "cat-1" } })
  );
  mockRotationFindUnique.mockResolvedValue(null);
  mockRotationCreate.mockResolvedValue(undefined);
  mockRotationUpdate.mockResolvedValue(undefined);
});

/**
 * #35: the check "submitted for this challenge today (UTC)?" was copied into both
 * the submit and the daily route. The helper is now the single source - for the
 * submit lock, the daily response and the dashboard card.
 */
describe("findTodaySubmission", () => {
  it("limits the query to the current UTC day", async () => {
    await findTodaySubmission("user-1", "ch-1");
    const where = mockSubmissionFindFirst.mock.calls[0][0].where;
    expect(where.userId).toBe("user-1");
    expect(where.challengeId).toBe("ch-1");

    const { gte, lt } = where.createdAt;
    expect(gte.getUTCHours()).toBe(0);
    expect(gte.getUTCMinutes()).toBe(0);
    expect(gte.getUTCSeconds()).toBe(0);
    expect(lt.getTime() - gte.getTime()).toBe(24 * 60 * 60 * 1000);
  });

  it("returns the newest submission of the day", async () => {
    mockSubmissionFindFirst.mockResolvedValueOnce({
      id: "sub-1",
      status: "completed",
      createdAt: new Date(),
      code: "x",
      language: "javascript",
    });
    const found = await findTodaySubmission("user-1", "ch-1");
    expect(found?.id).toBe("sub-1");
    expect(mockSubmissionFindFirst.mock.calls[0][0].orderBy).toEqual({
      createdAt: "desc",
    });
  });

  // #60: without testResults the page shows the empty template ("0/5 passed") next
  // to "successfully submitted" after a reload.
  it("includes the stored test results", async () => {
    await findTodaySubmission("user-1", "ch-1");
    expect(mockSubmissionFindFirst.mock.calls[0][0].select.testResults).toBe(true);
  });

  it("returns null when nothing was submitted today", async () => {
    expect(await findTodaySubmission("user-1", "ch-1")).toBeNull();
  });
});

/**
 * The ring used to be resolved on full rows: every landing page pulled the hints,
 * examples, test cases and starter code of every active challenge out of the database to
 * decide which single one is today's. Sentry measured 95 ms per call and `GET /` as the
 * slowest transaction. The order needs two columns, so only two are asked for, and the
 * one challenge that wins is fetched by its id.
 */
describe("findDailyChallengeRow", () => {
  it("asks the ring query for the order only, never for the content", async () => {
    await findDailyChallengeRow();

    const args = mockChallengeFindMany.mock.calls[0][0];
    expect(args.select).toEqual({ id: true, position: true });
    expect(args.include).toBeUndefined();
    expect(args.where).toEqual({ isActive: true });
    expect(args.orderBy).toEqual([{ position: "asc" }, { id: "asc" }]);
  });

  it("loads the challenge it picked by id, with its category", async () => {
    mockRotationFindUnique.mockResolvedValueOnce({
      challengeId: "ch-b",
      position: 2,
      day: startOfToday(),
    });

    const row = await findDailyChallengeRow();

    expect(mockChallengeFindUnique).toHaveBeenCalledWith({
      where: { id: "ch-b" },
      include: { category: true },
    });
    expect(row?.id).toBe("ch-b");
  });

  it("starts the ring at its first entry when no state exists yet", async () => {
    const row = await findDailyChallengeRow();

    expect(mockRotationCreate.mock.calls[0][0].data).toMatchObject({
      id: "current",
      challengeId: "ch-a",
      position: 1,
    });
    expect(row?.id).toBe("ch-a");
  });

  it("advances one entry per elapsed UTC day and stores where it stands", async () => {
    const yesterday = startOfToday();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    mockRotationFindUnique.mockResolvedValueOnce({
      challengeId: "ch-a",
      position: 1,
      day: yesterday,
    });

    const row = await findDailyChallengeRow();

    expect(row?.id).toBe("ch-b");
    expect(mockRotationUpdate.mock.calls[0][0].data).toMatchObject({
      challengeId: "ch-b",
      position: 2,
    });
  });

  it("returns null on an empty ring without loading anything", async () => {
    mockChallengeFindMany.mockResolvedValueOnce([]);
    expect(await findDailyChallengeRow()).toBeNull();
    expect(mockChallengeFindUnique).not.toHaveBeenCalled();
  });
});
