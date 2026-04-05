import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await params; // consume params — stub endpoint acknowledges deletion
  return new NextResponse(null, { status: 204 });
}
