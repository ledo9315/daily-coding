import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getLocale, getTranslations } from "next-intl/server";
import { getSessionUserId } from "@/lib/auth-session";
import { DEFAULT_LOCALE, LOCALES, isAppLocale, type AppLocale } from "@/lib/locale";
import { prisma } from "@/lib/prisma";
import { sendAccountDeletionEmail } from "@/lib/server/email-service";

/**
 * The confirmation phrase of every language, keyed by locale. The settings panel shows the
 * one of the language the user reads; the route accepts all of them, so switching the
 * language with the confirmation already typed does not turn the form into a dead end.
 */
async function deleteConfirmPhrases(): Promise<Record<AppLocale, string>> {
  const entries = await Promise.all(
    LOCALES.map(async (locale) => {
      const translate = await getTranslations({ locale, namespace: "profile" });
      return [locale, translate("settings.account.confirmPhrase")] as const;
    })
  );
  return Object.fromEntries(entries) as Record<AppLocale, string>;
}

export async function DELETE(request: Request) {
  const t = await getTranslations("api");
  const result = await getSessionUserId();
  if (result.error) return result.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: t("user.invalidJsonBody") }, { status: 400 });
  }

  const confirmText =
    body && typeof body === "object" && "confirmText" in body
      ? (body as { confirmText: unknown }).confirmText
      : undefined;
  const currentPassword =
    body && typeof body === "object" && "currentPassword" in body
      ? (body as { currentPassword: unknown }).currentPassword
      : "";

  const requestLocale = await getLocale();
  const phrases = await deleteConfirmPhrases();
  const shownPhrase = phrases[isAppLocale(requestLocale) ? requestLocale : DEFAULT_LOCALE];
  const typedPhrase = typeof confirmText === "string" ? confirmText.trim() : "";

  if (!Object.values(phrases).includes(typedPhrase)) {
    return NextResponse.json(
      { error: t("user.deleteConfirmRequired", { phrase: shownPhrase }) },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: result.userId },
    select: { id: true, passwordHash: true, email: true, name: true },
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

  await prisma.$transaction([
    prisma.rankingEntry.deleteMany({ where: { userId: user.id } }),
    prisma.userAchievement.deleteMany({ where: { userId: user.id } }),
    prisma.submission.deleteMany({ where: { userId: user.id } }),
    prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } }),
    prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
    prisma.account.deleteMany({ where: { userId: user.id } }),
    prisma.user.delete({ where: { id: user.id } }),
  ]);

  try {
    await sendAccountDeletionEmail(user.email, user.name);
  } catch (error) {
    console.warn("[user/account] deletion email failed", {
      userId: user.id,
      email: user.email,
      error,
    });
  }

  return NextResponse.json({ success: true });
}
