export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowBarUp, Bullseye, Zap } from "@nsmr/pixelart-react";
import { Header } from "@/components/header";
import { LandingFooter } from "@/components/landing/footer";
import { StatsCard } from "@/components/stats-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      <AnimatedFlickeringGrid
        className="absolute inset-x-0 top-0 z-0 h-[300px] mask-[radial-gradient(300px_circle_at_top,white,transparent)]"
        squareSize={6}
        gridGap={1}
        color="#A371F7"
        maxOpacity={0.2}
        flickerChance={0.1}
      />

      <Header />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 relative">
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
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatsCard title="LEVEL" value={profile.level} icon={ArrowBarUp} />
          <StatsCard
            title="STREAK"
            value={profile.streak}
            description={`Rekord: ${profile.streakRecord}`}
            icon={Zap}
          />
          <StatsCard title="GELÖST" value={profile.totalSolved} icon={Bullseye} />
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
