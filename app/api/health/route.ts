import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Container health check. A reachable Node process is not the interesting question - the
 * app is useless without its database, and on this host both sit on the same machine, so
 * a restart loop that ignores the database would hide the failure that actually happens.
 */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ status: "degraded" }, { status: 503 });
  }
}
