import { prisma } from "@/lib/prisma";

/** Current role from the DB, not from the JWT where it can be stale. */
export async function getUserRoleFromDb(
  userId: string,
): Promise<"user" | "admin" | null> {
  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return row?.role ?? null;
}
