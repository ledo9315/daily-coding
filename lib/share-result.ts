/**
 * The block a solver copies out of the result page.
 *
 * Modelled on Wordle's: small enough for any input field, and it says how the week went
 * without saying anything about how the task was solved. Two constraints follow from
 * that, and both are the point of the feature rather than details of it:
 *
 * 1. **No code and no test output.** Whoever reads the block should still want to solve
 *    the task, so the only numbers in it are the reader's own week and streak.
 * 2. **The link points at the task, not at the solution.** `/challenge/<id>/solutions`
 *    sits behind the login and is the spoiler; the daily task is public since #287.
 *
 * The squares are the part that differs between two people. The test results are not:
 * a submission that counts as solved passed every case, so a grid of them would be the
 * same row of green for everybody.
 */

/** Seven, so the strip reads as "this week" without a legend. */
export const SHARE_WEEK_DAYS = 7;

const SOLVED_SQUARE = "🟩";
/** White, not black: the feeds this gets pasted into are dark far more often than not. */
const MISSED_SQUARE = "⬜";

export interface ShareResultInput {
  /** Localized, and part of the block on purpose - it is the conversation starter. */
  challengeTitle: string;
  difficultyLabel: string;
  dateLabel: string;
  /** Oldest day first; `SHARE_WEEK_DAYS` entries. */
  days: boolean[];
  /** Already pluralised in the reader's language. */
  streakLabel: string;
  url: string;
}

export function shareResultText(input: ShareResultInput): string {
  const strip = input.days.map((solved) => (solved ? SOLVED_SQUARE : MISSED_SQUARE)).join("");

  return [
    `>_ DAILY CODING · ${input.dateLabel}`,
    `${input.challengeTitle} · ${input.difficultyLabel}`,
    "",
    strip,
    `🔥 ${input.streakLabel}`,
    "",
    input.url,
  ].join("\n");
}
