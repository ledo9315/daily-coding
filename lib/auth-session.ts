import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * Retrieve the authenticated user ID from the current session.
 * Returns { userId } on success, or a 401 NextResponse if unauthenticated.
 */
export async function getSessionUserId(): Promise<
  { userId: string; userEmail: string | null; error?: never } | { userId?: never; userEmail?: never; error: NextResponse }
> {
  const session = await auth();
  const userId = session?.user?.id;
  const userEmail = session?.user?.email ?? null;
  if (!userId) {
    return {
      error: NextResponse.json(
        { error: "Nicht authentifiziert." },
        { status: 401 }
      ),
    };
  }
  return { userId, userEmail };
}
