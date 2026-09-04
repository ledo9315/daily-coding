import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSubmissionFindMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    submission: { findMany: (...args: unknown[]) => mockSubmissionFindMany(...args) },
  },
}));

vi.mock("next-intl/server", async () =>
  (await import("@/app/api/__tests__/api-translations-mock")).apiTranslationsMock()
);

import { SHARE_WEEK_DAYS, shareResultText } from "@/lib/share-result";
import { completedWeekStrip } from "@/lib/streak-days";
import { buildShareResultText } from "@/lib/server/share-result";

describe("shareResultText", () => {
  const base = {
    challengeTitle: "Zwei Summen",
    difficultyLabel: "Mittel",
    dateLabel: "05.09.2026",
    days: [true, true, false, true, true, true, true],
    streakLabel: "4 Tage in Folge",
    url: "https://daily-coding.dev/de/challenge",
  };

  it("draws one square per day, filled for the solved ones", () => {
    expect(shareResultText(base)).toContain("🟩🟩⬜🟩🟩🟩🟩");
  });

  it("names the task, the difficulty and the date in the first two lines", () => {
    const [first, second] = shareResultText(base).split("\n");
    expect(first).toBe(">_ DAILY CODING · 05.09.2026");
    expect(second).toBe("Zwei Summen · Mittel");
  });

  it("ends on the absolute address of the task", () => {
    const lines = shareResultText(base).split("\n");
    expect(lines[lines.length - 1]).toBe("https://daily-coding.dev/de/challenge");
  });

  it("stays short enough for a post that has room left for a sentence", () => {
    expect(shareResultText(base).length).toBeLessThan(200);
  });
});

describe("completedWeekStrip", () => {
  const day = (s: string) => new Date(`${s}T00:00:00.000Z`);

  it("ends on the reference day and reaches back SHARE_WEEK_DAYS - 1 days", () => {
    const strip = completedWeekStrip(
      day("2026-09-05"),
      new Set(["2026-09-05", "2026-08-30"]),
      SHARE_WEEK_DAYS
    );
    expect(strip).toEqual([true, false, false, false, false, false, true]);
  });

  it("keeps a gap rather than stopping at it, unlike the streak", () => {
    const strip = completedWeekStrip(
      day("2026-09-05"),
      new Set(["2026-09-05", "2026-09-03", "2026-09-02"]),
      SHARE_WEEK_DAYS
    );
    // 30.08 … 05.09, oldest first: only 02.09, 03.09 and 05.09 carry a submission.
    expect(strip).toEqual([false, false, false, true, true, false, true]);
  });

  it("ignores days after the reference day", () => {
    const strip = completedWeekStrip(day("2026-09-05"), new Set(["2026-09-06"]), 3);
    expect(strip).toEqual([false, false, false]);
  });
});

describe("buildShareResultText", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /** Every row is a completed submission on that UTC day. */
  function completedOn(days: string[]) {
    mockSubmissionFindMany.mockResolvedValue(
      days.map((d) => ({ createdAt: new Date(`${d}T09:00:00.000Z`) }))
    );
  }

  const params = {
    userId: "u1",
    submittedAt: new Date("2026-09-05T09:00:00.000Z"),
    challengeTitle: "Zwei Summen",
    difficulty: "medium" as const,
    locale: "de",
  };

  it("counts the streak up to the day of the submission, not up to today", async () => {
    // Two days before the submission the user stopped; a streak counted today would be 0.
    completedOn(["2026-09-03", "2026-09-04", "2026-09-05"]);

    const text = await buildShareResultText(params);

    expect(text).toContain("🔥 3 Tage in Folge");
  });

  it("says day rather than days for a streak of one", async () => {
    completedOn(["2026-09-05"]);

    expect(await buildShareResultText(params)).toContain("🔥 1 Tag in Folge");
  });

  it("links the German task page for a German reader", async () => {
    completedOn(["2026-09-05"]);

    expect(await buildShareResultText(params)).toContain(
      "https://daily-coding.dev/de/challenge"
    );
  });

  it("links the unprefixed task page for an English reader and translates the block", async () => {
    completedOn(["2026-09-05"]);

    const text = await buildShareResultText({ ...params, locale: "en" });

    expect(text).toContain("https://daily-coding.dev/challenge");
    expect(text).toContain("Zwei Summen · Medium");
    expect(text).toContain("🔥 1 day in a row");
  });

  it("carries neither code nor test output", async () => {
    completedOn(["2026-09-05"]);

    const text = await buildShareResultText(params);

    expect(text).not.toMatch(/function|=>|passed|\bconst\b/);
  });
});
