export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { LandingPage } from "@/components/landing/landing-page";
import { findDailyChallengeForApp } from "@/lib/server/challenge-day";
import { Header } from "@/components/header";
import { TodaysChallengeCard } from "@/components/todays-challenge-card";
import { RankingPreviewCard } from "@/components/ranking-preview-card";
import { StatsCard } from "@/components/stats-card";
import type { CSSProperties } from "react";
import { Zap, Bullseye, Trophy } from "@nsmr/pixelart-react";
import { PageAmbience } from "@/components/page-ambience";
import { EncryptedText } from "@/components/ui/encrypted-text";
import { CommunityFeed } from "@/components/community-feed";
import {
  getDashboardRankingPreviewData,
  getTodayChallengeSummary,
  getUserStatsData,
} from "@/lib/server/dashboard-data";
import { formatNumber } from "@/lib/format";

/**
 * Title and description stay the site-wide default from the root layout: for anyone without
 * a session this route *is* the landing, and that is what a search result shows (#130).
 * Only the canonical URL was missing (#131).
 */
export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function DashboardPage() {
  const session = await auth();
  /**
   * Rendered, not redirected to. A visitor without a session is the one this page has to
   * convince, and `/` is the URL they arrive on - a redirect handed crawlers a login form
   * on the canonical URL of the site (#130).
   */
  if (!session?.user?.id) {
    // Same source as the signed-in dashboard, so the badge on the landing names the challenge
    // a visitor actually gets when they sign up.
    const daily = await findDailyChallengeForApp();
    return <LandingPage todaysChallengeTitle={daily?.title ?? null} />;
  }
  const userId = session.user.id;

  const [locale, t, rankingPreview, todayChallenge, userStats] = await Promise.all([
    getLocale(),
    getTranslations("dashboard"),
    getDashboardRankingPreviewData(),
    getTodayChallengeSummary(userId),
    getUserStatsData(userId),
  ]);
  if (!userStats) {
    redirect("/api/auth/signout?callbackUrl=/login");
  }
  if (!todayChallenge) notFound();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <PageAmbience />

      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative">
        <div className="mb-8">
          <h1 className="font-pixel text-xl mb-2">{t("home.welcome")}</h1>
          <EncryptedText
            text={t("home.prompt")}
            revealDelayMs={30}
            className="text-xl text-muted-foreground uppercase tracking-wide"
          />
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title={t("home.rank.title")}
            value={userStats.rank}
            description={t("home.rank.of", { count: userStats.totalUsers })}
            icon={Trophy}
            trend={{
              value: userStats.rankTrendPlaces,
              label: t("home.rank.trend"),
              unit: "number",
            }}
          />
          <StatsCard
            title={t("home.points.title")}
            value={formatNumber(userStats.points, locale)}
            icon={Bullseye}
            // A loss reads as a reproach on the dashboard; the number is on the profile.
            trend={
              userStats.pointsTrendPercent > 0
                ? {
                    value: userStats.pointsTrendPercent,
                    label: t("home.points.trend"),
                  }
                : undefined
            }
          />
          <StatsCard
            title={t("home.streak.title")}
            value={String(userStats.streak)}
            footer={t("home.streak.record", { count: userStats.streakRecord })}
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
            title={t("home.weekRanking")}
            users={rankingPreview.week}
            href="/ranking"
          />
        </div>

        <div className="mb-6">
          <h2 className="font-pixel text-lg mb-4">{t("home.communityFeed")}</h2>
        </div>
        <CommunityFeed />
      </main>
    </div>
  );
}
