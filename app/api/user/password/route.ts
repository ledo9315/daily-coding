import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { getSessionUserId } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { passwordValidationError, type PasswordError } from "@/lib/password-policy";

export async function PATCH(request: Request) {
  const t = await getTranslations("api");

  const passwordErrorText = (error: PasswordError): string => {
    switch (error.code) {
      case "tooShort":
        return t("validation.passwordTooShort", { min: error.min });
      case "tooLong":
        return t("validation.passwordTooLong", { maxBytes: error.maxBytes });
    }
  };

  const result = await getSessionUserId();
  if (result.error) return result.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: t("user.invalidJsonBody") }, { status: 400 });
  }

  const currentPassword =
    body && typeof body === "object" && "currentPassword" in body
      ? (body as { currentPassword: unknown }).currentPassword
      : "";
  const newPassword =
    body && typeof body === "object" && "newPassword" in body
      ? (body as { newPassword: unknown }).newPassword
      : undefined;

  if (typeof newPassword !== "string") {
    return NextResponse.json({ error: t("user.newPasswordMissing") }, { status: 400 });
  }
  const passwordError = passwordValidationError(newPassword);
  if (passwordError) {
    return NextResponse.json({ error: passwordErrorText(passwordError) }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: result.userId },
    select: { id: true, passwordHash: true },
  });

  if (!user) {
    return NextResponse.json(
      { error: t("user.notFound") },
      { status: 401 }
    );
  }

  if (user.passwordHash) {
    if (typeof currentPassword !== "string" || currentPassword.length === 0) {
      return NextResponse.json(
        { error: t("user.currentPasswordRequired") },
        { status: 400 }
      );
    }

    const currentValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!currentValid) {
      return NextResponse.json(
        { error: t("user.currentPasswordWrong") },
        { status: 400 }
      );
    }
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return NextResponse.json({ success: true });
}
