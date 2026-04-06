export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
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
import { getUserProfileData } from "@/lib/server/profile-data";
import { levelTitleDe } from "@/lib/level";
import type { Achievement } from "@/lib/api";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Check,
  CalendarWeek,
  Clock,
  Trophy,
  Zap,
  Bullseye,
};

function resolveIcon(iconKey: string): React.ComponentType<{ className?: string }> {
  return iconMap[iconKey] ?? Trophy;
}

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const profile = await getUserProfileData(session.user.id);
  if (!profile) {
    redirect("/api/auth/signout?callbackUrl=/login");
  }

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
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-4 border-zinc-700 rounded-none">
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback className="text-2xl rounded-none">
                {profile.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-sans font-bold tracking-widest uppercase">
                {profile.name}
              </h1>
              <p className="text-muted-foreground uppercase tracking-wider text-sm">
                {profile.role}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <StreakBadge count={profile.stats.streak} />
                <PointsChip points={parseInt(profile.stats.points.replace(".", ""), 10)} variant="highlight" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <StatsCard
                title="LEVEL"
                value={profile.stats.level}
                description={
                  profile.stats.rank !== "#-" ? `Heute ${profile.stats.rank}` : undefined
                }
                icon={Trophy}
              />
              <StatsCard title="GELÖST" value={String(profile.stats.totalSolved)} icon={Bullseye} />
              <StatsCard title="REKORD" value={String(profile.stats.streakRecord)} icon={Zap} />
              <StatsCard title="BADGES" value={`${profile.stats.badges}/${profile.stats.badgesTotal}`} icon={Trophy} />
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
                  label={`Level ${profile.stats.level} – ${levelTitleDe(profile.stats.level)}`}
                  value={parseInt(profile.stats.points.replace(".", ""), 10)}
                  max={profile.stats.levelMax}
                  variant="default"
                />
                <ProgressBar
                  label="Monatsziel: Challenges"
                  value={profile.stats.monthlyChallengesSolved}
                  max={profile.stats.monthlyChallengeGoal}
                  variant="success"
                />
                <ProgressBar
                  label="Streak zum Rekord"
                  value={profile.stats.streak}
                  max={profile.stats.streakRecord}
                  variant="warning"
                />
              </CardContent>
            </Card>

            <ChallengeHistory entries={profile.challengeHistory} />
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
                {profile.achievements.map((achievement: Achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    title={achievement.title}
                    description={achievement.description}
                    icon={resolveIcon(achievement.iconKey)}
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
