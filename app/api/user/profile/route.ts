import { NextResponse } from "next/server";
import { getUserProfileData } from "@/lib/server/profile-data";

export async function GET() {
  const data = await getUserProfileData();
  return NextResponse.json(data);
}
