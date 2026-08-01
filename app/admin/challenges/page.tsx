import Link from "next/link";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { ChallengeRowActions } from "@/components/admin/challenge-row-actions";
import { ChallengeOrderControls } from "@/components/admin/challenge-order-controls";
import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/server/require-admin-page";
import { buildAdminOrder } from "@/lib/server/challenge-admin-sort";
import { ringLabel } from "@/lib/server/challenge-ring";

export const metadata = {
  title: "Challenges verwalten",
};

export default async function AdminChallengesPage() {
  await requireAdminPage("/admin/challenges");

  const [rows, state] = await Promise.all([
    prisma.challenge.findMany({
      include: {
        category: { select: { name: true } },
        _count: { select: { submissions: true } },
      },
    }),
    prisma.rotationState.findUnique({ where: { id: "current" } }),
  ]);

  const { active, inactive } = buildAdminOrder(rows, state?.challengeId ?? null);

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
              Die Reihenfolge ist der Ablauf: oben läuft heute, darunter folgt Tag
              für Tag der Rest. Nach der letzten geht es wieder oben los.
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
                <th className="p-3 font-sans uppercase tracking-wide w-[130px]">Wann</th>
                <th className="p-3 font-sans uppercase tracking-wide">Titel</th>
                <th className="p-3 font-sans uppercase tracking-wide">Diff</th>
                <th className="p-3 font-sans uppercase tracking-wide">Pkt</th>
                <th className="p-3 font-sans uppercase tracking-wide">Abgaben</th>
                <th className="p-3 font-sans uppercase tracking-wide w-[120px]">
                  Reihenfolge
                </th>
                <th className="p-3 font-sans uppercase tracking-wide w-[200px]">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody>
              {active.length === 0 && inactive.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    Noch keine Challenges.
                  </td>
                </tr>
              ) : null}

              {active.map((c, i) => (
                <tr
                  key={c.id}
                  className={`border-b border-border hover:bg-muted/20 ${
                    i === 0 ? "bg-primary/5" : ""
                  }`}
                >
                  <td className="p-3 align-top whitespace-nowrap">
                    <span
                      className={
                        i === 0
                          ? "inline-block rounded-none border border-primary/60 bg-primary/10 px-1.5 py-0.5 text-[11px] font-sans uppercase tracking-wide text-primary"
                          : "text-muted-foreground"
                      }
                    >
                      {ringLabel(i)}
                    </span>
                  </td>
                  <td className="p-3 align-top">
                    <div>{c.title}</div>
                    <div className="text-xs text-muted-foreground">{c.category.name}</div>
                  </td>
                  <td className="p-3 align-top uppercase">{c.difficulty}</td>
                  <td className="p-3 align-top">{c.points}</td>
                  <td className="p-3 align-top">{c._count.submissions}</td>
                  <td className="p-3 align-top">
                    <ChallengeOrderControls
                      challengeId={c.id}
                      /*
                        Neighbours in the displayed list, not in stored order: at the wrap point
                        the two differ, and what the admin means is always what they see.

                        Row 0 is live and cannot take part. The pointer remembers the challenge,
                        not the slot, so moving the live row wrote to the database and changed
                        nothing on screen — it stayed on top because the list rotates around it.
                        Row 1 may not swap upwards for the same reason: it would not become
                        today's, it would land at the far end of the list.
                      */
                      swapUpWith={i <= 1 ? null : active[i - 1].id}
                      swapDownWith={
                        i === 0 || i === active.length - 1 ? null : active[i + 1].id
                      }
                      isLive={i === 0}
                      isNextUp={i === 1}
                    />
                  </td>
                  <td className="p-3 align-top">
                    <ChallengeRowActions
                      challengeId={c.id}
                      submissionCount={c._count.submissions}
                    />
                  </td>
                </tr>
              ))}

              {inactive.length > 0 ? (
                <tr className="border-b border-border bg-muted/30">
                  <td colSpan={7} className="px-3 py-2 text-xs uppercase tracking-wide text-muted-foreground">
                    Nicht im Ablauf ({inactive.length})
                  </td>
                </tr>
              ) : null}

              {inactive.map((c) => (
                <tr key={c.id} className="border-b border-border opacity-50 hover:opacity-100">
                  <td className="p-3 align-top text-muted-foreground whitespace-nowrap">
                    Inaktiv
                  </td>
                  <td className="p-3 align-top">
                    <div>{c.title}</div>
                    <div className="text-xs text-muted-foreground">{c.category.name}</div>
                  </td>
                  <td className="p-3 align-top uppercase">{c.difficulty}</td>
                  <td className="p-3 align-top">{c.points}</td>
                  <td className="p-3 align-top">{c._count.submissions}</td>
                  <td className="p-3 align-top">
                    {/* Ordering an inactive challenge is meaningless: it is not in the ring.
                        It takes its place by position once it is switched on. */}
                    <span className="text-xs text-muted-foreground">—</span>
                  </td>
                  <td className="p-3 align-top">
                    <ChallengeRowActions
                      challengeId={c.id}
                      submissionCount={c._count.submissions}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
