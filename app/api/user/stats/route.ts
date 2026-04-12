import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth-session";
import { getUserStatsData } from "@/lib/server/dashboard-data";

export async function GET() {
  const result = await getSessionUserId();
  if (result.error) return result.error;
  const { userId, userEmail } = result;
  const data = await getUserStatsData(userId, userEmail);
  if (!data) {
    return NextResponse.json(
      {
        error:
          "Benutzer nicht gefunden. Bitte abmelden und erneut anmelden (z. B. nach Datenbank-Reset).",
      },
      { status: 401 }
    );
  }
  return NextResponse.json(data);
}
