import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  validatePasswordResetToken,
  markPasswordResetTokenUsed,
} from "@/lib/server/auth-service";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Token und Passwort (min. 8 Zeichen) erforderlich." },
      { status: 400 }
    );
  }
  const { token, password } = parsed.data;

  const result = await validatePasswordResetToken(token);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await markPasswordResetTokenUsed(token);
  await prisma.user.update({
    where: { id: result.userId },
    data: { passwordHash },
  });

  return NextResponse.json({ success: true });
}
