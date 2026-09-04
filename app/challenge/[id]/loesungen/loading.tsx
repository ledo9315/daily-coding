"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Header } from "@/components/header";
import { Skeleton } from "@/components/ui/skeleton";

// Without this file app/challenge/loading.tsx applies and the editor skeleton flashes here.
// A client component only for the spinner's label; the rest is static markup.
export default function ChallengeResultLoading() {
  const t = useTranslations("challenge");

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* The ambient purple of the page itself, so the background does not change on load. */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-15%] right-[-10%] h-200 w-200 bg-chart-5/30 blur-[140px] rounded-full opacity-50 mix-blend-screen" />
        <div className="absolute bottom-[-15%] left-[-10%] h-175 w-175 bg-chart-5/30 blur-[120px] rounded-full opacity-50 mix-blend-screen" />
      </div>

      <Header />

      <main className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <Skeleton className="h-6 w-64 sm:h-8" />
            <Skeleton className="h-5 w-28" />
          </div>
          <div className="flex items-center gap-3 sm:shrink-0">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>

        <div className="mt-4 border-l-4 border-primary bg-primary/[0.06] py-2 pl-3">
          <Skeleton className="h-5 w-72" />
        </div>

        {/* Both panels come up collapsed, so only the two triggers have a height. */}
        <div className="mt-6 border-2 border-border bg-card px-4">
          <div className="flex items-center justify-between border-b border-border py-4">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-4" />
          </div>
          <div className="flex items-center justify-between gap-3 py-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>

        <section className="mt-10">
          <div className="mb-3">
            <Skeleton className="h-5 w-28" />
          </div>
          <Skeleton className="h-72 w-full" />
        </section>

        <section className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-border pb-4">
            <Skeleton className="h-5 w-56" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 w-44" />
            </div>
          </div>
          {/* The same spinner the list shows while it fetches its first page. */}
          <div className="flex justify-center py-12 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
            <span className="sr-only">{t("solutions.loading")}</span>
          </div>
        </section>
      </main>
    </div>
  );
}
