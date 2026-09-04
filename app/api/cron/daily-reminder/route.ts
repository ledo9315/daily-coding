import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { runDailyReminder } from "@/lib/server/daily-reminder";

/**
 * A run sends one mail at a time with a pause in between, so it is long by design.
 * The platform default is 300 seconds; naming it here keeps the ceiling visible next to
 * the loop that spends it.
 */
export const maxDuration = 300;

/**
 * No message from this route reaches a reader - it answers Vercel's scheduler and its
 * replies end up in a log - so the strings stay English literals rather than message keys.
 */
function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function matchesSecret(header: string | null, secret: string): boolean {
  if (!header) return false;
  const expected = Buffer.from(`Bearer ${secret}`, "utf8");
  const given = Buffer.from(header, "utf8");
  return expected.length === given.length && timingSafeEqual(expected, given);
}

/**
 * The daily reminder (#288). Vercel calls this on the schedule in `vercel.json` and sends
 * `Authorization: Bearer $CRON_SECRET` whenever that variable is set.
 *
 * Without the variable the route refuses to run at all rather than falling open: an
 * endpoint that mails every user is not one to leave reachable by whoever finds the path.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 503 }
    );
  }
  if (!matchesSecret(request.headers.get("authorization"), secret)) {
    return unauthorized();
  }

  const result = await runDailyReminder();
  return NextResponse.json(result);
}
