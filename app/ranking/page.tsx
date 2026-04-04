"use client";

import { useState } from "react";
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

const todayRanking = [
  {
    rank: 1,
    previousRank: 1,
    name: "Anna Schmidt",
    initials: "AS",
    points: 150,
    time: "4:23",
    team: "Frontend",
    avatar: "/user/chibi1.png",
    level: 15,
  },
  {
    rank: 2,
    previousRank: 4,
    name: "Tom Weber",
    initials: "TW",
    points: 145,
    time: "5:12",
    team: "Backend",
    avatar: "/user/chibi2.png",
    level: 14,
  },
  {
    rank: 3,
    previousRank: 2,
    name: "Lisa Müller",
    initials: "LM",
    points: 140,
    time: "5:45",
    team: "Frontend",
    avatar: "/user/chibi3.png",
    level: 13,
  },
  {
    rank: 4,
    previousRank: 3,
    name: "Jan Becker",
    initials: "JB",
    points: 130,
    time: "6:02",
    team: "DevOps",
    avatar: "/user/minipix2.png",
    level: 12,
  },
  {
    rank: 5,
    previousRank: 7,
    name: "Sarah Klein",
    initials: "SK",
    points: 125,
    time: "6:30",
    team: "Mobile",
    avatar: "/user/minipix4.png",
    level: 11,
  },
  {
    rank: 6,
    previousRank: 5,
    name: "Max Mustermann",
    initials: "MM",
    points: 120,
    time: "7:15",
    team: "Frontend",
    avatar: "/user/minipix5.png",
    level: 12,
  },
  {
    rank: 7,
    previousRank: 8,
    name: "Julia Fischer",
    initials: "JF",
    points: 115,
    time: "7:45",
    team: "Backend",
    avatar: "/user/minipix6.png",
    level: 10,
  },
  {
    rank: 8,
    previousRank: 6,
    name: "Peter Hoffmann",
    initials: "PH",
    points: 110,
    time: "8:20",
    team: "QA",
    avatar: "/user/pony2.png",
    level: 9,
  },
  {
    rank: 9,
    previousRank: 9,
    name: "Maria Wagner",
    initials: "MW",
    points: 105,
    time: "8:55",
    team: "DevOps",
    avatar: "/user/pony3.png",
    level: 9,
  },
  {
    rank: 10,
    previousRank: 12,
    name: "David Schulz",
    initials: "DS",
    points: 100,
    time: "9:30",
    team: "Mobile",
    avatar: "/user/pony4.png",
    level: 8,
  },
];

const weeklyRanking = [
  {
    rank: 1,
    previousRank: 2,
    name: "Tom Weber",
    initials: "TW",
    points: 890,
    challengesSolved: 7,
    team: "Backend",
    avatar: "/user/chibi2.png",
    level: 14,
  },
  {
    rank: 2,
    previousRank: 1,
    name: "Anna Schmidt",
    initials: "AS",
    points: 875,
    challengesSolved: 7,
    team: "Frontend",
    avatar: "/user/chibi1.png",
    level: 15,
  },
  {
    rank: 3,
    previousRank: 3,
    name: "Lisa Müller",
    initials: "LM",
    points: 820,
    challengesSolved: 6,
    team: "Frontend",
    avatar: "/user/chibi3.png",
    level: 13,
  },
  {
    rank: 4,
    previousRank: 5,
    name: "Max Mustermann",
    initials: "MM",
    points: 780,
    challengesSolved: 6,
    team: "Frontend",
    avatar: "/user/minipix5.png",
    level: 12,
  },
  {
    rank: 5,
    previousRank: 4,
    name: "Jan Becker",
    initials: "JB",
    points: 750,
    challengesSolved: 5,
    team: "DevOps",
    avatar: "/user/minipix2.png",
    level: 12,
  },
  {
    rank: 6,
    previousRank: 6,
    name: "Sarah Klein",
    initials: "SK",
    points: 720,
    challengesSolved: 5,
    team: "Mobile",
    avatar: "/user/minipix4.png",
    level: 11,
  },
  {
    rank: 7,
    previousRank: 9,
    name: "Julia Fischer",
    initials: "JF",
    points: 690,
    challengesSolved: 5,
    team: "Backend",
    avatar: "/user/minipix6.png",
    level: 10,
  },
  {
    rank: 8,
    previousRank: 7,
    name: "Peter Hoffmann",
    initials: "PH",
    points: 660,
    challengesSolved: 4,
    team: "QA",
    avatar: "/user/pony2.png",
    level: 9,
  },
  {
    rank: 9,
    previousRank: 8,
    name: "Maria Wagner",
    initials: "MW",
    points: 630,
    challengesSolved: 4,
    team: "DevOps",
    avatar: "/user/pony3.png",
    level: 9,
  },
  {
    rank: 10,
    previousRank: 10,
    name: "David Schulz",
    initials: "DS",
    points: 600,
    challengesSolved: 4,
    team: "Mobile",
    avatar: "/user/pony4.png",
    level: 8,
  },
];

const monthlyRanking = [
  {
    rank: 1,
    previousRank: 1,
    name: "Anna Schmidt",
    initials: "AS",
    points: 3450,
    challengesSolved: 28,
    team: "Frontend",
    avatar: "/user/chibi1.png",
    level: 15,
  },
  {
    rank: 2,
    previousRank: 3,
    name: "Tom Weber",
    initials: "TW",
    points: 3280,
    challengesSolved: 27,
    team: "Backend",
    avatar: "/user/chibi2.png",
    level: 14,
  },
  {
    rank: 3,
    previousRank: 2,
    name: "Lisa Müller",
    initials: "LM",
    points: 3100,
    challengesSolved: 26,
    team: "Frontend",
    avatar: "/user/chibi3.png",
    level: 13,
  },
  {
    rank: 4,
    previousRank: 4,
    name: "Max Mustermann",
    initials: "MM",
    points: 2950,
    challengesSolved: 24,
    team: "Frontend",
    avatar: "/user/minipix5.png",
    level: 12,
  },
  {
    rank: 5,
    previousRank: 6,
    name: "Jan Becker",
    initials: "JB",
    points: 2800,
    challengesSolved: 23,
    team: "DevOps",
    avatar: "/user/minipix2.png",
    level: 12,
  },
  {
    rank: 6,
    previousRank: 5,
    name: "Sarah Klein",
    initials: "SK",
    points: 2650,
    challengesSolved: 22,
    team: "Mobile",
    avatar: "/user/minipix4.png",
    level: 11,
  },
  {
    rank: 7,
    previousRank: 7,
    name: "Julia Fischer",
    initials: "JF",
    points: 2500,
    challengesSolved: 21,
    team: "Backend",
    avatar: "/user/minipix6.png",
    level: 10,
  },
  {
    rank: 8,
    previousRank: 8,
    name: "Peter Hoffmann",
    initials: "PH",
    points: 2350,
    challengesSolved: 20,
    team: "QA",
    avatar: "/user/pony2.png",
    level: 9,
  },
  {
    rank: 9,
    previousRank: 10,
    name: "Maria Wagner",
    initials: "MW",
    points: 2200,
    challengesSolved: 19,
    team: "DevOps",
    avatar: "/user/pony3.png",
    level: 9,
  },
  {
    rank: 10,
    previousRank: 9,
    name: "David Schulz",
    initials: "DS",
    points: 2050,
    challengesSolved: 18,
    team: "Mobile",
    avatar: "/user/pony4.png",
    level: 8,
  },
];

const teamRanking = [
  {
    rank: 1,
    previousRank: 1,
    name: "Team Frontend",
    initials: "TF",
    points: 9500,
    challengesSolved: 78,
    avatar: "/user/pony2.png",
    level: 25,
  },
  {
    rank: 2,
    previousRank: 2,
    name: "Team Backend",
    initials: "TB",
    points: 8780,
    challengesSolved: 72,
    avatar: "/user/minipix2.png",
    level: 23,
  },
  {
    rank: 3,
    previousRank: 4,
    name: "Team DevOps",
    initials: "TD",
    points: 7650,
    challengesSolved: 65,
    avatar: "/user/pony3.png",
    level: 21,
  },
  {
    rank: 4,
    previousRank: 3,
    name: "Team Mobile",
    initials: "TM",
    points: 7200,
    challengesSolved: 60,
    avatar: "/user/minipix4.png",
    level: 20,
  },
  {
    rank: 5,
    previousRank: 5,
    name: "Team QA",
    initials: "TQ",
    points: 5800,
    challengesSolved: 48,
    avatar: "/user/minipix5.png",
    level: 18,
  },
];

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState("today");

  const getCurrentRanking = () => {
    switch (activeTab) {
      case "today":
        return todayRanking;
      case "week":
        return weeklyRanking;
      case "month":
        return monthlyRanking;
      case "team":
        return teamRanking;
      default:
        return todayRanking;
    }
  };

  const currentRanking = getCurrentRanking();

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
          onValueChange={setActiveTab}
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
            <Card className="shadow-[0_0_40px_-10px_rgba(163,113,247,0.3)] border-chart-5/50">
              <CardHeader>
                <CardTitle className="text-center">Top 3 des Tages</CardTitle>
              </CardHeader>
              <CardContent>
                <TopThreePodium
                  first={todayRanking[0]}
                  second={todayRanking[1]}
                  third={todayRanking[2]}
                />
              </CardContent>
            </Card>
            <RankingTable entries={currentRanking} showTime showTeam />
          </TabsContent>

          <TabsContent value="week" className="space-y-8">
            <Card className="shadow-[0_0_40px_-10px_rgba(163,113,247,0.3)] border-chart-5/50">
              <CardHeader>
                <CardTitle className="text-center">Top 3 der Woche</CardTitle>
              </CardHeader>
              <CardContent>
                <TopThreePodium
                  first={weeklyRanking[0]}
                  second={weeklyRanking[1]}
                  third={weeklyRanking[2]}
                />
              </CardContent>
            </Card>
            <RankingTable entries={currentRanking} showTeam />
          </TabsContent>

          <TabsContent value="month" className="space-y-8">
            <Card className="shadow-[0_0_40px_-10px_rgba(163,113,247,0.3)] border-chart-5/50">
              <CardHeader>
                <CardTitle className="text-center">Top 3 des Monats</CardTitle>
              </CardHeader>
              <CardContent>
                <TopThreePodium
                  first={monthlyRanking[0]}
                  second={monthlyRanking[1]}
                  third={monthlyRanking[2]}
                />
              </CardContent>
            </Card>
            <RankingTable entries={currentRanking} showTeam />
          </TabsContent>

          <TabsContent value="team" className="space-y-8">
            <Card className="shadow-[0_0_40px_-10px_rgba(163,113,247,0.3)] border-chart-5/50">
              <CardHeader>
                <CardTitle className="text-center">Top 3 Teams</CardTitle>
              </CardHeader>
              <CardContent>
                <TopThreePodium
                  first={teamRanking[0]}
                  second={teamRanking[1]}
                  third={teamRanking[2]}
                />
              </CardContent>
            </Card>
            <RankingTable entries={currentRanking} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
