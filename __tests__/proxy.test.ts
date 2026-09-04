import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mockGetToken = vi.fn();
vi.mock("next-auth/jwt", () => ({ getToken: (...args: unknown[]) => mockGetToken(...args) }));

import { proxy } from "@/proxy";

function request(
  path: string,
  headers: Record<string, string> = {}
): NextRequest {
  // The canonical host. `daily-coding.de` is the legacy one and would redirect first.
  return new NextRequest(new URL(path, "https://daily-coding.dev"), { headers });
}

function localeCookieOf(response: Awaited<ReturnType<typeof proxy>>): string | undefined {
  return response.cookies.get("NEXT_LOCALE")?.value;
}

const ORIGINAL_SECRET = process.env.AUTH_SECRET;

beforeEach(() => {
  mockGetToken.mockReset();
  process.env.AUTH_SECRET = "test-secret";
});

afterEach(() => {
  if (ORIGINAL_SECRET === undefined) delete process.env.AUTH_SECRET;
  else process.env.AUTH_SECRET = ORIGINAL_SECRET;
});

/**
 * The point of these: the locale cookie has to be written at *every* return point, and
 * two of them are unreachable from the outside - the branch that corrects the cookie from
 * the account setting needs a token, and the missing-secret branch needs a broken
 * environment.
 */
describe("proxy locale cookie", () => {
  it("writes the cookie on a public path from Accept-Language", async () => {
    // `/login` rather than `/`: the landing is one of the language-fixed pages now, and
    // those deliberately leave the cookie alone.
    const response = await proxy(request("/login", { "accept-language": "en-US,en;q=0.9" }));

    expect(localeCookieOf(response)).toBe("en");
    expect(mockGetToken).not.toHaveBeenCalled();
  });

  it("falls back to the country header when no language matches", async () => {
    const response = await proxy(
      request("/login", { "accept-language": "fr-FR", "x-vercel-ip-country": "AT" })
    );

    expect(localeCookieOf(response)).toBe("de");
  });

  it("leaves the response alone when the cookie already says the right thing", async () => {
    const response = await proxy(
      request("/login", { "accept-language": "en-US", cookie: "NEXT_LOCALE=en" })
    );

    expect(localeCookieOf(response)).toBeUndefined();
  });

  it("writes the cookie on the redirect for an anonymous protected path", async () => {
    mockGetToken.mockResolvedValueOnce(null);

    const response = await proxy(
      request("/profile", { "accept-language": "en-US,en;q=0.9" })
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login?callbackUrl=%2Fprofile");
    expect(localeCookieOf(response)).toBe("en");
  });

  it("writes the cookie even when no auth secret is configured", async () => {
    delete process.env.AUTH_SECRET;
    delete process.env.NEXTAUTH_SECRET;
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await proxy(
      request("/profile", { "accept-language": "en-US,en;q=0.9" })
    );

    expect(response.status).toBe(307);
    expect(localeCookieOf(response)).toBe("en");
    errorSpy.mockRestore();
  });

  it("corrects a cookie that disagrees with the account setting", async () => {
    // The second-device case: an earlier anonymous visit left `de` behind, the account
    // says `en`.
    mockGetToken.mockResolvedValueOnce({ id: "u1", locale: "en" });

    const response = await proxy(
      request("/profile", { cookie: "NEXT_LOCALE=de", "accept-language": "de-DE" })
    );

    expect(localeCookieOf(response)).toBe("en");
  });

  it("keeps the cookie when the account setting agrees with it", async () => {
    mockGetToken.mockResolvedValueOnce({ id: "u1", locale: "en" });

    const response = await proxy(
      request("/profile", { cookie: "NEXT_LOCALE=en", "accept-language": "de-DE" })
    );

    expect(localeCookieOf(response)).toBeUndefined();
  });

  it("ignores a token without a usable locale", async () => {
    mockGetToken.mockResolvedValueOnce({ id: "u1" });

    const response = await proxy(
      request("/profile", { cookie: "NEXT_LOCALE=en", "accept-language": "de-DE" })
    );

    expect(localeCookieOf(response)).toBeUndefined();
  });
});

/**
 * The domain move. Two rules that look like one: the legacy host redirects, and it inserts
 * the language prefix only where a language pair exists. Everything else maps one to one -
 * sending a path without a German counterpart to `/de/…` would turn a working URL into a
 * 404 in the name of preserving content.
 */
describe("legacy domain", () => {
  it.each([
    ["/", "https://daily-coding.dev/de"],
    ["/changelog", "https://daily-coding.dev/de/changelog"],
    ["/impressum", "https://daily-coding.dev/de/impressum"],
    ["/datenschutz", "https://daily-coding.dev/de/datenschutz"],
    // Everything on the old domain was German, and since #287 the task has a German URL.
    ["/challenge", "https://daily-coding.dev/de/challenge"],
  ])("sends the public path %s to its German counterpart", async (path, target) => {
    const response = await proxy(request(path, { host: "daily-coding.de" }));

    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe(target);
  });

  it.each([
    // A child of the public task, but private itself - no pair, so no prefix.
    ["/challenge/abc/solutions", "https://daily-coding.dev/challenge/abc/solutions"],
    ["/profile", "https://daily-coding.dev/profile"],
    ["/login", "https://daily-coding.dev/login"],
    ["/api/user/me", "https://daily-coding.dev/api/user/me"],
  ])("leaves %s without a prefix, since it has no pair", async (path, target) => {
    const response = await proxy(request(path, { host: "daily-coding.de" }));

    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe(target);
  });

  it("redirects the www host as well", async () => {
    const response = await proxy(request("/impressum", { host: "www.daily-coding.de" }));

    expect(response.headers.get("location")).toBe("https://daily-coding.dev/de/impressum");
  });

  it("keeps the query string", async () => {
    const response = await proxy(
      request("/changelog?from=mail", { host: "daily-coding.de" })
    );

    expect(response.headers.get("location")).toBe(
      "https://daily-coding.dev/de/changelog?from=mail"
    );
  });

  it("does not redirect the new host", async () => {
    const response = await proxy(request("/impressum", { host: "daily-coding.dev" }));

    expect(response.status).toBe(200);
  });
});

/**
 * On a public page the path fixes the language. That is the whole point of the prefix: a
 * URL whose content depends on a cookie can be crawled in one language only.
 */
describe("locale prefix", () => {
  const localeHeaderOf = (response: Awaited<ReturnType<typeof proxy>>) =>
    response.headers.get("x-middleware-request-x-app-locale");

  it("marks an unprefixed public path as the default locale", async () => {
    const response = await proxy(
      request("/impressum", { cookie: "NEXT_LOCALE=de", "accept-language": "de-DE" })
    );

    expect(localeHeaderOf(response)).toBe("en");
  });

  it("marks a prefixed public path as German, whatever the cookie says", async () => {
    const response = await proxy(
      request("/de/impressum", { cookie: "NEXT_LOCALE=en", "accept-language": "en-US" })
    );

    expect(localeHeaderOf(response)).toBe("de");
  });

  it("leaves a non-public path to the cookie", async () => {
    mockGetToken.mockResolvedValueOnce({ id: "u1", locale: "de" });

    const response = await proxy(request("/profile", { cookie: "NEXT_LOCALE=de" }));

    expect(localeHeaderOf(response)).toBeNull();
  });

  it("drops a locale header the visitor sent", async () => {
    // Otherwise a reader could pick the language of a page that is meant to be fixed.
    const response = await proxy(
      request("/impressum", { "x-app-locale": "de" })
    );

    expect(localeHeaderOf(response)).toBe("en");
  });

  it("writes no cookie on a prefixed page", async () => {
    // Reading the German Impressum is not a decision to switch the whole app to German.
    const response = await proxy(
      request("/de/impressum", { "accept-language": "en-US" })
    );

    expect(localeCookieOf(response)).toBeUndefined();
  });

  it("still writes the cookie on an unprefixed page outside the public set", async () => {
    const response = await proxy(request("/login", { "accept-language": "de-DE" }));

    expect(localeCookieOf(response)).toBe("de");
  });
});
