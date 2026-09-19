import type { withMonitor } from "@sentry/nextjs";

/** The SDK does not re-export the shape, so it is read off the function that takes it. */
type MonitorConfig = NonNullable<Parameters<typeof withMonitor>[2]>;

/**
 * What Sentry files the daily reminder's check-ins under. The slug is the monitor's
 * identity: rename it and the next run opens a second monitor without history instead of
 * continuing this one.
 */
export const DAILY_REMINDER_MONITOR = "daily-reminder";

/**
 * The schedule the monitor expects, mirrored from the `crons` entry in `vercel.json`.
 * Vercel owns the trigger; Sentry only knows what it was told, and a monitor told the wrong
 * time reports a miss every day until nobody reads it any more. A test compares the two
 * files, so the copy cannot drift silently.
 */
export const DAILY_REMINDER_SCHEDULE = "0 17 * * *";

/**
 * Sent with the first check-in, which is what creates the monitor - so the numbers live
 * here next to their reasons rather than in the Sentry UI, where nothing remembers why.
 *
 * `checkinMargin` is wide because the Hobby plan schedules per hour, not per minute:
 * Vercel documents a precision of ±59 minutes, so a job set to 17:00 may fire any time up
 * to 17:59. A margin of five minutes would report a missed run most days. Seventy-five
 * minutes covers the whole window and still notices a run that never came.
 *
 * `maxRuntime` sits above the route's own `maxDuration` of 300 seconds. A run that reaches
 * the platform's ceiling is killed there and never sends its closing check-in, and that is
 * the timeout worth hearing about; a shorter value would flag a long but healthy run.
 */
export const DAILY_REMINDER_MONITOR_CONFIG = {
  schedule: { type: "crontab", value: DAILY_REMINDER_SCHEDULE },
  checkinMargin: 75,
  maxRuntime: 10,
  timezone: "UTC",
} as const satisfies MonitorConfig;
