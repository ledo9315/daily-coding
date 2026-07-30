import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserRoleFromDb } from "@/lib/server/user-role";

/**
 * For server components: signed-in admins only, everyone else is redirected.
 * The role comes from the DB, not from the session JWT.
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
