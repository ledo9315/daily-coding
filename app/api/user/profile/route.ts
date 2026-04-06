import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth-session";
import { getUserProfileData } from "@/lib/server/profile-data";

export async function GET() {
  const result = await getSessionUserId();
  if (result.error) return result.error;
  const { userId } = result;
  const data = await getUserProfileData(userId);
  return NextResponse.json(data);
}
