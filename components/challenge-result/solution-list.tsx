"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

const SORT_LABELS: Record<SolutionSort, string> = {
  newest: "Neueste zuerst",
  oldest: "Älteste zuerst",
  best_practices: "Best Practices",
  clever: "Clever",
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
  const [groups, setGroups] = useState<ChallengeSolutionGroup[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Client state, not the URL: the list loads its pages client-side anyway, and putting the
  // choice in the URL would re-render the whole server component for a reordering.
  const [sort, setSort] = useState<SolutionSort>("newest");
  const [filter, setFilter] = useState<SolutionFilter>("all");
  const sentinelRef = useRef<HTMLDivElement | null>(null);

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
          setError(
            e instanceof Error
              ? e.message
              : "Lösungen konnten nicht geladen werden.",
          );
        }
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadPage]);

  const onLoadMore = useCallback(async () => {
    if (nextCursor == null || loadingMore || initialLoading) return;
    setLoadingMore(true);
    setError(null);
    try {
      await loadPage(nextCursor);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Weitere Lösungen konnten nicht geladen werden.",
      );
    } finally {
      setLoadingMore(false);
    }
  }, [nextCursor, loadingMore, initialLoading, loadPage]);

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

  return (
    <section className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-pixel text-sm uppercase tracking-wide">
          Lösungen der Community
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex" role="group" aria-label="Lösungen filtern">
            {(["all", "mine"] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
                className={`border border-border px-3 py-1 text-xs uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  filter === value
                    ? "border-primary bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {value === "all" ? "Alle" : "Meine"}
              </button>
            ))}
          </div>

          <label className="sr-only" htmlFor="solution-sort">
            Lösungen sortieren
          </label>
          <select
            id="solution-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SolutionSort)}
            className="border border-border bg-background px-3 py-1 text-xs uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {initialLoading ? (
        <div className="flex justify-center py-12 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
          <span className="sr-only">Lösungen werden geladen</span>
        </div>
      ) : error && groups.length === 0 ? (
        <p className="mt-4 border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : groups.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          {filter === "mine"
            ? "Von dir liegt hier noch keine Lösung."
            : "Diese Challenge hat bisher noch niemand gelöst — schau später wieder vorbei."}
        </p>
      ) : (
        <>
          <div className="mt-4 grid gap-4">
            {groups.map((group) => (
              <SolutionCard
                key={group.codeHash}
                challengeId={challengeId}
                group={group}
                ownCode={ownCode}
                ownLanguage={ownLanguage}
              />
            ))}
          </div>

          <div ref={sentinelRef} className="h-4 w-full shrink-0" aria-hidden />

          {error ? (
            <p className="text-center text-sm text-destructive">{error}</p>
          ) : null}

          {loadingMore ? (
            <div className="flex justify-center py-4 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
              <span className="sr-only">Weitere Lösungen werden geladen</span>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
