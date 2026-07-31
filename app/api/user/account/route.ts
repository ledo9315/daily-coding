import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { sendAccountDeletionEmail } from "@/lib/server/email-service";

export async function DELETE(request: Request) {
  const result = await getSessionUserId();
  if (result.error) return result.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger JSON-Body." }, { status: 400 });
  }

  const confirmText =
    body && typeof body === "object" && "confirmText" in body
      ? (body as { confirmText: unknown }).confirmText
      : undefined;
  const currentPassword =
    body && typeof body === "object" && "currentPassword" in body
      ? (body as { currentPassword: unknown }).currentPassword
      : "";

  if (confirmText !== "KONTO LÖSCHEN") {
    return NextResponse.json(
      { error: "Bitte bestätige mit KONTO LÖSCHEN." },
      { status: 400 }
    );
  }

  const user = result.userEmail
    ? await prisma.user.findFirst({
        where: {
          OR: [{ id: result.userId }, { email: result.userEmail }],
        },
        select: { id: true, passwordHash: true, email: true, name: true },
      })
    : await prisma.user.findUnique({
        where: { id: result.userId },
        select: { id: true, passwordHash: true, email: true, name: true },
      });

  if (!user) {
    return NextResponse.json(
      {
        error:
          "Benutzer nicht gefunden. Bitte abmelden und erneut anmelden (z. B. nach Datenbank-Reset).",
      },
      { status: 401 }
    );
  }

  const hasOAuthAccount = user.passwordHash
    ? Boolean(
        await prisma.account.findFirst({
          where: { userId: user.id },
          select: { id: true },
        })
      )
    : false;

  if (user.passwordHash && !hasOAuthAccount) {
    if (typeof currentPassword !== "string" || currentPassword.length === 0) {
      return NextResponse.json(
        { error: "Bitte gib dein aktuelles Passwort ein." },
        { status: 400 }
      );
    }

    const currentValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!currentValid) {
      return NextResponse.json(
        { error: "Aktuelles Passwort ist falsch." },
        { status: 400 }
      );
    }
  }

  try {
    await sendAccountDeletionEmail(user.email, user.name);
  } catch (error) {
    console.warn("[user/account] deletion email failed", {
      userId: user.id,
      email: user.email,
      error,
    });
  }

  await prisma.rankingEntry.deleteMany({ where: { userId: user.id } });
  await prisma.userAchievement.deleteMany({ where: { userId: user.id } });
  await prisma.submission.deleteMany({ where: { userId: user.id } });
  await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
  await prisma.account.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });

  return NextResponse.json({ success: true });
}
