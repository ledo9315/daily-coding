import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma/client";
import { adminCreateChallengeSchema } from "@/lib/admin/challenge-schema";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/server/admin-session";
import { startOfUtcDay } from "@/lib/server/ranking-period";

/** Liste aller Challenges (Admin). */
export async function GET() {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  const rows = await prisma.challenge.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      category: { select: { name: true } },
      _count: { select: { submissions: true } },
    },
  });

  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      title: r.title,
      difficulty: r.difficulty,
      points: r.points,
      isActive: r.isActive,
      date: r.date?.toISOString() ?? null,
      categoryName: r.category.name,
      submissionCount: r._count.submissions,
      updatedAt: r.updatedAt.toISOString(),
    })),
  );
}

export async function POST(request: NextRequest) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger JSON-Body." }, { status: 400 });
  }

  const parsed = adminCreateChallengeSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    return NextResponse.json(
      { error: "Validierung fehlgeschlagen.", details: msg },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });
  if (!category) {
    return NextResponse.json({ error: "Kategorie nicht gefunden." }, { status: 400 });
  }

  let date: Date | null = null;
  if (typeof data.dateIso === "string" && data.dateIso.trim().length > 0) {
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
    const created = await prisma.challenge.create({
      data: {
        id: data.id,
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
    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        const target = (e.meta?.target as string[] | undefined)?.join(", ");
        return NextResponse.json(
          {
            error:
              target?.includes("id")
                ? "Eine Challenge mit dieser ID existiert bereits."
                : "Eindeutigkeitsfehler (z. B. Datum bereits vergeben).",
          },
          { status: 409 },
        );
      }
    }
    throw e;
  }
}
