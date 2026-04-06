import { Header } from "@/components/header";
import { CreateChallengeForm } from "@/components/admin/create-challenge-form";
import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/server/require-admin-page";

export const metadata = {
  title: "Neue Aufgabe | Admin",
};

export default async function AdminNewChallengePage() {
  await requireAdminPage("/admin/challenges/new");
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-pixel text-2xl uppercase tracking-tight text-primary mb-2">
          Neue Aufgabe anlegen
        </h1>
        <p className="text-muted-foreground mb-8 text-sm">
          Pflichtfelder und JSON-Testfälle wie im Seed (
          <code className="text-xs">evaluationConfig</code>,{" "}
          <code className="text-xs">starterCodes</code>).
        </p>
        <CreateChallengeForm categories={categories} />
      </main>
    </div>
  );
}
