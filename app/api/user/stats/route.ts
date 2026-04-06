import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth-session";
import { getUserStatsData } from "@/lib/server/dashboard-data";

export async function GET() {
  const result = await getSessionUserId();
  if (result.error) return result.error;
  const { userId } = result;
  const data = await getUserStatsData(userId);
  return NextResponse.json(data);
}
