import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindUnique = vi.fn();
const mockCompare = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: (...args: unknown[]) => mockCompare(...args),
  },
}));

import { authorizeCredentials } from "@/lib/auth-credentials";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("authorizeCredentials", () => {
  it("returns null when email is missing", async () => {
    const result = await authorizeCredentials({
      password: "secret1234",
    });
    expect(result).toBeNull();
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("returns null when password is missing", async () => {
    const result = await authorizeCredentials({
      email: "a@b.de",
    });
    expect(result).toBeNull();
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("returns null when credentials are undefined", async () => {
    const result = await authorizeCredentials(undefined);
    expect(result).toBeNull();
  });

  it("returns null when user is not found", async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    const result = await authorizeCredentials({
      email: "nope@example.com",
      password: "secret1234",
    });
    expect(result).toBeNull();
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { email: "nope@example.com" },
    });
  });

  it("returns null when user has no passwordHash", async () => {
    mockFindUnique.mockResolvedValueOnce({
      id: "u1",
      email: "a@b.de",
      name: "A",
      avatar: "",
      passwordHash: null,
    });
    const result = await authorizeCredentials({
      email: "a@b.de",
      password: "secret1234",
    });
    expect(result).toBeNull();
    expect(mockCompare).not.toHaveBeenCalled();
  });

  it("returns null when password does not match", async () => {
    mockFindUnique.mockResolvedValueOnce({
      id: "u1",
      email: "a@b.de",
      name: "A",
      avatar: "/x.png",
      passwordHash: "hashed",
    });
    mockCompare.mockResolvedValueOnce(false);
    const result = await authorizeCredentials({
      email: "a@b.de",
      password: "wrong",
    });
    expect(result).toBeNull();
    expect(mockCompare).toHaveBeenCalledWith("wrong", "hashed");
  });

  it("returns user session fields when password matches", async () => {
    mockFindUnique.mockResolvedValueOnce({
      id: "user-42",
      email: "max@example.com",
      name: "Max",
      avatar: "/avatar.png",
      passwordHash: "hashed",
    });
    mockCompare.mockResolvedValueOnce(true);
    const result = await authorizeCredentials({
      email: "max@example.com",
      password: "correcthorse",
    });
    expect(result).toEqual({
      id: "user-42",
      name: "Max",
      email: "max@example.com",
      image: "/avatar.png",
    });
  });
});
