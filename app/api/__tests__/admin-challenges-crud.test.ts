import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockAuth = vi.fn();
const mockUserFindUnique = vi.fn();
const mockFindMany = vi.fn();
const mockFindUniqueChallenge = vi.fn();
const mockChallengeUpdate = vi.fn();
const mockChallengeDelete = vi.fn();
const mockCategoryFindUnique = vi.fn();

vi.mock("@/auth", () => ({
  auth: () => mockAuth(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
    },
    challenge: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      findUnique: (...args: unknown[]) => mockFindUniqueChallenge(...args),
      update: (...args: unknown[]) => mockChallengeUpdate(...args),
      delete: (...args: unknown[]) => mockChallengeDelete(...args),
    },
    category: {
      findUnique: (...args: unknown[]) => mockCategoryFindUnique(...args),
    },
  },
}));

import { GET as getList } from "../admin/challenges/route";
import {
  GET as getOne,
  PATCH as patchOne,
  DELETE as deleteOne,
} from "../admin/challenges/[id]/route";

const patchBody = {
  title: "T",
  description: "D",
  difficulty: "easy" as const,
  points: 10,
  categoryId: "cat-1",
  examples: [],
  testCases: [{ name: "t", input: "1", expected: "1" }],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "f",
      typescript: "f",
      python: "f",
      php: "f",
    },
  },
  starterCodes: { javascript: "j", typescript: "t", python: "p", php: "x" },
  dateIso: null,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/admin/challenges", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);
    const res = await getList();
    expect(res.status).toBe(401);
  });

  it("returns list when admin", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "a1" } });
    mockUserFindUnique.mockResolvedValueOnce({ role: "admin" });
    mockFindMany.mockResolvedValueOnce([
      {
        id: "c1",
        title: "X",
        difficulty: "easy",
        points: 10,
        isActive: true,
        date: null,
        updatedAt: new Date("2026-01-01"),
        category: { name: "Algo" },
        _count: { submissions: 0 },
      },
    ]);
    const res = await getList();
    expect(res.status).toBe(200);
    const json = (await res.json()) as Array<{ id: string }>;
    expect(json[0]?.id).toBe("c1");
  });
});

describe("/api/admin/challenges/[id]", () => {
  it("GET returns 404 when missing", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "a1" } });
    mockUserFindUnique.mockResolvedValueOnce({ role: "admin" });
    mockFindUniqueChallenge.mockResolvedValueOnce(null);
    const res = await getOne(
      new NextRequest("http://localhost/api/admin/challenges/x"),
      { params: Promise.resolve({ id: "x" }) },
    );
    expect(res.status).toBe(404);
  });

  it("PATCH updates when admin", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "a1" } });
    mockUserFindUnique.mockResolvedValueOnce({ role: "admin" });
    mockFindUniqueChallenge.mockResolvedValueOnce({ id: "c1" });
    mockCategoryFindUnique.mockResolvedValueOnce({ id: "cat-1" });
    mockChallengeUpdate.mockResolvedValueOnce({});

    const req = new NextRequest("http://localhost/api/admin/challenges/c1", {
      method: "PATCH",
      body: JSON.stringify(patchBody),
      headers: { "Content-Type": "application/json" },
    });
    const res = await patchOne(req, { params: Promise.resolve({ id: "c1" }) });
    expect(res.status).toBe(200);
    expect(mockChallengeUpdate).toHaveBeenCalled();
  });

  it("DELETE returns 409 when submissions exist", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "a1" } });
    mockUserFindUnique.mockResolvedValueOnce({ role: "admin" });
    mockFindUniqueChallenge.mockResolvedValueOnce({
      id: "c1",
      _count: { submissions: 2 },
    });

    const res = await deleteOne(
      new NextRequest("http://localhost/api/admin/challenges/c1"),
      { params: Promise.resolve({ id: "c1" }) },
    );
    expect(res.status).toBe(409);
    expect(mockChallengeDelete).not.toHaveBeenCalled();
  });
});
