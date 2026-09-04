import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { getSessionUserId } from "@/lib/auth-session";
import { getUserProfileData } from "@/lib/server/profile-data";

export async function GET() {
  const result = await getSessionUserId();
  if (result.error) return result.error;
  const { userId } = result;
  const data = await getUserProfileData(userId);
  if (!data) {
    const t = await getTranslations("api");
    return NextResponse.json(
      { error: t("user.notFound") },
      { status: 401 }
    );
  }
  return NextResponse.json(data);
}
