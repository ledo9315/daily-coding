import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserRoleFromDb } from "@/lib/server/user-role";

/**
 * Returns the current role from the DB, for UI decisions such as showing the
 * admin link in the header.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }
  const role = await getUserRoleFromDb(session.user.id);
  return NextResponse.json({
    id: session.user.id,
    role: role ?? "user",
  });
}
