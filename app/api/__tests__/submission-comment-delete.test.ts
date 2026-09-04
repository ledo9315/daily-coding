import { describe, it, expect, vi, beforeEach } from "vitest";

/** Route handlers translate themselves; `next-intl/server` throws outside react-server. */
vi.mock("next-intl/server", async () =>
  (await import("@/app/api/__tests__/api-translations-mock")).apiTranslationsMock()
);

import { NextResponse } from "next/server";
import { DELETE as deleteCommentHandler } from "../submission/[id]/comments/[commentId]/route";

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockFindUnique = vi.fn();
const mockDelete = vi.fn();
const mockGetSessionUserId = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    comment: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      delete: (...args: unknown[]) => mockDelete(...args),
    },
  },
}));

vi.mock("@/lib/auth-session", () => ({
  getSessionUserId: () => mockGetSessionUserId(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockGetSessionUserId.mockResolvedValue({ userId: "user-me" });
  mockFindUnique.mockResolvedValue({
    id: "comment-1",
    userId: "user-me",
    submissionId: "sub-1",
  });
  mockDelete.mockResolvedValue({});
});

function call(submissionId = "sub-1", commentId = "comment-1") {
  return deleteCommentHandler(
    new Request(`http://localhost/api/submission/${submissionId}/comments/${commentId}`, {
      method: "DELETE",
    }),
    { params: Promise.resolve({ id: submissionId, commentId }) },
  );
}

// ─── DELETE /api/submission/[id]/comments/[commentId] ─────────────────────────

describe("DELETE /api/submission/[id]/comments/[commentId]", () => {
  it("returns 401 without a session", async () => {
    mockGetSessionUserId.mockResolvedValue({
      error: NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 }),
    });
    const res = await call();
    expect(res.status).toBe(401);
    expect(mockFindUnique).not.toHaveBeenCalled();
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("returns 404 for an unknown comment id", async () => {
    mockFindUnique.mockResolvedValue(null);
    const res = await call();
    expect(res.status).toBe(404);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("returns 404 when the comment belongs to another submission, even if it is mine", async () => {
    mockFindUnique.mockResolvedValue({
      id: "comment-1",
      userId: "user-me",
      submissionId: "sub-other",
    });
    const res = await call("sub-1", "comment-1");
    expect(res.status).toBe(404);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("returns 403 for a comment written by somebody else", async () => {
    mockFindUnique.mockResolvedValue({
      id: "comment-1",
      userId: "user-alice",
      submissionId: "sub-1",
    });
    const res = await call();
    expect(res.status).toBe(403);
    expect((await res.json()).error).toContain("eigene Kommentare");
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("returns 403 for a foreign comment under my own submission - no moderation rights", async () => {
    mockFindUnique.mockResolvedValue({
      id: "comment-1",
      userId: "user-alice",
      submissionId: "sub-mine",
    });
    const res = await call("sub-mine", "comment-1");
    expect(res.status).toBe(403);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("deletes exactly the addressed row and reports success", async () => {
    const res = await call();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: "comment-1" } });
  });
});
