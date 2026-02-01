import { Header } from "@/components/header";
import { TodaysChallengeCard } from "@/components/todays-challenge-card";
import { RankingPreviewCard } from "@/components/ranking-preview-card";
import { StatsCard } from "@/components/stats-card";
import { Zap, Bullseye, Trophy, Users } from "@nsmr/pixelart-react";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { EncryptedText } from "@/components/ui/encrypted-text";
import { CommunityFeed } from "@/components/community-feed";

const todayRanking = [
  {
    rank: 1,
    name: "Anna Schmidt",
    initials: "AS",
    points: 150,
    time: "4:23",
    avatar: "/user/chibi1.png",
    level: 15,
  },
  {
    rank: 2,
    name: "Tom Weber",
    initials: "TW",
    points: 145,
    time: "5:12",
    avatar: "/user/chibi2.png",
    level: 14,
  },
  {
    rank: 3,
    name: "Lisa Müller",
    initials: "LM",
    points: 140,
    time: "5:45",
    avatar: "/user/chibi3.png",
    level: 13,
  },
  {
    rank: 4,
    name: "Jan Becker",
    initials: "JB",
    points: 130,
    time: "6:02",
    avatar: "/user/minipix2.png",
    level: 12,
  },
  {
    rank: 5,
    name: "Sarah Klein",
    initials: "SK",
    points: 125,
    time: "6:30",
    avatar: "/user/minipix4.png",
    level: 11,
  },
];

const teamRanking = [
  {
    rank: 1,
    name: "Team Frontend",
    initials: "TF",
    points: 2450,
    avatar: "/user/pony2.png",
    level: 25,
  },
  {
    rank: 2,
    name: "Team Backend",
    initials: "TB",
    points: 2280,
    avatar: "/user/minipix2.png",
    level: 23,
  },
  {
    rank: 3,
    name: "Team DevOps",
    initials: "TD",
    points: 2150,
    avatar: "/user/pony3.png",
    level: 21,
  },
  {
    rank: 4,
    name: "Team Mobile",
    initials: "TM",
    points: 1980,
    avatar: "/user/minipix4.png",
    level: 20,
  },
  {
    rank: 5,
    name: "Team QA",
    initials: "TQ",
    points: 1850,
    avatar: "/user/minipix5.png",
    level: 18,
  },
];

export default function DashboardPage() {
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
        <div className="mb-8">
          <h1 className="font-pixel text-xl mb-2">
            WILLKOMMEN ZURÜCK, LEONID!
          </h1>
          <EncryptedText
            text="Bereit für die heutige Challenge?"
            revealDelayMs={30}
            className="text-xl text-muted-foreground uppercase tracking-wide"
          />
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="DEIN RANG"
            value="#12"
            description="von 156 Entwicklern"
            icon={Trophy}
            trend={{ value: 3, label: "seit letzter Woche" }}
          />
          <StatsCard
            title="PUNKTE"
            value="2.450"
            icon={Bullseye}
            trend={{ value: 8, label: "diesen Monat" }}
          />
          <StatsCard
            title="STREAK"
            value="12"
            description="Rekord: 28 Tage"
            icon={Zap}
          />
          <StatsCard
            title="TEAM RANG"
            value="#2"
            description="Team Frontend"
            icon={Users}
          />
        </div>

        <div className="mb-8" style={{ "--primary": "var(--chart-5)" } as any}>
          <TodaysChallengeCard
            title="ARRAY MANIPULATION"
            description="Implementiere eine Funktion, die ein Array von Zahlen nimmt und das Array so transformiert, dass jedes Element die Summe aller vorherigen Elemente enthaelt."
            difficulty="easy"
            points={150}
            category="ALGORITHMEN"
            className="shadow-[0_0_40px_-10px_rgba(163,113,247,0.3)] border-primary/50"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-12">
          <RankingPreviewCard
            title="TAGES-RANKING"
            users={todayRanking}
            href="/ranking"
            showTime
          />
          <RankingPreviewCard
            title="TEAM-RANKING"
            users={teamRanking}
            href="/ranking?tab=team"
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
