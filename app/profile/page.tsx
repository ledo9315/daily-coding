export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { StreakBadge } from "@/components/streak-badge";
import { PointsChip } from "@/components/points-chip";
import { StatsCard } from "@/components/stats-card";
import { AchievementsCard } from "@/components/achievements-card";
import { ProgressBar } from "@/components/progress-bar";
import { ChallengeHistory } from "@/components/challenge-history";
import { MonthlyActivityView } from "@/components/monthly-activity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileAvatarPicker } from "@/components/profile-avatar-picker";
import {
  ArrowBarUp,
  Bullseye,
  Zap,
  CalendarToday,
  Tournament,
  Trophy,
} from "@nsmr/pixelart-react";
import { PageAmbience } from "@/components/page-ambience";
import { getUserProfileData } from "@/lib/server/profile-data";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const profile = await getUserProfileData(session.user.id);
  if (!profile) {
    redirect("/api/auth/signout?callbackUrl=/login");
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <PageAmbience />

      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative">
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <ProfileAvatarPicker
              currentAvatar={profile.avatar}
              initials={profile.initials}
              name={profile.name}
            />
            <div>
              <h1 className="text-2xl font-sans font-bold tracking-tight uppercase">
                {profile.name}
              </h1>
              <p className="text-muted-foreground uppercase tracking-wide text-sm">
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
          <div className="min-w-0 space-y-6 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <StatsCard title="LEVEL" value={profile.stats.level} icon={ArrowBarUp} />
              <StatsCard title="GELÖST" value={String(profile.stats.totalSolved)} icon={Bullseye} />
              <StatsCard title="REKORD" value={String(profile.stats.streakRecord)} icon={Zap} />
              <StatsCard
                title="PLATZIERUNG"
                value={profile.stats.totalSolved > 0 ? profile.stats.rank : "–"}
                description={`von ${profile.stats.totalUsers}`}
                icon={Trophy}
              />
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
                  label={`Level ${profile.stats.level}`}
                  value={parseInt(profile.stats.points.replace(".", ""), 10)}
                  max={profile.stats.levelMax}
                  variant="default"
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
            <AchievementsCard
              achievements={profile.achievements}
              unlockedCount={profile.stats.badges}
              total={profile.stats.badgesTotal}
            />

            <Card>
              <CardHeader className="mb-2">
                <CardTitle className="flex items-center gap-2">
                  <CalendarToday className="h-5 w-5 text-primary" />
                  Aktivität
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MonthlyActivityView activity={profile.monthlyActivity} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
