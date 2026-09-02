import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: "function countBits(n) {\n  // Your solution here\n  return 0;\n}",
  typescript: "function countBits(n: number): number {\n  // Your solution here\n  return 0;\n}",
  python: "def count_bits(n):\n    # Your solution here\n    return 0\n",
  php: "<?php\n\nfunction countBits($n) {\n    // Your solution here\n    return 0;\n}\n",
  ruby: "def count_bits(n)\n  # Your solution here\n  0\nend\n",
  java: "static int countBits(int n) {\n    // Your solution here\n    return 0;\n}\n",
  go: "func countBits(n int) int {\n\t// Your solution here\n\treturn 0\n}\n",
  cpp: "int countBits(int n) {\n    // Your solution here\n    return 0;\n}\n",
  csharp: "static int CountBits(int n) {\n    // Your solution here\n    return 0;\n}\n",
  rust: "fn count_bits(n: i64) -> i64 {\n    // Your solution here\n    0\n}\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-bit-counting",
  title: "Bit Counting",
  description:
    "Implementiere countBits(n).\n\n" +
    "Gib zurück, wie viele Einsen in der Binärdarstellung der nicht-negativen ganzen Zahl n " +
    "stehen. 1234 ist binär 10011010010 und enthält fünf Einsen, also ist die Antwort 5. Für 0 " +
    "ist die Antwort 0.\n\n" +
    "n bleibt im Bereich einer vorzeichenbehafteten 32-Bit-Zahl, der größte Wert ist also " +
    "2147483647 – und der hat 31 Einsen.\n\n" +
    "Die Aufgabe prüft, ob du eine Zahl als Bitfolge lesen kannst. Der Umweg über einen String " +
    "funktioniert, die eigentliche Idee ist aber, die Bits mit Rest und Division – oder mit " +
    "Shift und Und – einzeln abzufragen.",
  difficulty: "easy",
  points: 100,
  categoryId: CATEGORY.algorithmen,
  hints: [
    {
      title: "Die Idee",
      body:
        "Das unterste Bit einer Zahl ist n % 2 bzw. n & 1. Halbierst du n – ganzzahlig durch 2 " +
        "oder n >> 1 –, rückt das nächste Bit nach unten. So ziehst du die Binärdarstellung Bit " +
        "für Bit ab, ohne sie je als Ganzes aufzuschreiben.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Starte mit count = 0. Solange n größer als 0 ist: addiere n & 1 zu count und setze n " +
        "auf n >> 1. Am Ende steht in count die Anzahl der Einsen.\n\n" +
        "Alternativ wandelst du n in einen Binärstring um und zählst die Zeichen „1“ – in den " +
        "meisten Sprachen eine Zeile, und für diese Aufgabe völlig legitim.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Für 0 muss die Schleife sofort abbrechen und 0 liefern, nicht 1. Wer erst zählt und " +
        "dann prüft, zählt ein Bit zu viel.\n\n" +
        "In JavaScript arbeiten Bit-Operatoren mit 32-Bit-Zahlen. 2147483647 passt gerade noch " +
        "hinein; wer mit % 2 und Math.floor(n / 2) rechnet, ist von dieser Grenze unabhängig.\n\n" +
        "Gezählt werden die Einsen, nicht die Stellen: 8 ist binär 1000 und hat eine Eins, " +
        "nicht vier.",
    },
  ],
  examples: [{ input: "1234", output: "5" }],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "countBits",
      typescript: "countBits",
      python: "count_bits",
      ruby: "count_bits",
      php: "countBits",
      java: "countBits",
      go: "countBits",
      cpp: "countBits",
      csharp: "CountBits",
      rust: "count_bits",
    },
  },
  testCases: [
    { id: 1, name: "Null", input: "0", expected: "0" },
    { id: 2, name: "Zweierpotenz", input: "4", expected: "1" },
    { id: 3, name: "Nur Einsen", input: "7", expected: "3" },
    { id: 4, name: "Zwei Einsen", input: "9", expected: "2" },
    { id: 5, name: "Gerade Zahl", input: "10", expected: "2" },
    { id: 6, name: "Beispiel", input: "1234", expected: "5" },
    { id: 7, name: "Größter 32-Bit-Wert", input: "2147483647", expected: "31" },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
};
