import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

function keyHash(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

/**
 * Fixed-window limiter backed by Postgres. The conditional increment is atomic, so separate
 * Vercel instances share the same limit and concurrent requests cannot all pass.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: Date = new Date()
): Promise<boolean> {
  const hashedKey = keyHash(key);
  const resetAt = new Date(now.getTime() + windowMs);

  await prisma.rateLimitBucket.upsert({
    where: { key: hashedKey },
    create: { key: hashedKey, count: 0, resetAt },
    update: {},
  });

  await prisma.rateLimitBucket.updateMany({
    where: { key: hashedKey, resetAt: { lte: now } },
    data: { count: 0, resetAt },
  });

  const incremented = await prisma.rateLimitBucket.updateMany({
    where: {
      key: hashedKey,
      resetAt: { gt: now },
      count: { lt: limit },
    },
    data: { count: { increment: 1 } },
  });

  return incremented.count === 1;
}
