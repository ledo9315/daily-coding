import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: "function longestConsecutive(nums) {\n  // Your solution here\n  return 0;\n}",
  typescript:
    "function longestConsecutive(nums: number[]): number {\n  // Your solution here\n  return 0;\n}",
  python: "def longest_consecutive(nums):\n    # Your solution here\n    return 0\n",
  php: "<?php\n\nfunction longestConsecutive($nums) {\n    // Your solution here\n    return 0;\n}\n",
  ruby: "def longest_consecutive(nums)\n  # Your solution here\n  0\nend\n",
  java: "static int longestConsecutive(int[] nums) {\n    // Your solution here\n    return 0;\n}\n",
  go: "func longestConsecutive(nums []int) int {\n\t// Your solution here\n\treturn 0\n}\n",
  cpp: "int longestConsecutive(vector<int> nums) {\n    // Your solution here\n    return 0;\n}\n",
  csharp: "static int LongestConsecutive(int[] nums) {\n    // Your solution here\n    return 0;\n}\n",
  rust: "fn longest_consecutive(nums: Vec<i64>) -> i64 {\n    // Your solution here\n    0\n}\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-longest-consecutive-sequence",
  title: "Longest Consecutive Sequence",
  description:
    "Implementiere longestConsecutive(nums).\n\n" +
    "Gib die Länge der längsten Folge direkt aufeinanderfolgender ganzer Zahlen zurück, die " +
    "in nums vorkommen – egal, wo sie im Array stehen. In [100,4,200,1,3,2] ist das 1,2,3,4, " +
    "also 4. Ein leeres Array ergibt 0.\n\n" +
    "nums ist unsortiert und kann Duplikate und negative Zahlen enthalten.\n\n" +
    "Sortieren funktioniert und kostet O(n log n) – die Aufgabe zielt auf O(n): Wer alle " +
    "Zahlen in einem Set hat, kann jede Kette von ihrem Anfang aus abzählen, ohne je zu " +
    "sortieren.",
  difficulty: "medium",
  points: 150,
  categoryId: CATEGORY.datenstrukturen,
  hints: [
    {
      title: "Die Idee",
      body:
        "Eine Kette erkennt man an ihrem Anfang: eine Zahl n, für die n - 1 nicht vorkommt. " +
        "Von dort zählst du hoch, solange n + 1, n + 2, … im Set liegen. Jede Zahl gehört zu " +
        "genau einer Kette und wird beim Abzählen nur einmal besucht – das ist der ganze " +
        "Grund, warum das linear läuft.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Lege alle Zahlen in ein Set; das erledigt nebenbei die Duplikate. Laufe dann über " +
        "die Elemente des Sets. Liegt n - 1 im Set, überspring n – es ist kein Anfang. Sonst " +
        "zähle mit einer inneren Schleife, wie lange n + 1, n + 2, … noch im Set stecken, " +
        "und merk dir das Maximum. Am Ende gibst du das Maximum zurück, bei leerem Set 0.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Wer die innere Schleife für jede Zahl startet statt nur für die Anfänge, zählt " +
        "dieselbe Kette so oft, wie sie lang ist – das ist O(n²). Die Prüfung auf n - 1 " +
        "ist kein Detail, sie ist der Algorithmus.\n\n" +
        "Duplikate dürfen nicht doppelt zählen: [1,2,2,3] ergibt 3, nicht 4. Mit einem Set " +
        "passiert das von allein, mit dem Array nicht.\n\n" +
        "Ein leeres Array ergibt 0, ein einzelnes Element 1. Und negative Zahlen sind " +
        "normale Zahlen: -3,-2,-1 ist eine Kette der Länge 3.",
    },
  ],
  examples: [{ input: "[100,4,200,1,3,2]", output: "4" }],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "longestConsecutive",
      typescript: "longestConsecutive",
      python: "longest_consecutive",
      ruby: "longest_consecutive",
      php: "longestConsecutive",
      java: "longestConsecutive",
      go: "longestConsecutive",
      cpp: "longestConsecutive",
      csharp: "LongestConsecutive",
      rust: "longest_consecutive",
    },
  },
  testCases: [
    { id: 1, name: "Beispiel", input: "[100,4,200,1,3,2]", expected: "4" },
    { id: 2, name: "Lange Kette", input: "[0,3,7,2,5,8,4,6,0,1]", expected: "9" },
    { id: 3, name: "Leer", input: "[]", expected: "0" },
    { id: 4, name: "Ein Element", input: "[1]", expected: "1" },
    { id: 5, name: "Duplikate", input: "[1,2,2,3]", expected: "3" },
    { id: 6, name: "Negative", input: "[-3,-2,-1,5]", expected: "3" },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
};
