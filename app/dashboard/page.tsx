export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { TodaysChallengeCard } from "@/components/todays-challenge-card";
import { RankingPreviewCard } from "@/components/ranking-preview-card";
import { StatsCard } from "@/components/stats-card";
import { Zap, Bullseye, Trophy } from "@nsmr/pixelart-react";
import { EncryptedText } from "@/components/ui/encrypted-text";
import {
  getDashboardRankingPreviewData,
  getTodayChallengeSummary,
  getUserStatsData,
} from "@/lib/server/dashboard-data";

export default async function DashboardPage() {
  const [rankingPreview, todayChallenge, userStats] = await Promise.all([
    getDashboardRankingPreviewData(),
    getTodayChallengeSummary(),
    getUserStatsData(),
  ]);
  if (!todayChallenge) notFound();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] h-150 w-150 bg-primary/15 blur-[120px] rounded-full opacity-50 mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-5%] h-125 w-125 bg-chart-5/15 blur-[100px] rounded-full opacity-50 mix-blend-screen" />
      </div>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative">
        <div className="mb-8">
          <h1 className="font-pixel text-xl mb-2">HEY LEONID!</h1>
          <EncryptedText
            text="Bereit für die heutige Challenge?"
            className="text-xl text-muted-foreground uppercase tracking-wide"
          />
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="DEIN RANG"
            value={userStats.rank}
            description="von 156 Entwicklern"
            icon={Trophy}
            trend={{ value: 3, label: "seit letzter Woche" }}
          />
          <StatsCard
            title="PUNKTE"
            value={userStats.points}
            icon={Bullseye}
            trend={{ value: 8, label: "diesen Monat" }}
          />
          <StatsCard
            title="STREAK"
            value={String(userStats.streak)}
            description={`Rekord: ${userStats.streakRecord} Tage`}
            icon={Zap}
          />
        </div>

        <div className="mb-8" style={{ "--primary": "var(--chart-5)" } as any}>
          <TodaysChallengeCard
            title={todayChallenge.title}
            description={todayChallenge.description}
            difficulty={todayChallenge.difficulty}
            points={todayChallenge.points}
            category={todayChallenge.category}
            className="shadow-[0_0_40px_-10px_rgba(163,113,247,0.3)] border-primary/50"
          />
        </div>

        <div>
          <RankingPreviewCard
            title="TAGES-RANKING"
            users={rankingPreview.today}
            href="/ranking"
            showTime
          />
        </div>
      </main>
    </div>
  );
}
