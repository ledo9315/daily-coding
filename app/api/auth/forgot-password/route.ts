import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createPasswordResetToken } from "@/lib/server/auth-service";
import { sendPasswordResetEmail } from "@/lib/server/email-service";
import { checkRateLimit } from "@/lib/server/rate-limiter";
import { normaliseEmailAddress } from "@/lib/email-address";
import { requestClientIdentity } from "@/lib/server/request-security";

const schema = z.object({ email: z.string().email() });

export async function POST(request: NextRequest) {
  const t = await getTranslations("api");
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: t("auth.invalidEmail") }, { status: 400 });
  }
  const email = normaliseEmailAddress(parsed.data.email);

  const client = requestClientIdentity(request);
  const clientAllowed = await checkRateLimit(`forgot-ip:${client}`, 10, 15 * 60 * 1000);
  const emailAllowed =
    clientAllowed &&
    (await checkRateLimit(`forgot-email:${email}`, 3, 15 * 60 * 1000));
  if (!emailAllowed) {
    return NextResponse.json(
      { error: t("auth.tooManyRequests") },
      { status: 429 }
    );
  }

  // Always return 200 to prevent user enumeration
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    try {
      const token = await createPasswordResetToken(user.id);
      await sendPasswordResetEmail(email, token);
    } catch {
      // Best-effort
    }
  }

  return NextResponse.json({ success: true });
}
