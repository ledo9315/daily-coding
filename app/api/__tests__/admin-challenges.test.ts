import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockAuth = vi.fn();
const mockUserFindUnique = vi.fn();
const mockCategoryFindUnique = vi.fn();
const mockChallengeCreate = vi.fn();
const mockTranslationUpsert = vi.fn();
const mockTranslationDeleteMany = vi.fn();

vi.mock("@/auth", () => ({
  auth: () => mockAuth(),
}));

// The challenge and its translation rows are written in one transaction, so the create call
// goes through the transaction client rather than through `prisma` itself.
vi.mock("@/lib/prisma", () => {
  const tx = {
    challenge: {
      create: (...args: unknown[]) => mockChallengeCreate(...args),
    },
    challengeTranslation: {
      upsert: (...args: unknown[]) => mockTranslationUpsert(...args),
      deleteMany: (...args: unknown[]) => mockTranslationDeleteMany(...args),
    },
  };
  return {
    prisma: {
      user: {
        findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
      },
      category: {
        findUnique: (...args: unknown[]) => mockCategoryFindUnique(...args),
      },
      $transaction: (run: (client: typeof tx) => unknown) => run(tx),
    },
  };
});

import { POST as postChallenge } from "../admin/challenges/route";

const validBody = {
  id: "challenge-new-one",
  title: "Neu",
  description: "Beschreibung",
  difficulty: "easy",
  points: 50,
  categoryId: "cat-x",
  examples: [{ input: "1", output: "2" }],
  hints: [{ title: "Ansatz", body: "Modulo." }],
  testCases: [{ id: 1, name: "A", input: "i", expected: "o" }],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "f",
      typescript: "f",
      python: "f",
      php: "f",
      ruby: "f",
    },
  },
  starterCodes: {
    javascript: "j",
    typescript: "t",
    python: "p",
    php: "x",
    ruby: "r",
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

describe("POST /api/admin/challenges translations", () => {
  function adminRequest(body: unknown) {
    mockAuth.mockResolvedValueOnce({ user: { id: "u1", role: "admin" } });
    mockUserFindUnique.mockResolvedValueOnce({ role: "admin" });
    mockCategoryFindUnique.mockResolvedValueOnce({ id: "cat-x", name: "X" });
    mockChallengeCreate.mockResolvedValueOnce({ id: "challenge-new-one" });
    return new NextRequest("http://localhost/api/admin/challenges", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
  }

  function upsertFor(locale: string) {
    return mockTranslationUpsert.mock.calls
      .map((call) => call[0] as { create: { locale: string } })
      .find((arg) => arg.create.locale === locale);
  }

  it("mirrors the German prose into the de row", async () => {
    const res = await postChallenge(adminRequest(validBody));
    expect(res.status).toBe(201);

    const german = upsertFor("de");
    expect(german?.create).toMatchObject({
      challengeId: "challenge-new-one",
      title: "Neu",
      description: "Beschreibung",
      testCaseNames: { "1": "A" },
    });
  });

  it("saves without an English version", async () => {
    const res = await postChallenge(adminRequest(validBody));
    expect(res.status).toBe(201);
    expect(upsertFor("en")).toBeUndefined();
  });

  it("stores the English version when one is sent", async () => {
    const res = await postChallenge(
      adminRequest({
        ...validBody,
        translations: {
          en: {
            title: "New",
            description: "Description",
            hints: [{ title: "Approach", body: "Modulo." }],
            testCaseNames: { "1": "A case" },
          },
        },
      }),
    );
    expect(res.status).toBe(201);
    expect(upsertFor("en")?.create).toMatchObject({
      title: "New",
      description: "Description",
      testCaseNames: { "1": "A case" },
    });
  });

  // Only the queue this request actually consumes: validation fails before the category
  // lookup, and a leftover `mockResolvedValueOnce` would surface in the next test.
  it("rejects an English version without a title", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "u1", role: "admin" } });
    mockUserFindUnique.mockResolvedValueOnce({ role: "admin" });

    const res = await postChallenge(
      new NextRequest("http://localhost/api/admin/challenges", {
        method: "POST",
        body: JSON.stringify({
          ...validBody,
          translations: {
            en: { title: "", description: "D", hints: [], testCaseNames: {} },
          },
        }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(res.status).toBe(400);
    expect(mockChallengeCreate).not.toHaveBeenCalled();
  });
});
