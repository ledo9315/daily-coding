import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as getDailyHandler } from "../challenge/daily/route";
import { GET as getTodayHandler } from "../challenge/today/route";
import { POST as runTestsHandler } from "../challenge/[id]/run/route";
import { POST as submitHandler } from "../challenge/[id]/submit/route";

// ─── Auth session mock ────────────────────────────────────────────────────────

vi.mock("@/lib/auth-session", () => ({
  getSessionUserId: vi.fn().mockResolvedValue({ userId: "user-test" }),
}));

const mockAuth = vi.fn();
vi.mock("@/auth", () => ({
  auth: () => mockAuth(),
}));

// ─── Prisma mock ─────────────────────────────────────────────────────────────

const mockFindFirst = vi.fn();
const mockFindUniqueChallenge = vi.fn();
const mockUserFindUnique = vi.fn();
const mockUserUpdate = vi.fn();
const mockSubmissionFindFirst = vi.fn();
const mockSubmissionFindMany = vi.fn();
const mockSubmissionAggregate = vi.fn();
const mockSubmissionCount = vi.fn();
const mockCreate = vi.fn();
const mockChallengeStartFindUnique = vi.fn();
const mockChallengeStartCreateMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    challengeStart: {
      findUnique: (...args: unknown[]) => mockChallengeStartFindUnique(...args),
      createMany: (...args: unknown[]) => mockChallengeStartCreateMany(...args),
    },
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
      update: (...args: unknown[]) => mockUserUpdate(...args),
    },
    challenge: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      findUnique: (...args: unknown[]) => mockFindUniqueChallenge(...args),
    },
    submission: {
      findFirst: (...args: unknown[]) => mockSubmissionFindFirst(...args),
      findMany: (...args: unknown[]) => mockSubmissionFindMany(...args),
      create: (...args: unknown[]) => mockCreate(...args),
      aggregate: (...args: unknown[]) => mockSubmissionAggregate(...args),
      count: (...args: unknown[]) => mockSubmissionCount(...args),
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockUserFindUnique.mockResolvedValue({ id: "user-test", streakRecord: 0 });
  mockSubmissionFindFirst.mockResolvedValue(null);
  mockSubmissionFindMany.mockResolvedValue([{ createdAt: new Date() }]);
  mockSubmissionAggregate.mockResolvedValue({ _avg: { timeTaken: 80 } });
  mockSubmissionCount.mockResolvedValue(3);
  mockUserUpdate.mockResolvedValue({ streak: 1, streakRecord: 1 });
  mockAuth.mockResolvedValue(null);
  mockChallengeStartFindUnique.mockResolvedValue(null);
  mockChallengeStartCreateMany.mockResolvedValue({ count: 1 });
});

// ─── shared test data ─────────────────────────────────────────────────────────

const activeChallenge = {
  id: "ch-1",
  title: "Two Sum",
  description: "Find two numbers that add up to target",
  difficulty: "medium" as const,
  points: 200,
  categoryId: "cat-arrays",
  category: { id: "cat-arrays", name: "Arrays", createdAt: new Date() },
  hint: "Use a hash map",
  examples: [{ input: "[2,7,11,15], 9", output: "[0,1]" }],
  testCases: [{ id: 1, name: "T1", status: "pending" }],
  starterCode: "function twoSum(nums, target) {}",
  supportedLanguages: ["javascript", "typescript", "python", "php"] as const,
  starterCodes: {
    javascript: "function twoSum(nums, target) {}",
    typescript: "function twoSum(nums: number[], target: number): number[] {}",
    python: "def two_sum(nums, target):\n    pass",
    php: "<?php\n\nfunction twoSum($nums, $target) {\n}\n",
  },
  isActive: true,
  date: new Date("2026-04-05"),
};

// ─── /api/challenge/daily ─────────────────────────────────────────────────────

describe("GET /api/challenge/daily", () => {
  it("returns 200 with full challenge details", async () => {
    mockFindFirst.mockResolvedValueOnce(activeChallenge);
    const res = await getDailyHandler();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({
      id: "ch-1",
      title: "Two Sum",
      difficulty: "medium",
      points: 200,
      hint: "Use a hash map",
      defaultLanguage: "javascript",
      supportedLanguages: ["javascript", "typescript", "python", "php"],
      todaySubmission: null,
    });
    expect(json.starterCodes).toMatchObject({
      javascript: "function twoSum(nums, target) {}",
    });
  });

  it("returns 404 when no challenge for today and no active fallback", async () => {
    mockFindFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    const res = await getDailyHandler();
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json).toHaveProperty("error");
  });

  it("returns empty string for null hint", async () => {
    mockFindFirst.mockResolvedValueOnce({ ...activeChallenge, hint: null });
    const res = await getDailyHandler();
    const json = await res.json();
    expect(json.hint).toBe("");
  });

  it("fills starterCodes from legacy starterCode when JSON map empty", async () => {
    mockFindFirst.mockResolvedValueOnce({
      ...activeChallenge,
      starterCode: "function legacy() {}",
      starterCodes: {},
    });
    const res = await getDailyHandler();
    const json = await res.json();
    expect(json.starterCodes.javascript).toBe("function legacy() {}");
    expect(json.starterCode).toBe("function legacy() {}");
  });

  it("tries UTC-day challenge first, then active fallback", async () => {
    mockFindFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(activeChallenge);
    await getDailyHandler();
    expect(mockFindFirst).toHaveBeenCalledTimes(2);
    expect(mockFindFirst.mock.calls[0][0]).toMatchObject({
      where: { date: { gte: expect.any(Date), lt: expect.any(Date) } },
      include: { category: true },
    });
    expect(mockFindFirst.mock.calls[1][0]).toMatchObject({
      where: { isActive: true },
      orderBy: { date: "desc" },
      include: { category: true },
    });
  });

  it("does not query submissions when unauthenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);
    mockFindFirst.mockResolvedValueOnce(activeChallenge);
    await getDailyHandler();
    expect(mockSubmissionFindFirst).not.toHaveBeenCalled();
  });

  it("returns todaySubmission when logged-in user already submitted today", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "user-test", email: "t@test.com" } });
    mockFindFirst.mockResolvedValueOnce(activeChallenge);
    mockSubmissionFindFirst.mockResolvedValueOnce({
      status: "completed",
      createdAt: new Date("2026-04-06T15:00:00.000Z"),
    });
    const res = await getDailyHandler();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.todaySubmission).toEqual({
      status: "completed",
      submittedAt: "2026-04-06T15:00:00.000Z",
    });
  });

  it("returns failed todaySubmission when last submission failed", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "user-test" } });
    mockFindFirst.mockResolvedValueOnce(activeChallenge);
    mockSubmissionFindFirst.mockResolvedValueOnce({
      status: "failed",
      createdAt: new Date("2026-04-06T12:30:00.000Z"),
    });
    const res = await getDailyHandler();
    const json = await res.json();
    expect(json.todaySubmission).toEqual({
      status: "failed",
      submittedAt: "2026-04-06T12:30:00.000Z",
    });
  });

  it("returns todaySubmission null when authenticated but no submission today", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "user-test" } });
    mockFindFirst.mockResolvedValueOnce(activeChallenge);
    mockSubmissionFindFirst.mockResolvedValueOnce(null);
    const res = await getDailyHandler();
    const json = await res.json();
    expect(json.todaySubmission).toBeNull();
    expect(mockSubmissionFindFirst).toHaveBeenCalled();
  });

  // Regression zu #46: Die Startzeit muss serverseitig entstehen, damit die
  // Lösezeit nicht vom Client bestimmt wird.
  it("records the solve start once for a logged-in user", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "user-test" } });
    mockFindFirst.mockResolvedValueOnce(activeChallenge);
    await getDailyHandler();
    expect(mockChallengeStartCreateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [{ userId: "user-test", challengeId: "ch-1" }],
        skipDuplicates: true,
      })
    );
  });

  it("does not record a solve start for anonymous visitors", async () => {
    mockAuth.mockResolvedValueOnce(null);
    mockFindFirst.mockResolvedValueOnce(activeChallenge);
    await getDailyHandler();
    expect(mockChallengeStartCreateMany).not.toHaveBeenCalled();
  });
});

// ─── /api/challenge/today ─────────────────────────────────────────────────────

describe("GET /api/challenge/today", () => {
  it("returns 200 with summary fields in uppercase", async () => {
    mockFindFirst.mockResolvedValueOnce(activeChallenge);
    const res = await getTodayHandler();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.title).toBe("TWO SUM");
    expect(json.category).toBe("ARRAYS");
  });

  it("returns 404 when no challenge for today and no active fallback", async () => {
    mockFindFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    const res = await getTodayHandler();
    expect(res.status).toBe(404);
  });

  it("includes difficulty and points", async () => {
    mockFindFirst.mockResolvedValueOnce(activeChallenge);
    const res = await getTodayHandler();
    const json = await res.json();
    expect(json.difficulty).toBe("medium");
    expect(json.points).toBe(200);
  });

  it("returns uppercased category name", async () => {
    mockFindFirst.mockResolvedValueOnce({
      ...activeChallenge,
      category: { id: "cat-graphs", name: "Graphs", createdAt: new Date() },
    });
    const res = await getTodayHandler();
    const json = await res.json();
    expect(json.category).toBe("GRAPHS");
  });
});

// ─── /api/challenge/[id]/run ──────────────────────────────────────────────────

describe("POST /api/challenge/[id]/run", () => {
  function makeRequest(id: string, code = "code", language = "javascript") {
    return new NextRequest(`http://localhost/api/challenge/${id}/run`, {
      method: "POST",
      body: JSON.stringify({ code, language }),
      headers: { "Content-Type": "application/json" },
    });
  }

  it("returns 404 when challenge does not exist", async () => {
    mockFindUniqueChallenge.mockResolvedValueOnce(null);
    const res = await runTestsHandler(makeRequest("missing"), {
      params: Promise.resolve({ id: "missing" }),
    });
    expect(res.status).toBe(404);
  });

  it("returns 400 when language is not allowed", async () => {
    mockFindUniqueChallenge.mockResolvedValueOnce(activeChallenge);
    const res = await runTestsHandler(makeRequest("ch-1", "x", "rust"), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    expect(res.status).toBe(400);
  });

  it("returns 200 with test cases", async () => {
    mockFindUniqueChallenge.mockResolvedValueOnce(activeChallenge);
    const res = await runTestsHandler(makeRequest("ch-1"), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("testCases");
    expect(Array.isArray(json.testCases)).toBe(true);
    expect(json.language).toBe("javascript");
  });

  it("returns 5 test cases in the stub", async () => {
    mockFindUniqueChallenge.mockResolvedValueOnce(activeChallenge);
    const res = await runTestsHandler(makeRequest("ch-1"), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    const json = await res.json();
    expect(json.testCases).toHaveLength(5);
  });

  it("includes passed and failed test cases", async () => {
    mockFindUniqueChallenge.mockResolvedValueOnce(activeChallenge);
    const res = await runTestsHandler(makeRequest("ch-1"), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    const json = await res.json();
    const statuses = json.testCases.map((tc: { status: string }) => tc.status);
    expect(statuses).toContain("passed");
    expect(statuses).toContain("failed");
  });

  it("echoes python in stub names when language is python", async () => {
    mockFindUniqueChallenge.mockResolvedValueOnce(activeChallenge);
    const res = await runTestsHandler(makeRequest("ch-1", "print(1)", "python"), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    const json = await res.json();
    expect(json.language).toBe("python");
    expect(json.testCases[0].name).toContain("python");
  });
});

// ─── /api/challenge/[id]/submit ───────────────────────────────────────────────

describe("POST /api/challenge/[id]/submit", () => {
  function makeRequest(
    id: string,
    code = "function solve() {}",
    language = "javascript",
    extra?: Record<string, unknown>
  ) {
    return new NextRequest(`http://localhost/api/challenge/${id}/submit`, {
      method: "POST",
      body: JSON.stringify({ code, language, ...extra }),
      headers: { "Content-Type": "application/json" },
    });
  }

  it("returns 200 with success=true and test cases on valid challenge", async () => {
    mockFindUniqueChallenge.mockResolvedValueOnce(activeChallenge);
    mockCreate.mockResolvedValueOnce({});
    const res = await submitHandler(makeRequest("ch-1"), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.testCases)).toBe(true);
  });

  it("returns 404 when challenge does not exist", async () => {
    mockFindUniqueChallenge.mockResolvedValueOnce(null);
    const res = await submitHandler(makeRequest("nonexistent"), {
      params: Promise.resolve({ id: "nonexistent" }),
    });
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json).toHaveProperty("error");
  });

  it("returns 401 when session user is not in database", async () => {
    mockUserFindUnique.mockResolvedValueOnce(null);
    const res = await submitHandler(makeRequest("ch-1"), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    expect(res.status).toBe(401);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns 409 when already submitted today (UTC)", async () => {
    mockSubmissionFindFirst.mockResolvedValueOnce({ id: "existing-sub" });
    mockFindUniqueChallenge.mockResolvedValueOnce(activeChallenge);
    const res = await submitHandler(makeRequest("ch-1"), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error).toMatch(/heute \(UTC\) bereits/);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("creates a submission record in the database", async () => {
    mockFindUniqueChallenge.mockResolvedValueOnce(activeChallenge);
    mockCreate.mockResolvedValueOnce({});
    await submitHandler(makeRequest("ch-1", "my code", "typescript"), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          challengeId: "ch-1",
          code: "my code",
          language: "typescript",
          status: "completed",
          timeTaken: 1,
        }),
      })
    );
  });

  // Regression zu #46: Die Lösezeit entscheidet über die Platzierung in der
  // Rangliste und darf deshalb nicht vom Client kommen.
  it("ignores a client-supplied solveDurationSeconds", async () => {
    mockFindUniqueChallenge.mockResolvedValueOnce(activeChallenge);
    mockChallengeStartFindUnique.mockResolvedValueOnce({
      startedAt: new Date(Date.now() - 300_000), // vor 5 Minuten
    });
    mockCreate.mockResolvedValueOnce({});
    await submitHandler(makeRequest("ch-1", "code", "javascript", { solveDurationSeconds: 1 }), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    const stored = mockCreate.mock.calls[0][0].data.timeTaken;
    expect(stored).not.toBe(1);
    expect(stored).toBeGreaterThanOrEqual(299);
    expect(stored).toBeLessThanOrEqual(302);
  });

  it("computes timeTaken from the server-side start record", async () => {
    mockFindUniqueChallenge.mockResolvedValueOnce(activeChallenge);
    mockChallengeStartFindUnique.mockResolvedValueOnce({
      startedAt: new Date(Date.now() - 142_000),
    });
    mockCreate.mockResolvedValueOnce({});
    await submitHandler(makeRequest("ch-1", "code", "javascript"), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    const stored = mockCreate.mock.calls[0][0].data.timeTaken;
    expect(stored).toBeGreaterThanOrEqual(141);
    expect(stored).toBeLessThanOrEqual(144);
  });

  it("falls back to execution time when no start record exists", async () => {
    mockFindUniqueChallenge.mockResolvedValueOnce(activeChallenge);
    mockChallengeStartFindUnique.mockResolvedValueOnce(null);
    mockCreate.mockResolvedValueOnce({});
    await submitHandler(makeRequest("ch-1", "code", "javascript", { solveDurationSeconds: 5 }), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    const stored = mockCreate.mock.calls[0][0].data.timeTaken;
    expect(stored).not.toBe(5);
    expect(stored).toBe(1); // Sandbox-Summe des Stub-Runners
  });

  it("update streak and record after successful submission", async () => {
    mockFindUniqueChallenge.mockResolvedValueOnce(activeChallenge);
    mockCreate.mockResolvedValueOnce({});
    await submitHandler(makeRequest("ch-1"), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    expect(mockSubmissionFindMany).toHaveBeenCalled();
    expect(mockUserUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user-test" },
        data: expect.objectContaining({
          streak: expect.any(Number),
          streakRecord: expect.any(Number),
        }),
      })
    );
  });

  it("returns 400 when language is not allowed", async () => {
    mockFindUniqueChallenge.mockResolvedValueOnce(activeChallenge);
    const res = await submitHandler(makeRequest("ch-1", "x", "rust"), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    expect(res.status).toBe(400);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("all stub test cases have status=passed on submit", async () => {
    mockFindUniqueChallenge.mockResolvedValueOnce(activeChallenge);
    mockCreate.mockResolvedValueOnce({});
    const res = await submitHandler(makeRequest("ch-1"), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    const json = await res.json();
    const statuses = json.testCases.map((tc: { status: string }) => tc.status);
    expect(statuses.every((s: string) => s === "passed")).toBe(true);
  });

  it("returns celebration payload with streak and community stats on success", async () => {
    mockFindUniqueChallenge.mockResolvedValueOnce(activeChallenge);
    mockCreate.mockResolvedValueOnce({});
    const res = await submitHandler(makeRequest("ch-1"), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.celebration).toBeDefined();
    expect(json.celebration).toMatchObject({
      streak: 1,
      streakRecord: 1,
      completionsToday: 3,
      avgSolveTimeTodaySeconds: 80,
    });
    expect(typeof json.celebration.timeTakenSeconds).toBe("number");
    expect(mockSubmissionAggregate).toHaveBeenCalled();
    expect(mockSubmissionCount).toHaveBeenCalled();
  });
});
