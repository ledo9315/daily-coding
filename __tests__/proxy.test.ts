import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mockGetToken = vi.fn();
vi.mock("next-auth/jwt", () => ({ getToken: (...args: unknown[]) => mockGetToken(...args) }));

import { proxy } from "@/proxy";

function request(
  path: string,
  headers: Record<string, string> = {}
): NextRequest {
  return new NextRequest(new URL(path, "https://daily-coding.de"), { headers });
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
    const response = await proxy(request("/", { "accept-language": "en-US,en;q=0.9" }));

    expect(localeCookieOf(response)).toBe("en");
    expect(mockGetToken).not.toHaveBeenCalled();
  });

  it("falls back to the country header when no language matches", async () => {
    const response = await proxy(
      request("/", { "accept-language": "fr-FR", "x-vercel-ip-country": "AT" })
    );

    expect(localeCookieOf(response)).toBe("de");
  });

  it("leaves the response alone when the cookie already says the right thing", async () => {
    const response = await proxy(
      request("/", { "accept-language": "en-US", cookie: "NEXT_LOCALE=en" })
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
