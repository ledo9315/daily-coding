import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: "function persistence(n) {\n  // Your solution here\n  return 0;\n}",
  typescript: "function persistence(n: number): number {\n  // Your solution here\n  return 0;\n}",
  python: "def persistence(n):\n    # Your solution here\n    return 0\n",
  php: "<?php\n\nfunction persistence($n) {\n    // Your solution here\n    return 0;\n}\n",
  ruby: "def persistence(n)\n  # Your solution here\n  0\nend\n",
  java: "static int persistence(int n) {\n    // Your solution here\n    return 0;\n}\n",
  go: "func persistence(n int) int {\n\t// Your solution here\n\treturn 0\n}\n",
  cpp: "int persistence(int n) {\n    // Your solution here\n    return 0;\n}\n",
  csharp: "static int Persistence(int n) {\n    // Your solution here\n    return 0;\n}\n",
  rust: "fn persistence(n: i64) -> i64 {\n    // Your solution here\n    0\n}\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-persistent-bugger",
  title: "Persistent Bugger",
  description:
    "Implementiere persistence(n).\n\n" +
    "Gib die multiplikative Persistenz von n zurück: Wie oft musst du die Ziffern von n " +
    "miteinander multiplizieren, bis nur noch eine einzelne Ziffer übrig ist? Für 39 sind " +
    "das drei Schritte: 3 · 9 = 27, 2 · 7 = 14, 1 · 4 = 4. Für 999 sind es vier: 729, " +
    "126, 12, 2. Eine Zahl, die schon einstellig ist, hat die Persistenz 0.\n\n" +
    "n ist immer eine positive ganze Zahl. Die Aufgabe ist eine Schleife um ein Ziffernprodukt. " +
    "Die Kunst liegt darin, das Ziffernprodukt sauber zu bauen und die Schleife im " +
    "richtigen Moment zu verlassen.\n\n" +
    "Wer Digital Root gelöst hat, kennt die Schleife. Neu ist hier nur, was ein Produkt " +
    "anders macht als eine Summe.",
  difficulty: "easy",
  points: 100,
  categoryId: CATEGORY.algorithmen,
  hints: [
    {
      title: "Die Idee",
      body:
        "Zwei Dinge, die getrennt einfach sind: die Ziffern einer Zahl multiplizieren, und " +
        "das so lange wiederholen, wie die Zahl mindestens zweistellig ist. Ein Zähler " +
        "merkt sich, wie oft du multipliziert hast. Er ist das Ergebnis.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Setze count = 0. Solange n >= 10 ist: Bilde das Produkt aller Ziffern von n, " +
        "weise es n zu und erhöhe count um 1. Ist die Schleife vorbei, gib count zurück. " +
        "Die Ziffern bekommst du entweder über die String-Darstellung oder arithmetisch: " +
        "n % 10 ist die letzte Ziffer, n = Math.floor(n / 10) streicht sie weg.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Das Produkt startet bei 1, nicht bei 0, sonst ist jedes Ziffernprodukt 0 und die " +
        "Schleife endet nach einem Schritt mit dem falschen Zähler.\n\n" +
        "Einstellige Zahlen sind sofort fertig: persistence(4) ist 0, nicht 1. Wer den " +
        "Zähler vor der Prüfung erhöht oder eine do-while-Schleife nimmt, zählt einen " +
        "Schritt zu viel.\n\n" +
        "Wer die Ziffern über den String holt, muss sie vor dem Multiplizieren zurück in " +
        "Zahlen wandeln. JavaScript zwingt bei \"3\" * \"9\" die Strings stillschweigend in " +
        "Zahlen und liefert 27; Python und Ruby werfen an derselben Stelle einen Fehler. Wandle " +
        "die Ziffern deshalb überall ausdrücklich um, bevor du multiplizierst. Bei einer Null " +
        "unter den Ziffern ist das Produkt 0 und die Schleife endet. Das ist richtig so, " +
        "persistence(10) ist 1.",
    },
  ],
  examples: [
    { input: "39", output: "3" },
    { input: "999", output: "4" },
  ],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "persistence",
      typescript: "persistence",
      python: "persistence",
      ruby: "persistence",
      php: "persistence",
      java: "persistence",
      go: "persistence",
      cpp: "persistence",
      csharp: "Persistence",
      rust: "persistence",
    },
  },
  testCases: [
    { id: 1, name: "Beispiel", input: "39", expected: "3" },
    { id: 2, name: "Vier Schritte", input: "999", expected: "4" },
    { id: 3, name: "Einstellig", input: "4", expected: "0" },
    { id: 4, name: "Zwei Schritte", input: "25", expected: "2" },
    { id: 5, name: "Gleiche Ziffern", input: "77", expected: "4" },
    { id: 6, name: "Mit Null", input: "10", expected: "1" },
  ],
  translations: {
    en: {
      title: "Persistent Bugger",
      description:
        "Implement persistence(n).\n\n" +
        "Return the multiplicative persistence of n: how many times do you have to multiply " +
        "the digits of n together until only a single digit is left? For 39 that takes three " +
        "steps: 3 · 9 = 27, 2 · 7 = 14, 1 · 4 = 4. For 999 it takes four: 729, 126, 12, 2. A " +
        "number that already has one digit has persistence 0.\n\n" +
        "n is always a positive integer. The task is a loop around a digit product. The craft " +
        "lies in building that product cleanly and leaving the loop at the right moment.\n\n" +
        "If you have solved Digital Root you know the loop. The only new thing here is what a " +
        "product does differently from a sum.",
      hints: [
        {
          title: "The idea",
          body:
            "Two things that are easy on their own: multiplying the digits of a number, and " +
            "repeating that as long as the number has at least two digits. A counter remembers " +
            "how often you multiplied. It is the answer.",
        },
        {
          title: "The implementation",
          body:
            "Set count = 0. As long as n >= 10: build the product of all digits of n, assign " +
            "it to n and increase count by 1. Once the loop is over, return count. You get the " +
            "digits either from the string representation or arithmetically: n % 10 is the last " +
            "digit, n = Math.floor(n / 10) drops it.",
        },
        {
          title: "Where most people go wrong",
          body:
            "The product starts at 1, not at 0, otherwise every digit product is 0 and the " +
            "loop ends after one step with the wrong counter.\n\n" +
            "Single-digit numbers are done immediately: persistence(4) is 0, not 1. Increase " +
            "the counter before the check, or reach for a do-while loop, and you count one step " +
            "too many.\n\n" +
            "If you take the digits from the string, you have to turn them back into numbers " +
            "before multiplying. JavaScript silently coerces the strings in \"3\" * \"9\" into " +
            "numbers and hands you 27; Python and Ruby raise an error at the same spot. So " +
            "convert the digits explicitly everywhere before you multiply. With a zero among " +
            "the digits the product is 0 and the loop ends. That is correct, persistence(10) " +
            "is 1.",
        },
      ],
      testCaseNames: {
        "1": "Example",
        "2": "Four steps",
        "3": "Single digit",
        "4": "Two steps",
        "5": "Same digits",
        "6": "With a zero",
      },
    },
  },
  starterCodes: starter,
  starterCode: starter.javascript,
};
