import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function authorizeCredentials(
  credentials: Partial<Record<"email" | "password" | "rememberMe", unknown>> | undefined
): Promise<{
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: "user" | "admin";
  rememberMe: boolean;
} | null> {
  const email = credentials?.email as string | undefined;
  const password = credentials?.password as string | undefined;
  const rememberMe = credentials?.rememberMe === "true";

  if (!email || !password) return null;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  if (
    process.env.REQUIRE_EMAIL_VERIFICATION === "true" &&
    !user.emailVerified
  ) {
    return null;
  }

  const role: "user" | "admin" = user.role === "admin" ? "admin" : "user";

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.avatar,
    role,
    rememberMe,
  };
}
