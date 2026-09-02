import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: "function maxProfit(prices) {\n  // Your solution here\n  return 0;\n}",
  typescript: "function maxProfit(prices: number[]): number {\n  // Your solution here\n  return 0;\n}",
  python: "def max_profit(prices):\n    # Your solution here\n    return 0\n",
  php: "<?php\n\nfunction maxProfit($prices) {\n    // Your solution here\n    return 0;\n}\n",
  ruby: "def max_profit(prices)\n  # Your solution here\n  0\nend\n",
  java: "static int maxProfit(int[] prices) {\n    // Your solution here\n    return 0;\n}\n",
  go: "func maxProfit(prices []int) int {\n\t// Your solution here\n\treturn 0\n}\n",
  cpp: "int maxProfit(vector<int> prices) {\n    // Your solution here\n    return 0;\n}\n",
  csharp: "static int MaxProfit(int[] prices) {\n    // Your solution here\n    return 0;\n}\n",
  rust: "fn max_profit(prices: Vec<i64>) -> i64 {\n    // Your solution here\n    0\n}\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-best-time-to-buy-and-sell-stock",
  title: "Best Time to Buy and Sell Stock",
  description:
    "Implementiere maxProfit(prices).\n\n" +
    "prices[i] ist der Kurs einer Aktie am Tag i. Du kaufst an einem Tag und verkaufst an " +
    "einem späteren Tag – genau einmal. Gib den größten Gewinn zurück, der so möglich ist. " +
    "Lässt sich kein Gewinn erzielen, gib 0 zurück; das gilt auch für ein leeres Array und " +
    "für einen einzelnen Tag.\n\n" +
    "Jedes Paar aus Kauf- und Verkaufstag durchzuprobieren kostet O(n²). Die Aufgabe " +
    "zielt auf den einen Durchlauf: Für jeden Tag zählt nur, wie tief der Kurs vor ihm " +
    "schon einmal stand.",
  difficulty: "easy",
  points: 120,
  categoryId: CATEGORY.algorithmen,
  hints: [
    {
      title: "Die Idee",
      body:
        "Wenn du an Tag i verkaufst, hättest du am besten am billigsten Tag davor gekauft. " +
        "Der beste Gewinn für Tag i ist also prices[i] minus das Minimum aller früheren " +
        "Kurse. Läufst du von links nach rechts und führst dieses Minimum mit, kennst du " +
        "es an jedem Tag, ohne zurückzuschauen.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Zwei Variablen: der niedrigste bisher gesehene Kurs (starte mit einem sehr großen " +
        "Wert) und der beste Gewinn (starte mit 0). Für jeden Kurs: Ist er niedriger als " +
        "das Minimum, wird er das neue Minimum. Sonst rechne Kurs minus Minimum und behalte " +
        "die Differenz, wenn sie größer ist als der bisher beste Gewinn. Am Ende gibst du " +
        "den besten Gewinn zurück.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Größter minus kleinster Kurs im ganzen Array ist falsch: Bei [3,8,1,5] wäre das " +
        "7, aber der Kurs 1 kommt nach der 8. Verkaufen geht nur nach dem Kaufen – deshalb " +
        "darf ins Minimum nur einfließen, was vor dem aktuellen Tag lag.\n\n" +
        "Der beste Gewinn startet bei 0, nicht bei der ersten Differenz. Sonst gibst du " +
        "bei fallenden Kursen einen negativen Wert zurück.\n\n" +
        "Wer das Minimum mit prices[0] initialisiert, greift bei einem leeren Array ins " +
        "Leere. Entweder vorher abfangen oder mit Unendlich bzw. dem größten Integer " +
        "starten.",
    },
  ],
  examples: [
    { input: "[7,1,5,3,6,4]", output: "5" },
    { input: "[7,6,4,3,1]", output: "0" },
  ],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "maxProfit",
      typescript: "maxProfit",
      python: "max_profit",
      ruby: "max_profit",
      php: "maxProfit",
      java: "maxProfit",
      go: "maxProfit",
      cpp: "maxProfit",
      csharp: "MaxProfit",
      rust: "max_profit",
    },
  },
  testCases: [
    { id: 1, name: "Beispiel", input: "[7,1,5,3,6,4]", expected: "5" },
    { id: 2, name: "Fallend", input: "[7,6,4,3,1]", expected: "0" },
    { id: 3, name: "Ein Tag", input: "[5]", expected: "0" },
    { id: 4, name: "Leer", input: "[]", expected: "0" },
    { id: 5, name: "Bestes Paar spät", input: "[2,4,1,7]", expected: "6" },
    { id: 6, name: "Reihenfolge zählt", input: "[3,8,1,5]", expected: "5" },
    { id: 7, name: "Konstant", input: "[3,3,3]", expected: "0" },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
};
