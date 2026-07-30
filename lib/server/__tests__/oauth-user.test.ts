import { describe, it, expect, vi, beforeEach } from "vitest";

// `oauth-user` imports "server-only", which throws outside a server component.
vi.mock("server-only", () => ({}));

import { findOrCreateOAuthUser } from "@/lib/server/oauth-user";

const mockAccountFindUnique = vi.fn();
const mockAccountCreate = vi.fn();
const mockUserFindUnique = vi.fn();
const mockUserCreate = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    account: {
      findUnique: (...args: unknown[]) => mockAccountFindUnique(...args),
      create: (...args: unknown[]) => mockAccountCreate(...args),
    },
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
      create: (...args: unknown[]) => mockUserCreate(...args),
    },
  },
}));

type Profile = Parameters<typeof findOrCreateOAuthUser>[0];

const account = { provider: "google", providerAccountId: "115226194717317484936" };

/**
 * Providers do send a picture URL, and `OAuthProfile` no longer has a field for it.
 * The cast passes one anyway — that is the point: if someone re-adds `image` to the
 * interface and wires it into `user.create`, the assertions below start failing.
 */
const withProviderPicture = (image: string, email = "someone@gmail.com") =>
  ({ email, name: "Some One", image }) as Profile;

/**
 * #86: a new OAuth account stored the provider's picture URL in `User.avatar`, and
 * `avatarImageSrc` passes http(s) values straight to the `img` element. The file was
 * then fetched from googleusercontent.com in the browser of everyone viewing the feed
 * or the ranking, not just the account owner.
 */
describe("findOrCreateOAuthUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAccountFindUnique.mockResolvedValue(null);
    mockUserFindUnique.mockResolvedValue(null);
    mockUserCreate.mockResolvedValue({ id: "u-new", avatar: "" });
  });

  it("stores no avatar for a new account even when the provider sends a picture", async () => {
    await findOrCreateOAuthUser(
      withProviderPicture("https://lh3.googleusercontent.com/a/ACg8ocK=s96-c"),
      account,
    );

    expect(mockUserCreate).toHaveBeenCalledTimes(1);
    expect(mockUserCreate.mock.calls[0][0].data.avatar).toBe("");
  });

  it("writes no external URL into avatar for a GitHub picture either", async () => {
    await findOrCreateOAuthUser(
      withProviderPicture("https://avatars.githubusercontent.com/u/141648130?v=4"),
      account,
    );

    expect(mockUserCreate.mock.calls[0][0].data.avatar).not.toMatch(/^https?:/);
  });

  it("still derives the initials from the provider name", async () => {
    await findOrCreateOAuthUser({ email: "some.one@gmail.com", name: "Some One" }, account);

    expect(mockUserCreate.mock.calls[0][0].data.initials).toBe("SO");
  });

  it("falls back to the local part of the email when the provider sends no name", async () => {
    await findOrCreateOAuthUser({ email: "someone@gmail.com", name: null }, account);

    expect(mockUserCreate.mock.calls[0][0].data.name).toBe("someone");
  });

  it("leaves a chosen avatar untouched when linking an account by email", async () => {
    mockUserFindUnique.mockResolvedValueOnce({
      id: "u-1",
      role: "user",
      avatar: "/user/chibi1.png",
    });
    mockAccountCreate.mockResolvedValueOnce({});

    const result = await findOrCreateOAuthUser(
      withProviderPicture(
        "https://lh3.googleusercontent.com/a/ACg8ocK=s96-c",
        "leonid.domagalsky@gmail.com",
      ),
      account,
    );

    expect(result.avatar).toBe("/user/chibi1.png");
    expect(mockUserCreate).not.toHaveBeenCalled();
  });
});
