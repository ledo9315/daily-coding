import { NextResponse } from "next/server";
import type { DailyChallenge } from "@/lib/api";

const challenge: DailyChallenge = {
  id: "array-manipulation-day-47",
  title: "Array Manipulation Challenge",
  description:
    "Implementiere eine Funktion transformArray(arr), die ein Array von Zahlen nimmt und ein neues Array zurückgibt, bei dem jedes Element die kumulative Summe aller vorherigen Elemente (inklusive sich selbst) enthält.",
  difficulty: "medium",
  points: 150,
  category: "Algorithmen • Tag 47",
  hint: "Versuche die Lösung mit O(n) Zeitkomplexität und O(1) zusätzlichem Speicher zu implementieren.",
  examples: [
    { input: "[1, 2, 3, 4, 5]", output: "[1, 3, 6, 10, 15]" },
    { input: "[5, -2, 3, 1]", output: "[5, 3, 6, 7]" },
  ],
  testCases: [
    { id: 1, name: "Test Case 1: Einfaches Array", status: "pending" },
    { id: 2, name: "Test Case 2: Leeres Array", status: "pending" },
    { id: 3, name: "Test Case 3: Negative Zahlen", status: "pending" },
    { id: 4, name: "Test Case 4: Großes Array", status: "pending" },
    { id: 5, name: "Test Case 5: Edge Cases", status: "pending" },
  ],
  starterCode: `function transformArray(arr) {\n  // Your solution here\n}`,
};

export async function GET() {
  return NextResponse.json(challenge);
}
