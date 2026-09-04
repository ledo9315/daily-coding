import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: "function digitalRoot(n) {\n  // Your solution here\n  return 0;\n}",
  typescript: "function digitalRoot(n: number): number {\n  // Your solution here\n  return 0;\n}",
  python: "def digital_root(n):\n    # Your solution here\n    return 0\n",
  php: "<?php\n\nfunction digitalRoot($n) {\n    // Your solution here\n    return 0;\n}\n",
  java: "static int digitalRoot(int n) {\n    // Your solution here\n    return 0;\n}\n",
  go: "func digitalRoot(n int) int {\n\t// Your solution here\n\treturn 0\n}\n",
  cpp: "int digitalRoot(int n) {\n    // Your solution here\n    return 0;\n}\n",
  csharp: "static int DigitalRoot(int n) {\n    // Your solution here\n    return 0;\n}\n",
  rust: "fn digital_root(n: i64) -> i64 {\n    // Your solution here\n    0\n}\n",
  ruby: "def digital_root(n)\n  # Your solution here\n  0\nend\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-digital-root",
  title: "Digital Root",
  description:
    "Implementiere digitalRoot(n).\n\n" +
    "Addiere wiederholt die Ziffern von n, bis nur noch eine einzelne Ziffer von 0 " +
    "bis 9 übrig ist, und gib sie zurück.\n\n" +
    "Aus 132189 wird 24, daraus 6. Einmal Quersumme reicht also nicht – gefragt ist " +
    "das Falten, bis nichts mehr zu falten ist.",
  difficulty: "easy",
  points: 100,
  categoryId: CATEGORY.algorithmen,
  hints: [
    {
      title: "Die Idee",
      body:
        "Zwei Vorgänge stecken ineinander: die Quersumme einer Zahl bilden, und das " +
        "so lange wiederholen, bis das Ergebnis einstellig ist.\n\n" +
        "Trenn sie gedanklich. Die Quersumme ist eine Schleife über die Ziffern, das " +
        "Falten eine Schleife über die Quersummen.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Die Ziffern bekommst du mit Rest und Ganzzahldivision: n % 10 ist die letzte " +
        "Ziffer, n / 10 abgerundet der Rest der Zahl. Wiederhole das, bis nichts mehr " +
        "übrig ist, und summiere.\n\n" +
        "Diesen Schritt legst du in eine äußere Schleife, die läuft, solange n " +
        "mindestens 10 ist. Am Ende gibst du n zurück. Wer mag, geht über den Umweg " +
        "String und zerlegt die Zahl in Zeichen – das ist langsamer, aber genauso " +
        "richtig.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Nur einmal falten. Bei 942 kommt 15 heraus, und 15 ist keine Ziffer. Die " +
        "Bedingung muss geprüft werden, bevor und nachdem summiert wurde – eine " +
        "while-Schleife tut genau das.\n\n" +
        "Die 0. Sie ist bereits einstellig, die Antwort ist 0. Eine Schleife mit " +
        "do-while oder eine Bedingung auf n > 0 kann hier danebengreifen.\n\n" +
        "Ganzzahldivision. In JavaScript ist n / 10 eine Kommazahl – ohne " +
        "Math.floor summierst du Nachkommastellen mit.",
    },
  ],
  translations: {
    en: {
      title: "Digital Root",
      description:
        "Implement digitalRoot(n).\n\n" +
        "Add up the digits of n over and over until a single digit from 0 to 9 is left, " +
        "and return it.\n\n" +
        "132189 becomes 24, and that becomes 6. So one digit sum is not enough – what " +
        "is asked for is folding until there is nothing left to fold.",
      hints: [
        {
          title: "The idea",
          body:
            "Two operations are nested here: taking the digit sum of a number, and " +
            "repeating that until the result has a single digit.\n\n" +
            "Keep them apart in your head. The digit sum is a loop over the digits, the " +
            "folding a loop over the digit sums.",
        },
        {
          title: "The implementation",
          body:
            "You get the digits with remainder and integer division: n % 10 is the last " +
            "digit, n / 10 rounded down the rest of the number. Repeat that until nothing " +
            "is left, and sum as you go.\n\n" +
            "That step goes inside an outer loop that runs as long as n is at least 10. " +
            "At the end you return n. If you prefer, take the detour through a string and " +
            "split the number into characters – slower, but just as correct.",
        },
        {
          title: "Where most people go wrong",
          body:
            "Folding only once. For 942 you get 15, and 15 is not a digit. The condition " +
            "has to be checked before and after summing – a while loop does exactly " +
            "that.\n\n" +
            "Zero. It already has a single digit, so the answer is 0. A do-while loop or " +
            "a condition on n > 0 can get this one wrong.\n\n" +
            "Integer division. In JavaScript n / 10 is a floating-point number – " +
            "without Math.floor you sum decimals along with it.",
        },
      ],
      testCaseNames: {
        "1": "Zero",
        "2": "Single digit",
        "3": "Three digits",
        "4": "Folded several times",
        "5": "Large",
      },
    },
  },
  examples: [{ input: "942", output: "6" }],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "digitalRoot",
      typescript: "digitalRoot",
      python: "digital_root",
      ruby: "digital_root",
      php: "digitalRoot",
      java: "digitalRoot",
      go: "digitalRoot",
      cpp: "digitalRoot",
      csharp: "DigitalRoot",
      rust: "digital_root",
    },
  },
  testCases: [
    { id: 1, name: "Null", input: "0", expected: "0" },
    { id: 2, name: "Einstellig", input: "5", expected: "5" },
    { id: 3, name: "Dreistellig", input: "942", expected: "6" },
    { id: 4, name: "Mehrfach falten", input: "132189", expected: "6" },
    { id: 5, name: "Groß", input: "493193", expected: "2" },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
};
