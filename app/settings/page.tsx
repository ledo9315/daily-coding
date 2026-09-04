export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Header } from "@/components/header";
import { SettingsPanel } from "@/components/settings-panel";
import { PageAmbience } from "@/components/page-ambience";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("profile");
  return { title: t("metadata.settings") };
}

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/settings");

  const t = await getTranslations("profile");

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <PageAmbience />

      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 relative">
        <div className="mb-8">
          <h1 className="text-3xl font-sans font-bold tracking-tight uppercase">
            {t("settings.title")}
          </h1>
          <p className="text-xl text-muted-foreground uppercase">
            {t("settings.subtitle")}
          </p>
        </div>

        <SettingsPanel />
      </main>
    </div>
  );
}
