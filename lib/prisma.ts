import "server-only";

import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Locally: copy .env.local from .env.example. On Vercel: Settings → Environment Variables → URL of a hosted Postgres instance (Neon, Supabase, …)."
    );
  }
  if (
    process.env.VERCEL &&
    /localhost|127\.0\.0\.1/.test(connectionString)
  ) {
    throw new Error(
      "DATABASE_URL points at localhost. There is no local database on Vercel. Set the connection URL of your hosted Postgres (Neon / Supabase / Vercel Postgres) under Environment Variables and run prisma migrate deploy against it."
    );
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
