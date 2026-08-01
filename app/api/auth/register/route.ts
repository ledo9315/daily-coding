import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { createEmailVerificationToken } from "@/lib/server/auth-service";
import { sendVerificationEmail } from "@/lib/server/email-service";
import { starterAvatarPath } from "@/lib/user-avatars";
import {
  displayNameValidationError,
  nameKeyOf,
  normaliseDisplayName,
} from "@/lib/display-name";
import {
  emailAddressValidationError,
  normaliseEmailAddress,
} from "@/lib/email-address";
import { passwordValidationError } from "@/lib/password-policy";
import { checkRateLimit } from "@/lib/server/rate-limiter";
import { requestClientIdentity } from "@/lib/server/request-security";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const { email, password, name } = body;

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof name !== "string" ||
    !email ||
    !password ||
    !name
  ) {
    return NextResponse.json(
      { error: "E-Mail, Passwort und Name sind erforderlich." },
      { status: 400 }
    );
  }

  const emailError = emailAddressValidationError(email);
  if (emailError) return NextResponse.json({ error: emailError }, { status: 400 });

  const passwordError = passwordValidationError(password);
  if (passwordError) return NextResponse.json({ error: passwordError }, { status: 400 });

  const displayNameError = displayNameValidationError(name);
  if (displayNameError) {
    return NextResponse.json({ error: displayNameError }, { status: 400 });
  }

  const displayName = normaliseDisplayName(name);
  const canonicalEmail = normaliseEmailAddress(email);

  const client = requestClientIdentity(request);
  const clientAllowed = await checkRateLimit(`register-ip:${client}`, 10, 60 * 60 * 1000);
  const emailAllowed =
    clientAllowed &&
    (await checkRateLimit(`register-email:${canonicalEmail}`, 3, 60 * 60 * 1000));
  if (!emailAllowed) {
    return NextResponse.json(
      { error: "Zu viele Registrierungsversuche. Bitte später erneut versuchen." },
      { status: 429 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email: canonicalEmail } });
  if (existing) {
    return NextResponse.json(
      { error: "Diese E-Mail-Adresse wird bereits verwendet." },
      { status: 409 }
    );
  }

  /**
   * Rejected rather than silently renamed: this path has a form to show the error in.
   * The OAuth path cannot do that and appends a counter instead (#107).
   */
  const nameKey = nameKeyOf(displayName);
  const nameTaken = await prisma.user.findUnique({ where: { nameKey } });
  if (nameTaken) {
    return NextResponse.json(
      { error: "Dieser Name ist schon vergeben." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const initials = displayName
    .split(" ")
    .map((part: string) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  let user: { id: string };
  try {
    user = await prisma.user.create({
      data: {
        email: canonicalEmail,
        passwordHash,
        name: displayName,
        nameKey,
        initials,
        avatar: starterAvatarPath(canonicalEmail),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "E-Mail-Adresse oder Name ist bereits vergeben." },
        { status: 409 }
      );
    }
    throw error;
  }

  let verificationEmailSent = true;
  try {
    const token = await createEmailVerificationToken(user.id);
    await sendVerificationEmail(canonicalEmail, token);
  } catch (error) {
    verificationEmailSent = false;
    console.error("[auth/register] verification email failed", {
      userId: user.id,
      email: canonicalEmail,
      error,
    });
  }

  return NextResponse.json({ success: true, verificationEmailSent }, { status: 201 });
}
