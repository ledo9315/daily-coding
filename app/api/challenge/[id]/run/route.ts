import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { parseCodeLanguage, normalizeSupportedLanguages } from "@/lib/challenge-languages";
import { runChallengeTests } from "@/lib/server/challenge-execution";
import { findDailyChallengeForApp } from "@/lib/server/challenge-day";
import { checkRateLimit } from "@/lib/server/rate-limiter";
import { reserveCompiledLanguageRun } from "@/lib/server/compiled-language-budget";
import { localeFromQuery, localeFromRequestScope } from "@/lib/server/request-locale";
import {
  codeExceedsLimit,
  MAX_CHALLENGE_REQUEST_BYTES,
  requestBodyExceedsLimit,
  requestClientIdentity,
} from "@/lib/server/request-security";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Same reason as in the daily route: the test-case names come from the challenge, so a
  // run must not answer in the other language than the page it fills.
  const locale = localeFromQuery(request.url) ?? (await localeFromRequestScope());
  const t = await getTranslations({ locale, namespace: "api" });
  const { id: challengeId } = await params;
  if (requestBodyExceedsLimit(request, MAX_CHALLENGE_REQUEST_BYTES)) {
    return NextResponse.json({ error: t("challenge.codeTooLong") }, { status: 413 });
  }

  const client = requestClientIdentity(request);
  if (!(await checkRateLimit(`challenge-run:${client}`, 20, 60_000))) {
    return NextResponse.json(
      { error: t("challenge.tooManyRuns") },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const code: string = typeof body.code === "string" ? body.code : "";
  if (codeExceedsLimit(code)) {
    return NextResponse.json({ error: t("challenge.codeTooLong") }, { status: 413 });
  }

  const challenge = await findDailyChallengeForApp(locale);
  if (!challenge || challenge.id !== challengeId) {
    return NextResponse.json({ error: t("challenge.notFound") }, { status: 404 });
  }

  const allowed = normalizeSupportedLanguages(
    challenge.supportedLanguages as unknown as string[]
  );
  const language = parseCodeLanguage(body.language, allowed);
  if (!language) {
    return NextResponse.json(
      { error: t("challenge.unsupportedLanguage") },
      { status: 400 }
    );
  }

  if (!(await reserveCompiledLanguageRun(language))) {
    return NextResponse.json(
      { error: t("challenge.compiledLanguagesBusy") },
      { status: 429 }
    );
  }

  const { testCases, runtimeOk, compileError } = await runChallengeTests(
    challenge,
    code,
    language,
    "run",
    locale
  );
  return NextResponse.json({ testCases, language, runtimeOk, compileError });
}
