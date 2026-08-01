import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { consumePasswordResetToken } from "@/lib/server/auth-service";
import { passwordValidationError } from "@/lib/password-policy";
import { checkRateLimit } from "@/lib/server/rate-limiter";
import { requestClientIdentity } from "@/lib/server/request-security";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(1),
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
  const passwordError = passwordValidationError(password);
  if (passwordError) return NextResponse.json({ error: passwordError }, { status: 400 });

  const client = requestClientIdentity(request);
  if (!(await checkRateLimit(`reset-password-ip:${client}`, 10, 15 * 60 * 1000))) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte warte 15 Minuten." },
      { status: 429 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const result = await consumePasswordResetToken(token, passwordHash);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });

  return NextResponse.json({ success: true });
}
