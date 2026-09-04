import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { LandingNavbar } from "@/components/landing/navbar";
import { applyReminderLink } from "@/lib/server/reminder-preference";
import { unsubscribePath } from "@/lib/server/reminder-token";
import { localizedPath } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("email");
  return {
    title: t("unsubscribe.metaTitle"),
    // Nothing here is worth a search result, and the URL carries a signature.
    robots: { index: false, follow: false },
  };
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) ?? "";

/**
 * The way out of the daily reminder, without a login (#288).
 *
 * The switch is thrown by opening the page, not by a button on it: someone who wants the
 * mails to stop should not have to confirm that they meant it. The cost is that a link
 * scanner in a mail client can trip it, and the answer to that is the link back - one
 * click either way, and both directions say plainly what just happened.
 */
export default async function UnsubscribePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const userId = first(params.u);
  const token = first(params.t);
  const resume = first(params.resume) === "1";

  const t = await getTranslations("email");
  const locale = await getLocale();

  const state = await applyReminderLink(userId, token, resume);

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
      <LandingNavbar />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 pt-32 pb-16 sm:px-6">
        <h1 className="mb-4 font-pixel text-xl uppercase tracking-wide">
          {t(`unsubscribe.${state}Title`)}
        </h1>
        {/* Not `text-sm`: the pixel face has a small x-height, and this is the sentence
            that says what just happened to the reader's mailbox. */}
        <p className="text-base leading-relaxed text-muted-foreground">
          {t(`unsubscribe.${state}Body`)}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {state === "done" ? (
            <Link
              href={`${unsubscribePath(userId)}&resume=1`}
              className="border-2 border-border px-4 py-2 text-base uppercase tracking-wider text-muted-foreground hover:border-primary hover:text-primary"
            >
              {t("unsubscribe.resume")}
            </Link>
          ) : null}
          <Link
            href={localizedPath("/challenge", locale)}
            className="border-2 border-primary/40 bg-primary/10 px-4 py-2 text-base uppercase tracking-wider text-primary hover:border-primary hover:bg-primary/20"
          >
            {t("unsubscribe.toChallenge")}
          </Link>
        </div>
      </main>
    </div>
  );
}
