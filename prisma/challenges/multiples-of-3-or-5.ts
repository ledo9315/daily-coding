import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: "function sumMultiples(n) {\n  // Your solution here\n  return 0;\n}",
  typescript: "function sumMultiples(n: number): number {\n  // Your solution here\n  return 0;\n}",
  python: "def sum_multiples(n):\n    # Your solution here\n    return 0\n",
  php: "<?php\n\nfunction sumMultiples($n) {\n    // Your solution here\n    return 0;\n}\n",
  ruby: "def sum_multiples(n)\n  # Your solution here\n  0\nend\n",
  java: "static int sumMultiples(int n) {\n    // Your solution here\n    return 0;\n}\n",
  go: "func sumMultiples(n int) int {\n\t// Your solution here\n\treturn 0\n}\n",
  cpp: "int sumMultiples(int n) {\n    // Your solution here\n    return 0;\n}\n",
  csharp: "static int SumMultiples(int n) {\n    // Your solution here\n    return 0;\n}\n",
  rust: "fn sum_multiples(n: i64) -> i64 {\n    // Your solution here\n    0\n}\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-multiples-of-3-or-5",
  title: "Multiples of 3 or 5",
  description:
    "Implementiere sumMultiples(n).\n\n" +
    "Gib die Summe aller natürlichen Zahlen unterhalb von n zurück, die Vielfache von 3 " +
    "oder von 5 sind. Für n = 10 sind das 3, 5, 6 und 9, also 23. Die Grenze n selbst " +
    "zählt nicht mit. Ist n kleiner oder gleich 0, gibt es nichts zu summieren: Gib 0 " +
    "zurück.\n\n" +
    "Die Aufgabe ist das erste Problem von Project Euler und hat zwei Fallen in einem " +
    "Satz: „unterhalb“ und „oder“. Wer beide sauber liest, ist mit einer Schleife fertig.",
  difficulty: "easy",
  points: 100,
  categoryId: CATEGORY.algorithmen,
  hints: [
    {
      title: "Die Idee",
      body:
        "Jede Zahl von 1 bis n - 1 wird einzeln geprüft: Ist sie durch 3 oder durch 5 " +
        "teilbar, kommt sie in die Summe, sonst nicht. Teilbarkeit fragst du mit dem " +
        "Restoperator ab: i % 3 === 0. Das ist O(n) und für jedes n in dieser Aufgabe " +
        "schnell genug.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Setze sum = 0. Laufe mit i von 1 bis ausschließlich n. Wenn i % 3 === 0 oder " +
        "i % 5 === 0 gilt, addiere i auf sum. Gib sum zurück. Für n <= 0 läuft die " +
        "Schleife kein einziges Mal, und 0 kommt von allein heraus – du brauchst keine " +
        "Sonderbehandlung, solange die Schleife bei 1 beginnt.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Die Zahl 15 ist durch 3 und durch 5 teilbar. Wer zwei getrennte Schleifen schreibt " +
        "– eine für die Vielfachen von 3, eine für die von 5 – zählt 15, 30, 45 doppelt und " +
        "bekommt für n = 20 die Summe 93 statt 78. Eine Bedingung mit „oder“ zählt jede " +
        "Zahl genau einmal.\n\n" +
        "„Unterhalb von n“ heißt ausschließlich n. Für n = 10 gehört die 10 nicht dazu, " +
        "auch wenn sie durch 5 teilbar ist. Eine Schleife bis <= n liefert 33 statt 23.\n\n" +
        "Negative n sind erlaubt und ergeben 0 – nicht eine Endlosschleife und nicht eine " +
        "negative Summe.",
    },
  ],
  examples: [
    { input: "10", output: "23" },
    { input: "20", output: "78" },
  ],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "sumMultiples",
      typescript: "sumMultiples",
      python: "sum_multiples",
      ruby: "sum_multiples",
      php: "sumMultiples",
      java: "sumMultiples",
      go: "sumMultiples",
      cpp: "sumMultiples",
      csharp: "SumMultiples",
      rust: "sum_multiples",
    },
  },
  testCases: [
    { id: 1, name: "Beispiel", input: "10", expected: "23" },
    { id: 2, name: "Mit 15", input: "20", expected: "78" },
    { id: 3, name: "Eins", input: "1", expected: "0" },
    { id: 4, name: "Null", input: "0", expected: "0" },
    { id: 5, name: "Negativ", input: "-5", expected: "0" },
    { id: 6, name: "Groß", input: "1000", expected: "233168" },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
};
