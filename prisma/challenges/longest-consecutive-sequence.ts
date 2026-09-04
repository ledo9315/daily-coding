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
  translations: {
    en: {
      title: "Longest Consecutive Sequence",
      description:
        "Implement longestConsecutive(nums).\n\n" +
        "Return the length of the longest run of directly consecutive integers that appear in " +
        "nums – no matter where they sit in the array. In [100,4,200,1,3,2] that is 1,2,3,4, so " +
        "4. An empty array gives 0.\n\n" +
        "nums is unsorted and may contain duplicates and negative numbers.\n\n" +
        "Sorting works and costs O(n log n) – the task aims at O(n): with every number in a set " +
        "you can count each run from its start, without ever sorting.",
      hints: [
        {
          title: "The idea",
          body:
            "You spot a run by its start: a number n for which n - 1 does not appear. From " +
            "there you count up as long as n + 1, n + 2, … are in the set. Every number belongs " +
            "to exactly one run and is visited only once while counting – that is the whole " +
            "reason this runs in linear time.",
        },
        {
          title: "The implementation",
          body:
            "Put all the numbers into a set; that takes care of the duplicates along the way. " +
            "Then walk over the elements of the set. If n - 1 is in the set, skip n – it is not " +
            "a start. Otherwise count with an inner loop how far n + 1, n + 2, … keep going in " +
            "the set, and remember the maximum. At the end you return the maximum, or 0 for an " +
            "empty set.",
        },
        {
          title: "Where most people go wrong",
          body:
            "Starting the inner loop for every number instead of only for the starts counts the " +
            "same run as often as it is long – that is O(n²). The check for n - 1 is not a " +
            "detail, it is the algorithm.\n\n" +
            "Duplicates must not count twice: [1,2,2,3] gives 3, not 4. With a set that happens " +
            "by itself, with the array it does not.\n\n" +
            "An empty array gives 0, a single element 1. And negative numbers are ordinary " +
            "numbers: -3,-2,-1 is a run of length 3.",
        },
      ],
      testCaseNames: {
        "1": "Example",
        "2": "Long run",
        "3": "Empty",
        "4": "One element",
        "5": "Duplicates",
        "6": "Negatives",
      },
    },
  },
  starterCodes: starter,
  starterCode: starter.javascript,
};
