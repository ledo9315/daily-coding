import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 * Credentials provider logic for NextAuth (unit-tested).
 */
export async function authorizeCredentials(
  credentials: Partial<Record<"email" | "password", unknown>> | undefined
): Promise<{
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: "user" | "admin";
} | null> {
  const email = credentials?.email as string | undefined;
  const password = credentials?.password as string | undefined;

  if (!email || !password) return null;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  const role: "user" | "admin" = user.role === "admin" ? "admin" : "user";

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.avatar,
    role,
  };
}
