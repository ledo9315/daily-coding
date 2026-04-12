import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { isAllowedUserAvatarPath } from "@/lib/user-avatars";

export async function PATCH(request: Request) {
  const result = await getSessionUserId();
  if (result.error) return result.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger JSON-Body." }, { status: 400 });
  }

  const avatar =
    body && typeof body === "object" && "avatar" in body
      ? (body as { avatar: unknown }).avatar
      : undefined;

  if (typeof avatar !== "string" || !isAllowedUserAvatarPath(avatar)) {
    return NextResponse.json(
      { error: "Ungültiger Avatar. Bitte ein Bild aus der Liste wählen." },
      { status: 400 }
    );
  }

  const user = result.userEmail
    ? await prisma.user.findFirst({
        where: {
          OR: [{ id: result.userId }, { email: result.userEmail }],
        },
        select: { id: true },
      })
    : await prisma.user.findUnique({
        where: { id: result.userId },
        select: { id: true },
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

  await prisma.user.update({
    where: { id: user.id },
    data: { avatar },
  });

  return NextResponse.json({ avatar });
}
