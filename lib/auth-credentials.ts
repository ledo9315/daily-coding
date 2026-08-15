import bcrypt from "bcryptjs";
import { CredentialsSignin } from "next-auth";
import { prisma } from "@/lib/prisma";
import { verifyEmailToken } from "@/lib/server/auth-service";
import { emailAddressValidationError, normaliseEmailAddress } from "@/lib/email-address";
import { checkRateLimit } from "@/lib/server/rate-limiter";
import { requestClientIdentity } from "@/lib/server/request-security";

export const EMAIL_NOT_VERIFIED_CODE = "email_not_verified";

export class EmailNotVerifiedError extends CredentialsSignin {
  code = EMAIL_NOT_VERIFIED_CODE;
}

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
  credentials: CredentialsInput | undefined,
  request?: Request
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
  if (emailAddressValidationError(email)) return null;

  const canonicalEmail = normaliseEmailAddress(email);
  const client = request ? requestClientIdentity(request) : "unknown";
  if (!(await checkRateLimit(`login-ip:${client}`, 30, 15 * 60 * 1000))) return null;
  if (!(await checkRateLimit(`login:${canonicalEmail}`, 10, 15 * 60 * 1000))) return null;

  const user = await prisma.user.findUnique({ where: { email: canonicalEmail } });
  if (!user || !user.passwordHash) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  // Safe to name the real reason here: the password already matched, so this leaks
  // nothing to a stranger. NextAuth passes the error's `code` on to the client.
  if (
    process.env.REQUIRE_EMAIL_VERIFICATION === "true" &&
    !user.emailVerified
  ) {
    throw new EmailNotVerifiedError();
  }

  return mapUserToSessionUser(user, rememberMe);
}
