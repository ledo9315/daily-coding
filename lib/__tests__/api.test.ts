import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { utcDaysInMonth } from "@/lib/monthly-challenge-goal";
import {
  getServerApiBaseUrl,
  getRanking,
  getTodayChallenge,
  getDashboardRankingPreview,
  getUserStats,
  getUserProfile,
  getDailyChallenge,
  submitSolution,
  runTests,
  getCommunityFeed,
} from "../api";

// ─── fetch mock ──────────────────────────────────────────────────────────────

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  // Simulate browser environment (window defined) so base URL is empty
  vi.stubGlobal("window", {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

function mockOkResponse(data: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => data,
  });
}

function mockErrorResponse(status: number, body?: Record<string, unknown>) {
  const raw = body !== undefined ? JSON.stringify(body) : "{}";
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    text: async () => raw,
  });
}

// ─── getServerApiBaseUrl ─────────────────────────────────────────────────────

describe("getServerApiBaseUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("trims NEXT_PUBLIC_APP_URL and takes precedence over VERCEL_URL", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://app.example.com/");
    vi.stubEnv("VERCEL_URL", "ignore.vercel.app");
    expect(getServerApiBaseUrl()).toBe("https://app.example.com");
  });

  it("uses https://VERCEL_URL when NEXT_PUBLIC_APP_URL is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    vi.stubEnv("VERCEL_URL", "my-project.vercel.app");
    expect(getServerApiBaseUrl()).toBe("https://my-project.vercel.app");
  });

  it("falls back to NEXTAUTH_URL", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    vi.stubEnv("VERCEL_URL", "");
    vi.stubEnv("NEXTAUTH_URL", "https://auth.site/");
    expect(getServerApiBaseUrl()).toBe("https://auth.site");
  });

  it("falls back to localhost with PORT", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    vi.stubEnv("VERCEL_URL", "");
    vi.stubEnv("NEXTAUTH_URL", "");
    vi.stubEnv("PORT", "3001");
    expect(getServerApiBaseUrl()).toBe("http://localhost:3001");
  });
});

// ─── apiFetch error handling ─────────────────────────────────────────────────

describe("apiFetch error handling", () => {
  it("throws on non-ok responses", async () => {
    mockErrorResponse(500);
    await expect(getRanking("today")).rejects.toThrow("API error 500");
  });

  it("includes the path in the error message", async () => {
    mockErrorResponse(404);
    await expect(getRanking("today")).rejects.toThrow("/api/ranking");
  });

  it("uses server JSON `error` string when present", async () => {
    mockErrorResponse(409, {
      error: "Already submitted today (UTC).",
    });
    await expect(submitSolution("ch-1", "code", "javascript")).rejects.toThrow(
      "Already submitted today (UTC)."
    );
  });
});

// ─── getRanking ──────────────────────────────────────────────────────────────

describe("getRanking", () => {
  it("calls GET /api/ranking?period=today", async () => {
    mockOkResponse([]);
    await getRanking("today");
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/ranking?period=today",
      expect.objectContaining({ headers: { "Content-Type": "application/json" } })
    );
  });

  it("calls GET /api/ranking?period=week", async () => {
    mockOkResponse([]);
    await getRanking("week");
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/ranking?period=week",
      expect.anything()
    );
  });

  it("calls GET /api/ranking?period=month", async () => {
    mockOkResponse([]);
    await getRanking("month");
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/ranking?period=month",
      expect.anything()
    );
  });

  it("returns parsed ranking entries", async () => {
    const entries = [
      { rank: 1, name: "Alice", initials: "A", points: 100, avatar: "🐱", level: 5 },
    ];
    mockOkResponse(entries);
    const result = await getRanking("today");
    expect(result).toEqual(entries);
  });
});

// ─── getTodayChallenge ────────────────────────────────────────────────────────

describe("getTodayChallenge", () => {
  it("calls GET /api/challenge/today", async () => {
    mockOkResponse({});
    await getTodayChallenge();
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/challenge/today",
      expect.anything()
    );
  });

  it("returns the challenge data", async () => {
    const challenge = {
      title: "Two Sum",
      description: "Find two numbers that add up to target",
      difficulty: "easy" as const,
      points: 100,
      category: "Arrays",
    };
    mockOkResponse(challenge);
    const result = await getTodayChallenge();
    expect(result).toEqual(challenge);
  });
});

// ─── getDashboardRankingPreview ───────────────────────────────────────────────

describe("getDashboardRankingPreview", () => {
  it("calls GET /api/ranking/preview", async () => {
    mockOkResponse({ today: [] });
    await getDashboardRankingPreview();
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/ranking/preview",
      expect.anything()
    );
  });

  it("returns today ranking entries without team", async () => {
    const preview = { today: [{ rank: 1, name: "Bob", initials: "B", points: 200, avatar: "🐶", level: 3 }] };
    mockOkResponse(preview);
    const result = await getDashboardRankingPreview();
    expect(result).toEqual(preview);
    expect(result).not.toHaveProperty("team");
  });
});

// ─── getUserStats ─────────────────────────────────────────────────────────────

describe("getUserStats", () => {
  it("calls GET /api/user/stats", async () => {
    mockOkResponse({});
    await getUserStats();
    expect(mockFetch).toHaveBeenCalledWith("/api/user/stats", expect.anything());
  });

  it("returns user stats without team fields", async () => {
    const stats = {
      rank: "#1",
      points: "1.500",
      streak: 7,
      streakRecord: 14,
      totalSolved: 42,
      level: 5,
      levelMax: 3000,
      badges: 3,
      badgesTotal: 6,
      monthlyChallengesSolved: 5,
      monthlyChallengeGoal: utcDaysInMonth(),
    };
    mockOkResponse(stats);
    const result = await getUserStats();
    expect(result).toEqual(stats);
    expect(result).not.toHaveProperty("teamRank");
    expect(result).not.toHaveProperty("teamName");
  });
});

// ─── getUserProfile ───────────────────────────────────────────────────────────

describe("getUserProfile", () => {
  it("calls GET /api/user/profile", async () => {
    mockOkResponse({});
    await getUserProfile();
    expect(mockFetch).toHaveBeenCalledWith("/api/user/profile", expect.anything());
  });
});

// ─── getDailyChallenge ────────────────────────────────────────────────────────

describe("getDailyChallenge", () => {
  it("calls GET /api/challenge/daily", async () => {
    mockOkResponse({});
    await getDailyChallenge();
    expect(mockFetch).toHaveBeenCalledWith("/api/challenge/daily", expect.anything());
  });

  it("returns full challenge details", async () => {
    const challenge = {
      id: "abc123",
      title: "FizzBuzz",
      description: "Classic FizzBuzz",
      difficulty: "easy" as const,
      points: 50,
      category: "Basics",
      hint: "Use modulo",
      examples: [{ input: "15", output: "FizzBuzz" }],
      testCases: [],
      supportedLanguages: ["javascript", "typescript", "python", "php"] as const,
      defaultLanguage: "javascript" as const,
      starterCodes: {
        javascript: "function fizzBuzz(n) {}",
        typescript: "function fizzBuzz(n: number): string[] {}",
        python: "def fizz_buzz(n):\n    pass",
        php: "<?php\n\nfunction fizzBuzz($n) {\n}\n",
      },
      starterCode: "function fizzBuzz(n) {}",
      todaySubmission: null,
    };
    mockOkResponse(challenge);
    const result = await getDailyChallenge();
    expect(result).toEqual(challenge);
  });
});

// ─── submitSolution ───────────────────────────────────────────────────────────

describe("submitSolution", () => {
  it("calls POST /api/challenge/:id/submit with code and language in body", async () => {
    mockOkResponse({ success: true, testCases: [] });
    await submitSolution("ch-1", "function solve() {}", "javascript");
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/challenge/ch-1/submit",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          code: "function solve() {}",
          language: "javascript",
        }),
      })
    );
  });

  it("includes solveDurationSeconds in submit body when provided", async () => {
    mockOkResponse({ success: true, testCases: [] });
    await submitSolution("ch-1", "x", "javascript", 90);
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/challenge/ch-1/submit",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          code: "x",
          language: "javascript",
          solveDurationSeconds: 90,
        }),
      })
    );
  });

  it("returns success and test cases", async () => {
    const response = { success: true, testCases: [{ id: 1, name: "T1", status: "passed" as const }] };
    mockOkResponse(response);
    const result = await submitSolution("ch-1", "code", "python");
    expect(result).toEqual(response);
  });

  it("propagates API errors", async () => {
    mockErrorResponse(404);
    await expect(submitSolution("nonexistent", "code", "javascript")).rejects.toThrow("API error 404");
  });
});

// ─── runTests ─────────────────────────────────────────────────────────────────

describe("runTests", () => {
  it("calls POST /api/challenge/:id/run with code and language in body", async () => {
    mockOkResponse({ testCases: [] });
    await runTests("ch-2", "console.log('hi')", "typescript");
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/challenge/ch-2/run",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          code: "console.log('hi')",
          language: "typescript",
        }),
      })
    );
  });

  it("returns test cases", async () => {
    const response = { testCases: [{ id: 1, name: "T1", status: "passed" as const, time: "5ms" }] };
    mockOkResponse(response);
    const result = await runTests("ch-2", "code", "javascript");
    expect(result).toEqual(response);
  });
});

// ─── getCommunityFeed ─────────────────────────────────────────────────────────

describe("getCommunityFeed", () => {
  it("calls GET /api/community/feed", async () => {
    mockOkResponse({ items: [], nextCursor: null });
    await getCommunityFeed();
    expect(mockFetch).toHaveBeenCalledWith("/api/community/feed", expect.anything());
  });

  it("returns feed page with items and nextCursor", async () => {
    const page = {
      items: [
        {
          id: "f1",
          kind: "challenge-solved" as const,
          user: { name: "Alice", initials: "A", avatar: "🐱", level: 3 },
          username: "@alice",
          action: "hat die Challenge gelöst",
          challenge: "FizzBuzz",
          points: 100,
          time: "vor 5 Minuten",
          createdAt: new Date().toISOString(),
        },
      ],
      nextCursor: null,
    };
    mockOkResponse(page);
    const result = await getCommunityFeed();
    expect(result).toEqual(page);
  });

  it("passes cursor and limit as query string", async () => {
    mockOkResponse({ items: [], nextCursor: null });
    await getCommunityFeed({ cursor: "sub-x", limit: 10 });
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/community/feed?cursor=sub-x&limit=10",
      expect.anything(),
    );
  });
});
