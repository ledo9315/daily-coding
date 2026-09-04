import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: "function reverseString(s) {\n  // Your solution here\n  return s;\n}",
  typescript:
    "function reverseString(s: string): string {\n  // Your solution here\n  return s;\n}",
  python: "def reverse_string(s):\n    # Your solution here\n    return s\n",
  php: "<?php\n\nfunction reverseString($s) {\n    // Your solution here\n    return $s;\n}\n",
  java: "static String reverseString(String s) {\n    // Your solution here\n    return s;\n}\n",
  go: "func reverseString(s string) string {\n\t// Your solution here\n\treturn s\n}\n",
  cpp: "string reverseString(string s) {\n    // Your solution here\n    return s;\n}\n",
  csharp: "static string ReverseString(string s) {\n    // Your solution here\n    return s;\n}\n",
  rust: "fn reverse_string(s: String) -> String {\n    // Your solution here\n    s\n}\n",
  ruby: "def reverse_string(s)\n  # Your solution here\n  s\nend\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-string-reversal",
  title: "String Reversal",
  description:
    "Implementiere reverseString(s).\n\n" +
    "Gib den übergebenen String in umgekehrter Zeichenreihenfolge zurück.\n\n" +
    "Jede Sprache hat dafür einen Einzeiler, und der ist hier auch eine gültige " +
    "Antwort. Wer etwas mitnehmen will, schreibt die Schleife einmal selbst – sie " +
    "steckt in jedem Palindrom-Check und in jeder Zwei-Zeiger-Aufgabe wieder.",
  difficulty: "easy",
  points: 100,
  categoryId: CATEGORY.strings,
  hints: [
    {
      title: "Die Idee",
      body:
        "Ein String ist eine Folge von Zeichen mit Positionen. Umdrehen heißt: das " +
        "letzte Zeichen kommt an Position 0, das vorletzte an Position 1, und so " +
        "weiter. Entweder liest du von hinten nach vorn, oder du tauschst paarweise " +
        "von außen nach innen.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Der kurze Weg: in Zeichen zerlegen, die Reihenfolge umkehren, wieder " +
        "zusammensetzen. In JavaScript s.split(\"\").reverse().join(\"\"), in Python " +
        "s[::-1], in PHP strrev.\n\n" +
        "Der lehrreiche Weg: eine Schleife vom letzten Index rückwärts bis 0, die " +
        "jedes Zeichen an ein Ergebnis hängt.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Der letzte Index ist Länge minus 1. Bei Länge zu starten liefert nichts oder " +
        "einen Fehler, je nach Sprache.\n\n" +
        "Strings sind in JavaScript und Python unveränderlich: Du kannst kein Zeichen " +
        "über s[i] = … zuweisen, sondern baust ein neues Ergebnis auf.\n\n" +
        "Der leere String ergibt den leeren String. Ein Palindrom ergibt sich selbst – " +
        "beides sind gültige Eingaben und keine Sonderfälle, die du abfangen musst.",
    },
  ],
  examples: [
    { input: '"hello"', output: '"olleh"' },
    { input: '"racecar"', output: '"racecar"' },
  ],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "reverseString",
      typescript: "reverseString",
      python: "reverse_string",
      ruby: "reverse_string",
      php: "reverseString",
      java: "reverseString",
      go: "reverseString",
      cpp: "reverseString",
      csharp: "ReverseString",
      rust: "reverse_string",
    },
  },
  testCases: [
    { id: 1, name: "Einfaches Wort", input: '"hello"', expected: '"olleh"' },
    { id: 2, name: "Leerer String", input: '""', expected: '""' },
    { id: 3, name: "Ein Zeichen", input: '"a"', expected: '"a"' },
    { id: 4, name: "Palindrom", input: '"racecar"', expected: '"racecar"' },
    { id: 5, name: "Mit Satzzeichen", input: '"Hello, World!"', expected: '"!dlroW ,olleH"' },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
  translations: {
    en: {
      title: "String Reversal",
      description:
        "Implement reverseString(s).\n\n" +
        "Return the given string with its characters in reverse order.\n\n" +
        "Every language has a one-liner for this, and that is a valid answer here too. " +
        "If you want to take something away from it, write the loop yourself once – it " +
        "shows up again in every palindrome check and every two-pointer task.",
      hints: [
        {
          title: "The idea",
          body:
            "A string is a sequence of characters with positions. Reversing it means: " +
            "the last character moves to position 0, the second to last to position 1, " +
            "and so on. Either you read from back to front, or you swap in pairs from " +
            "the outside in.",
        },
        {
          title: "The implementation",
          body:
            "The short way: split into characters, reverse the order, join them back " +
            "together. In JavaScript s.split(\"\").reverse().join(\"\"), in Python " +
            "s[::-1], in PHP strrev.\n\n" +
            "The instructive way: a loop running from the last index backwards to 0 " +
            "that appends each character to a result.",
        },
        {
          title: "Where most people go wrong",
          body:
            "The last index is length minus 1. Starting at length gives you nothing " +
            "or an error, depending on the language.\n\n" +
            "Strings are immutable in JavaScript and Python: you cannot assign a " +
            "character via s[i] = …, you build a new result instead.\n\n" +
            "The empty string yields the empty string. A palindrome yields itself " +
            "– both are valid inputs, not special cases you have to catch.",
        },
      ],
      testCaseNames: {
        "1": "Simple word",
        "2": "Empty string",
        "3": "Single character",
        "4": "Palindrome",
        "5": "With punctuation",
      },
    },
  },
};
