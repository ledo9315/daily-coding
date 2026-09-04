import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { getSessionUserId } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { isAllowedUserAvatarPath } from "@/lib/user-avatars";

export async function PATCH(request: Request) {
  const t = await getTranslations("api");
  const result = await getSessionUserId();
  if (result.error) return result.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: t("user.invalidJsonBody") }, { status: 400 });
  }

  const avatar =
    body && typeof body === "object" && "avatar" in body
      ? (body as { avatar: unknown }).avatar
      : undefined;

  if (typeof avatar !== "string" || !isAllowedUserAvatarPath(avatar)) {
    return NextResponse.json(
      { error: t("user.invalidAvatar") },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: result.userId },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json(
      { error: t("user.notFound") },
      { status: 401 }
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { avatar },
  });

  return NextResponse.json({ avatar });
}
