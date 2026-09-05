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
    "Die Zahl in einen String zu verwandeln und zu spiegeln funktioniert, geht aber am " +
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
        "multiplizierst und die Ziffer addierst. Am Ende steht die gespiegelte Zahl, " +
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
        "nichts mehr zum Vergleichen. Rev wird dann mit 0 verglichen.\n\n" +
        "Die Division muss ganzzahlig sein. In JavaScript liefert x / 10 einen Bruch " +
        "und die Schleife endet nie; nimm Math.floor oder Math.trunc, in Python //.\n\n" +
        "Die Schleifenbedingung ist x > 0, nicht x >= 0, sonst dreht sich die 0 endlos. " +
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
  translations: {
    en: {
      title: "Palindrome Number",
      description:
        "Implement isPalindrome(x).\n\n" +
        "Return true if the integer x reads the same forwards and backwards, otherwise false. " +
        "Negative numbers are not palindromes: -121 read backwards is 121-. 0 is one, and so " +
        "is every single digit.\n\n" +
        "Turning the number into a string and mirroring it works, but it misses the point. " +
        "The point of this task is to reverse the digits arithmetically: x % 10 gives you the " +
        "last digit, and integer division by 10 drops it.",
      hints: [
        {
          title: "The idea",
          body:
            "Build a new number out of the digits, back to front: every digit you pick off is " +
            "appended on the right of the reversal so far, by multiplying that reversal by 10 " +
            "and adding the digit. What you end up with is the mirrored number, and that is " +
            "what you compare with the original.",
        },
        {
          title: "The implementation",
          body:
            "If x is negative, return false right away. Remember the original and set rev to " +
            "0. As long as x is greater than 0: rev = rev * 10 + x % 10, then divide x by 10 " +
            "as an integer. At the end you return whether rev equals the original.",
        },
        {
          title: "Where most people go wrong",
          body:
            "Change x inside the loop without saving the original first and you have nothing " +
            "left to compare at the end. Rev then gets compared with 0.\n\n" +
            "The division has to be an integer division. In JavaScript x / 10 gives you a " +
            "fraction and the loop never ends; use Math.floor or Math.trunc, in Python //.\n\n" +
            "The loop condition is x > 0, not x >= 0, otherwise 0 spins forever. And the " +
            "check for negative numbers comes first: in some languages -121 % 10 is -1, in " +
            "others 9, and both lead the wrong way.",
        },
      ],
      testCaseNames: {
        "1": "Example",
        "2": "Negative",
        "3": "Ends in zero",
        "4": "Zero",
        "5": "Seven digits",
        "6": "Two digits",
        "7": "One digit",
      },
    },
  },
  starterCodes: starter,
  starterCode: starter.javascript,
};
