import "server-only";
import { prisma } from "@/lib/prisma";

interface OAuthProfile {
  email: string;
  name: string | null | undefined;
  image: string | null | undefined;
}

interface OAuthAccount {
  provider: string;
  providerAccountId: string;
}

interface DbUser {
  id: string;
  role: "user" | "admin";
  avatar: string;
}

export async function findOAuthUserByAccount(
  account: OAuthAccount
): Promise<DbUser | null> {
  const existingAccount = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: account.provider,
        providerAccountId: account.providerAccountId,
      },
    },
    include: { user: true },
  });

  if (!existingAccount) return null;

  return {
    id: existingAccount.user.id,
    role: existingAccount.user.role as "user" | "admin",
    avatar: existingAccount.user.avatar,
  };
}

export async function findOrCreateOAuthUser(
  profile: OAuthProfile,
  account: OAuthAccount
): Promise<DbUser> {
  // 1. Returning user via same OAuth provider
  const linkedUser = await findOAuthUserByAccount(account);
  if (linkedUser) {
    return linkedUser;
  }

  // 2. Existing user by email (account linking)
  const existingUser = await prisma.user.findUnique({
    where: { email: profile.email },
  });

  if (existingUser) {
    await prisma.account.create({
      data: {
        userId: existingUser.id,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
      },
    });

    return {
      id: existingUser.id,
      role: existingUser.role as "user" | "admin",
      avatar: existingUser.avatar,
    };
  }

  // 3. Brand-new user via OAuth
  const name = profile.name ?? profile.email.split("@")[0];
  const initials = name
    .split(" ")
    .map((p: string) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const newUser = await prisma.user.create({
    data: {
      email: profile.email,
      name,
      initials,
      avatar: profile.image ?? "",
      emailVerified: true, // OAuth providers pre-verify emails
      accounts: {
        create: {
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        },
      },
    },
  });

  return { id: newUser.id, role: "user", avatar: newUser.avatar };
}
