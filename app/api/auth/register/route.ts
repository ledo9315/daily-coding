import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password, name } = body as {
    email?: string;
    password?: string;
    name?: string;
  };

  if (!email || !password || !name) {
    return NextResponse.json(
      { error: "E-Mail, Passwort und Name sind erforderlich." },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Passwort muss mindestens 8 Zeichen lang sein." },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Diese E-Mail-Adresse wird bereits verwendet." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const initials = name
    .split(" ")
    .map((part: string) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      initials,
      avatar: "",
    },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
