import { NextResponse } from "next/server";
import type { TodayChallenge } from "@/lib/api";

const challenge: TodayChallenge = {
  title: "ARRAY MANIPULATION",
  description:
    "Implementiere eine Funktion, die ein Array von Zahlen nimmt und das Array so transformiert, dass jedes Element die Summe aller vorherigen Elemente enthaelt.",
  difficulty: "easy",
  points: 150,
  category: "ALGORITHMEN",
};

export async function GET() {
  return NextResponse.json(challenge);
}
