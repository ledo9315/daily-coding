import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: "function rob(nums) {\n  // Your solution here\n  return 0;\n}",
  typescript: "function rob(nums: number[]): number {\n  // Your solution here\n  return 0;\n}",
  python: "def rob(nums):\n    # Your solution here\n    return 0\n",
  php: "<?php\n\nfunction rob($nums) {\n    // Your solution here\n    return 0;\n}\n",
  ruby: "def rob(nums)\n  # Your solution here\n  0\nend\n",
  java: "static int rob(int[] nums) {\n    // Your solution here\n    return 0;\n}\n",
  go: "func rob(nums []int) int {\n\t// Your solution here\n\treturn 0\n}\n",
  cpp: "int rob(vector<int> nums) {\n    // Your solution here\n    return 0;\n}\n",
  csharp: "static int Rob(int[] nums) {\n    // Your solution here\n    return 0;\n}\n",
  rust: "fn rob(nums: Vec<i64>) -> i64 {\n    // Your solution here\n    0\n}\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-house-robber",
  title: "House Robber",
  description:
    "Implementiere rob(nums).\n\n" +
    "nums[i] ist der Geldbetrag im i-ten Haus einer Straße. Du darfst beliebig viele Häuser " +
    "ausrauben, aber keine zwei benachbarten – sonst geht der Alarm los. Gib den höchsten " +
    "Betrag zurück, den du erbeuten kannst. Alle Beträge sind nicht negativ; ein leeres Array " +
    "bringt 0.\n\n" +
    "Einfach jedes zweite Haus zu nehmen scheitert schon an [2,7,9,3,1]. Die Aufgabe zielt " +
    "darauf, die Entscheidung an jedem Haus auf das zurückzuführen, was du über die beiden " +
    "Häuser davor schon weißt.",
  difficulty: "medium",
  points: 150,
  categoryId: CATEGORY.algorithmen,
  hints: [
    {
      title: "Die Idee",
      body:
        "An jedem Haus gibt es genau zwei Möglichkeiten. Du nimmst es: Dann steht dir das Beste " +
        "bis zwei Häuser davor plus sein Betrag zu. Oder du lässt es aus: Dann bleibt das Beste " +
        "bis zum Haus davor. Das Maximum der beiden ist das Beste bis hierher – und mehr als " +
        "diese zwei Zwischenstände musst du nie kennen.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Zwei Variablen, prev2 und prev1, beide 0: das Beste bis vor zwei Häusern und das Beste " +
        "bis zum letzten Haus. Für jedes nums[i] rechnest du current = max(prev1, prev2 + " +
        "nums[i]) und rückst dann auf: prev2 = prev1, prev1 = current. Nach dem letzten Haus " +
        "steht die Antwort in prev1 – bei einem leeren Array ist das 0, ganz ohne Sonderfall.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Die Gier nach jedem zweiten Haus: Bei [2,7,9,3,1] bringen 2 + 9 + 1 = 12 mehr als " +
        "7 + 3 = 10, bei [2,1,1,2] die beiden äußeren 4 statt 3. Zwischen zwei genommenen " +
        "Häusern dürfen auch zwei oder mehr liegen.\n\n" +
        "Die Reihenfolge beim Aufrücken: Wer prev1 überschreibt, bevor er es in prev2 gesichert " +
        "hat, rechnet im nächsten Schritt mit dem falschen Wert.\n\n" +
        "Ein Array mit einem Haus liefert dessen Betrag, ein leeres 0 – beides sollte deine " +
        "Schleife überstehen, ohne je auf nums[1] zuzugreifen.",
    },
  ],
  examples: [{ input: "[1,2,3,1]", output: "4" }],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "rob",
      typescript: "rob",
      python: "rob",
      ruby: "rob",
      php: "rob",
      java: "rob",
      go: "rob",
      cpp: "rob",
      csharp: "Rob",
      rust: "rob",
    },
  },
  testCases: [
    { id: 1, name: "Beispiel", input: "[1,2,3,1]", expected: "4" },
    { id: 2, name: "Nicht jedes zweite", input: "[2,7,9,3,1]", expected: "12" },
    { id: 3, name: "Außen statt Mitte", input: "[2,1,1,2]", expected: "4" },
    { id: 4, name: "Ein Haus", input: "[5]", expected: "5" },
    { id: 5, name: "Leer", input: "[]", expected: "0" },
    { id: 6, name: "Alle gleich", input: "[3,3,3,3,3]", expected: "9" },
    { id: 7, name: "Zwei Häuser", input: "[2,9]", expected: "9" },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
};
