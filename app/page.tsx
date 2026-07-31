export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { LandingPage } from "@/components/landing/landing-page";
import { Header } from "@/components/header";
import { TodaysChallengeCard } from "@/components/todays-challenge-card";
import { RankingPreviewCard } from "@/components/ranking-preview-card";
import { StatsCard } from "@/components/stats-card";
import type { CSSProperties } from "react";
import { Zap, Bullseye, Trophy } from "@nsmr/pixelart-react";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { EncryptedText } from "@/components/ui/encrypted-text";
import { CommunityFeed } from "@/components/community-feed";
import {
  getDashboardRankingPreviewData,
  getTodayChallengeSummary,
  getUserStatsData,
} from "@/lib/server/dashboard-data";

export default async function DashboardPage() {
  const session = await auth();
  /**
   * Rendered, not redirected to. A visitor without a session is the one this page has to
   * convince, and `/` is the URL they arrive on — a redirect handed crawlers a login form
   * on the canonical URL of the site (#130).
   */
  if (!session?.user?.id) return <LandingPage />;
  const userId = session.user.id;
  const userEmail = session.user.email ?? null;

  const [rankingPreview, todayChallenge, userStats] = await Promise.all([
    getDashboardRankingPreviewData(),
    getTodayChallengeSummary(userId),
    getUserStatsData(userId, userEmail),
  ]);
  if (!userStats) {
    redirect("/api/auth/signout?callbackUrl=/login");
  }
  if (!todayChallenge) notFound();

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
          <h1 className="font-pixel text-xl mb-2">
            WILLKOMMEN ZURÜCK!
          </h1>
          <EncryptedText
            text="Bereit für die heutige Challenge?"
            revealDelayMs={30}
            className="text-xl text-muted-foreground uppercase tracking-wide"
          />
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="DEIN RANG"
            value={userStats.rank}
            description={`von ${userStats.totalUsers.toLocaleString("de-DE")} Nutzern`}
            icon={Trophy}
            trend={{
              value: userStats.rankTrendPlaces,
              label: "Plätze seit letzter Woche",
              unit: "number",
            }}
          />
          <StatsCard
            title="PUNKTE"
            value={userStats.points}
            icon={Bullseye}
            trend={{ value: userStats.pointsTrendPercent, label: "diesen Monat" }}
          />
          <StatsCard
            title="STREAK"
            value={String(userStats.streak)}
            description={`Rekord: ${userStats.streakRecord} Tage`}
            icon={Zap}
          />
        </div>

        <div
          className="mb-8"
          style={
            { "--primary": "var(--chart-5)" } as CSSProperties & {
              "--primary": string;
            }
          }
        >
          <TodaysChallengeCard
            title={todayChallenge.title}
            description={todayChallenge.description}
            difficulty={todayChallenge.difficulty}
            points={todayChallenge.points}
            category={todayChallenge.category}
            todayStatus={todayChallenge.todayStatus}
            className="shadow-[0_0_40px_-10px_rgba(163,113,247,0.3)] border-primary/50"
          />
        </div>

        <div className="mb-12">
          <RankingPreviewCard
            title="WOCHEN-RANKING"
            users={rankingPreview.week}
            href="/ranking"
          />
        </div>

        <div className="mb-6">
          <h2 className="font-pixel text-lg mb-4">COMMUNITY-FEED</h2>
        </div>
        <CommunityFeed />
      </main>
    </div>
  );
}
