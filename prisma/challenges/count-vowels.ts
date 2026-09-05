import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: "function countVowels(s) {\n  // Your solution here\n  return 0;\n}",
  typescript: "function countVowels(s: string): number {\n  // Your solution here\n  return 0;\n}",
  python: "def count_vowels(s):\n    # Your solution here\n    return 0\n",
  php: "<?php\n\nfunction countVowels($s) {\n    // Your solution here\n    return 0;\n}\n",
  java: "static int countVowels(String s) {\n    // Your solution here\n    return 0;\n}\n",
  go: "func countVowels(s string) int {\n\t// Your solution here\n\treturn 0\n}\n",
  cpp: "int countVowels(string s) {\n    // Your solution here\n    return 0;\n}\n",
  csharp: "static int CountVowels(string s) {\n    // Your solution here\n    return 0;\n}\n",
  rust: "fn count_vowels(s: String) -> i64 {\n    // Your solution here\n    0\n}\n",
  ruby: "def count_vowels(s)\n  # Your solution here\n  0\nend\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-count-vowels",
  title: "Count Vowels",
  description:
    "Implementiere countVowels(s).\n\n" +
    "Zähle die Vokale im String s. Vokale sind a, e, i, o und u, " +
    "Groß-/Kleinschreibung spielt keine Rolle.\n\n" +
    "Der Kern der Aufgabe ist nicht das Zählen, sondern die Frage „gehört dieses " +
    "Zeichen dazu\" so zu stellen, dass sie nicht bei jedem Sonderfall neu " +
    "beantwortet werden muss.",
  difficulty: "easy",
  points: 100,
  categoryId: CATEGORY.strings,
  hints: [
    {
      title: "Die Idee",
      body:
        "Statt jedes Zeichen gegen zehn Varianten zu vergleichen, a, A, e, E und so " +
        "weiter, bringst du es erst in eine einheitliche Form und prüfst dann gegen " +
        "eine einzige Menge von fünf Buchstaben.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Wandle den String einmal komplett in Kleinbuchstaben um. Halte die Vokale in " +
        "einer Zeichenkette oder Menge, etwa \"aeiou\". Geh dann Zeichen für Zeichen " +
        "durch und erhöhe einen Zähler, wenn das Zeichen darin vorkommt.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Die Groß-/Kleinschreibung. \"AEIOU\" muss 5 ergeben. Wer nur gegen " +
        "Kleinbuchstaben prüft und nicht umwandelt, bekommt 0.\n\n" +
        "y ist hier kein Vokal. \"why\" ergibt 0, auch wenn man es im Englischen " +
        "anders sehen kann. Halte dich an die fünf, die in der Aufgabe stehen.\n\n" +
        "Der leere String ergibt 0, nicht null oder einen Fehler. Die Schleife läuft " +
        "dann einfach keinmal, wenn der Zähler vorher bei 0 startet.",
    },
  ],
  translations: {
    en: {
      title: "Count Vowels",
      description:
        "Implement countVowels(s).\n\n" +
        "Count the vowels in the string s. The vowels are a, e, i, o and u; upper or " +
        "lower case makes no difference.\n\n" +
        "The heart of this task is not the counting but asking the question \"does this " +
        "character belong\" in a way that does not have to be answered anew for every " +
        "special case.",
      hints: [
        {
          title: "The idea",
          body:
            "Instead of comparing every character against ten variants, a, A, e, E and " +
            "so on, you first bring it into one uniform form and then check it against " +
            "a single set of five letters.",
        },
        {
          title: "The implementation",
          body:
            "Convert the whole string to lower case once. Keep the vowels in a string or " +
            "a set, say \"aeiou\". Then go through it character by character and " +
            "increment a counter whenever the character occurs in there.",
        },
        {
          title: "Where most people go wrong",
          body:
            "Case. \"AEIOU\" has to give 5. Check only against lower-case letters " +
            "without converting and you get 0.\n\n" +
            "y is not a vowel here. \"why\" gives 0, even if English can see it " +
            "differently. Stick to the five the task names.\n\n" +
            "The empty string gives 0, not null and not an error. The loop simply runs " +
            "no times at all, as long as the counter starts at 0.",
        },
      ],
      testCaseNames: {
        "1": "Word",
        "2": "Empty",
        "3": "No vowels",
        "4": "Only vowels",
        "5": "Mixed",
      },
    },
  },
  examples: [{ input: '"hello"', output: "2" }],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "countVowels",
      typescript: "countVowels",
      python: "count_vowels",
      ruby: "count_vowels",
      php: "countVowels",
      java: "countVowels",
      go: "countVowels",
      cpp: "countVowels",
      csharp: "CountVowels",
      rust: "count_vowels",
    },
  },
  testCases: [
    { id: 1, name: "Wort", input: '"hello"', expected: "2" },
    { id: 2, name: "Leer", input: '""', expected: "0" },
    { id: 3, name: "Keine Vokale", input: '"why"', expected: "0" },
    { id: 4, name: "Nur Vokale", input: '"AEIOU"', expected: "5" },
    { id: 5, name: "Gemischt", input: '"Programming"', expected: "3" },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
};
