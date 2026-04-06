import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth-session";
import { getUserProfileData } from "@/lib/server/profile-data";

export async function GET() {
  const result = await getSessionUserId();
  if (result.error) return result.error;
  const { userId } = result;
  const data = await getUserProfileData(userId);
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
