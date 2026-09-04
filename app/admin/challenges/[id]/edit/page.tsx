import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { AdminChallengeForm } from "@/components/admin/challenge-form";
import { challengeToFormInitial } from "@/lib/admin/map-challenge-to-form";
import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/server/require-admin-page";

export const metadata = {
  title: "Challenge bearbeiten",
};

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminEditChallengePage({ params }: PageProps) {
  const { id } = await params;
  await requireAdminPage(`/admin/challenges/${id}/edit`);

  const [ch, categories] = await Promise.all([
    prisma.challenge.findUnique({
      where: { id },
      include: {
        translations: {
          where: { locale: "en" },
          select: { title: true, description: true, hints: true, testCaseNames: true },
        },
      },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!ch) notFound();

  const initial = challengeToFormInitial(ch, ch.translations[0]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-pixel text-2xl uppercase tracking-tight text-primary mb-2">
          Challenge bearbeiten
        </h1>
        <p className="text-muted-foreground mb-8 text-sm font-mono">{id}</p>
        <AdminChallengeForm
          categories={categories}
          mode="edit"
          initial={initial}
        />
      </main>
    </div>
  );
}
