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

// ─── Prisma mock ─────────────────────────────────────────────────────────────

const mockFindFirst = vi.fn();
const mockFindUnique = vi.fn();
const mockCreate = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    challenge: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
    submission: {
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
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

  it("returns empty string for null starterCode", async () => {
    mockFindFirst.mockResolvedValueOnce({ ...activeChallenge, starterCode: null });
    const res = await getDailyHandler();
    const json = await res.json();
    expect(json.starterCode).toBe("");
  });

  it("versucht zuerst Challenge am UTC-Tag, dann aktiven Fallback", async () => {
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
  function makeRequest(id: string, code = "code") {
    return new NextRequest(`http://localhost/api/challenge/${id}/run`, {
      method: "POST",
      body: JSON.stringify({ code }),
      headers: { "Content-Type": "application/json" },
    });
  }

  it("returns 200 with test cases", async () => {
    const res = await runTestsHandler(makeRequest("ch-1"), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("testCases");
    expect(Array.isArray(json.testCases)).toBe(true);
  });

  it("returns 5 test cases in the stub", async () => {
    const res = await runTestsHandler(makeRequest("ch-1"), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    const json = await res.json();
    expect(json.testCases).toHaveLength(5);
  });

  it("includes passed and failed test cases", async () => {
    const res = await runTestsHandler(makeRequest("ch-1"), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    const json = await res.json();
    const statuses = json.testCases.map((tc: { status: string }) => tc.status);
    expect(statuses).toContain("passed");
    expect(statuses).toContain("failed");
  });
});

// ─── /api/challenge/[id]/submit ───────────────────────────────────────────────

describe("POST /api/challenge/[id]/submit", () => {
  function makeRequest(id: string, code = "function solve() {}") {
    return new NextRequest(`http://localhost/api/challenge/${id}/submit`, {
      method: "POST",
      body: JSON.stringify({ code }),
      headers: { "Content-Type": "application/json" },
    });
  }

  it("returns 200 with success=true and test cases on valid challenge", async () => {
    mockFindUnique.mockResolvedValueOnce(activeChallenge);
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
    mockFindUnique.mockResolvedValueOnce(null);
    const res = await submitHandler(makeRequest("nonexistent"), {
      params: Promise.resolve({ id: "nonexistent" }),
    });
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json).toHaveProperty("error");
  });

  it("creates a submission record in the database", async () => {
    mockFindUnique.mockResolvedValueOnce(activeChallenge);
    mockCreate.mockResolvedValueOnce({});
    await submitHandler(makeRequest("ch-1", "my code"), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          challengeId: "ch-1",
          code: "my code",
          status: "completed",
        }),
      })
    );
  });

  it("all stub test cases have status=passed on submit", async () => {
    mockFindUnique.mockResolvedValueOnce(activeChallenge);
    mockCreate.mockResolvedValueOnce({});
    const res = await submitHandler(makeRequest("ch-1"), {
      params: Promise.resolve({ id: "ch-1" }),
    });
    const json = await res.json();
    const statuses = json.testCases.map((tc: { status: string }) => tc.status);
    expect(statuses.every((s: string) => s === "passed")).toBe(true);
  });
});
