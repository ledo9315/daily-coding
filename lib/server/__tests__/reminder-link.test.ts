import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUserUpdate = vi.fn();
vi.mock("@/lib/prisma", () => ({
  prisma: { user: { update: (...args: unknown[]) => mockUserUpdate(...args) } },
}));

import { applyReminderLink } from "@/lib/server/reminder-preference";
import {
  isValidReminderToken,
  reminderToken,
  unsubscribePath,
} from "@/lib/server/reminder-token";

// At module scope, not only in `beforeEach`: an `it.each` table is built while the file
// is collected, and signing a token there would run before any hook.
process.env.AUTH_SECRET = "test-secret";

beforeEach(() => {
  vi.clearAllMocks();
  process.env.AUTH_SECRET = "test-secret";
  mockUserUpdate.mockResolvedValue({ id: "u-1" });
});

describe("reminder token", () => {
  it("gives the same user the same token", () => {
    expect(reminderToken("u-1")).toBe(reminderToken("u-1"));
  });

  it("gives two users different tokens", () => {
    expect(reminderToken("u-1")).not.toBe(reminderToken("u-2"));
  });

  it("accepts its own token and nothing else", () => {
    const token = reminderToken("u-1");

    expect(isValidReminderToken("u-1", token)).toBe(true);
    expect(isValidReminderToken("u-2", token)).toBe(false);
    expect(isValidReminderToken("u-1", token.slice(0, -1) + "0")).toBe(false);
    expect(isValidReminderToken("u-1", "")).toBe(false);
  });

  it("changes with the secret, so a rotation invalidates old links", () => {
    const before = reminderToken("u-1");
    process.env.AUTH_SECRET = "another-secret";

    expect(reminderToken("u-1")).not.toBe(before);
  });

  it("builds a link that carries both halves", () => {
    expect(unsubscribePath("u-1")).toBe(`/unsubscribe?u=u-1&t=${reminderToken("u-1")}`);
  });
});

describe("applyReminderLink", () => {
  it("switches the reminder off for a signed link", async () => {
    const outcome = await applyReminderLink("u-1", reminderToken("u-1"), false);

    expect(outcome).toBe("done");
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: "u-1" },
      data: { notifyDailyReminder: false },
      select: { id: true },
    });
  });

  it("switches it back on when the link says so", async () => {
    const outcome = await applyReminderLink("u-1", reminderToken("u-1"), true);

    expect(outcome).toBe("resumed");
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: "u-1" },
      data: { notifyDailyReminder: true },
      select: { id: true },
    });
  });

  it.each([
    ["a forged token", "u-1", "deadbeef"],
    ["a token signed for someone else", "u-2", reminderToken("u-1")],
    ["no token at all", "u-1", ""],
  ])("refuses %s without touching a row", async (_case, userId, token) => {
    expect(await applyReminderLink(userId, token, false)).toBe("invalid");
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it("reports an account that no longer exists as invalid", async () => {
    mockUserUpdate.mockRejectedValue(new Error("record not found"));

    expect(await applyReminderLink("u-1", reminderToken("u-1"), false)).toBe("invalid");
  });
});
