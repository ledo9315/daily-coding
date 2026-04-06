import { redirect } from "next/navigation";
import { joinSearchParamsToRegisterPath } from "@/lib/join-to-register-path";

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  redirect(joinSearchParamsToRegisterPath(params));
}
