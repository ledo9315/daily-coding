import { describe, it, expect, vi, beforeEach } from "vitest";

// `oauth-user` imports "server-only", which throws outside a server component.
vi.mock("server-only", () => ({}));

import { findOrCreateOAuthUser } from "@/lib/server/oauth-user";
import { isAllowedUserAvatarPath, starterAvatarPath } from "@/lib/user-avatars";

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

  it("stores a local avatar for a new account, never the provider picture", async () => {
    await findOrCreateOAuthUser(
      withProviderPicture("https://lh3.googleusercontent.com/a/ACg8ocK=s96-c"),
      account,
    );

    expect(mockUserCreate).toHaveBeenCalledTimes(1);
    // #101 replaced the empty string with one of the bundled avatars. What #86 guards is
    // unchanged: the stored value is a local path from the allow-list, never a URL.
    const stored = mockUserCreate.mock.calls[0][0].data.avatar;
    expect(isAllowedUserAvatarPath(stored)).toBe(true);
    expect(stored).toBe(starterAvatarPath("someone@gmail.com"));
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

/**
 * #107: rejecting is impossible on this path — the user is back from the provider and
 * expects an account, with no form left to show an error in. So the name gets a counter.
 */
describe("findOrCreateOAuthUser and display names", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAccountFindUnique.mockResolvedValue(null);
    mockUserCreate.mockResolvedValue({ id: "u-new", avatar: "/user/gpt.png" });
  });

  it("keeps the provider name when it is free", async () => {
    mockUserFindUnique.mockResolvedValue(null);

    await findOrCreateOAuthUser({ email: "new@gmail.com", name: "Max Müller" }, account);

    const data = mockUserCreate.mock.calls[0][0].data;
    expect(data.name).toBe("Max Müller");
    expect(data.nameKey).toBe("max müller");
  });

  it("appends a counter when the name is taken", async () => {
    // First lookup is the email (no account), then "max müller", then "max müller 2".
    mockUserFindUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "someone-else" })
      .mockResolvedValueOnce(null);

    await findOrCreateOAuthUser({ email: "new@gmail.com", name: "Max Müller" }, account);

    const data = mockUserCreate.mock.calls[0][0].data;
    expect(data.name).toBe("Max Müller 2");
    expect(data.nameKey).toBe("max müller 2");
  });

  it("falls back to the local part of the address when the provider sends no name", async () => {
    mockUserFindUnique.mockResolvedValue(null);

    await findOrCreateOAuthUser({ email: "someone@gmail.com", name: null }, account);

    expect(mockUserCreate.mock.calls[0][0].data.name).toBe("someone");
  });

  it("falls back to the email name when the provider name is only punctuation", async () => {
    mockUserFindUnique.mockResolvedValue(null);

    await findOrCreateOAuthUser({ email: "valid.user@gmail.com", name: "." }, account);

    expect(mockUserCreate.mock.calls[0][0].data.name).toBe("valid.user");
  });

  it("uses a safe default when neither provider nor email has a valid name", async () => {
    mockUserFindUnique.mockResolvedValue(null);

    await findOrCreateOAuthUser({ email: "x@gmail.com", name: "🎮" }, account);

    expect(mockUserCreate.mock.calls[0][0].data.name).toBe("User");
  });
});
