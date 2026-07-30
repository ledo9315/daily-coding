import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma/client";
import { adminUpdateChallengeSchema } from "@/lib/admin/challenge-schema";
import { challengeToFormInitial } from "@/lib/admin/map-challenge-to-form";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/server/admin-session";
import { startOfUtcDay } from "@/lib/server/ranking-period";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const ch = await prisma.challenge.findUnique({
    where: { id },
    include: { category: { select: { id: true, name: true } } },
  });

  if (!ch) {
    return NextResponse.json({ error: "Challenge nicht gefunden." }, { status: 404 });
  }

  return NextResponse.json({
    ...challengeToFormInitial(ch),
    categoryName: ch.category.name,
  });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger JSON-Body." }, { status: 400 });
  }

  const parsed = adminUpdateChallengeSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    return NextResponse.json(
      { error: "Validierung fehlgeschlagen.", details: msg },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const existing = await prisma.challenge.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Challenge nicht gefunden." }, { status: 404 });
  }

  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });
  if (!category) {
    return NextResponse.json({ error: "Kategorie nicht gefunden." }, { status: 400 });
  }

  let date: Date | null;
  if (
    data.dateIso == null ||
    (typeof data.dateIso === "string" && data.dateIso.trim() === "")
  ) {
    date = null;
  } else {
    const d = new Date(data.dateIso);
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json(
        { error: "Ungültiges Datum (dateIso)." },
        { status: 400 },
      );
    }
    // Auf UTC-Mitternacht normalisieren: die Uhrzeit hat keine Wirkung (die
    // Tagesaufgabe gilt für den ganzen UTC-Tag), und ein Zeitstempel mitten am
    // Tag würde den `@unique`-Constraint entwerten — dann wären zwei Aufgaben
    // am selben Tag möglich und eine davon unsichtbar (#71).
    date = startOfUtcDay(d);
  }

  const supported =
    data.supportedLanguages?.length ? data.supportedLanguages : (
      ["javascript", "typescript", "python", "php"] as const
    );

  try {
    await prisma.challenge.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        hint: data.hint ?? null,
        difficulty: data.difficulty,
        points: data.points,
        categoryId: data.categoryId,
        examples: data.examples as unknown as Prisma.InputJsonValue,
        testCases: data.testCases as unknown as Prisma.InputJsonValue,
        evaluationConfig:
          data.evaluationConfig as unknown as Prisma.InputJsonValue,
        starterCodes: data.starterCodes as unknown as Prisma.InputJsonValue,
        starterCode: data.starterCodes.javascript,
        supportedLanguages: [...supported],
        isActive: data.isActive ?? false,
        date,
      },
    });
    return NextResponse.json({ id }, { status: 200 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return NextResponse.json(
          {
            error:
              "Eindeutigkeitsfehler (z. B. Daily-Datum bereits von anderer Challenge belegt).",
          },
          { status: 409 },
        );
      }
    }
    throw e;
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  const { id } = await params;

  const ch = await prisma.challenge.findUnique({
    where: { id },
    include: { _count: { select: { submissions: true } } },
  });

  if (!ch) {
    return NextResponse.json({ error: "Challenge nicht gefunden." }, { status: 404 });
  }

  if (ch._count.submissions > 0) {
    return NextResponse.json(
      {
        error: `Löschen nicht möglich: ${ch._count.submissions} Abgabe(n). Challenge deaktivieren (isActive) oder Einträge in der DB bereinigen.`,
      },
      { status: 409 },
    );
  }

  await prisma.challenge.delete({ where: { id } });
  return NextResponse.json({ ok: true }, { status: 200 });
}
