import { verifyEmailToken } from "@/lib/server/auth-service";
import { redirect } from "next/navigation";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    redirect("/login?error=missing-token");
  }

  const result = await verifyEmailToken(token);

  if ("error" in result) {
    redirect("/login?error=verification-failed");
  }

  redirect("/login?verified=1");
}
