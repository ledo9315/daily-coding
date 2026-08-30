"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { RankingTable } from "@/components/ranking-table";
import { TopThreePodium } from "@/components/top-three-podium";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarWeek,
  CalendarMonth,
  Trophy,
} from "@nsmr/pixelart-react";
import { EncryptedText } from "@/components/ui/encrypted-text";
import { AnimatedFlickeringGrid } from "@/components/ui/animated-flickering-grid";
import { getRanking } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

type Period = "week" | "month" | "all";

function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b border-border px-4 py-4">
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-5 w-16" />
    </div>
  );
}

function RankingSkeleton() {
  return (
    <div className="space-y-8">
      <Card className="shadow-[0_0_40px_-10px_rgba(163,113,247,0.3)] border-chart-5/50">
        <CardHeader>
          <Skeleton className="h-6 w-32 mx-auto" />
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-center gap-6 pt-4">
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-16 w-24" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="h-14 w-14 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-24 w-24" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-12 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="border border-border overflow-hidden">
        <div className="flex gap-8 border-b border-border bg-secondary/50 px-4 py-3">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-16" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <TableRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState<Period>("week");

  const { data: weekRanking = [], isLoading: weekLoading } = useQuery({
    queryKey: ["ranking", "week"],
    queryFn: () => getRanking("week"),
  });

  const { data: monthRanking = [], isLoading: monthLoading } = useQuery({
    queryKey: ["ranking", "month"],
    queryFn: () => getRanking("month"),
  });

  const { data: allTimeRanking = [], isLoading: allTimeLoading } = useQuery({
    queryKey: ["ranking", "all"],
    queryFn: () => getRanking("all"),
  });

  const isLoading = weekLoading || monthLoading || allTimeLoading;

  const currentRanking =
    activeTab === "week"
      ? weekRanking
      : activeTab === "month"
        ? monthRanking
        : allTimeRanking;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <AnimatedFlickeringGrid
        className="absolute inset-x-0 top-0 z-0 h-[300px] mask-[radial-gradient(300px_circle_at_top,white,transparent)]"
        squareSize={6}
        gridGap={1}
        color="#A371F7"
        maxOpacity={0.2}
        flickerChance={0.1}
      />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-15%] right-[-10%] h-200 w-200 bg-chart-5/30 blur-[140px] rounded-full opacity-50 mix-blend-screen" />
        <div className="absolute bottom-[-15%] left-[-10%] h-175 w-175 bg-chart-5/30 blur-[120px] rounded-full opacity-50 mix-blend-screen" />
      </div>

      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative">
        <div className="mb-8">
          <h1 className="text-3xl font-pixel uppercase tracking-tight mb-2">
            Rangliste
          </h1>
          <EncryptedText
            text="Vergleiche dich mit anderen Nutzern"
            revealDelayMs={20}
            className="text-xl text-muted-foreground uppercase tracking-wide"
          />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as Period)}
          className="space-y-6"
        >
          <TabsList className="w-full sm:w-auto sm:grid-cols-none rounded-none">
            <TabsTrigger value="week" className="gap-2 cursor-pointer rounded-none text-md">
              <CalendarWeek className="h-4 w-4 hidden sm:block" fill="currentColor" />
              Woche
            </TabsTrigger>
            <TabsTrigger value="month" className="gap-2 cursor-pointer rounded-none text-md">
              <CalendarMonth className="h-4 w-4 hidden sm:block" fill="currentColor" />
              Monat
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-2 cursor-pointer rounded-none text-md">
              <Trophy className="h-4 w-4 hidden sm:block" fill="currentColor" />
              Gesamt
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <RankingSkeleton />
          ) : (
            <>
              <TabsContent value="week" className="space-y-8">
                {weekRanking.length > 0 && (
                  <Card className="shadow-[0_0_40px_-10px_rgba(163,113,247,0.3)] border-chart-5/50">
                    <CardHeader>
                      <CardTitle className="text-center">Top 3 der Woche</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TopThreePodium
                        first={weekRanking[0]}
                        second={weekRanking[1]}
                        third={weekRanking[2]}
                      />
                    </CardContent>
                  </Card>
                )}
                <RankingTable entries={currentRanking} />
              </TabsContent>

              <TabsContent value="month" className="space-y-8">
                {monthRanking.length > 0 && (
                  <Card className="shadow-[0_0_40px_-10px_rgba(163,113,247,0.3)] border-chart-5/50">
                    <CardHeader>
                      <CardTitle className="text-center">Top 3 des Monats</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TopThreePodium
                        first={monthRanking[0]}
                        second={monthRanking[1]}
                        third={monthRanking[2]}
                      />
                    </CardContent>
                  </Card>
                )}
                <RankingTable entries={currentRanking} />
              </TabsContent>

              <TabsContent value="all" className="space-y-8">
                {allTimeRanking.length > 0 && (
                  <Card className="shadow-[0_0_40px_-10px_rgba(163,113,247,0.3)] border-chart-5/50">
                    <CardHeader>
                      <CardTitle className="text-center">Top 3 insgesamt</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TopThreePodium
                        first={allTimeRanking[0]}
                        second={allTimeRanking[1]}
                        third={allTimeRanking[2]}
                      />
                    </CardContent>
                  </Card>
                )}
                <RankingTable entries={currentRanking} />
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>
    </div>
  );
}
