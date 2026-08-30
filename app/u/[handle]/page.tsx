export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowBarUp,
  Bookmark,
  Bullseye,
  CalendarToday,
  Zap,
} from "@nsmr/pixelart-react";
import { Header } from "@/components/header";
import { LandingFooter } from "@/components/landing/footer";
import { StatsCard } from "@/components/stats-card";
import { PixelStar } from "@/components/points-chip";
import {
  AchievementBadge,
  resolveAchievementIcon,
} from "@/components/achievement-badge";
import { MonthlyActivityView } from "@/components/monthly-activity";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedFlickeringGrid } from "@/components/ui/animated-flickering-grid";
import { avatarImageSrc } from "@/lib/avatar-src";
import { levelTitleDe } from "@/lib/level";
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
      <AnimatedFlickeringGrid
        className="absolute inset-x-0 top-0 z-0 h-[300px] mask-[radial-gradient(300px_circle_at_top,white,transparent)]"
        squareSize={6}
        gridGap={1}
        color="#A371F7"
        maxOpacity={0.2}
        flickerChance={0.1}
      />
      {/* Same ambient purple as the own profile and the challenge pages. */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-15%] right-[-10%] h-200 w-200 bg-chart-5/30 blur-[140px] rounded-full opacity-50 mix-blend-screen" />
        <div className="absolute bottom-[-15%] left-[-10%] h-175 w-175 bg-chart-5/30 blur-[120px] rounded-full opacity-50 mix-blend-screen" />
      </div>

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
              Level {profile.level} – {levelTitleDe(profile.level)}
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
          {profile.achievements.length > 0 && (
            <Card>
              <CardHeader className="mb-2">
                <CardTitle className="flex items-center gap-2">
                  <Bookmark className="h-5 w-5 text-amber-500" />
                  Abzeichen {profile.achievements.length}/{profile.badgesTotal}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.achievements.map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    title={achievement.title}
                    description={achievement.description}
                    icon={resolveAchievementIcon(achievement.iconKey)}
                    unlocked
                    rarity={achievement.rarity}
                    unlockedAt={achievement.unlockedAt}
                  />
                ))}
              </CardContent>
            </Card>
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

      <LandingFooter />
    </div>
  );
}
