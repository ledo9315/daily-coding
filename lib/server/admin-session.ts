import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getUserRoleFromDb } from "@/lib/server/user-role";

export async function requireAdminApi() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 }),
    };
  }
  const role = await getUserRoleFromDb(session.user.id);
  if (role !== "admin") {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 }),
    };
  }
  return { ok: true as const, session };
}
