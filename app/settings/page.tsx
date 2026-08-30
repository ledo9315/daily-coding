export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Header } from "@/components/header";
import { SettingsPanel } from "@/components/settings-panel";
import { PageAmbience } from "@/components/page-ambience";

export const metadata: Metadata = { title: "Einstellungen" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/settings");

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <PageAmbience />

      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 relative">
        <div className="mb-8">
          <h1 className="text-3xl font-sans font-bold tracking-tight uppercase">
            Einstellungen
          </h1>
          <p className="text-xl text-muted-foreground uppercase tracking-wide">
            Benachrichtigungen, Passwort und Konto
          </p>
        </div>

        <SettingsPanel />
      </main>
    </div>
  );
}
