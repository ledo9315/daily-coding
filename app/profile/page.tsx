import { Header } from "@/components/header";
import { StreakBadge } from "@/components/streak-badge";
import { PointsChip } from "@/components/points-chip";
import { StatsCard } from "@/components/stats-card";
import { AchievementBadge } from "@/components/achievement-badge";
import { ProgressBar } from "@/components/progress-bar";
import { ChallengeHistory } from "@/components/challenge-history";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Trophy,
  Bullseye,
  Zap,
  CalendarToday,
  Tournament,
  Check,
  CalendarWeek,
  Clock,
} from "@nsmr/pixelart-react";
import { FlickeringGrid } from "@/components/ui/flickering-grid";

const achievements = [
  {
    id: "1",
    title: "Erste Schritte",
    description: "Erste Challenge abgeschlossen",
    icon: Check,
    unlocked: true,
    rarity: "common" as const,
    unlockedAt: "15.01.2026",
  },
  {
    id: "2",
    title: "Wochenend-Krieger",
    description: "7 Tage Streak erreicht",
    icon: CalendarWeek,
    unlocked: true,
    rarity: "rare" as const,
    unlockedAt: "22.01.2026",
  },
  {
    id: "3",
    title: "Blitzschnell",
    description: "Challenge in unter 3 Minuten gelöst",
    icon: Clock,
    unlocked: true,
    rarity: "rare" as const,
    unlockedAt: "25.01.2026",
  },
  {
    id: "4",
    title: "Code-Meister",
    description: "10 schwere Challenges gelöst",
    icon: Trophy,
    unlocked: true,
    rarity: "epic" as const,
    unlockedAt: "28.01.2026",
  },
  {
    id: "5",
    title: "Unaufhaltsam",
    description: "30 Tage Streak erreicht",
    icon: Zap,
    unlocked: false,
    rarity: "legendary" as const,
  },
  {
    id: "6",
    title: "Perfektionist",
    description: "20 Challenges ohne Fehler",
    icon: Bullseye,
    unlocked: false,
    rarity: "epic" as const,
  },
];

const challengeHistory = [
  {
    id: "1",
    title: "Array Manipulation",
    date: "Heute",
    difficulty: "medium" as const,
    status: "completed" as const,
    points: 150,
    time: "5:23",
    rank: 8,
  },
  {
    id: "2",
    title: "String Parsing",
    date: "Gestern",
    difficulty: "easy" as const,
    status: "completed" as const,
    points: 100,
    time: "3:12",
    rank: 3,
  },
  {
    id: "3",
    title: "Binary Tree Traversal",
    date: "29.01.2026",
    difficulty: "hard" as const,
    status: "failed" as const,
    points: 200,
    time: "15:00",
  },
  {
    id: "4",
    title: "Hash Map Implementation",
    date: "28.01.2026",
    difficulty: "medium" as const,
    status: "completed" as const,
    points: 150,
    time: "8:45",
    rank: 12,
  },
  {
    id: "5",
    title: "Recursion Basics",
    date: "27.01.2026",
    difficulty: "easy" as const,
    status: "completed" as const,
    points: 100,
    time: "4:30",
    rank: 5,
  },
];

export default function ProfilePage() {
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
        <div className="absolute top-[-10%] right-[-5%] h-[600px] w-[600px] bg-chart-5/15 blur-[120px] rounded-full opacity-50 mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-5%] h-[500px] w-[500px] bg-chart-5/15 blur-[100px] rounded-full opacity-50 mix-blend-screen" />
      </div>

      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative">
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-4 border-zinc-700 rounded-none">
              <AvatarImage src="/user/minipix4.png" alt="Max Mustermann" />
              <AvatarFallback className="text-2xl rounded-none">
                MM
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-sans font-bold tracking-widest uppercase">
                MAX MUSTERMANN
              </h1>
              <p className="text-muted-foreground uppercase tracking-wider text-sm">
                Team Frontend • Senior Developer
              </p>
              <div className="mt-2 flex items-center gap-3">
                <StreakBadge count={12} />
                <PointsChip points={2450} variant="highlight" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatsCard title="RANG" value="#12" icon={Trophy} />
              <StatsCard title="GELÖST" value="47" icon={Bullseye} />
              <StatsCard title="REKORD" value="28" icon={Zap} />
              <StatsCard title="BADGES" value="4/6" icon={Trophy} />
            </div>

            <Card>
              <CardHeader className="mb-2">
                <CardTitle className="flex items-center gap-2">
                  <Tournament className="h-5 w-5 text-primary" />
                  Fortschritt
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <ProgressBar
                  label="Level 12 - Code Ninja"
                  value={2450}
                  max={3000}
                  variant="default"
                />
                <ProgressBar
                  label="Monatsziel: Challenges"
                  value={22}
                  max={30}
                  variant="success"
                />
                <ProgressBar
                  label="Streak zum Rekord"
                  value={12}
                  max={28}
                  variant="warning"
                />
              </CardContent>
            </Card>

            <ChallengeHistory entries={challengeHistory} />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="mb-2">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {achievements.map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    title={achievement.title}
                    description={achievement.description}
                    icon={achievement.icon}
                    unlocked={achievement.unlocked}
                    rarity={achievement.rarity}
                    unlockedAt={achievement.unlockedAt}
                  />
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="mb-2">
                <CardTitle className="flex items-center gap-2">
                  <CalendarToday className="h-5 w-5 text-primary" />
                  Aktivität
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 28 }).map((_, i) => {
                    const intensity = Math.random();
                    return (
                      <div
                        key={i}
                        className={`aspect-square ${
                          intensity > 0.7
                            ? "bg-primary"
                            : intensity > 0.4
                              ? "bg-primary/60"
                              : intensity > 0.2
                                ? "bg-primary/30"
                                : "bg-secondary"
                        }`}
                        title={`Tag ${i + 1}`}
                      />
                    );
                  })}
                </div>
                <p className="mt-3 text-center text-sm text-muted-foreground">
                  22 von 28 Tagen aktiv
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
