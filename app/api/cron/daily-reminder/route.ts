import { timingSafeEqual } from "node:crypto";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  DAILY_REMINDER_MONITOR,
  DAILY_REMINDER_MONITOR_CONFIG,
} from "@/lib/server/cron-monitor";
import { runDailyReminder } from "@/lib/server/daily-reminder";
import { pruneReadNotifications } from "@/lib/server/notifications";

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
 *
 * `withMonitor` opens a Sentry check-in before the work and closes it as `ok` or `error`
 * afterwards. That is the only way a run that never happens becomes visible: an error has
 * something to report, silence has not, and until now a scheduler that stopped calling
 * would have gone unnoticed until someone asked why the mails had stopped. Both check-ins
 * sit behind the secret, so a stranger hitting the path cannot write into the monitor's
 * history - and a refused call is not a run.
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

  try {
    const summary = await Sentry.withMonitor(
      DAILY_REMINDER_MONITOR,
      async () => {
        // The one scheduled run of the day carries the housekeeping too; a second cron for a
        // single deleteMany is not worth its own schedule entry.
        const prunedNotifications = await pruneReadNotifications();
        const result = await runDailyReminder();
        // The JSON below answers the scheduler and is gone; this line is the run's record.
        Sentry.logger.info("daily reminder run", { ...result, prunedNotifications });
        return { ...result, prunedNotifications };
      },
      DAILY_REMINDER_MONITOR_CONFIG
    );
    return NextResponse.json(summary);
  } finally {
    /**
     * A serverless instance may be frozen the moment the response leaves, and the closing
     * check-in is the whole point of the monitor. Waiting here beats a healthy run that
     * Sentry reports as a timeout because its envelope never left the machine.
     */
    await Sentry.flush(2000);
  }
}
