import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserRoleFromDb } from "@/lib/server/user-role";

/**
 * Server Components: nur für eingeloggte Admins; sonst Redirect.
 * Rolle kommt aus der DB (nicht aus dem Session-JWT).
 */
export async function requireAdminPage(callbackPath = "/admin/challenges/new") {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackPath)}`);
  }
  const role = await getUserRoleFromDb(session.user.id);
  if (role !== "admin") {
    redirect("/");
  }
  return session;
}
