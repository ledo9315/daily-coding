import { describe, it, expect, vi, beforeEach } from "vitest";
import api from "@/messages/de/api.json";

/** Route handlers translate themselves; `next-intl/server` throws outside react-server. */
vi.mock("next-intl/server", async () =>
  (await import("@/app/api/__tests__/api-translations-mock")).apiTranslationsMock()
);

import { NextResponse } from "next/server";
import {
  GET as getSubmissionCommentsHandler,
  POST as postSubmissionCommentHandler,
} from "../submission/[id]/comments/route";

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockSubmissionFindUnique = vi.fn();
const mockCommentFindMany = vi.fn();
const mockCommentCreate = vi.fn();
const mockGetSessionUserId = vi.fn();
const mockHasSolvedChallenge = vi.fn();
const mockCheckRateLimit = vi.fn();
const mockGetLifetimePointsByUserIds = vi.fn();
const mockNotify = vi.fn();
const mockPersistAchievementUnlocks = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    submission: {
      findUnique: (...args: unknown[]) => mockSubmissionFindUnique(...args),
    },
    comment: {
      findMany: (...args: unknown[]) => mockCommentFindMany(...args),
      create: (...args: unknown[]) => mockCommentCreate(...args),
    },
  },
}));

vi.mock("@/lib/auth-session", () => ({
  getSessionUserId: () => mockGetSessionUserId(),
}));

vi.mock("@/lib/server/solution-access", () => ({
  hasSolvedChallenge: (...args: unknown[]) => mockHasSolvedChallenge(...args),
}));

vi.mock("@/lib/server/rate-limiter", () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
}));

vi.mock("@/lib/server/notifications", () => ({
  notifySolutionActivity: (...args: unknown[]) => mockNotify(...args),
}));

vi.mock("@/lib/server/user-points", () => ({
  getLifetimePointsByUserIds: (...args: unknown[]) =>
    mockGetLifetimePointsByUserIds(...args),
}));

vi.mock("@/lib/server/achievement-unlocks", () => ({
  persistAchievementUnlocks: (...args: unknown[]) => mockPersistAchievementUnlocks(...args),
}));

const createdAt = new Date("2026-08-01T10:00:00.000Z");

const makeRow = (
  overrides: Partial<{ id: string; userId: string; body: string }> = {},
) => ({
  id: "comment-1",
  userId: "user-alice",
  body: "Schöne Lösung!",
  createdAt,
  user: { name: "Alice Müller", initials: "AM", avatar: "🐱" },
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  mockGetSessionUserId.mockResolvedValue({ userId: "user-me" });
  mockSubmissionFindUnique.mockResolvedValue({
    id: "sub-1",
    userId: "user-alice",
    challengeId: "challenge-1",
    status: "completed",
    codeHash: "d".repeat(64),
  });
  mockHasSolvedChallenge.mockResolvedValue(true);
  mockNotify.mockResolvedValue(undefined);
  mockCheckRateLimit.mockResolvedValue(true);
  mockCommentFindMany.mockResolvedValue([]);
  mockCommentCreate.mockResolvedValue(makeRow({ userId: "user-me" }));
  mockGetLifetimePointsByUserIds.mockResolvedValue(new Map());
  mockPersistAchievementUnlocks.mockResolvedValue([]);
});

const params = Promise.resolve({ id: "sub-1" });

function get(url = "http://localhost/api/submission/sub-1/comments") {
  return getSubmissionCommentsHandler(new Request(url), { params });
}

function post(body: unknown) {
  return postSubmissionCommentHandler(
    new Request("http://localhost/api/submission/sub-1/comments", {
      method: "POST",
      body: JSON.stringify(body),
    }),
    { params },
  );
}

const unauthenticated = () =>
  mockGetSessionUserId.mockResolvedValue({
    error: NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 }),
  });

// ─── Access ──────────────────────────────────────────────────────────────────

describe("access to /api/submission/[id]/comments", () => {
  it("returns 401 without a session on GET", async () => {
    unauthenticated();
    const res = await get();
    expect(res.status).toBe(401);
    expect(mockSubmissionFindUnique).not.toHaveBeenCalled();
  });

  it("returns 401 without a session on POST", async () => {
    unauthenticated();
    const res = await post({ body: "Hallo" });
    expect(res.status).toBe(401);
    expect(mockCommentCreate).not.toHaveBeenCalled();
  });

  it("returns 404 for an unknown submission", async () => {
    mockSubmissionFindUnique.mockResolvedValue(null);
    const res = await get();
    expect(res.status).toBe(404);
    expect(mockCommentFindMany).not.toHaveBeenCalled();
  });

  it("returns 404 when the submission is not completed", async () => {
    mockSubmissionFindUnique.mockResolvedValue({
      id: "sub-1",
      userId: "user-alice",
      challengeId: "challenge-1",
      status: "failed",
    });
    const res = await get();
    expect(res.status).toBe(404);
    expect(mockHasSolvedChallenge).not.toHaveBeenCalled();
  });

  it("returns 403 on GET when the user has not solved the challenge themselves", async () => {
    mockHasSolvedChallenge.mockResolvedValue(false);
    const res = await get();
    expect(res.status).toBe(403);
    expect((await res.json()).error).toBe(api.comments.solveFirstToDiscuss);
    expect(mockCommentFindMany).not.toHaveBeenCalled();
  });

  it("returns 403 on POST when the user has not solved the challenge themselves", async () => {
    mockHasSolvedChallenge.mockResolvedValue(false);
    const res = await post({ body: "Hallo" });
    expect(res.status).toBe(403);
    expect(mockCommentCreate).not.toHaveBeenCalled();
    expect(mockCheckRateLimit).not.toHaveBeenCalled();
  });
});

// ─── GET ─────────────────────────────────────────────────────────────────────

describe("GET /api/submission/[id]/comments", () => {
  it("maps a foreign comment to the response shape without own", async () => {
    mockCommentFindMany.mockResolvedValue([makeRow()]);
    const json = await (await get()).json();
    expect(json).toEqual({
      comments: [
        {
          id: "comment-1",
          author: { name: "Alice Müller", initials: "AM", avatar: "🐱", level: 1 },
          body: "Schöne Lösung!",
          createdAt: createdAt.toISOString(),
          own: false,
        },
      ],
      nextCursor: null,
    });
  });

  it("marks the signed-in user's own comment and never leaks the userId", async () => {
    mockCommentFindMany.mockResolvedValue([makeRow({ userId: "user-me" })]);
    const res = await get();
    const raw = await res.text();
    expect(JSON.parse(raw).comments[0].own).toBe(true);
    expect(raw).not.toContain("userId");
    expect(raw).not.toContain("user-me");
  });

  it("orders by createdAt and filters by the submission", async () => {
    await get();
    expect(mockCommentFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { submissionId: "sub-1" },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      }),
    );
  });

  it("uses default limit 10 plus one row to detect the next page", async () => {
    await get();
    expect(mockCommentFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 11 }),
    );
  });

  it("caps the limit at 50", async () => {
    await get("http://localhost/api/submission/sub-1/comments?limit=500");
    expect(mockCommentFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 51 }),
    );
  });

  it("passes cursor and skip when the cursor query param is set", async () => {
    await get("http://localhost/api/submission/sub-1/comments?cursor=comment-old");
    expect(mockCommentFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ cursor: { id: "comment-old" }, skip: 1 }),
    );
  });

  it("sets nextCursor when more rows exist than the limit", async () => {
    mockCommentFindMany.mockResolvedValue(
      Array.from({ length: 11 }, (_, i) => makeRow({ id: `comment-${i}` })),
    );
    const json = await (await get()).json();
    expect(json.comments).toHaveLength(10);
    expect(json.nextCursor).toBe("comment-9");
  });
});

// ─── POST ────────────────────────────────────────────────────────────────────

describe("POST /api/submission/[id]/comments", () => {
  it("stores the trimmed body and answers 201 with own set", async () => {
    const res = await post({ body: "  Danke für den Hinweis!  " });
    expect(res.status).toBe(201);
    expect(mockCommentCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          submissionId: "sub-1",
          userId: "user-me",
          body: "Danke für den Hinweis!",
        },
      }),
    );
    expect((await res.json()).own).toBe(true);
  });

  it("returns 400 for an empty body", async () => {
    const res = await post({ body: "   " });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("leer");
    expect(mockCommentCreate).not.toHaveBeenCalled();
  });

  it("returns 400 for a body over the length limit", async () => {
    const res = await post({ body: "x".repeat(2001) });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("Zeichen");
    expect(mockCommentCreate).not.toHaveBeenCalled();
  });

  it("returns 429 when the rate limit is exhausted", async () => {
    mockCheckRateLimit.mockResolvedValue(false);
    const res = await post({ body: "Hallo" });
    expect(res.status).toBe(429);
    expect(mockCheckRateLimit).toHaveBeenCalledWith("comment-create:user-me", 10, 60_000);
    expect(mockCommentCreate).not.toHaveBeenCalled();
  });
});

/**
 * #122: `include: { user: true }` loads the whole user row - `passwordHash`, `email`,
 * `nameKey` - into a handler that hands out foreign comments. This pins the narrower
 * query so a later `...comment.user` spread cannot turn it into a leak.
 */
describe("notifications for a new comment", () => {
  it("notifies the authors of the commented code, not the submission owner", async () => {
    await post({ body: "Schöne Lösung" });
    expect(mockNotify).toHaveBeenCalledWith({
      challengeId: "challenge-1",
      codeHash: "d".repeat(64),
      actorId: "user-me",
      kind: "comment",
    });
  });

  it("skips legacy rows without a code hash", async () => {
    mockSubmissionFindUnique.mockResolvedValue({
      id: "sub-1",
      userId: "user-alice",
      challengeId: "challenge-1",
      status: "completed",
      codeHash: null,
    });
    await post({ body: "Schöne Lösung" });
    expect(mockNotify).not.toHaveBeenCalled();
  });

  /** The comment row is written before the mail; a failing mail must not swallow it. */
  it("still answers 201 when the notification fails", async () => {
    mockNotify.mockRejectedValue(new Error("resend down"));
    const res = await post({ body: "Schöne Lösung" });
    expect(res.status).toBe(201);
  });
});

/**
 * „Wortmeldung" (#271) is derived from the commenter's comments. Freezing the unlock right
 * after the write keeps a later delete from recomputing it away (#205).
 */
describe("achievement unlocks for a new comment", () => {
  it("freezes the commenter's unlocks once after the comment is written", async () => {
    await post({ body: "Schöne Lösung" });
    expect(mockPersistAchievementUnlocks).toHaveBeenCalledTimes(1);
    expect(mockPersistAchievementUnlocks.mock.calls[0][1]).toBe("user-me");
    expect(mockCommentCreate.mock.invocationCallOrder[0]).toBeLessThan(
      mockPersistAchievementUnlocks.mock.invocationCallOrder[0],
    );
  });

  it("does not freeze anything when the comment was rejected", async () => {
    await post({ body: "   " });
    expect(mockPersistAchievementUnlocks).not.toHaveBeenCalled();
  });

  it("still answers 201 when freezing the unlock fails", async () => {
    mockPersistAchievementUnlocks.mockRejectedValue(new Error("db down"));
    const res = await post({ body: "Schöne Lösung" });
    expect(res.status).toBe(201);
    expect((await res.json()).own).toBe(true);
  });
});

describe("the comments query", () => {
  it("selects only the three user fields the response uses", async () => {
    await get();
    const args = mockCommentFindMany.mock.calls[0][0] as {
      include?: unknown;
      select?: { user?: { select?: Record<string, boolean> } };
    };
    expect(args.include).toBeUndefined();
    expect(Object.keys(args.select?.user?.select ?? {}).sort()).toEqual([
      "avatar",
      "initials",
      "name",
    ]);
  });

  it("never asks the database for the password hash, the email or the name key", async () => {
    await get();
    await post({ body: "Hallo" });
    for (const call of [
      mockCommentFindMany.mock.calls[0][0],
      mockCommentCreate.mock.calls[0][0],
      mockSubmissionFindUnique.mock.calls[0][0],
    ]) {
      const serialised = JSON.stringify(call);
      expect(serialised).not.toContain("passwordHash");
      expect(serialised).not.toContain("email");
      expect(serialised).not.toContain("nameKey");
    }
  });
});
