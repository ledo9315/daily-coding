import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/server/admin-session";
import { compareRingEntries } from "@/lib/server/challenge-ring";

/**
 * Two moves, one endpoint.
 *
 * `swapWith` names the row to trade places with instead of saying "up" or "down". The list is
 * displayed rotated so that today is on top, so the row above something is not always its
 * neighbour in stored order - at the wrap point it is the far end of the list. Naming the
 * partner removes that ambiguity from the server entirely.
 *
 * `next` is the move an admin actually wants most of the time, "run this one tomorrow", which
 * as a sequence of arrow clicks would be a dozen requests.
 */
const moveSchema = z.union([
  z.object({ swapWith: z.string().min(1) }),
  z.object({ direction: z.literal("next") }),
]);

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger JSON-Body." }, { status: 400 });
  }

  const parsed = moveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Erwartet wird swapWith oder direction: next." },
      { status: 400 },
    );
  }

  const ordered = (
    await prisma.challenge.findMany({ select: { id: true, position: true } })
  ).sort(compareRingEntries);

  const from = ordered.findIndex((c) => c.id === id);
  if (from === -1) {
    return NextResponse.json({ error: "Challenge nicht gefunden." }, { status: 404 });
  }

  const reordered = [...ordered];

  const move = parsed.data;
  const state = await prisma.rotationState.findUnique({ where: { id: "current" } });

  if ("swapWith" in move) {
    const other = reordered.findIndex((c) => c.id === move.swapWith);
    if (other === -1) {
      return NextResponse.json({ error: "Tauschpartner nicht gefunden." }, { status: 404 });
    }
    /*
      The live challenge takes part in no swap. The pointer follows the challenge and the list is
      drawn starting from it, so trading places with it wrote to the database and changed nothing
      visible - the live one stayed on top and its partner jumped to the far end. Today is
      running; the order applies from tomorrow.
    */
    if (state?.challengeId && (id === state.challengeId || move.swapWith === state.challengeId)) {
      return NextResponse.json(
        { error: "Die heutige Challenge läuft schon, sortiert wird ab morgen." },
        { status: 409 },
      );
    }
    [reordered[from], reordered[other]] = [reordered[other], reordered[from]];
  } else {
    const live = reordered.findIndex((c) => c.id === state?.challengeId);
    if (live === -1 || live === from) {
      return NextResponse.json(
        { error: "Diese Challenge läuft bereits heute." },
        { status: 409 },
      );
    }
    const [moved] = reordered.splice(from, 1);
    // Splicing the row out first shifts everything behind it down by one.
    reordered.splice(from > live ? live + 1 : live, 0, moved);
  }

  /*
    Positions are rewritten as a dense 0..n-1 sequence rather than swapping two values. A few
    more writes, but it repairs duplicates and gaps as a side effect - and duplicates are
    possible, `position` carries no unique constraint precisely so a swap cannot collide.
  */
  await prisma.$transaction(
    reordered.map((c, index) =>
      prisma.challenge.update({ where: { id: c.id }, data: { position: index } }),
    ),
  );

  return NextResponse.json({ ok: true });
}
