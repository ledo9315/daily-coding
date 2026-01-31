import { Header } from "@/components/header";
import { TodaysChallengeCard } from "@/components/todays-challenge-card";
import { RankingPreviewCard } from "@/components/ranking-preview-card";
import { StatsCard } from "@/components/stats-card";
import { Zap, Bullseye, Trophy, Users } from "@nsmr/pixelart-react";

const todayRanking = [
  {
    rank: 1,
    name: "Anna Schmidt",
    initials: "AS",
    points: 150,
    time: "4:23",
    avatar: "/user/chibi1.png",
  },
  {
    rank: 2,
    name: "Tom Weber",
    initials: "TW",
    points: 145,
    time: "5:12",
    avatar: "/user/chibi2.png",
  },
  {
    rank: 3,
    name: "Lisa Müller",
    initials: "LM",
    points: 140,
    time: "5:45",
    avatar: "/user/chibi3.png",
  },
  {
    rank: 4,
    name: "Jan Becker",
    initials: "JB",
    points: 130,
    time: "6:02",
    avatar: "/user/minipix2.png",
  },
  {
    rank: 5,
    name: "Sarah Klein",
    initials: "SK",
    points: 125,
    time: "6:30",
    avatar: "/user/minipix4.png",
  },
];

const teamRanking = [
  {
    rank: 1,
    name: "Team Frontend",
    initials: "TF",
    points: 2450,
    avatar: "/user/pony2.png",
  },
  {
    rank: 2,
    name: "Team Backend",
    initials: "TB",
    points: 2280,
    avatar: "/user/minipix2.png",
  },
  {
    rank: 3,
    name: "Team DevOps",
    initials: "TD",
    points: 2150,
    avatar: "/user/pony3.png",
  },
  {
    rank: 4,
    name: "Team Mobile",
    initials: "TM",
    points: 1980,
    avatar: "/user/minipix4.png",
  },
  {
    rank: 5,
    name: "Team QA",
    initials: "TQ",
    points: 1850,
    avatar: "/user/minipix5.png",
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-pixel text-xl text-primary mb-2">
            WILLKOMMEN ZURUECK!
          </h1>
          <p className="text-xl text-muted-foreground uppercase tracking-wide">
            Bereit fuer die heutige Challenge? Zeig was du kannst!
          </p>
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

        <div className="mb-8">
          <TodaysChallengeCard
            title="ARRAY MANIPULATION"
            description="Implementiere eine Funktion, die ein Array von Zahlen nimmt und das Array so transformiert, dass jedes Element die Summe aller vorherigen Elemente enthaelt."
            difficulty="medium"
            points={150}
            category="ALGORITHMEN"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
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
      </main>
    </div>
  );
}
