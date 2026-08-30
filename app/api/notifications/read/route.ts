import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth-session";

/** Marks everything unread as read. Opening the menu is the read receipt, per entry it is not. */
export async function POST() {
  const session = await getSessionUserId();
  if (session.error) return session.error;

  const { count } = await prisma.notification.updateMany({
    where: { userId: session.userId, readAt: null },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ read: count });
}
