import { Header } from "@/components/header"
import { StreakBadge } from "@/components/streak-badge"
import { PointsChip } from "@/components/points-chip"
import { AchievementBadge } from "@/components/achievement-badge"
import { ProgressBar } from "@/components/progress-bar"
import { ChallengeHistory } from "@/components/challenge-history"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Trophy,
  Target,
  Flame,
  Zap,
  Star,
  Award,
  Code2,
  Rocket,
  Crown,
  Shield,
  Calendar,
  TrendingUp,
} from "lucide-react"

const achievements = [
  {
    id: "1",
    title: "Erste Schritte",
    description: "Erste Challenge abgeschlossen",
    icon: Rocket,
    unlocked: true,
    rarity: "common" as const,
    unlockedAt: "15.01.2026",
  },
  {
    id: "2",
    title: "Wochenend-Krieger",
    description: "7 Tage Streak erreicht",
    icon: Flame,
    unlocked: true,
    rarity: "rare" as const,
    unlockedAt: "22.01.2026",
  },
  {
    id: "3",
    title: "Code-Meister",
    description: "10 schwere Challenges gelöst",
    icon: Crown,
    unlocked: true,
    rarity: "epic" as const,
    unlockedAt: "28.01.2026",
  },
  {
    id: "4",
    title: "Blitzschnell",
    description: "Challenge in unter 3 Minuten gelöst",
    icon: Zap,
    unlocked: true,
    rarity: "rare" as const,
    unlockedAt: "25.01.2026",
  },
  {
    id: "5",
    title: "Unaufhaltsam",
    description: "30 Tage Streak erreicht",
    icon: Shield,
    unlocked: false,
    rarity: "legendary" as const,
  },
  {
    id: "6",
    title: "Perfektionist",
    description: "20 Challenges ohne Fehler",
    icon: Star,
    unlocked: false,
    rarity: "epic" as const,
  },
]

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
]

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage src="/placeholder-avatar.jpg" alt="Max Mustermann" />
              <AvatarFallback className="text-2xl">MM</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Max Mustermann</h1>
              <p className="text-muted-foreground">Team Frontend • Senior Developer</p>
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
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Trophy className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rang</p>
                      <p className="text-xl font-bold">#12</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                      <Target className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Gelöst</p>
                      <p className="text-xl font-bold">47</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                      <Flame className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rekord</p>
                      <p className="text-xl font-bold">28 Tage</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                      <Award className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Badges</p>
                      <p className="text-xl font-bold">4/6</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
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
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
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
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Aktivität
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 28 }).map((_, i) => {
                    const intensity = Math.random()
                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded-sm ${
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
                    )
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
  )
}
