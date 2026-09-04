import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { findDailyChallengeForApp } from "@/lib/server/challenge-day";
import { localizedAlternates } from "@/lib/server/metadata";

/** Roughly what a search result and a link preview show before they cut. */
const EXCERPT_LENGTH = 155;

/**
 * The first sentences of the description, ending on a word. Newlines collapse: a
 * description may use paragraphs, and a preview renders them as one line anyway.
 */
function excerpt(text: string): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= EXCERPT_LENGTH) return flat;
  const cut = flat.slice(0, EXCERPT_LENGTH);
  const lastSpace = cut.lastIndexOf(" ");
  return `${lastSpace > 0 ? cut.slice(0, lastSpace) : cut}…`;
}

/**
 * The task is public since #287, so it carries a description and one canonical per
 * language like the other indexable pages - and it names today's task rather than the
 * product: the body is fetched in the browser, so a link preview would otherwise show an
 * empty shell wherever the URL is shared.
 *
 * The challenge is read best-effort. A metadata function that throws takes the page with
 * it, and a missing preview is worth less than a working task.
 *
 * `/challenge/<id>/solutions` sits under this layout and clears the alternates again - it
 * stays behind the login and would otherwise inherit this page's canonical.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("challenge");
  const challenge = await findDailyChallengeForApp().catch(() => null);

  return {
    title: challenge?.title ?? t("meta.task"),
    description: challenge ? excerpt(challenge.description) : t("meta.description"),
    alternates: await localizedAlternates("/challenge"),
  };
}

// Client component page, so the metadata lives here (#131).
export default function ChallengeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
