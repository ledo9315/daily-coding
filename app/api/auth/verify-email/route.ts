import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { verifyEmailToken, type TokenError } from "@/lib/server/auth-service";

export async function GET(request: NextRequest) {
  const t = await getTranslations("api");
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: t("auth.tokenMissing") }, { status: 400 });
  }

  const result = await verifyEmailToken(token);
  if ("error" in result) {
    const tokenErrorText: Record<TokenError, string> = {
      invalid: t("validation.tokenInvalid"),
      expired: t("validation.tokenExpired"),
      alreadyUsed: t("validation.tokenAlreadyUsed"),
    };
    return NextResponse.json({ error: tokenErrorText[result.error] }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
