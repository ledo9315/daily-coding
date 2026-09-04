import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { getTodayChallengeSummary } from "@/lib/server/dashboard-data";

export async function GET() {
  const data = await getTodayChallengeSummary();
  if (!data) {
    const t = await getTranslations("api");
    return NextResponse.json({ error: t("challenge.noneActive") }, { status: 404 });
  }
  return NextResponse.json(data);
}
