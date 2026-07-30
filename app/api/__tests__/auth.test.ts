import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ─── Prisma mock ─────────────────────────────────────────────────────────────

const mockFindUnique = vi.fn();
const mockCreate = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── /api/auth/register ───────────────────────────────────────────────────────

import { POST as registerHandler } from "../auth/register/route";

describe("POST /api/auth/register", () => {
  function makeRequest(body: Record<string, unknown>) {
    return new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
  }

  it("returns 201 on successful registration", async () => {
    mockFindUnique.mockResolvedValueOnce(null); // no existing user
    mockCreate.mockResolvedValueOnce({ id: "new-user" });
    const res = await registerHandler(
      makeRequest({ name: "Max Mustermann", email: "max@example.com", password: "securepassword" })
    );
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  it("returns 400 when name is missing", async () => {
    const res = await registerHandler(
      makeRequest({ email: "max@example.com", password: "securepassword" })
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toHaveProperty("error");
  });

  it("returns 400 when email is missing", async () => {
    const res = await registerHandler(
      makeRequest({ name: "Max", password: "securepassword" })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when password is missing", async () => {
    const res = await registerHandler(
      makeRequest({ name: "Max", email: "max@example.com" })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when password is shorter than 8 characters", async () => {
    const res = await registerHandler(
      makeRequest({ name: "Max", email: "max@example.com", password: "short" })
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/8/);
  });

  it("returns 409 when email is already registered", async () => {
    mockFindUnique.mockResolvedValueOnce({ id: "existing-user" });
    const res = await registerHandler(
      makeRequest({ name: "Max", email: "existing@example.com", password: "securepassword" })
    );
    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json).toHaveProperty("error");
  });

  /**
   * #107: without this, two accounts could carry the same name, and with a starter avatar
   * drawn from a set of 20 also the same picture — indistinguishable in the ranking.
   */
  it("returns 409 when the display name is already taken", async () => {
    mockFindUnique.mockResolvedValueOnce(null); // email is free
    mockFindUnique.mockResolvedValueOnce({ id: "existing-user" }); // nameKey is not
    const res = await registerHandler(
      makeRequest({ name: "Max Mustermann", email: "new@example.com", password: "securepassword" })
    );
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "Dieser Name ist schon vergeben." });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("looks the name up case-insensitively and stores the key", async () => {
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValueOnce({ id: "new-user" });
    await registerHandler(
      makeRequest({ name: "  Max   Mustermann ", email: "max@example.com", password: "securepassword" })
    );
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { nameKey: "max mustermann" } });
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: "Max Mustermann", nameKey: "max mustermann" }),
      })
    );
  });

  it("hashes the password (create is called with passwordHash, not plain password)", async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    mockCreate.mockResolvedValueOnce({ id: "new-user" });
    await registerHandler(
      makeRequest({ name: "Max Mustermann", email: "max@example.com", password: "securepassword" })
    );
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          passwordHash: expect.any(String),
          email: "max@example.com",
        }),
      })
    );
    const callData = mockCreate.mock.calls[0][0].data;
    expect(callData.passwordHash).not.toBe("securepassword");
  });

  it("derives initials from name (two words → two letters)", async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    mockCreate.mockResolvedValueOnce({ id: "new-user" });
    await registerHandler(
      makeRequest({ name: "Max Mustermann", email: "max@example.com", password: "securepassword" })
    );
    const callData = mockCreate.mock.calls[0][0].data;
    expect(callData.initials).toBe("MM");
  });

  it("derives initials from single name (one letter)", async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    mockCreate.mockResolvedValueOnce({ id: "new-user" });
    await registerHandler(
      makeRequest({ name: "Alice", email: "alice@example.com", password: "securepassword" })
    );
    const callData = mockCreate.mock.calls[0][0].data;
    expect(callData.initials).toBe("A");
  });
});

// ─── lib/auth-session: getSessionUserId ───────────────────────────────────────
// Test the helper via its own mock interface

const mockAuth = vi.fn();

vi.mock("@/auth", () => ({
  get auth() {
    return mockAuth;
  },
}));

describe("getSessionUserId helper", () => {
  it("returns userId when session has a valid user id", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "user-123" } });
    const { getSessionUserId } = await import("@/lib/auth-session");
    const result = await getSessionUserId();
    expect("userId" in result).toBe(true);
    if ("userId" in result) {
      expect(result.userId).toBe("user-123");
    }
  });

  it("returns 401 error response when auth() returns null", async () => {
    mockAuth.mockResolvedValueOnce(null);
    const { getSessionUserId } = await import("@/lib/auth-session");
    const result = await getSessionUserId();
    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error?.status).toBe(401);
    }
  });

  it("returns 401 when session user has no id", async () => {
    mockAuth.mockResolvedValueOnce({ user: {} });
    const { getSessionUserId } = await import("@/lib/auth-session");
    const result = await getSessionUserId();
    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error?.status).toBe(401);
    }
  });
});
