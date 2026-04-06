import { NextResponse } from "next/server";
import { getDashboardRankingPreviewData } from "@/lib/server/dashboard-data";

export async function GET() {
  const data = await getDashboardRankingPreviewData();
  return NextResponse.json(data);
}
