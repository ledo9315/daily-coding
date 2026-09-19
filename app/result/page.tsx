import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { GuestResult } from "@/components/guest-result";

/**
 * `noindex`, and for a stronger reason than the usual one: the page renders from the
 * reader's own `sessionStorage`, so a crawler would only ever see the empty state. It is
 * also listed in `PRIVATE_PATHS`, which keeps it out of robots.txt; both together, because
 * a disallowed path can still end up in an index through a link.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("challenge");

  return {
    title: t("guestResult.title"),
    robots: { index: false, follow: false },
    alternates: { canonical: null, languages: {} },
  };
}

export default function GuestResultPage() {
  return <GuestResult />;
}
