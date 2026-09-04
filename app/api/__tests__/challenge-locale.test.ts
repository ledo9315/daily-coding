import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("next-intl/server", async () =>
  (await import("@/app/api/__tests__/api-translations-mock")).apiTranslationsMock()
);

vi.mock("@/auth", () => ({ auth: async () => null }));

const mockFindDaily = vi.fn();
vi.mock("@/lib/server/challenge-day", () => ({
  findDailyChallengeForApp: (...args: unknown[]) => mockFindDaily(...args),
  findTodaySubmission: async () => null,
  publicSubmissionStatus: (status: string) => status,
}));

import { GET } from "@/app/api/challenge/daily/route";
import { localeFromQuery } from "@/lib/server/request-locale";

const CHALLENGE = {
  id: "ch-1",
  title: "Two Sum",
  description: "…",
  difficulty: "medium",
  points: 200,
  category: { name: "Algorithms" },
  hints: [],
  examples: [],
  testCases: [],
  supportedLanguages: ["javascript"],
  starterCodes: { javascript: "" },
  starterCode: "",
};

const call = (query: string) =>
  GET(new NextRequest(new URL(`https://daily-coding.dev/api/challenge/daily${query}`)));

beforeEach(() => {
  vi.clearAllMocks();
  mockFindDaily.mockResolvedValue(CHALLENGE);
});

describe("localeFromQuery", () => {
  it.each(["de", "en"] as const)("reads %s", (locale) => {
    expect(localeFromQuery(`https://x.test/api?locale=${locale}`)).toBe(locale);
  });

  it.each([
    ["no parameter", ""],
    ["an empty value", "?locale="],
    ["a language the app does not have", "?locale=fr"],
    ["something that is not a locale", "?locale=<script>"],
  ])("ignores %s", (_case, query) => {
    expect(localeFromQuery(`https://x.test/api${query}`)).toBeUndefined();
  });
});

/**
 * The regression this guards: `/de/challenge` is fixed to German by its URL, but the task
 * arrives from this route, which never sees that URL. Reading the cookie instead put a
 * German task under English headings and the other way round.
 */
describe("GET /api/challenge/daily answers in the language it is asked for", () => {
  it.each(["de", "en"] as const)("passes %s down to the challenge lookup", async (locale) => {
    await call(`?locale=${locale}`);

    expect(mockFindDaily).toHaveBeenCalledWith(locale);
  });

  it("falls back to the request scope when no language is named", async () => {
    await call("");

    // Outside a request scope that resolution degrades to the default rather than throwing.
    expect(mockFindDaily).toHaveBeenCalledWith(expect.stringMatching(/^(de|en)$/));
  });

  it("does not take a made-up language from the query", async () => {
    await call("?locale=fr");

    expect(mockFindDaily).not.toHaveBeenCalledWith("fr");
  });
});
