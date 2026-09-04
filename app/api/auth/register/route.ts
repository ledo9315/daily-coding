import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { createEmailVerificationToken } from "@/lib/server/auth-service";
import { sendVerificationEmail } from "@/lib/server/email-service";
import { starterAvatarPath } from "@/lib/user-avatars";
import {
  displayNameValidationError,
  nameKeyOf,
  normaliseDisplayName,
  type DisplayNameError,
} from "@/lib/display-name";
import {
  emailAddressValidationError,
  normaliseEmailAddress,
} from "@/lib/email-address";
import { passwordValidationError, type PasswordError } from "@/lib/password-policy";
import { checkRateLimit } from "@/lib/server/rate-limiter";
import { requestClientIdentity } from "@/lib/server/request-security";
import { localeFromRequest } from "@/lib/request-locale";

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

  const displayNameErrorText = (error: DisplayNameError): string => {
    switch (error.code) {
      case "empty":
        return t("validation.nameEmpty");
      case "tooLong":
        return t("validation.nameTooLong", { max: error.max });
      case "tooFewAlphanumerics":
        return t("validation.nameTooFewAlphanumerics");
    }
  };

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const { email, password, name } = body;

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof name !== "string" ||
    !email ||
    !password ||
    !name
  ) {
    return NextResponse.json(
      { error: t("auth.registerFieldsRequired") },
      { status: 400 }
    );
  }

  if (emailAddressValidationError(email)) {
    return NextResponse.json({ error: t("validation.emailInvalid") }, { status: 400 });
  }

  const passwordError = passwordValidationError(password);
  if (passwordError) {
    return NextResponse.json({ error: passwordErrorText(passwordError) }, { status: 400 });
  }

  const displayNameError = displayNameValidationError(name);
  if (displayNameError) {
    return NextResponse.json(
      { error: displayNameErrorText(displayNameError) },
      { status: 400 }
    );
  }

  const displayName = normaliseDisplayName(name);
  const canonicalEmail = normaliseEmailAddress(email);

  const client = requestClientIdentity(request);
  const clientAllowed = await checkRateLimit(`register-ip:${client}`, 10, 60 * 60 * 1000);
  const emailAllowed =
    clientAllowed &&
    (await checkRateLimit(`register-email:${canonicalEmail}`, 3, 60 * 60 * 1000));
  if (!emailAllowed) {
    return NextResponse.json(
      { error: t("auth.tooManyRegistrations") },
      { status: 429 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email: canonicalEmail } });
  if (existing) {
    return NextResponse.json(
      { error: t("auth.emailTaken") },
      { status: 409 }
    );
  }

  /**
   * Rejected rather than silently renamed: this path has a form to show the error in.
   * The OAuth path cannot do that and appends a counter instead (#107).
   */
  const nameKey = nameKeyOf(displayName);
  const nameTaken = await prisma.user.findUnique({ where: { nameKey } });
  if (nameTaken) {
    return NextResponse.json(
      { error: t("auth.nameTaken") },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const initials = displayName
    .split(" ")
    .map((part: string) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  let user: { id: string };
  try {
    user = await prisma.user.create({
      data: {
        email: canonicalEmail,
        passwordHash,
        name: displayName,
        nameKey,
        initials,
        avatar: starterAvatarPath(displayName),
        // The language this visitor is reading the form in, so the verification mail
        // arrives in it. Existing accounts keep `de` via the column default (E7).
        locale: localeFromRequest(request),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: t("auth.emailOrNameTaken") },
        { status: 409 }
      );
    }
    throw error;
  }

  let verificationEmailSent = true;
  try {
    const token = await createEmailVerificationToken(user.id);
    await sendVerificationEmail(canonicalEmail, token);
  } catch (error) {
    verificationEmailSent = false;
    console.error("[auth/register] verification email failed", {
      userId: user.id,
      email: canonicalEmail,
      error,
    });
  }

  return NextResponse.json({ success: true, verificationEmailSent }, { status: 201 });
}
