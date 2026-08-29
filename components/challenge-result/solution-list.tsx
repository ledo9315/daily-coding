"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { SolutionCard } from "@/components/challenge-result/solution-card";
import { getChallengeSolutions, type ChallengeSolutionGroup } from "@/lib/api";

const PAGE_SIZE = 10;

export function SolutionList({ challengeId }: { challengeId: string }) {
  const [groups, setGroups] = useState<ChallengeSolutionGroup[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadPage = useCallback(
    async (cursor: string | null) => {
      const page = await getChallengeSolutions(challengeId, {
        cursor: cursor ?? undefined,
        limit: PAGE_SIZE,
      });
      setNextCursor(page.nextCursor);
      setGroups((prev) => (cursor ? [...prev, ...page.groups] : page.groups));
    },
    [challengeId],
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
      <h2 className="font-pixel text-sm uppercase tracking-wide">
        Lösungen der Community
      </h2>

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
          Diese Challenge hat bisher noch niemand sonst gelöst — schau später
          wieder vorbei.
        </p>
      ) : (
        <>
          <div className="mt-4 grid gap-4">
            {groups.map((group) => (
              <SolutionCard key={group.codeHash} group={group} />
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
