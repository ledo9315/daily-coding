import "server-only";

import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL ist nicht gesetzt. Lokal: .env.local aus .env.example. Vercel: Settings → Environment Variables → URL einer gehosteten Postgres-Instanz (z. B. Neon, Supabase)."
    );
  }
  if (
    process.env.VERCEL &&
    /localhost|127\.0\.0\.1/.test(connectionString)
  ) {
    throw new Error(
      "DATABASE_URL zeigt auf localhost. Auf Vercel gibt es keine lokale Datenbank. Trage die Verbindungs-URL deines gehosteten Postgres (Neon/Supabase/Vercel Postgres) unter Environment Variables ein und führe prisma migrate deploy gegen diese DB aus."
    );
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
