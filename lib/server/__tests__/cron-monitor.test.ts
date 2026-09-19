import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  DAILY_REMINDER_MONITOR,
  DAILY_REMINDER_MONITOR_CONFIG,
  DAILY_REMINDER_SCHEDULE,
} from "@/lib/server/cron-monitor";

const CRON_PATH = "/api/cron/daily-reminder";

const readProjectFile = (...segments: string[]) =>
  readFileSync(resolve(process.cwd(), ...segments), "utf8");

const vercelCrons = (): { path: string; schedule: string }[] =>
  JSON.parse(readProjectFile("vercel.json")).crons ?? [];

/**
 * A cron monitor is a promise about a schedule that another file makes. Everything here
 * compares the promise with the thing that keeps it, because a monitor that expects the
 * wrong time is worse than none: it reports a miss every day and is switched off by the
 * first person who tires of the mail.
 */
describe("daily reminder cron monitor", () => {
  it("expects the schedule Vercel actually triggers", () => {
    const entry = vercelCrons().find((cron) => cron.path === CRON_PATH);

    expect(entry?.schedule).toBe(DAILY_REMINDER_SCHEDULE);
    expect(DAILY_REMINDER_MONITOR_CONFIG.schedule).toEqual({
      type: "crontab",
      value: entry?.schedule,
    });
  });

  /** The cron expression is written in UTC, so the monitor has to read it as UTC. */
  it("reads the schedule in the timezone it was written in", () => {
    expect(DAILY_REMINDER_MONITOR_CONFIG.timezone).toBe("UTC");
  });

  /**
   * Vercel's Hobby plan schedules per hour, not per minute: a job set to 17:00 fires any
   * time up to 17:59. A margin below that window turns a normal run into a missed one.
   */
  it("allows for the hour of imprecision the Hobby plan reserves", () => {
    expect(DAILY_REMINDER_MONITOR_CONFIG.checkinMargin).toBeGreaterThanOrEqual(60);
  });

  /**
   * A run is only a timeout once the platform has given up on it; below that ceiling the
   * monitor would flag a long but healthy send.
   */
  it("calls a run timed out no earlier than the platform does", () => {
    const source = readProjectFile("app", "api", "cron", "daily-reminder", "route.ts");
    const maxDurationSeconds = Number(source.match(/maxDuration = (\d+)/)?.[1]);

    expect(maxDurationSeconds).toBeGreaterThan(0);
    expect(DAILY_REMINDER_MONITOR_CONFIG.maxRuntime * 60).toBeGreaterThan(
      maxDurationSeconds
    );
  });

  /** The slug is the monitor's identity in Sentry; a rename starts an empty one. */
  it("keeps the slug the monitor was created under", () => {
    expect(DAILY_REMINDER_MONITOR).toBe("daily-reminder");
  });
});
