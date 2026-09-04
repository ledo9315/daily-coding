import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { localeFromQuery, localeFromRequestScope } from "@/lib/server/request-locale";
import {
  findDailyChallengeForApp,
  findTodaySubmission,
  publicSubmissionStatus,
} from "@/lib/server/challenge-day";
import {
  normalizeStarterCodes,
  normalizeSupportedLanguages,
} from "@/lib/challenge-languages";
import { stripTestCaseSecretsForClient } from "@/lib/server/public-challenge";
import { normalizeHints } from "@/lib/challenge-hints";

export async function GET(request: NextRequest) {
  /**
   * The page asks in the language its URL fixed; without that the cookie would answer, and
   * `/de/challenge` could render an English task under German headings (#287).
   */
  const locale = localeFromQuery(request.url) ?? (await localeFromRequestScope());
  const challenge = await findDailyChallengeForApp(locale);

  if (!challenge) {
    const t = await getTranslations({ locale, namespace: "api" });
    return NextResponse.json({ error: t("challenge.noneActive") }, { status: 404 });
  }

  const supportedLanguages = normalizeSupportedLanguages(
    challenge.supportedLanguages as unknown as string[]
  );
  const starterCodes = normalizeStarterCodes(
    challenge.starterCodes,
    supportedLanguages,
    challenge.starterCode
  );
  const defaultLanguage = supportedLanguages[0];

  const session = await auth();
  const userId = session?.user?.id;

  let todaySubmission: {
    status: "completed" | "failed" | "pending";
    submittedAt: string;
    code: string;
    language: string;
    /** Graded test cases of the submission; null for legacy rows without stored results. */
    testResults: unknown;
  } | null = null;

  if (userId) {
    const sub = await findTodaySubmission(userId, challenge.id);

    if (sub) {
      const submittedAt = sub.createdAt.toISOString();
      todaySubmission = {
        status: publicSubmissionStatus(sub.status),
        submittedAt,
        code: sub.code,
        language: sub.language,
        testResults: Array.isArray(sub.testResults) ? sub.testResults : null,
      };
    }
  }

  const tc = await getTranslations({ locale, namespace: "challenge" });

  return NextResponse.json({
    id: challenge.id,
    title: challenge.title,
    description: challenge.description,
    difficulty: challenge.difficulty,
    points: challenge.points,
    category: challenge.category.name,
    hints: normalizeHints(challenge.hints, tc("hints.fallbackTitle")),
    examples: challenge.examples,
    testCases: stripTestCaseSecretsForClient(challenge.testCases),
    supportedLanguages,
    defaultLanguage,
    starterCodes,
    /** @deprecated Use starterCodes + defaultLanguage */
    starterCode: starterCodes[defaultLanguage] ?? "",
    /** When signed in: today's (UTC) submission for this challenge, else null. */
    todaySubmission,
  });
}
