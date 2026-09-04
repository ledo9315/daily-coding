import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth-session";

/**
 * Two switches, not one (#288). `notifyByEmail` covers the mails that answer something -
 * a comment, a vote on your solution - and `notifyDailyReminder` the one that arrives on
 * its own. Wanting the first and not the second is the common case.
 */
const SETTINGS = ["notifyByEmail", "notifyDailyReminder"] as const;
type Setting = (typeof SETTINGS)[number];

const SELECTION = { notifyByEmail: true, notifyDailyReminder: true } as const;

export async function GET() {
  const session = await getSessionUserId();
  if (session.error) return session.error;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: SELECTION,
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

  // A partial body on purpose: the panel writes the switch that moved, not both.
  const data: Partial<Record<Setting, boolean>> = {};
  for (const setting of SETTINGS) {
    const value = body?.[setting];
    if (value === undefined) continue;
    if (typeof value !== "boolean") {
      const t = await getTranslations("api");
      return NextResponse.json({ error: t("user.invalidValue") }, { status: 400 });
    }
    data[setting] = value;
  }

  if (Object.keys(data).length === 0) {
    const t = await getTranslations("api");
    return NextResponse.json({ error: t("user.invalidValue") }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.userId },
    data,
    select: SELECTION,
  });

  return NextResponse.json(user);
}
