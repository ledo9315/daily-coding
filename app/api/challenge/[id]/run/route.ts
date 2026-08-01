import { NextRequest, NextResponse } from "next/server";
import { parseCodeLanguage, normalizeSupportedLanguages } from "@/lib/challenge-languages";
import { runChallengeTests } from "@/lib/server/challenge-execution";
import { findDailyChallengeForApp } from "@/lib/server/challenge-day";
import { checkRateLimit } from "@/lib/server/rate-limiter";
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
  const { id: challengeId } = await params;
  if (requestBodyExceedsLimit(request, MAX_CHALLENGE_REQUEST_BYTES)) {
    return NextResponse.json({ error: "Code ist zu lang." }, { status: 413 });
  }

  const client = requestClientIdentity(request);
  if (!(await checkRateLimit(`challenge-run:${client}`, 20, 60_000))) {
    return NextResponse.json(
      { error: "Zu viele Testläufe. Bitte kurz warten." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const code: string = typeof body.code === "string" ? body.code : "";
  if (codeExceedsLimit(code)) {
    return NextResponse.json({ error: "Code ist zu lang." }, { status: 413 });
  }

  const challenge = await findDailyChallengeForApp();
  if (!challenge || challenge.id !== challengeId) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }

  const allowed = normalizeSupportedLanguages(
    challenge.supportedLanguages as unknown as string[]
  );
  const language = parseCodeLanguage(body.language, allowed);
  if (!language) {
    return NextResponse.json(
      { error: "Ungültige oder nicht unterstützte Sprache für diese Challenge." },
      { status: 400 }
    );
  }

  const { testCases, runtimeOk, compileError } = await runChallengeTests(
    challenge,
    code,
    language,
    "run"
  );
  return NextResponse.json({ testCases, language, runtimeOk, compileError });
}
