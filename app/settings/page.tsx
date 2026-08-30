export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Header } from "@/components/header";
import { SettingsPanel } from "@/components/settings-panel";
import { AnimatedFlickeringGrid } from "@/components/ui/animated-flickering-grid";

export const metadata: Metadata = { title: "Einstellungen" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/settings");

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
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-15%] right-[-10%] h-200 w-200 bg-chart-5/30 blur-[140px] rounded-full opacity-50 mix-blend-screen" />
        <div className="absolute bottom-[-15%] left-[-10%] h-175 w-175 bg-chart-5/30 blur-[120px] rounded-full opacity-50 mix-blend-screen" />
      </div>

      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 relative">
        <div className="mb-8">
          <h1 className="text-2xl font-sans font-bold tracking-widest uppercase">
            Einstellungen
          </h1>
          <p className="text-muted-foreground uppercase tracking-wider text-sm">
            Passwort ändern oder Konto löschen
          </p>
        </div>

        <SettingsPanel />
      </main>
    </div>
  );
}
