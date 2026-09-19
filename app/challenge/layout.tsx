import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { findDailyChallengeForApp } from "@/lib/server/challenge-day";
import { localizedAlternates } from "@/lib/server/metadata";
import { excerpt } from "@/lib/excerpt";

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
