import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/server/admin-session";

export async function GET() {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return NextResponse.json(categories);
}
