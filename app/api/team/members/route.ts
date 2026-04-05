import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      initials: true,
      avatar: true,
      joinDate: true,
      department: true,
    },
  });

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  return NextResponse.json(
    users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      initials: u.initials,
      avatar: u.avatar,
      joinDate: formatDate(u.joinDate),
      department: u.department ?? "",
    }))
  );
}
