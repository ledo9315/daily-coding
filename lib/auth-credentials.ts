import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifyEmailToken } from "@/lib/server/auth-service";

type CredentialsInput = Partial<
  Record<"email" | "password" | "rememberMe" | "verificationToken", unknown>
>;

type SessionUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: "user" | "admin";
  rememberMe: boolean;
};

function mapUserToSessionUser(
  user: {
    id: string;
    name: string | null;
    email: string | null;
    avatar: string | null;
    role: "user" | "admin" | string;
  },
  rememberMe: boolean
): SessionUser {
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

export async function authorizeCredentials(
  credentials: CredentialsInput | undefined
): Promise<SessionUser | null> {
  const verificationToken = credentials?.verificationToken as string | undefined;
  if (verificationToken) {
    const verified = await verifyEmailToken(verificationToken);
    if ("error" in verified) return null;

    const verifiedUser = await prisma.user.findUnique({ where: { id: verified.userId } });
    if (!verifiedUser) return null;

    return mapUserToSessionUser(verifiedUser, true);
  }

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

  return mapUserToSessionUser(user, rememberMe);
}
