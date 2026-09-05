import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: "function fibonacci(n) {\n  // Your solution here\n  return 0;\n}",
  typescript:
    "function fibonacci(n: number): number {\n  // Your solution here\n  return 0;\n}",
  python: "def fibonacci(n):\n    # Your solution here\n    return 0\n",
  php: "<?php\n\nfunction fibonacci($n) {\n    // Your solution here\n    return 0;\n}\n",
  java: "static int fibonacci(int n) {\n    // Your solution here\n    return 0;\n}\n",
  go: "func fibonacci(n int) int {\n\t// Your solution here\n\treturn 0\n}\n",
  cpp: "int fibonacci(int n) {\n    // Your solution here\n    return 0;\n}\n",
  csharp: "static int Fibonacci(int n) {\n    // Your solution here\n    return 0;\n}\n",
  rust: "fn fibonacci(n: i64) -> i64 {\n    // Your solution here\n    0\n}\n",
  ruby: "def fibonacci(n)\n  # Your solution here\n  0\nend\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-recursion",
  title: "Recursion Basics",
  description:
    "Implementiere fibonacci(n).\n\n" +
    "Gib die n-te Fibonacci-Zahl zurück, 0-indiziert: fibonacci(0) = 0, " +
    "fibonacci(1) = 1, jede weitere ist die Summe ihrer beiden Vorgänger.\n\n" +
    "Die Rekursion schreibt sich in drei Zeilen und ist die eigentliche Übung: Wann " +
    "hört sie auf, und was gibt sie dann zurück.",
  difficulty: "easy",
  points: 100,
  categoryId: CATEGORY.algorithmen,
  hints: [
    {
      title: "Die Idee",
      body:
        "Die Definition ist schon der Algorithmus: fibonacci(n) ist fibonacci(n-1) " +
        "plus fibonacci(n-2). Damit das nicht endlos weiterläuft, brauchst du " +
        "Haltepunkte: zwei Werte, die du direkt weißt, ohne weiter zu fragen: 0 und " +
        "1.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Prüfe zuerst die beiden Basisfälle und gib n zurück, wenn n kleiner als 2 " +
        "ist. Sonst gib die Summe der beiden rekursiven Aufrufe zurück.\n\n" +
        "Alternativ ohne Rekursion: Halte zwei Variablen mit 0 und 1 und schiebe sie " +
        "in einer Schleife n-mal weiter. Das ist der Weg, der auch bei großem n noch " +
        "in Sekundenbruchteilen antwortet.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Der Basisfall fehlt oder ist zu eng. Nur n === 0 abzufangen reicht nicht: " +
        "fibonacci(1) fragt dann nach fibonacci(-1) und läuft ins Negative, bis der " +
        "Stack voll ist.\n\n" +
        "Der Index. 0-indiziert heißt fibonacci(5) = 5 und fibonacci(10) = 55. Wer bei " +
        "1 zu zählen beginnt, liegt in jeder Antwort um eine Stelle daneben.\n\n" +
        "Die naive Rekursion berechnet dieselben Werte immer wieder und wird ab etwa " +
        "n = 40 unbrauchbar langsam. Hier reicht sie, aber merk dir die Stelle: Ein " +
        "Zwischenspeicher für bereits berechnete n macht daraus wieder eine schnelle " +
        "Funktion.",
    },
  ],
  examples: [
    { input: "5", output: "5" },
    { input: "10", output: "55" },
  ],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "fibonacci",
      typescript: "fibonacci",
      python: "fibonacci",
      ruby: "fibonacci",
      php: "fibonacci",
      java: "fibonacci",
      go: "fibonacci",
      cpp: "fibonacci",
      csharp: "Fibonacci",
      rust: "fibonacci",
    },
  },
  testCases: [
    { id: 1, name: "Basisfall 0", input: "0", expected: "0" },
    { id: 2, name: "Basisfall 1", input: "1", expected: "1" },
    { id: 3, name: "Kleiner Wert", input: "5", expected: "5" },
    { id: 4, name: "Mittlerer Wert", input: "10", expected: "55" },
    { id: 5, name: "Größerer Wert", input: "15", expected: "610" },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
  translations: {
    en: {
      title: "Recursion Basics",
      description:
        "Implement fibonacci(n).\n\n" +
        "Return the n-th Fibonacci number, 0-indexed: fibonacci(0) = 0, " +
        "fibonacci(1) = 1, and every further one is the sum of its two predecessors.\n\n" +
        "The recursion takes three lines and is the real exercise: when does it stop, " +
        "and what does it return then.",
      hints: [
        {
          title: "The idea",
          body:
            "The definition is already the algorithm: fibonacci(n) is fibonacci(n-1) plus " +
            "fibonacci(n-2). To keep that from running on forever you need stopping " +
            "points, two values you know straight away, without asking any further: 0 " +
            "and 1.",
        },
        {
          title: "The implementation",
          body:
            "Check the two base cases first and return n when n is smaller than 2. " +
            "Otherwise return the sum of the two recursive calls.\n\n" +
            "Or without recursion: keep two variables holding 0 and 1 and shift them on n " +
            "times in a loop. That is the way that still answers in a fraction of a second " +
            "for a large n.",
        },
        {
          title: "Where most people go wrong",
          body:
            "The base case is missing or too narrow. Catching only n === 0 is not enough: " +
            "fibonacci(1) then asks for fibonacci(-1) and runs off into the negatives " +
            "until the stack is full.\n\n" +
            "The index. 0-indexed means fibonacci(5) = 5 and fibonacci(10) = 55. Start " +
            "counting at 1 and every answer is one position off.\n\n" +
            "The naive recursion computes the same values over and over and gets unusably " +
            "slow from around n = 40. Here it is good enough, but remember the spot: a " +
            "cache for the n you have already computed turns it back into a fast function.",
        },
      ],
      testCaseNames: {
        "1": "Base case 0",
        "2": "Base case 1",
        "3": "Small value",
        "4": "Medium value",
        "5": "Larger value",
      },
    },
  },
};
