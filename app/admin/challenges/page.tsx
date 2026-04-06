import Link from "next/link";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { ChallengeRowActions } from "@/components/admin/challenge-row-actions";
import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/server/require-admin-page";
import { compareChallengesBySchedule } from "@/lib/server/challenge-admin-sort";
import { startOfUtcDay } from "@/lib/server/ranking-period";

function formatDailyDateUtc(d: Date | null): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("de-DE", {
    timeZone: "UTC",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

/** Gleiche Tagesgrenze wie `findDailyChallengeForApp` (UTC). */
function isScheduledUtcToday(d: Date | null): boolean {
  if (!d) return false;
  const dayStart = startOfUtcDay(new Date());
  const dayEnd = new Date(dayStart);
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
  return d >= dayStart && d < dayEnd;
}

export const metadata = {
  title: "Challenges verwalten | Admin",
};

export default async function AdminChallengesPage() {
  await requireAdminPage("/admin/challenges");
  const rows = await prisma.challenge.findMany({
    orderBy: { id: "asc" },
    include: {
      category: { select: { name: true } },
      _count: { select: { submissions: true } },
    },
  });
  const challenges = [...rows].sort(compareChallengesBySchedule);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="font-pixel text-2xl uppercase tracking-tight text-primary">
              Challenges
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Sortierung: zuerst kommende Dailys (heute und Zukunft, UTC,
              frühestes oben), dann vergangene Termine, zuletzt ohne Datum.
              Badge „Heute“ = gleicher UTC-Kalendertag wie die Live-Daily.
            </p>
          </div>
          <Button asChild className="rounded-none pixel-btn w-fit">
            <Link href="/admin/challenges/new">Neue Aufgabe</Link>
          </Button>
        </div>

        <div className="border-2 border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-border bg-muted/40 text-left">
                <th className="p-3 font-sans uppercase tracking-wide">ID</th>
                <th className="p-3 font-sans uppercase tracking-wide">Titel</th>
                <th className="p-3 font-sans uppercase tracking-wide">Kategorie</th>
                <th className="p-3 font-sans uppercase tracking-wide">Diff</th>
                <th className="p-3 font-sans uppercase tracking-wide">Pkt</th>
                <th className="p-3 font-sans uppercase tracking-wide min-w-[160px]">
                  Daily-Datum (UTC)
                </th>
                <th className="p-3 font-sans uppercase tracking-wide">Aktiv</th>
                <th className="p-3 font-sans uppercase tracking-wide">Abgaben</th>
                <th className="p-3 font-sans uppercase tracking-wide w-[200px]">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody>
              {challenges.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground">
                    Noch keine Challenges.
                  </td>
                </tr>
              ) : (
                challenges.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-border hover:bg-muted/20"
                  >
                    <td className="p-3 font-mono text-xs align-top max-w-[140px] break-all">
                      {c.id}
                    </td>
                    <td className="p-3 align-top">{c.title}</td>
                    <td className="p-3 align-top">{c.category.name}</td>
                    <td className="p-3 align-top uppercase">{c.difficulty}</td>
                    <td className="p-3 align-top">{c.points}</td>
                    <td className="p-3 align-top whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-xs">
                          {formatDailyDateUtc(c.date)}
                        </span>
                        {isScheduledUtcToday(c.date) && (
                          <span className="inline-block w-fit rounded-none border border-primary/60 bg-primary/10 px-1.5 py-0.5 text-[10px] font-sans uppercase tracking-wide text-primary">
                            Heute (UTC)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 align-top">{c.isActive ? "Ja" : "Nein"}</td>
                    <td className="p-3 align-top">{c._count.submissions}</td>
                    <td className="p-3 align-top">
                      <ChallengeRowActions
                        challengeId={c.id}
                        submissionCount={c._count.submissions}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
