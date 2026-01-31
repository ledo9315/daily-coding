"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { RankingTable } from "@/components/ranking-table"
import { TopThreePodium } from "@/components/top-three-podium"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CalendarDays, CalendarRange, Users } from "lucide-react"

const todayRanking = [
  { rank: 1, previousRank: 1, name: "Anna Schmidt", initials: "AS", points: 150, time: "4:23", team: "Frontend" },
  { rank: 2, previousRank: 4, name: "Tom Weber", initials: "TW", points: 145, time: "5:12", team: "Backend" },
  { rank: 3, previousRank: 2, name: "Lisa Müller", initials: "LM", points: 140, time: "5:45", team: "Frontend" },
  { rank: 4, previousRank: 3, name: "Jan Becker", initials: "JB", points: 130, time: "6:02", team: "DevOps" },
  { rank: 5, previousRank: 7, name: "Sarah Klein", initials: "SK", points: 125, time: "6:30", team: "Mobile" },
  { rank: 6, previousRank: 5, name: "Max Mustermann", initials: "MM", points: 120, time: "7:15", team: "Frontend" },
  { rank: 7, previousRank: 8, name: "Julia Fischer", initials: "JF", points: 115, time: "7:45", team: "Backend" },
  { rank: 8, previousRank: 6, name: "Peter Hoffmann", initials: "PH", points: 110, time: "8:20", team: "QA" },
  { rank: 9, previousRank: 9, name: "Maria Wagner", initials: "MW", points: 105, time: "8:55", team: "DevOps" },
  { rank: 10, previousRank: 12, name: "David Schulz", initials: "DS", points: 100, time: "9:30", team: "Mobile" },
]

const weeklyRanking = [
  { rank: 1, previousRank: 2, name: "Tom Weber", initials: "TW", points: 890, challengesSolved: 7, team: "Backend" },
  { rank: 2, previousRank: 1, name: "Anna Schmidt", initials: "AS", points: 875, challengesSolved: 7, team: "Frontend" },
  { rank: 3, previousRank: 3, name: "Lisa Müller", initials: "LM", points: 820, challengesSolved: 6, team: "Frontend" },
  { rank: 4, previousRank: 5, name: "Max Mustermann", initials: "MM", points: 780, challengesSolved: 6, team: "Frontend" },
  { rank: 5, previousRank: 4, name: "Jan Becker", initials: "JB", points: 750, challengesSolved: 5, team: "DevOps" },
  { rank: 6, previousRank: 6, name: "Sarah Klein", initials: "SK", points: 720, challengesSolved: 5, team: "Mobile" },
  { rank: 7, previousRank: 9, name: "Julia Fischer", initials: "JF", points: 690, challengesSolved: 5, team: "Backend" },
  { rank: 8, previousRank: 7, name: "Peter Hoffmann", initials: "PH", points: 660, challengesSolved: 4, team: "QA" },
  { rank: 9, previousRank: 8, name: "Maria Wagner", initials: "MW", points: 630, challengesSolved: 4, team: "DevOps" },
  { rank: 10, previousRank: 10, name: "David Schulz", initials: "DS", points: 600, challengesSolved: 4, team: "Mobile" },
]

const monthlyRanking = [
  { rank: 1, previousRank: 1, name: "Anna Schmidt", initials: "AS", points: 3450, challengesSolved: 28, team: "Frontend" },
  { rank: 2, previousRank: 3, name: "Tom Weber", initials: "TW", points: 3280, challengesSolved: 27, team: "Backend" },
  { rank: 3, previousRank: 2, name: "Lisa Müller", initials: "LM", points: 3100, challengesSolved: 26, team: "Frontend" },
  { rank: 4, previousRank: 4, name: "Max Mustermann", initials: "MM", points: 2950, challengesSolved: 24, team: "Frontend" },
  { rank: 5, previousRank: 6, name: "Jan Becker", initials: "JB", points: 2800, challengesSolved: 23, team: "DevOps" },
  { rank: 6, previousRank: 5, name: "Sarah Klein", initials: "SK", points: 2650, challengesSolved: 22, team: "Mobile" },
  { rank: 7, previousRank: 7, name: "Julia Fischer", initials: "JF", points: 2500, challengesSolved: 21, team: "Backend" },
  { rank: 8, previousRank: 8, name: "Peter Hoffmann", initials: "PH", points: 2350, challengesSolved: 20, team: "QA" },
  { rank: 9, previousRank: 10, name: "Maria Wagner", initials: "MW", points: 2200, challengesSolved: 19, team: "DevOps" },
  { rank: 10, previousRank: 9, name: "David Schulz", initials: "DS", points: 2050, challengesSolved: 18, team: "Mobile" },
]

const teamRanking = [
  { rank: 1, previousRank: 1, name: "Team Frontend", initials: "TF", points: 9500, challengesSolved: 78 },
  { rank: 2, previousRank: 2, name: "Team Backend", initials: "TB", points: 8780, challengesSolved: 72 },
  { rank: 3, previousRank: 4, name: "Team DevOps", initials: "TD", points: 7650, challengesSolved: 65 },
  { rank: 4, previousRank: 3, name: "Team Mobile", initials: "TM", points: 7200, challengesSolved: 60 },
  { rank: 5, previousRank: 5, name: "Team QA", initials: "TQ", points: 5800, challengesSolved: 48 },
]

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState("today")

  const getCurrentRanking = () => {
    switch (activeTab) {
      case "today":
        return todayRanking
      case "week":
        return weeklyRanking
      case "month":
        return monthlyRanking
      case "team":
        return teamRanking
      default:
        return todayRanking
    }
  }

  const currentRanking = getCurrentRanking()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Ranking</h1>
          <p className="mt-1 text-muted-foreground">
            Vergleiche dich mit anderen Entwicklern und Teams
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 sm:w-auto sm:grid-cols-none">
            <TabsTrigger value="today" className="gap-2">
              <Calendar className="h-4 w-4 hidden sm:block" />
              Heute
            </TabsTrigger>
            <TabsTrigger value="week" className="gap-2">
              <CalendarDays className="h-4 w-4 hidden sm:block" />
              Woche
            </TabsTrigger>
            <TabsTrigger value="month" className="gap-2">
              <CalendarRange className="h-4 w-4 hidden sm:block" />
              Monat
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2">
              <Users className="h-4 w-4 hidden sm:block" />
              Team
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-8">
            <Card>
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
            <Card>
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
            <Card>
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
            <Card>
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
  )
}
