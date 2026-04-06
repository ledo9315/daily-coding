import { NextResponse } from "next/server";
import { getUserStatsData } from "@/lib/server/dashboard-data";

export async function GET() {
  const data = await getUserStatsData();
  return NextResponse.json(data);
}
