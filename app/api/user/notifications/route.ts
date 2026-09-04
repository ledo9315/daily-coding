import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth-session";

export async function GET() {
  const session = await getSessionUserId();
  if (session.error) return session.error;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { notifyByEmail: true },
  });
  if (!user) {
    const t = await getTranslations("api");
    return NextResponse.json({ error: t("user.notFoundShort") }, { status: 401 });
  }
  return NextResponse.json(user);
}

export async function PATCH(request: Request) {
  const session = await getSessionUserId();
  if (session.error) return session.error;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const notifyByEmail = body?.notifyByEmail;
  if (typeof notifyByEmail !== "boolean") {
    const t = await getTranslations("api");
    return NextResponse.json({ error: t("user.invalidValue") }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { notifyByEmail },
  });

  return NextResponse.json({ notifyByEmail });
}
