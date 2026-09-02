export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowBarUp,
  Bullseye,
  CalendarToday,
  Zap,
} from "@nsmr/pixelart-react";
import { Header } from "@/components/header";
import { StatsCard } from "@/components/stats-card";
import { PixelStar } from "@/components/points-chip";
import { AchievementsCard } from "@/components/achievements-card";
import { MonthlyActivityView } from "@/components/monthly-activity";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageAmbience } from "@/components/page-ambience";
import { avatarImageSrc } from "@/lib/avatar-src";
import { getPublicProfile } from "@/lib/server/public-profile";

type PageProps = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const profile = await getPublicProfile(handle);
  if (!profile) {
    return { title: "Profil nicht gefunden", robots: { index: false, follow: true } };
  }
  return {
    title: `${profile.name} – Öffentliches Profil`,
    description: `Level ${profile.level}, ${profile.totalSolved} gelöste Challenges und eine Streak von ${profile.streak} Tagen.`,
    /**
     * Not an SEO detail: section 4 of the Datenschutzerklärung promises that this page
     * stays out of the search engines. Changing this makes that passage false.
     */
    robots: { index: false, follow: true },
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { handle } = await params;
  const profile = await getPublicProfile(handle);
  if (!profile) notFound();

  return (
    // `flex-col` with a growing main: without it the footer stops where the content does,
    // which on a short profile leaves it sitting in the middle of the screen.
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <PageAmbience />

      <Header />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 pt-8 pb-16 sm:px-6 sm:pb-24 lg:px-8 relative">
        <div className="mb-8 flex items-center gap-4">
          <Avatar className="h-20 w-20 rounded-none border-4 border-zinc-700">
            <AvatarImage src={avatarImageSrc(profile.avatar)} alt={profile.name} />
            <AvatarFallback className="text-2xl rounded-none">
              {profile.initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-sans font-bold tracking-widest uppercase">
              {profile.name}
            </h1>
            <p className="text-muted-foreground uppercase tracking-wider text-sm">
              Level {profile.level}
            </p>
            <p className="mt-1 text-xs text-muted-foreground/80">
              Dabei seit {profile.memberSince}
              {profile.lastSolvedAt
                ? ` · Zuletzt gelöst am ${profile.lastSolvedAt}`
                : ""}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <StatsCard title="LEVEL" value={profile.level} icon={ArrowBarUp} />
          <StatsCard
            title="PUNKTE"
            value={profile.points.toLocaleString("de-DE")}
            icon={PixelStar}
          />
          <StatsCard
            title="STREAK"
            value={profile.streak}
            description={`Rekord: ${profile.streakRecord}`}
            icon={Zap}
          />
          <StatsCard title="GELÖST" value={profile.totalSolved} icon={Bullseye} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Unlocked only, so no progress bars: a stranger has no use for someone else's standing. */}
          {profile.achievements.length > 0 && (
            <AchievementsCard
              achievements={profile.achievements}
              unlockedCount={profile.achievements.length}
              total={profile.badgesTotal}
              showProgress={false}
            />
          )}

          {/* Without badges next to it the activity card would sit in half a grid. */}
          <Card className={profile.achievements.length === 0 ? "lg:col-span-2" : undefined}>
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
      </main>

    </div>
  );
}
