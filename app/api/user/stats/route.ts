import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { getSessionUserId } from "@/lib/auth-session";
import { getUserStatsData } from "@/lib/server/dashboard-data";

export async function GET() {
  const result = await getSessionUserId();
  if (result.error) return result.error;
  const { userId } = result;
  const data = await getUserStatsData(userId);
  if (!data) {
    const t = await getTranslations("api");
    return NextResponse.json(
      { error: t("user.notFound") },
      { status: 401 }
    );
  }
  return NextResponse.json(data);
}
