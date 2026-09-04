import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockAuth = vi.fn();
const mockUserFindUnique = vi.fn();
const mockFindMany = vi.fn();
const mockFindUniqueChallenge = vi.fn();
const mockChallengeUpdate = vi.fn();
const mockChallengeDelete = vi.fn();
const mockCategoryFindUnique = vi.fn();
const mockTranslationUpsert = vi.fn();
const mockTranslationDeleteMany = vi.fn();

vi.mock("@/auth", () => ({
  auth: () => mockAuth(),
}));

// The update and the translation rows share one transaction, so the update goes through the
// transaction client. Both clients point at the same mocks here.
vi.mock("@/lib/prisma", () => {
  const challenge = {
    findMany: (...args: unknown[]) => mockFindMany(...args),
    findUnique: (...args: unknown[]) => mockFindUniqueChallenge(...args),
    update: (...args: unknown[]) => mockChallengeUpdate(...args),
    delete: (...args: unknown[]) => mockChallengeDelete(...args),
  };
  const challengeTranslation = {
    upsert: (...args: unknown[]) => mockTranslationUpsert(...args),
    deleteMany: (...args: unknown[]) => mockTranslationDeleteMany(...args),
  };
  const tx = { challenge, challengeTranslation };
  return {
    prisma: {
      user: {
        findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
      },
      challenge,
      challengeTranslation,
      category: {
        findUnique: (...args: unknown[]) => mockCategoryFindUnique(...args),
      },
      $transaction: (run: (client: typeof tx) => unknown) => run(tx),
    },
  };
});

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
  hints: [],
  testCases: [{ id: 1, name: "t", input: "1", expected: "1" }],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "f",
      typescript: "f",
      python: "f",
      php: "f",
      ruby: "f",
    },
  },
  starterCodes: { javascript: "j", typescript: "t", python: "p", php: "x", ruby: "r" },
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

  // #71: the time of day had no effect but shifted the UTC day. The server now
  // normalises it itself, including for direct API calls.
  it("PATCH normalises the daily date to UTC midnight", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "a1" } });
    mockUserFindUnique.mockResolvedValueOnce({ role: "admin" });
    mockFindUniqueChallenge.mockResolvedValueOnce({ id: "c1" });
    mockCategoryFindUnique.mockResolvedValueOnce({ id: "cat-1" });
    mockChallengeUpdate.mockResolvedValueOnce({});

    const req = new NextRequest("http://localhost/api/admin/challenges/c1", {
      method: "PATCH",
      body: JSON.stringify({ ...patchBody, dateIso: "2026-07-30T18:00:00.000Z" }),
      headers: { "Content-Type": "application/json" },
    });
    await patchOne(req, { params: Promise.resolve({ id: "c1" }) });

    const stored = mockChallengeUpdate.mock.calls[0][0].data.date as Date;
    expect(stored.toISOString()).toBe("2026-07-30T00:00:00.000Z");
  });

  it("PATCH keeps a null daily date", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "a1" } });
    mockUserFindUnique.mockResolvedValueOnce({ role: "admin" });
    mockFindUniqueChallenge.mockResolvedValueOnce({ id: "c1" });
    mockCategoryFindUnique.mockResolvedValueOnce({ id: "cat-1" });
    mockChallengeUpdate.mockResolvedValueOnce({});

    const req = new NextRequest("http://localhost/api/admin/challenges/c1", {
      method: "PATCH",
      body: JSON.stringify({ ...patchBody, dateIso: null }),
      headers: { "Content-Type": "application/json" },
    });
    await patchOne(req, { params: Promise.resolve({ id: "c1" }) });
    expect(mockChallengeUpdate.mock.calls[0][0].data.date).toBeNull();
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

describe("PATCH /api/admin/challenges/[id] translations", () => {
  function adminPatch(body: unknown) {
    mockAuth.mockResolvedValueOnce({ user: { id: "a1" } });
    mockUserFindUnique.mockResolvedValueOnce({ role: "admin" });
    mockFindUniqueChallenge.mockResolvedValueOnce({ id: "c1" });
    mockCategoryFindUnique.mockResolvedValueOnce({ id: "cat-1" });
    mockChallengeUpdate.mockResolvedValueOnce({});
    return patchOne(
      new NextRequest("http://localhost/api/admin/challenges/c1", {
        method: "PATCH",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      }),
      { params: Promise.resolve({ id: "c1" }) },
    );
  }

  function upsertFor(locale: string) {
    return mockTranslationUpsert.mock.calls
      .map((call) => call[0] as { create: { locale: string } })
      .find((arg) => arg.create.locale === locale);
  }

  it("saves when only the German version is filled in", async () => {
    const res = await adminPatch({ ...patchBody, translations: {} });
    expect(res.status).toBe(200);
    expect(upsertFor("de")).toBeDefined();
    expect(upsertFor("en")).toBeUndefined();
  });

  // An empty `translations` object is how the form says the English tab was cleared.
  it("removes the English row when the payload carries none", async () => {
    await adminPatch({ ...patchBody, translations: {} });
    expect(mockTranslationDeleteMany).toHaveBeenCalledWith({
      where: { challengeId: "c1", locale: "en" },
    });
  });

  it("leaves the English row alone when translations are not mentioned", async () => {
    await adminPatch(patchBody);
    expect(mockTranslationDeleteMany).not.toHaveBeenCalled();
  });

  it("writes the English version and keeps the German columns unchanged", async () => {
    const res = await adminPatch({
      ...patchBody,
      translations: {
        en: {
          title: "Title",
          description: "Desc",
          hints: [],
          testCaseNames: { "1": "case" },
        },
      },
    });
    expect(res.status).toBe(200);
    expect(upsertFor("en")?.create).toMatchObject({
      challengeId: "c1",
      title: "Title",
      testCaseNames: { "1": "case" },
    });
    expect(mockChallengeUpdate.mock.calls[0][0].data.title).toBe("T");
  });
});
