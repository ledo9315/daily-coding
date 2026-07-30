import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockSubmissionFindMany = vi.fn();
const mockFindDailyChallengeForApp = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    submission: {
      findMany: (...args: unknown[]) => mockSubmissionFindMany(...args),
    },
  },
}));

vi.mock("@/lib/server/challenge-day", () => ({
  findDailyChallengeForApp: () => mockFindDailyChallengeForApp(),
}));

import { getLiveRanking } from "@/lib/server/ranking-live";

const user = (id: string, name: string) => ({
  id,
  name,
  initials: name.slice(0, 2),
  avatar: "🐱",
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getLiveRanking — week/month", () => {
  const d1 = new Date("2026-04-07T00:00:00.000Z");
  const d2 = new Date("2026-04-08T00:00:00.000Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-09T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("counts solved daily challenges and breaks ties by point total", async () => {
    mockSubmissionFindMany.mockResolvedValue([
      {
        userId: "u1",
        challengeId: "ch1",
        status: "completed",
        user: user("u1", "One"),
        challenge: { id: "ch1", points: 100, date: d1 },
      },
      {
        userId: "u1",
        challengeId: "ch2",
        status: "completed",
        user: user("u1", "One"),
        challenge: { id: "ch2", points: 100, date: d2 },
      },
      {
        userId: "u2",
        challengeId: "ch1",
        status: "completed",
        user: user("u2", "Two"),
        challenge: { id: "ch1", points: 100, date: d1 },
      },
    ]);

    const rows = await getLiveRanking("week");
    expect(rows).toHaveLength(2);
    expect(rows[0].userId).toBe("u1");
    expect(rows[0].challengesSolved).toBe(2);
    expect(rows[0].points).toBe(200);
    expect(rows[1].userId).toBe("u2");
    expect(rows[1].challengesSolved).toBe(1);
  });
});
