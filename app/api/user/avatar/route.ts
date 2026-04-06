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

  await prisma.user.update({
    where: { id: result.userId },
    data: { avatar },
  });

  return NextResponse.json({ avatar });
}
