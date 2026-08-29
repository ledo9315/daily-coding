import { describe, it, expect, vi, beforeEach } from "vitest";
import { codeHash } from "@/lib/server/code-hash";
import { NextRequest } from "next/server";
import { GET as getDailyHandler } from "../challenge/daily/route";
import { GET as getTodayHandler } from "../challenge/today/route";
import { POST as runTestsHandler } from "../challenge/[id]/run/route";
import { POST as submitHandler } from "../challenge/[id]/submit/route";

// ─── Auth session mock ────────────────────────────────────────────────────────

vi.mock("@/lib/auth-session", () => ({
  getSessionUserId: vi.fn().mockResolvedValue({ userId: "user-test" }),
}));

const mockCheckRateLimit = vi.fn();
vi.mock("@/lib/server/rate-limiter", () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
}));

const mockAuth = vi.fn();
vi.mock("@/auth", () => ({
  auth: () => mockAuth(),
}));

// Partial mock: every test keeps the real stub runner, a single one overrides it to
// simulate a failing attempt - the stub always passes on submit.
type ChallengeExecution = typeof import("@/lib/server/challenge-execution");
const { mockRunChallengeTests } = vi.hoisted(() => ({ mockRunChallengeTests: vi.fn() }));
vi.mock("@/lib/server/challenge-execution", async (importOriginal) => {
  const actual = await importOriginal<ChallengeExecution>();
  mockRunChallengeTests.mockImplementation(actual.runChallengeTests);
  return {
    ...actual,
    runChallengeTests: (...args: Parameters<ChallengeExecution["runChallengeTests"]>) =>
      mockRunChallengeTests(...args),
  };
});

// Mocked whole: the route only owes us the call, and the module's own behaviour is
// covered in lib/server/__tests__/achievement-unlocks.test.ts.
const mockPersistAchievementUnlocks = vi.fn().mockResolvedValue([]);
vi.mock("@/lib/server/achievement-unlocks", () => ({
  persistAchievementUnlocks: (...args: unknown[]) =>
    mockPersistAchievementUnlocks(...args),
}));

// ─── Prisma mock ─────────────────────────────────────────────────────────────

const mockFindFirst = vi.fn();
const mockChallengeFindMany = vi.fn();
const mockRotationFindUnique = vi.fn();
const mockRotationUpdate = vi.fn();
const mockRotationCreate = vi.fn();
const mockFindUniqueChallenge = vi.fn();
const mockUserFindUnique = vi.fn();
const mockUserUpdate = vi.fn();
const mockSubmissionFindFirst = vi.fn();
const mockSubmissionFindMany = vi.fn();
const mockSubmissionAggregate = vi.fn();
const mockSubmissionCount = vi.fn();
const mockCreate = vi.fn();
const mockAchievementDefFindMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
      update: (...args: unknown[]) => mockUserUpdate(...args),
    },
    challenge: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      findMany: (...args: unknown[]) => mockChallengeFindMany(...args),
      findUnique: (...args: unknown[]) => mockFindUniqueChallenge(...args),
    },
    rotationState: {
      findUnique: (...args: unknown[]) => mockRotationFindUnique(...args),
      update: (...args: unknown[]) => mockRotationUpdate(...args),
      create: (...args: unknown[]) => mockRotationCreate(...args),
    },
    submission: {
      findFirst: (...args: unknown[]) => mockSubmissionFindFirst(...args),
      findMany: (...args: unknown[]) => mockSubmissionFindMany(...args),
      create: (...args: unknown[]) => mockCreate(...args),
      upsert: (...args: unknown[]) => mockCreate(...args),
      aggregate: (...args: unknown[]) => mockSubmissionAggregate(...args),
      count: (...args: unknown[]) => mockSubmissionCount(...args),
    },
    achievementDef: {
      findMany: (...args: unknown[]) => mockAchievementDefFindMany(...args),
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockCheckRateLimit.mockResolvedValue(true);
  mockUserFindUnique.mockResolvedValue({ id: "user-test", streakRecord: 0 });
  mockSubmissionFindFirst.mockResolvedValue(null);
  mockSubmissionFindMany.mockResolvedValue([{ createdAt: new Date() }]);
  mockSubmissionCount.mockResolvedValue(3);
  mockCreate.mockResolvedValue({ id: "sub-1" });
  mockPersistAchievementUnlocks.mockResolvedValue([]);
  mockAchievementDefFindMany.mockResolvedValue([]);
  mockUserUpdate.mockResolvedValue({ streak: 1, streakRecord: 1 });
  mockAuth.mockResolvedValue(null);
  // The daily is the ring: the active pool plus a pointer at where it stands.
  mockChallengeFindMany.mockResolvedValue([activeChallenge]);
  const startOfTodayUtc = new Date();
  startOfTodayUtc.setUTCHours(0, 0, 0, 0);
  mockRotationFindUnique.mockResolvedValue({
    id: "current",
    challengeId: activeChallenge.id,
    position: 0,
    day: startOfTodayUtc,
  });
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
  hints: [{ title: "Ansatz", body: "Use a hash map" }],
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
      hints: [{ title: "Ansatz", body: "Use a hash map" }],
      defaultLanguage: "javascript",
      supportedLanguages: ["javascript", "typescript", "python", "php"],
      todaySubmission: null,
    });
    expect(json.starterCodes).toMatchObject({
      javascript: "function twoSum(nums, target) {}",
    });
  });

  it("returns 404 when nothing is scheduled and the rotation pool is empty", async () => {
    mockFindFirst.mockResolvedValueOnce(null);
    mockChallengeFindMany.mockResolvedValueOnce([]);
    const res = await getDailyHandler();
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json).toHaveProperty("error");
  });

  it("returns an empty list when the hints column holds no array", async () => {
    // Legacy rows and hand-edited records reach the client too; the accordion maps over this.
    mockChallengeFindMany.mockResolvedValueOnce([{ ...activeChallenge, hints: null }]);
    const res = await getDailyHandler();
    const json = await res.json();
    expect(json.hints).toEqual([]);
  });

  it("fills starterCodes from legacy starterCode when JSON map empty", async () => {
    mockChallengeFindMany.mockResolvedValueOnce([
      { ...activeChallenge, starterCode: "function legacy() {}", starterCodes: {} },
    ]);
    const res = await getDailyHandler();
    const json = await res.json();
    expect(json.starterCodes.javascript).toBe("function legacy() {}");
    expect(json.starterCode).toBe("function legacy() {}");
  });

  // #67: without rotation the fallback served the same challenge forever. The rotation is now
  // an explicit order the admin can see and change.
  it("serves the challenge the ring points at", async () => {
    const res = await getDailyHandler();
    expect(res.status).toBe(200);
    expect((await res.json()).id).toBe("ch-1");
    expect(mockChallengeFindMany.mock.calls[0][0]).toMatchObject({
      where: { isActive: true },
      orderBy: [{ position: "asc" }, { id: "asc" }],
      include: { category: true },
    });
  });

  it("does not move the pointer twice on the same day", async () => {
    await getDailyHandler();
    expect(mockRotationUpdate).not.toHaveBeenCalled();
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
      testResults: null,
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
      testResults: null,
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

  // #60: return the stored test results of today's submission, otherwise the page
  // shows the empty template after a reload.
  it("returns the stored test results of today's submission", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "user-test" } });
    mockFindFirst.mockResolvedValueOnce(activeChallenge);
    mockSubmissionFindFirst.mockResolvedValueOnce({
      id: "sub-1",
      status: "completed",
      createdAt: new Date(),
      code: "x",
      language: "javascript",
      testResults: [
        { id: 1, name: "Einfaches Array", status: "passed" },
        { id: 2, name: "Leeres Array", status: "passed" },
      ],
    });
    const res = await getDailyHandler();
    const json = await res.json();
    expect(json.todaySubmission.testResults).toHaveLength(2);
    expect(json.todaySubmission.testResults[0].status).toBe("passed");
  });

  it("returns null test results for legacy submissions without them", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "user-test" } });
    mockFindFirst.mockResolvedValueOnce(activeChallenge);
    mockSubmissionFindFirst.mockResolvedValueOnce({
      id: "sub-old",
      status: "completed",
      createdAt: new Date(),
      code: "x",
      language: "javascript",
      testResults: null,
    });
    const res = await getDailyHandler();
    const json = await res.json();
    expect(json.todaySubmission.testResults).toBeNull();
  });

  // #47: the start time is returned so the page can display the elapsed working
  // time - the server stays the source of truth.
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

  it("returns 404 when nothing is scheduled and the rotation pool is empty", async () => {
    mockFindFirst.mockResolvedValueOnce(null);
    mockChallengeFindMany.mockResolvedValueOnce([]);
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
    mockChallengeFindMany.mockResolvedValueOnce([
      { ...activeChallenge, category: { id: "cat-graphs", name: "Graphs", createdAt: new Date() } },
    ]);
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
    mockChallengeFindMany.mockResolvedValueOnce([]);
    const res = await runTestsHandler(makeRequest("missing"), {
      params: Promise.resolve({ id: "missing" }),
    });
    expect(res.status).toBe(404);
  });

  it("does not run a real but non-daily challenge", async () => {
    const res = await runTestsHandler(makeRequest("future-challenge"), {
      params: Promise.resolve({ id: "future-challenge" }),
    });
    expect(res.status).toBe(404);
  });

  it("rejects oversized source code before execution", async () => {
    const res = await runTestsHandler(makeRequest("ch-1", "x".repeat(50_001)), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    expect(res.status).toBe(413);
  });

  it("measures the source-code limit in UTF-8 bytes", async () => {
    const res = await runTestsHandler(makeRequest("ch-1", "ä".repeat(25_001)), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    expect(res.status).toBe(413);
  });

  it("rejects a declared oversized request before parsing or rate-limit storage", async () => {
    const request = new NextRequest("http://localhost/api/challenge/ch-1/run", {
      method: "POST",
      body: "{}",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": "350001",
      },
    });

    const res = await runTestsHandler(request, {
      params: Promise.resolve({ id: "ch-1" }),
    });

    expect(res.status).toBe(413);
    expect(mockCheckRateLimit).not.toHaveBeenCalled();
  });

  it("rate-limits expensive code execution", async () => {
    mockCheckRateLimit.mockResolvedValueOnce(false);
    const res = await runTestsHandler(makeRequest("ch-1"), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    expect(res.status).toBe(429);
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
    mockChallengeFindMany.mockResolvedValueOnce([]);
    const res = await submitHandler(makeRequest("nonexistent"), {
      params: Promise.resolve({ id: "nonexistent" }),
    });
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json).toHaveProperty("error");
  });

  it("does not accept a non-daily challenge", async () => {
    const res = await submitHandler(makeRequest("old-challenge"), {
      params: Promise.resolve({ id: "old-challenge" }),
    });
    expect(res.status).toBe(404);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rate-limits submissions per authenticated user", async () => {
    mockCheckRateLimit.mockResolvedValueOnce(false);
    const res = await submitHandler(makeRequest("ch-1"), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    expect(res.status).toBe(429);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns 401 when session user is not in database", async () => {
    mockUserFindUnique.mockResolvedValueOnce(null);
    const res = await submitHandler(makeRequest("ch-1"), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    expect(res.status).toBe(401);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  // #200: a re-submission on the same UTC day overwrites the row instead of being rejected.
  it("overwrites today's submission instead of returning 409", async () => {
    mockSubmissionFindFirst.mockResolvedValueOnce({ id: "existing-sub", status: "failed" });
    mockFindUniqueChallenge.mockResolvedValueOnce(activeChallenge);
    mockCreate.mockResolvedValueOnce({});
    const res = await submitHandler(makeRequest("ch-1", "besserer code"), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    expect(res.status).toBe(200);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_submissionDay: { userId: "user-test", submissionDay: expect.any(Date) } },
        update: expect.objectContaining({ code: "besserer code", status: "completed" }),
      })
    );
  });

  it("keeps a solved day solved when a later attempt fails", async () => {
    mockSubmissionFindFirst.mockResolvedValueOnce({ id: "existing-sub", status: "completed" });
    mockFindUniqueChallenge.mockResolvedValueOnce(activeChallenge);
    mockRunChallengeTests.mockResolvedValueOnce({ testCases: [], runtimeOk: false });
    mockCreate.mockResolvedValueOnce({});
    const res = await submitHandler(makeRequest("ch-1", "kaputter code"), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.status).toBe("completed");
    expect(mockCreate.mock.calls[0][0].update.status).toBe("completed");
  });

  it("creates a submission record in the database", async () => {
    mockFindUniqueChallenge.mockResolvedValueOnce(activeChallenge);
    mockCreate.mockResolvedValueOnce({});
    await submitHandler(makeRequest("ch-1", "my code", "typescript"), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          challengeId: "ch-1",
          code: "my code",
          language: "typescript",
          status: "completed",
          submissionDay: expect.any(Date),
        }),
      })
    );
  });

  // #223 groups identical solutions by this hash. A branch of the upsert that forgets it
  // leaves the row out of the grouped list, where it simply looks like it was never solved.
  it("writes the code hash in both branches of the upsert", async () => {
    mockFindUniqueChallenge.mockResolvedValueOnce(activeChallenge);
    mockCreate.mockResolvedValueOnce({});
    await submitHandler(makeRequest("ch-1", "  my code  ", "typescript"), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    const expected = codeHash("  my code  ");
    expect(expected).toBe(codeHash("my code"));
    expect(mockCreate.mock.calls[0][0].create.codeHash).toBe(expected);
    expect(mockCreate.mock.calls[0][0].update.codeHash).toBe(expected);
  });

  // #91: the solve-time measurement is gone; no duration may be written any more.
  it("stores no timeTaken on a submission", async () => {
    mockFindUniqueChallenge.mockResolvedValueOnce(activeChallenge);
    mockCreate.mockResolvedValueOnce({});
    await submitHandler(makeRequest("ch-1", "code", "javascript"), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    expect(mockCreate.mock.calls[0][0].create).not.toHaveProperty("timeTaken");
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

  it("freezes reached achievements after a successful submission (#205)", async () => {
    mockFindUniqueChallenge.mockResolvedValueOnce(activeChallenge);
    mockCreate.mockResolvedValueOnce({});
    await submitHandler(makeRequest("ch-1"), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    expect(mockPersistAchievementUnlocks).toHaveBeenCalledWith(
      expect.anything(),
      "user-test"
    );
  });

  it("freezes nothing when the attempt failed", async () => {
    mockFindUniqueChallenge.mockResolvedValueOnce(activeChallenge);
    mockRunChallengeTests.mockResolvedValueOnce({ testCases: [], runtimeOk: false });
    mockCreate.mockResolvedValueOnce({});
    await submitHandler(makeRequest("ch-1", "kaputter code"), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    expect(mockPersistAchievementUnlocks).not.toHaveBeenCalled();
  });

  /**
   * The "once passed, it stays passed" rule of #200 read the day's submission without
   * asking which challenge it belonged to. The ring can move on within a UTC day when the
   * live challenge is deactivated, so a failed attempt at the new challenge inherited the
   * earlier solve - and with it, since #185, access to other people's solutions for a
   * challenge that was never solved.
   */
  it("looks up today's submission for this challenge, not just for the day", async () => {
    mockFindUniqueChallenge.mockResolvedValueOnce(activeChallenge);

    await submitHandler(makeRequest("ch-1"), {
      params: Promise.resolve({ id: "ch-1" }),
    });

    const dayLookup = mockSubmissionFindFirst.mock.calls.find(
      ([args]) => (args as { where?: { createdAt?: unknown } })?.where?.createdAt
    );
    expect(dayLookup?.[0]).toMatchObject({
      where: { userId: "user-test", challengeId: "ch-1" },
    });
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

  it("returns the id of the row today's attempt was stored in", async () => {
    mockFindUniqueChallenge.mockResolvedValueOnce(activeChallenge);
    mockCreate.mockResolvedValueOnce({ id: "sub-42" });
    const res = await submitHandler(makeRequest("ch-1"), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    const json = await res.json();
    expect(json.submissionId).toBe("sub-42");
    expect(mockCreate.mock.calls[0][0].select).toEqual({ id: true });
  });

  it("marks the attempt that turns the day green as the first solve", async () => {
    mockFindUniqueChallenge.mockResolvedValueOnce(activeChallenge);
    const res = await submitHandler(makeRequest("ch-1"), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    expect((await res.json()).firstSolveToday).toBe(true);
  });

  it("does not mark a repeat solve on an already completed day as the first solve", async () => {
    mockSubmissionFindFirst.mockResolvedValueOnce({ id: "existing-sub", status: "completed" });
    mockFindUniqueChallenge.mockResolvedValueOnce(activeChallenge);
    const res = await submitHandler(makeRequest("ch-1"), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    expect((await res.json()).firstSolveToday).toBe(false);
  });

  it("returns the definitions of the achievements this submission unlocked", async () => {
    mockFindUniqueChallenge.mockResolvedValueOnce(activeChallenge);
    mockPersistAchievementUnlocks.mockResolvedValueOnce(["ach-1"]);
    mockAchievementDefFindMany.mockResolvedValueOnce([
      { id: "ach-1", title: "Erste Schritte", description: "Erste Challenge gelöst" },
    ]);
    const res = await submitHandler(makeRequest("ch-1"), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    const json = await res.json();
    expect(json.unlockedAchievements).toEqual([
      { id: "ach-1", title: "Erste Schritte", description: "Erste Challenge gelöst" },
    ]);
    expect(mockAchievementDefFindMany).toHaveBeenCalledWith({
      where: { id: { in: ["ach-1"] } },
      select: { id: true, title: true, description: true },
    });
  });

  it("returns an empty achievement list when the attempt failed", async () => {
    mockFindUniqueChallenge.mockResolvedValueOnce(activeChallenge);
    mockRunChallengeTests.mockResolvedValueOnce({ testCases: [], runtimeOk: false });
    const res = await submitHandler(makeRequest("ch-1", "kaputter code"), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    const json = await res.json();
    expect(json.unlockedAchievements).toEqual([]);
    expect(json.firstSolveToday).toBe(false);
    expect(mockAchievementDefFindMany).not.toHaveBeenCalled();
  });
});
