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

/**
 * The networks that get a button of their own, beside the copy button.
 *
 * A fixed link rather than `navigator.share`, because that one has no say in which apps
 * the system offers: on macOS its sheet lists Mail, Notes and Reminders and nothing a
 * result would sensibly go to. These open a composer with the block already in it, on
 * every operating system and whether or not an app is installed.
 *
 * Both carry the whole text in one parameter. That is the reason the list is short:
 * LinkedIn dropped prefilled text in 2022 and would post the bare link, which is exactly
 * the part of the block that says nothing. Reddit prefills, but a personal daily result
 * is a post nobody subscribed to.
 */
export const SHARE_TARGETS = [
  {
    id: "x",
    /** Brand, so it is written out rather than translated. */
    label: "X",
    href: (text: string) => `https://x.com/intent/post?text=${encodeURIComponent(text)}`,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    href: (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`,
  },
] as const;

export type ShareTarget = (typeof SHARE_TARGETS)[number];
