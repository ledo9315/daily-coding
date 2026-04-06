import { NextResponse } from "next/server";
import { getTodayChallengeSummary } from "@/lib/server/dashboard-data";

export async function GET() {
  const data = await getTodayChallengeSummary();
  if (!data) {
    return NextResponse.json({ error: "No active challenge" }, { status: 404 });
  }
  return NextResponse.json(data);
}
