import { beforeEach, describe, expect, it, vi } from "vitest";

const mockCookies = vi.fn();
const mockHeaders = vi.fn();

vi.mock("next/headers", () => ({
  cookies: () => mockCookies(),
  headers: () => mockHeaders(),
}));

import { localeFromRequestScope } from "@/lib/server/request-locale";

const cookieStore = (value?: string) => ({
  get: (name: string) => (name === "NEXT_LOCALE" && value ? { value } : undefined),
});

const headerList = (entries: Record<string, string>) => ({
  get: (name: string) => entries[name] ?? null,
});

beforeEach(() => {
  mockCookies.mockReset();
  mockHeaders.mockReset();
});

describe("localeFromRequestScope", () => {
  it("reads the cookie, the language header and the country header", async () => {
    mockCookies.mockResolvedValue(cookieStore());
    mockHeaders.mockResolvedValue(headerList({ "accept-language": "en-US,en;q=0.9" }));

    await expect(localeFromRequestScope()).resolves.toBe("en");
  });

  it("lets the cookie win over the header", async () => {
    mockCookies.mockResolvedValue(cookieStore("en"));
    mockHeaders.mockResolvedValue(headerList({ "accept-language": "de-DE" }));

    await expect(localeFromRequestScope()).resolves.toBe("en");
  });

  it("lets the account setting win over both", async () => {
    mockCookies.mockResolvedValue(cookieStore("de"));
    mockHeaders.mockResolvedValue(headerList({ "accept-language": "de-DE" }));

    await expect(localeFromRequestScope("en")).resolves.toBe("en");
  });

  it("falls back to geography when no header names a language we have", async () => {
    mockCookies.mockResolvedValue(cookieStore());
    mockHeaders.mockResolvedValue(
      headerList({ "accept-language": "fr-FR", "x-vercel-ip-country": "CH" })
    );

    await expect(localeFromRequestScope()).resolves.toBe("de");
  });

  it("returns a locale instead of throwing outside a request scope", async () => {
    // What `cookies()` does in a context Next.js does not consider a request. A throw here
    // would come out of NextAuth's jwt callback and fail the whole sign-in.
    mockCookies.mockImplementation(() => {
      throw new Error("`cookies` was called outside a request scope.");
    });
    mockHeaders.mockImplementation(() => {
      throw new Error("`headers` was called outside a request scope.");
    });

    await expect(localeFromRequestScope()).resolves.toBe("de");
    await expect(localeFromRequestScope("en")).resolves.toBe("en");
  });
});
