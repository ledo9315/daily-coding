"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FeedItem } from "@/components/feed-item";
import { motion } from "framer-motion";
import { getCommunityFeed } from "@/lib/api";
import type { CommunityFeedItem } from "@/lib/api";
import { communityFeedItemToFeedItem } from "@/lib/community-feed-map";
import { formatWeekdayDate } from "@/lib/format";
import { Loader2 } from "lucide-react";

const PAGE_SIZE = 15;

type DayBucket = { label: string; items: CommunityFeedItem[] };

function groupItemsByDay(
  items: CommunityFeedItem[],
  now: Date,
  locale: string,
  /** The two headings that are words rather than a date. */
  labels: { today: string; yesterday: string }
): DayBucket[] {
  const startToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const dayMs = 86_400_000;

  const bucketMap = new Map<string, CommunityFeedItem[]>();
  const keyOrder: string[] = [];

  for (const item of items) {
    const d = new Date(item.createdAt);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const diffDays = Math.round((startToday - start) / dayMs);
    let key: string;
    if (diffDays === 0) key = "today";
    else if (diffDays === 1) key = "yesterday";
    else key = `day-${start}`;

    if (!bucketMap.has(key)) {
      bucketMap.set(key, []);
      keyOrder.push(key);
    }
    bucketMap.get(key)!.push(item);
  }

  return keyOrder.map((key) => {
    const arr = bucketMap.get(key)!;
    const first = new Date(arr[0].createdAt);
    let label: string;
    if (key === "today") label = labels.today;
    else if (key === "yesterday") label = labels.yesterday;
    else {
      label = formatWeekdayDate(first, locale);
    }
    return { label, items: arr };
  });
}

export function CommunityFeed() {
  const t = useTranslations("community");
  const locale = useLocale();
  const [now] = useState(() => new Date());
  const [items, setItems] = useState<CommunityFeedItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadPage = useCallback(async (cursor: string | null) => {
    const page = await getCommunityFeed({
      cursor: cursor ?? undefined,
      limit: PAGE_SIZE,
    });
    setNextCursor(page.nextCursor);
    setItems((prev) => (cursor ? [...prev, ...page.items] : page.items));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError(null);
      setInitialLoading(true);
      try {
        await loadPage(null);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : t("feed.loadError"));
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
      setError(e instanceof Error ? e.message : t("feed.loadMoreError"));
    } finally {
      setLoadingMore(false);
    }
  }, [nextCursor, loadingMore, initialLoading, loadPage, t]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) void onLoadMore();
      },
      { root: null, rootMargin: "200px", threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [onLoadMore]);

  const buckets = useMemo(
    () =>
      groupItemsByDay(items, now, locale, {
        today: t("feed.today"),
        yesterday: t("feed.yesterday"),
      }),
    [items, now, locale, t],
  );

  if (initialLoading) {
    return (
      <div className="flex justify-center py-12 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
        <span className="sr-only">{t("feed.loading")}</span>
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        {error}
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground px-1">{t("feed.empty")}</p>
    );
  }

  let globalIndex = 0;

  return (
    <div className="space-y-8">
      {buckets.map((bucket) => (
        <div key={bucket.label} className="space-y-4">
          <h3 className="text-md font-semibold text-muted-foreground uppercase tracking-wider px-1">
            {bucket.label}
          </h3>
          <div className="grid gap-4">
            {bucket.items.map((item) => {
              const i = globalIndex++;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.4) }}
                >
                  <FeedItem {...communityFeedItemToFeedItem(item, t)} />
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}

      <div ref={sentinelRef} className="h-4 w-full shrink-0" aria-hidden />

      {error && items.length > 0 ? (
        <p className="text-center text-sm text-destructive">{error}</p>
      ) : null}

      {loadingMore ? (
        <div className="flex justify-center py-4 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
          <span className="sr-only">{t("feed.loadingMore")}</span>
        </div>
      ) : null}

      {!loadingMore && nextCursor == null && items.length > 0 ? (
        <p className="text-center text-xs text-muted-foreground pb-2">
          {t("feed.end")}
        </p>
      ) : null}
    </div>
  );
}
