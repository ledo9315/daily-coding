"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { SolutionCard } from "@/components/challenge-result/solution-card";
import type { CodeLanguageId } from "@/lib/challenge-languages";
import {
  getChallengeSolutions,
  type ChallengeSolutionGroup,
  type SolutionFilter,
  type SolutionSort,
} from "@/lib/api";

const PAGE_SIZE = 10;

const SORT_LABEL_KEYS: Record<SolutionSort, string> = {
  newest: "solutionList.sortNewest",
  oldest: "solutionList.sortOldest",
  best_practices: "solutionList.sortBestPractices",
  clever: "solutionList.sortClever",
};

export function SolutionList({
  challengeId,
  ownCode,
  ownLanguage,
}: {
  challengeId: string;
  /** The user's own solution, so a card can diff against it without a second request. */
  ownCode: string;
  ownLanguage: CodeLanguageId;
}) {
  const t = useTranslations("community");
  /**
   * Set by a notification link. The list starts on „Meine" then: the wanted solution is one
   * of the user's own and there are few of those, so it is on the first page - without the
   * filter the list would have to page blindly until the hash shows up.
   */
  const focusHash = useSearchParams().get("loesung");
  const [groups, setGroups] = useState<ChallengeSolutionGroup[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Client state, not the URL: the list loads its pages client-side anyway, and putting the
  // choice in the URL would re-render the whole server component for a reordering.
  const [sort, setSort] = useState<SolutionSort>("newest");
  const [filter, setFilter] = useState<SolutionFilter>(focusHash ? "mine" : "all");
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const scrolledToFocus = useRef(false);

  const loadPage = useCallback(
    async (cursor: string | null) => {
      const page = await getChallengeSolutions(challengeId, {
        cursor: cursor ?? undefined,
        limit: PAGE_SIZE,
        sort,
        filter,
      });
      setNextCursor(page.nextCursor);
      setGroups((prev) => (cursor ? [...prev, ...page.groups] : page.groups));
    },
    // Changing either resets the list: `loadPage` is a dependency of the effect below, so a
    // new sort or filter reloads from the first page and drops the old cursor.
    [challengeId, sort, filter],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError(null);
      setInitialLoading(true);
      try {
        await loadPage(null);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : t("solutionList.loadError"));
        }
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadPage, t]);

  const onLoadMore = useCallback(async () => {
    if (nextCursor == null || loadingMore || initialLoading) return;
    setLoadingMore(true);
    setError(null);
    try {
      await loadPage(nextCursor);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("solutionList.loadMoreError"));
    } finally {
      setLoadingMore(false);
    }
  }, [nextCursor, loadingMore, initialLoading, loadPage, t]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void onLoadMore();
      },
      { root: null, rootMargin: "200px", threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [onLoadMore]);

  // Once per visit: scrolling again after „Mehr laden" would yank the reader back up.
  useEffect(() => {
    if (!focusHash || scrolledToFocus.current || initialLoading) return;
    const card = document.getElementById(`loesung-${focusHash}`);
    if (!card) return;
    scrolledToFocus.current = true;
    // Jump, not glide: the link promises a place, and a smooth scroll of a whole page
    // length only delays it (and does nothing at all in a browser that reduces motion).
    card.scrollIntoView({ block: "start" });
  }, [focusHash, initialLoading, groups]);

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-border pb-4">
        <h2 className="font-pixel text-sm uppercase tracking-wide sm:text-base">
          {t("solutionList.heading")}
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          <div
            className="flex border-2 border-border"
            role="group"
            aria-label={t("solutionList.filterLabel")}
          >
            {(["all", "mine"] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
                className={`px-3 py-1.5 text-base uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset ${
                  filter === value
                    ? "bg-primary/15 text-primary"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {value === "all"
                  ? t("solutionList.filterAll")
                  : t("solutionList.filterMine")}
              </button>
            ))}
          </div>

          <label className="sr-only" htmlFor="solution-sort">
            {t("solutionList.sortLabel")}
          </label>
          <select
            id="solution-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SolutionSort)}
            className="border-2 border-border bg-secondary px-3 py-1.5 text-base uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {Object.entries(SORT_LABEL_KEYS).map(([value, labelKey]) => (
              <option key={value} value={value}>
                {t(labelKey)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {initialLoading ? (
        <div className="flex justify-center py-12 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
          <span className="sr-only">{t("solutionList.loading")}</span>
        </div>
      ) : error && groups.length === 0 ? (
        <p className="mt-6 border-2 border-destructive/40 bg-destructive/10 px-4 py-3 text-lg text-destructive">
          {error}
        </p>
      ) : groups.length === 0 ? (
        <div className="mt-6 border-2 border-dashed border-border px-4 py-10 text-center">
          <p className="text-lg text-muted-foreground">
            {filter === "mine"
              ? t("solutionList.emptyMine")
              : t("solutionList.emptyAll")}
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4">
            {groups.map((group) => (
              <SolutionCard
                key={group.codeHash}
                challengeId={challengeId}
                group={group}
                ownCode={ownCode}
                ownLanguage={ownLanguage}
                focused={group.codeHash === focusHash}
              />
            ))}
          </div>

          <div ref={sentinelRef} className="h-4 w-full shrink-0" aria-hidden />

          {error ? (
            <p className="text-center text-lg text-destructive">{error}</p>
          ) : null}

          {loadingMore ? (
            <div className="flex justify-center py-4 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
              <span className="sr-only">{t("solutionList.loadingMore")}</span>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
