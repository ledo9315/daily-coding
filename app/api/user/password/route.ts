import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  const result = await getSessionUserId();
  if (result.error) return result.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger JSON-Body." }, { status: 400 });
  }

  const currentPassword =
    body && typeof body === "object" && "currentPassword" in body
      ? (body as { currentPassword: unknown }).currentPassword
      : "";
  const newPassword =
    body && typeof body === "object" && "newPassword" in body
      ? (body as { newPassword: unknown }).newPassword
      : undefined;

  if (typeof newPassword !== "string" || newPassword.length < 8) {
    return NextResponse.json(
      { error: "Neues Passwort muss mindestens 8 Zeichen lang sein." },
      { status: 400 }
    );
  }

  const user = result.userEmail
    ? await prisma.user.findFirst({
        where: {
          OR: [{ id: result.userId }, { email: result.userEmail }],
        },
        select: { id: true, passwordHash: true },
      })
    : await prisma.user.findUnique({
        where: { id: result.userId },
        select: { id: true, passwordHash: true },
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

  if (user.passwordHash) {
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

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return NextResponse.json({ success: true });
}
