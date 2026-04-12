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

export async function verifyEmailToken(
  token: string
): Promise<{ success: true; userId: string } | { error: string }> {
  const record = await prisma.emailVerificationToken.findUnique({ where: { token } });
  if (!record) return { error: "Token ungültig." };
  if (record.expiresAt < new Date()) {
    await prisma.emailVerificationToken.delete({ where: { token } });
    return { error: "Token abgelaufen." };
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

export async function validatePasswordResetToken(
  token: string
): Promise<{ userId: string } | { error: string }> {
  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!record) return { error: "Token ungültig." };
  if (record.used) return { error: "Token wurde bereits verwendet." };
  if (record.expiresAt < new Date()) return { error: "Token abgelaufen." };
  return { userId: record.userId };
}

export async function markPasswordResetTokenUsed(token: string): Promise<void> {
  await prisma.passwordResetToken.update({ where: { token }, data: { used: true } });
}
