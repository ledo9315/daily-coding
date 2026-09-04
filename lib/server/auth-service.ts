import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

export async function createEmailVerificationToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  await prisma.emailVerificationToken.deleteMany({ where: { userId } });
  await prisma.emailVerificationToken.create({
    data: {
      userId,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });
  return token;
}

/** Reasons a verification or reset token cannot be redeemed. */
export type TokenError = "invalid" | "expired" | "alreadyUsed";

export async function verifyEmailToken(
  token: string
): Promise<{ success: true; userId: string } | { error: TokenError }> {
  const record = await prisma.emailVerificationToken.findUnique({ where: { token } });
  if (!record) return { error: "invalid" };
  if (record.expiresAt < new Date()) {
    await prisma.emailVerificationToken.delete({ where: { token } });
    return { error: "expired" };
  }
  await prisma.user.update({ where: { id: record.userId }, data: { emailVerified: true } });
  await prisma.emailVerificationToken.delete({ where: { token } });
  return { success: true, userId: record.userId };
}

export async function createPasswordResetToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  await prisma.passwordResetToken.deleteMany({ where: { userId } });
  await prisma.passwordResetToken.create({
    data: {
      userId,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });
  return token;
}

export async function consumePasswordResetToken(
  token: string,
  passwordHash: string,
  now: Date = new Date()
): Promise<{ success: true } | { error: TokenError }> {
  return prisma.$transaction(async (tx) => {
    const record = await tx.passwordResetToken.findUnique({ where: { token } });
    if (!record) return { error: "invalid" };
    if (record.used) return { error: "alreadyUsed" };
    if (record.expiresAt < now) return { error: "expired" };

    const claimed = await tx.passwordResetToken.updateMany({
      where: { token, used: false, expiresAt: { gte: now } },
      data: { used: true },
    });
    if (claimed.count !== 1) return { error: "alreadyUsed" };

    await tx.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    });
    return { success: true };
  });
}
