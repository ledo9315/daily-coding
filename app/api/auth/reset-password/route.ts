import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  consumePasswordResetToken,
  type TokenError,
} from "@/lib/server/auth-service";
import { passwordValidationError, type PasswordError } from "@/lib/password-policy";
import { checkRateLimit } from "@/lib/server/rate-limiter";
import { requestClientIdentity } from "@/lib/server/request-security";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const t = await getTranslations("api");

  const passwordErrorText = (error: PasswordError): string => {
    switch (error.code) {
      case "tooShort":
        return t("validation.passwordTooShort", { min: error.min });
      case "tooLong":
        return t("validation.passwordTooLong", { maxBytes: error.maxBytes });
    }
  };

  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: t("auth.resetFieldsRequired") },
      { status: 400 }
    );
  }
  const { token, password } = parsed.data;
  const passwordError = passwordValidationError(password);
  if (passwordError) {
    return NextResponse.json({ error: passwordErrorText(passwordError) }, { status: 400 });
  }

  const client = requestClientIdentity(request);
  if (!(await checkRateLimit(`reset-password-ip:${client}`, 10, 15 * 60 * 1000))) {
    return NextResponse.json(
      { error: t("auth.tooManyRequests") },
      { status: 429 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const result = await consumePasswordResetToken(token, passwordHash);
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
