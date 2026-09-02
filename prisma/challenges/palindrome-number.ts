import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: "function isPalindrome(x) {\n  // Your solution here\n  return false;\n}",
  typescript: "function isPalindrome(x: number): boolean {\n  // Your solution here\n  return false;\n}",
  python: "def is_palindrome(x):\n    # Your solution here\n    return False\n",
  php: "<?php\n\nfunction isPalindrome($x) {\n    // Your solution here\n    return false;\n}\n",
  ruby: "def is_palindrome(x)\n  # Your solution here\n  false\nend\n",
  java: "static boolean isPalindrome(int x) {\n    // Your solution here\n    return false;\n}\n",
  go: "func isPalindrome(x int) bool {\n\t// Your solution here\n\treturn false\n}\n",
  cpp: "bool isPalindrome(int x) {\n    // Your solution here\n    return false;\n}\n",
  csharp: "static bool IsPalindrome(int x) {\n    // Your solution here\n    return false;\n}\n",
  rust: "fn is_palindrome(x: i64) -> bool {\n    // Your solution here\n    false\n}\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-palindrome-number",
  title: "Palindrome Number",
  description:
    "Implementiere isPalindrome(x).\n\n" +
    "Gib true zurück, wenn die ganze Zahl x vorwärts und rückwärts gelesen gleich ist, " +
    "sonst false. Negative Zahlen sind keine Palindrome: -121 liest sich rückwärts als " +
    "121-. Die 0 ist eines, jede einzelne Ziffer auch.\n\n" +
    "Die Zahl in einen String zu verwandeln und zu spiegeln funktioniert – geht aber am " +
    "Kern vorbei. Der Punkt der Aufgabe ist, die Ziffern arithmetisch umzudrehen: Die " +
    "letzte Ziffer liefert x % 10, und die ganzzahlige Division durch 10 streicht sie.",
  difficulty: "easy",
  points: 100,
  categoryId: CATEGORY.algorithmen,
  hints: [
    {
      title: "Die Idee",
      body:
        "Baue aus den Ziffern von hinten eine neue Zahl auf: Jede abgeholte Ziffer wird " +
        "rechts an die bisherige Umkehrung angehängt, indem du die Umkehrung mit 10 " +
        "multiplizierst und die Ziffer addierst. Am Ende steht die gespiegelte Zahl – " +
        "und die vergleichst du mit dem Original.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Ist x negativ, gib sofort false zurück. Merk dir das Original und setze rev auf " +
        "0. Solange x größer als 0 ist: rev = rev * 10 + x % 10, dann x ganzzahlig durch " +
        "10 teilen. Zum Schluss gibst du zurück, ob rev gleich dem Original ist.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Wer x in der Schleife verändert, ohne das Original zu sichern, hat am Ende " +
        "nichts mehr zum Vergleichen – rev wird dann mit 0 verglichen.\n\n" +
        "Die Division muss ganzzahlig sein. In JavaScript liefert x / 10 einen Bruch " +
        "und die Schleife endet nie; nimm Math.floor oder Math.trunc, in Python //.\n\n" +
        "Die Schleifenbedingung ist x > 0, nicht x >= 0 – sonst dreht sich die 0 endlos. " +
        "Und die Prüfung auf negative Zahlen kommt zuerst: In manchen Sprachen ist -121 % " +
        "10 gleich -1, in anderen 9, und beides führt in eine falsche Richtung.",
    },
  ],
  examples: [
    { input: "121", output: "true" },
    { input: "-121", output: "false" },
  ],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "isPalindrome",
      typescript: "isPalindrome",
      python: "is_palindrome",
      ruby: "is_palindrome",
      php: "isPalindrome",
      java: "isPalindrome",
      go: "isPalindrome",
      cpp: "isPalindrome",
      csharp: "IsPalindrome",
      rust: "is_palindrome",
    },
  },
  testCases: [
    { id: 1, name: "Beispiel", input: "121", expected: "true" },
    { id: 2, name: "Negativ", input: "-121", expected: "false" },
    { id: 3, name: "Endet auf Null", input: "10", expected: "false" },
    { id: 4, name: "Null", input: "0", expected: "true" },
    { id: 5, name: "Sieben Ziffern", input: "1234321", expected: "true" },
    { id: 6, name: "Zwei Ziffern", input: "12", expected: "false" },
    { id: 7, name: "Eine Ziffer", input: "7", expected: "true" },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
};
