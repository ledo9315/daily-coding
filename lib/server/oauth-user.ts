import "server-only";
import { prisma } from "@/lib/prisma";
import { starterAvatarPath } from "@/lib/user-avatars";
import {
  displayNameValidationError,
  nameKeyOf,
  uniqueDisplayName,
} from "@/lib/display-name";
import { emailAddressValidationError, normaliseEmailAddress } from "@/lib/email-address";

/**
 * No `image` field on purpose. The provider sends a picture URL, but storing it would
 * make every viewer of the feed, the ranking or the podium fetch that file straight
 * from googleusercontent.com — handing a third party the IP of people who have no
 * relationship with it (#86). New OAuth accounts get one of the local avatars from
 * `USER_AVATAR_PATHS` instead (#101).
 */
interface OAuthProfile {
  email: string;
  name: string | null | undefined;
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
  if (emailAddressValidationError(profile.email)) {
    throw new Error("OAuth provider returned an invalid email address");
  }
  const email = normaliseEmailAddress(profile.email);
  // 1. Returning user via same OAuth provider
  const linkedUser = await findOAuthUserByAccount(account);
  if (linkedUser) {
    return linkedUser;
  }

  // 2. Existing user by email (account linking)
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    if (!existingUser.emailVerified) {
      throw new Error("Cannot auto-link OAuth to an unverified email account");
    }
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
  /**
   * A counter is appended when the provider's name is taken — rejecting is not an option
   * here. The user comes back from Google or GitHub expecting an account, and there is no
   * form left to show an error in. The registration form does reject (#107).
   */
  const emailName = email.split("@")[0];
  const baseName = [profile.name ?? "", emailName, "User"].find(
    (candidate) => displayNameValidationError(candidate) === null
  )!;
  const name = await uniqueDisplayName(
    baseName,
    async (key) => (await prisma.user.findUnique({ where: { nameKey: key } })) !== null
  );
  const initials = name
    .split(" ")
    .map((p: string) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const newUser = await prisma.user.create({
    data: {
      email,
      name,
      nameKey: nameKeyOf(name),
      initials,
      avatar: starterAvatarPath(name),
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
