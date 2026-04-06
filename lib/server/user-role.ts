import { prisma } from "@/lib/prisma";

/** Aktuelle Rolle aus der DB (nicht aus dem JWT — dort kann sie veraltet sein). */
export async function getUserRoleFromDb(
  userId: string,
): Promise<"user" | "admin" | null> {
  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return row?.role ?? null;
}
