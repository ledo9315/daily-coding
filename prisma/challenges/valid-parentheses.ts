import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: "function isValid(s) {\n  // Your solution here\n  return false;\n}",
  typescript: "function isValid(s: string): boolean {\n  // Your solution here\n  return false;\n}",
  python: "def is_valid(s):\n    # Your solution here\n    return False\n",
  php: "<?php\n\nfunction isValid($s) {\n    // Your solution here\n    return false;\n}\n",
  java: "static boolean isValid(String s) {\n    // Your solution here\n    return false;\n}\n",
  go: "func isValid(s string) bool {\n\t// Your solution here\n\treturn false\n}\n",
  cpp: "bool isValid(string s) {\n    // Your solution here\n    return false;\n}\n",
  csharp: "static bool IsValid(string s) {\n    // Your solution here\n    return false;\n}\n",
  rust: "fn is_valid(s: String) -> bool {\n    // Your solution here\n    false\n}\n",
  ruby: "def is_valid(s)\n  # Your solution here\n  false\nend\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-valid-parentheses",
  title: "Valid Parentheses",
  description:
    "Implementiere isValid(s).\n\n" +
    "Prüfe, ob die Klammern in s korrekt verschachtelt und geschlossen sind. Erlaubte " +
    "Zeichen sind (), [] und {}. Gib true oder false zurück.\n\n" +
    "Klammern zu zählen reicht nicht: \"([)]\" hat von jeder Sorte gleich viele und ist " +
    "trotzdem falsch. Es geht um die Reihenfolge, und die verlangt eine Struktur, die " +
    "sich merkt, was zuletzt geöffnet wurde.",
  difficulty: "medium",
  points: 150,
  categoryId: CATEGORY.datenstrukturen,
  hints: [
    {
      title: "Die Idee",
      body:
        "Zuletzt geöffnet, zuerst geschlossen. Genau das ist ein Stack: Du legst " +
        "öffnende Klammern oben ab, und eine schließende Klammer darf nur die " +
        "wegnehmen, die gerade obenauf liegt.\n\n" +
        "Passt sie nicht zur obersten, war die Verschachtelung falsch, und du kannst " +
        "sofort aufhören.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Geh den String Zeichen für Zeichen durch. Bei einer öffnenden Klammer legst " +
        "du sie auf den Stack. Bei einer schließenden nimmst du das oberste Element " +
        "herunter und prüfst, ob es die passende Öffnung ist, sonst gib sofort false " +
        "zurück.\n\n" +
        "Eine Map von schließender auf öffnende Klammer erspart dir drei " +
        "Vergleichsketten.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Der Stack am Ende. Wer nur prüft, dass jede schließende Klammer gepasst hat, " +
        "hält \"(((\" für gültig. Die Antwort ist nur dann true, wenn der Stack " +
        "danach leer ist. Jede offene Klammer wurde geschlossen.\n\n" +
        "Die schließende Klammer auf leerem Stack. Bei \")\" gibt es nichts " +
        "herunterzunehmen; ohne Prüfung liest du undefined und vergleichst ins Leere. " +
        "Ein leerer Stack an dieser Stelle heißt false.\n\n" +
        "Und der eigentliche Testfall: \"([)]\" scheitert nur, wenn du die oberste " +
        "Klammer prüfst und nicht bloß irgendeine offene.",
    },
  ],
  examples: [
    { input: '"()[]{}"', output: "true" },
    { input: '"([)]"', output: "false" },
  ],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "isValid",
      typescript: "isValid",
      python: "is_valid",
      ruby: "is_valid",
      php: "isValid",
      java: "isValid",
      go: "isValid",
      cpp: "isValid",
      csharp: "IsValid",
      rust: "is_valid",
    },
  },
  testCases: [
    { id: 1, name: "Einfaches Paar", input: '"()"', expected: "true" },
    { id: 2, name: "Alle Typen", input: '"()[]{}"', expected: "true" },
    { id: 3, name: "Falsch geschlossen", input: '"(]"', expected: "false" },
    { id: 4, name: "Falsche Reihenfolge", input: '"([)]"', expected: "false" },
    { id: 5, name: "Verschachtelt", input: '"{[]}"', expected: "true" },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
  translations: {
    en: {
      title: "Valid Parentheses",
      description:
        "Implement isValid(s).\n\n" +
        "Check whether the brackets in s are correctly nested and closed. The allowed " +
        "characters are (), [] and {}. Return true or false.\n\n" +
        "Counting brackets is not enough: \"([)]\" has the same number of each kind " +
        "and is still wrong. It is about the order, and that calls for a structure " +
        "that remembers what was opened last.",
      hints: [
        {
          title: "The idea",
          body:
            "Opened last, closed first. That is exactly what a stack is: you put " +
            "opening brackets on top, and a closing bracket may only take away the one " +
            "sitting on top right now.\n\n" +
            "If it does not match the topmost one, the nesting was wrong and you can " +
            "stop right there.",
        },
        {
          title: "The implementation",
          body:
            "Walk the string character by character. On an opening bracket you push " +
            "it onto the stack. On a closing one you pop the top element and check " +
            "whether it is the matching opening, otherwise return false " +
            "immediately.\n\n" +
            "A map from closing to opening bracket saves you three chains of " +
            "comparisons.",
        },
        {
          title: "Where most people go wrong",
          body:
            "The stack at the end. Check only that every closing bracket matched, and " +
            "\"(((\" looks valid to you. The answer is true only if the stack is empty " +
            "afterwards. Every bracket that was opened got closed.\n\n" +
            "The closing bracket on an empty stack. With \")\" there is nothing to pop; " +
            "without a check you read undefined and compare against nothing. An empty " +
            "stack at that point means false.\n\n" +
            "And the test case that really matters: \"([)]\" only fails if you check " +
            "the topmost bracket and not just any open one.",
        },
      ],
      testCaseNames: {
        "1": "Simple pair",
        "2": "All types",
        "3": "Wrongly closed",
        "4": "Wrong order",
        "5": "Nested",
      },
    },
  },
};
