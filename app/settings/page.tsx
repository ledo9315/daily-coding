export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Header } from "@/components/header";
import { SettingsPanel } from "@/components/settings-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Einstellungen" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/settings");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="mb-6 pixel-box bg-card">
          <CardHeader>
            <CardTitle className="font-pixel text-xl uppercase tracking-wide">
              EINSTELLUNGEN
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Aendere dein Passwort oder lösche dein Konto.
          </CardContent>
        </Card>

        <SettingsPanel />
      </main>
    </div>
  );
}
