import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { getUserRoleFromDb } from "@/lib/server/user-role";

/**
 * Returns the current role from the DB, for UI decisions such as showing the
 * admin link in the header.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    const t = await getTranslations("api");
    return NextResponse.json({ error: t("user.notSignedIn") }, { status: 401 });
  }
  const role = await getUserRoleFromDb(session.user.id);
  return NextResponse.json({
    id: session.user.id,
    role: role ?? "user",
  });
}
