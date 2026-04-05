"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { RankingTable } from "@/components/ranking-table";
import { TopThreePodium } from "@/components/top-three-podium";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarToday,
  CalendarWeek,
  CalendarMonth,
  Users,
} from "@nsmr/pixelart-react";
import { EncryptedText } from "@/components/ui/encrypted-text";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { getRanking, type RankingEntry } from "@/lib/api";

type Period = "today" | "week" | "month" | "team";

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState<Period>("today");
  const [rankings, setRankings] = useState<Record<Period, RankingEntry[]>>({
    today: [],
    week: [],
    month: [],
    team: [],
  });

  useEffect(() => {
    Promise.all([
      getRanking("today"),
      getRanking("week"),
      getRanking("month"),
      getRanking("team"),
    ]).then(([today, week, month, team]) => {
      setRankings({ today, week, month, team });
    });
  }, []);

  const currentRanking = rankings[activeTab];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FlickeringGrid
        className="absolute inset-0 z-0 mask-[radial-gradient(300px_circle_at_top,white,transparent)]"
        squareSize={6}
        gridGap={1}
        color="#A371F7"
        maxOpacity={0.2}
        flickerChance={0.1}
        height={300}
        width={1920}
      />
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] h-150 w-150 bg-chart-5/15 blur-[120px] rounded-full opacity-50 mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-5%] h-125 w-125 bg-chart-5/15 blur-[100px] rounded-full opacity-50 mix-blend-screen" />
      </div>

      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative">
        <div className="mb-8">
          <h1 className="text-3xl font-pixel uppercase tracking-tight mb-2">
            Ranking
          </h1>
          <EncryptedText
            text="Vergleiche dich mit anderen Entwicklern und Teams"
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
            <TabsTrigger
              value="today"
              className="gap-2 cursor-pointer rounded-none text-md"
            >
              <CalendarToday
                className="h-4 w-4 hidden sm:block"
                fill="currentColor"
              />
              Heute
            </TabsTrigger>
            <TabsTrigger
              value="week"
              className="gap-2 cursor-pointer rounded-none text-md"
            >
              <CalendarWeek
                className="h-4 w-4 hidden sm:block"
                fill="currentColor"
              />
              Woche
            </TabsTrigger>
            <TabsTrigger
              value="month"
              className="gap-2 cursor-pointer rounded-none text-md"
            >
              <CalendarMonth
                className="h-4 w-4 hidden sm:block"
                fill="currentColor"
              />
              Monat
            </TabsTrigger>
            <TabsTrigger
              value="team"
              className="gap-2 cursor-pointer rounded-none text-md"
            >
              <Users className="h-4 w-4 hidden sm:block" fill="currentColor" />
              Team
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-8">
            {rankings.today.length > 0 && (
              <Card className="shadow-[0_0_40px_-10px_rgba(163,113,247,0.3)] border-chart-5/50">
                <CardHeader>
                  <CardTitle className="text-center">Top 3 des Tages</CardTitle>
                </CardHeader>
                <CardContent>
                  <TopThreePodium
                    first={rankings.today[0]}
                    second={rankings.today[1]}
                    third={rankings.today[2]}
                  />
                </CardContent>
              </Card>
            )}
            <RankingTable entries={currentRanking} showTime showTeam />
          </TabsContent>

          <TabsContent value="week" className="space-y-8">
            {rankings.week.length > 0 && (
              <Card className="shadow-[0_0_40px_-10px_rgba(163,113,247,0.3)] border-chart-5/50">
                <CardHeader>
                  <CardTitle className="text-center">Top 3 der Woche</CardTitle>
                </CardHeader>
                <CardContent>
                  <TopThreePodium
                    first={rankings.week[0]}
                    second={rankings.week[1]}
                    third={rankings.week[2]}
                  />
                </CardContent>
              </Card>
            )}
            <RankingTable entries={currentRanking} showTeam />
          </TabsContent>

          <TabsContent value="month" className="space-y-8">
            {rankings.month.length > 0 && (
              <Card className="shadow-[0_0_40px_-10px_rgba(163,113,247,0.3)] border-chart-5/50">
                <CardHeader>
                  <CardTitle className="text-center">Top 3 des Monats</CardTitle>
                </CardHeader>
                <CardContent>
                  <TopThreePodium
                    first={rankings.month[0]}
                    second={rankings.month[1]}
                    third={rankings.month[2]}
                  />
                </CardContent>
              </Card>
            )}
            <RankingTable entries={currentRanking} showTeam />
          </TabsContent>

          <TabsContent value="team" className="space-y-8">
            {rankings.team.length > 0 && (
              <Card className="shadow-[0_0_40px_-10px_rgba(163,113,247,0.3)] border-chart-5/50">
                <CardHeader>
                  <CardTitle className="text-center">Top 3 Teams</CardTitle>
                </CardHeader>
                <CardContent>
                  <TopThreePodium
                    first={rankings.team[0]}
                    second={rankings.team[1]}
                    third={rankings.team[2]}
                  />
                </CardContent>
              </Card>
            )}
            <RankingTable entries={currentRanking} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
