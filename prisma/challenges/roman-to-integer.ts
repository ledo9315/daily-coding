import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: "function romanToInt(s) {\n  // Your solution here\n  return 0;\n}",
  typescript: "function romanToInt(s: string): number {\n  // Your solution here\n  return 0;\n}",
  python: "def roman_to_int(s):\n    # Your solution here\n    return 0\n",
  php: "<?php\n\nfunction romanToInt($s) {\n    // Your solution here\n    return 0;\n}\n",
  java: "static int romanToInt(String s) {\n    // Your solution here\n    return 0;\n}\n",
  go: "func romanToInt(s string) int {\n\t// Your solution here\n\treturn 0\n}\n",
  cpp: "int romanToInt(string s) {\n    // Your solution here\n    return 0;\n}\n",
  csharp: "static int RomanToInt(string s) {\n    // Your solution here\n    return 0;\n}\n",
  rust: "fn roman_to_int(s: String) -> i64 {\n    // Your solution here\n    0\n}\n",
  ruby: "def roman_to_int(s)\n  # Your solution here\n  0\nend\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-roman-to-integer",
  title: "Roman to Integer",
  description:
    "Implementiere romanToInt(s).\n\n" +
    "Wandle eine römische Zahl in ihren ganzzahligen Wert um. Es gilt I=1, V=5, X=10, " +
    "L=50, C=100, D=500, M=1000.\n\n" +
    "Steht ein kleinerer Wert vor einem größeren, wird er abgezogen statt addiert: IV " +
    "ist 4, IX ist 9. Diese eine Ausnahme ist die ganze Aufgabe. Man braucht keine " +
    "Liste der sechs Sonderfälle, sondern eine Regel, die sie alle erzeugt.",
  difficulty: "medium",
  points: 150,
  categoryId: CATEGORY.strings,
  hints: [
    {
      title: "Die Idee",
      body:
        "Sieh dir jedes Zeichen zusammen mit seinem Nachfolger an. Ist der Nachfolger " +
        "größer, gehört das Zeichen zu einer Subtraktion und zählt negativ. In allen " +
        "anderen Fällen zählt es positiv.\n\n" +
        "Mehr Regeln braucht es nicht: IV, IX, XL, XC, CD und CM fallen alle unter " +
        "diese eine.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Leg eine Zuordnung von Zeichen auf Wert an. Geh den String von links nach " +
        "rechts durch und vergleiche den Wert an Position i mit dem an Position i+1. " +
        "Ist er kleiner, ziehe ihn von der Summe ab, sonst addiere ihn.\n\n" +
        "Genauso gut geht es von rechts nach links: Merk dir den größten bisher " +
        "gesehenen Wert und ziehe alles ab, was kleiner ist als er.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Das letzte Zeichen hat keinen Nachfolger. Ohne Absicherung liest du über das " +
        "Ende hinaus, in JavaScript kommt undefined heraus, der Vergleich wird " +
        "false, und das Zeichen wird zufällig richtig addiert. Verlass dich nicht " +
        "darauf, behandle den letzten Schritt bewusst.\n\n" +
        "Die Sonderfälle einzeln abzufangen. Wer nach \"IV\" und \"IX\" im String " +
        "sucht und sie ersetzt, hat bei MCMXCIV drei Ersetzungen zu bedenken und " +
        "übersieht eine.\n\n" +
        "Kleiner als der Nachfolger heißt echt kleiner. Bei II ist der Nachfolger " +
        "gleich groß, und beide zählen positiv.",
    },
  ],
  examples: [
    { input: '"IX"', output: "9" },
    { input: '"MCMXCIV"', output: "1994" },
  ],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "romanToInt",
      typescript: "romanToInt",
      python: "roman_to_int",
      ruby: "roman_to_int",
      php: "romanToInt",
      java: "romanToInt",
      go: "romanToInt",
      cpp: "romanToInt",
      csharp: "RomanToInt",
      rust: "roman_to_int",
    },
  },
  testCases: [
    { id: 1, name: "Einfach", input: '"III"', expected: "3" },
    { id: 2, name: "Mit Subtraktion", input: '"IV"', expected: "4" },
    { id: 3, name: "Neun", input: '"IX"', expected: "9" },
    { id: 4, name: "Mittel", input: '"LVIII"', expected: "58" },
    { id: 5, name: "Komplex", input: '"MCMXCIV"', expected: "1994" },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
  translations: {
    en: {
      title: "Roman to Integer",
      description:
        "Implement romanToInt(s).\n\n" +
        "Convert a Roman numeral to its integer value. I=1, V=5, X=10, L=50, C=100, " +
        "D=500, M=1000.\n\n" +
        "When a smaller value stands before a larger one, it is subtracted instead of " +
        "added: IV is 4, IX is 9. That one exception is the whole task. You do not " +
        "need a list of the six special cases, you need one rule that produces them all.",
      hints: [
        {
          title: "The idea",
          body:
            "Look at every character together with the one that follows it. If the " +
            "next one is larger, this character belongs to a subtraction and counts " +
            "as negative. In every other case it counts as positive.\n\n" +
            "No further rules are needed: IV, IX, XL, XC, CD and CM all fall under " +
            "this one.",
        },
        {
          title: "The implementation",
          body:
            "Set up a mapping from character to value. Walk the string from left to " +
            "right and compare the value at position i with the one at position i+1. " +
            "If it is smaller, subtract it from the sum, otherwise add it.\n\n" +
            "Right to left works just as well: remember the largest value seen so far " +
            "and subtract everything that is smaller than it.",
        },
        {
          title: "Where most people go wrong",
          body:
            "The last character has no successor. Without a guard you read past the " +
            "end, in JavaScript you get undefined, the comparison comes out " +
            "false, and the character happens to be added correctly. Do not rely on " +
            "that, handle the last step deliberately.\n\n" +
            "Catching the special cases one by one. Search the string for \"IV\" and " +
            "\"IX\" and replace them, and MCMXCIV leaves you three replacements to " +
            "keep track of. You will miss one.\n\n" +
            "Smaller than the successor means strictly smaller. In II the successor is " +
            "the same size, and both count as positive.",
        },
      ],
      testCaseNames: {
        "1": "Simple",
        "2": "With subtraction",
        "3": "Nine",
        "4": "Medium",
        "5": "Complex",
      },
    },
  },
};
