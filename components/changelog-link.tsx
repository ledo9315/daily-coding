"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  hasUnseenChangelog,
  latestChangelogVersion,
  markChangelogSeen,
  readChangelogSeen,
} from "@/lib/changelog-seen";

/**
 * The footer's changelog link, with a „NEU" marker after a release the reader has not opened.
 *
 * The state lives in localStorage, not in the database: it is one flag per browser about a
 * page that changes a few times a year, and a row per user would need a fan-out on every
 * release plus something to trigger it.
 */
export function ChangelogLink({ className }: { className?: string }) {
  const t = useTranslations("changelog");
  // Starts false and is decided after mount: reading storage during render would make the
  // server output and the first client render disagree.
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    const seen = readChangelogSeen();
    if (seen === null) {
      // First visit: remember where the reader came in, so the badge means "since you were
      // here" from the next release on.
      markChangelogSeen();
      return;
    }
    setIsNew(hasUnseenChangelog(seen, latestChangelogVersion()));
  }, []);

  return (
    <Link
      href="/changelog"
      className={className}
      onClick={() => {
        markChangelogSeen();
        setIsNew(false);
      }}
    >
      {t("link.label")}
      {isNew && (
        <span className="ml-2 border border-primary/40 bg-primary/15 px-1.5 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wider text-primary">
          {t("link.new")}
        </span>
      )}
    </Link>
  );
}

/**
 * Marks the changelog as read. Rendered by the page itself, so the badge also clears for
 * someone who arrives by bookmark rather than through the footer link.
 */
export function MarkChangelogSeen() {
  useEffect(() => markChangelogSeen(), []);
  return null;
}
