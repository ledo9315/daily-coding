import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockAuth = vi.fn();
const mockUserFindUnique = vi.fn();
const mockCategoryFindUnique = vi.fn();
const mockChallengeCreate = vi.fn();

vi.mock("@/auth", () => ({
  auth: () => mockAuth(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
    },
    category: {
      findUnique: (...args: unknown[]) => mockCategoryFindUnique(...args),
    },
    challenge: {
      create: (...args: unknown[]) => mockChallengeCreate(...args),
    },
  },
}));

import { POST as postChallenge } from "../admin/challenges/route";

const validBody = {
  id: "challenge-new-one",
  title: "Neu",
  description: "Beschreibung",
  difficulty: "easy",
  points: 50,
  categoryId: "cat-x",
  examples: [{ input: "1", output: "2" }],
  testCases: [{ name: "A", input: "i", expected: "o" }],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "f",
      typescript: "f",
      python: "f",
    },
  },
  starterCodes: {
    javascript: "j",
    typescript: "t",
    python: "p",
  },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/admin/challenges", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);
    const req = new NextRequest("http://localhost/api/admin/challenges", {
      method: "POST",
      body: JSON.stringify(validBody),
      headers: { "Content-Type": "application/json" },
    });
    const res = await postChallenge(req);
    expect(res.status).toBe(401);
  });

  it("returns 403 when not admin", async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: "u1", role: "user" },
    });
    mockUserFindUnique.mockResolvedValueOnce({ role: "user" });
    const req = new NextRequest("http://localhost/api/admin/challenges", {
      method: "POST",
      body: JSON.stringify(validBody),
      headers: { "Content-Type": "application/json" },
    });
    const res = await postChallenge(req);
    expect(res.status).toBe(403);
  });

  it("returns 201 when admin and data valid", async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: "u1", role: "admin" },
    });
    mockUserFindUnique.mockResolvedValueOnce({ role: "admin" });
    mockCategoryFindUnique.mockResolvedValueOnce({ id: "cat-x", name: "X" });
    mockChallengeCreate.mockResolvedValueOnce({ id: "challenge-new-one" });

    const req = new NextRequest("http://localhost/api/admin/challenges", {
      method: "POST",
      body: JSON.stringify(validBody),
      headers: { "Content-Type": "application/json" },
    });
    const res = await postChallenge(req);
    expect(res.status).toBe(201);
    const json = (await res.json()) as { id: string };
    expect(json.id).toBe("challenge-new-one");
    expect(mockChallengeCreate).toHaveBeenCalled();
  });
});
