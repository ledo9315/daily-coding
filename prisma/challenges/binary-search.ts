import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript:
    "function binarySearch(data) {\n  const { arr, target } = data;\n  // Your solution here\n  return -1;\n}",
  typescript:
    "function binarySearch(data: { arr: number[]; target: number }): number {\n  const { arr, target } = data;\n  // Your solution here\n  return -1;\n}",
  python:
    'def binary_search(data):\n    arr, target = data["arr"], data["target"]\n    # Your solution here\n    return -1\n',
  php: "<?php\n\nfunction binarySearch($data) {\n    $arr = $data['arr'];\n    $target = $data['target'];\n    // Your solution here\n    return -1;\n}\n",
  java: "static int binarySearch(int[] arr, int target) {\n    // Your solution here\n    return -1;\n}\n",
  go: "func binarySearch(arr []int, target int) int {\n\t// Your solution here\n\treturn -1\n}\n",
  cpp: "int binarySearch(vector<int> arr, int target) {\n    // Your solution here\n    return -1;\n}\n",
  csharp: "static int BinarySearch(int[] arr, int target) {\n    // Your solution here\n    return -1;\n}\n",
  rust: "fn binary_search(arr: Vec<i64>, target: i64) -> i64 {\n    // Your solution here\n    -1\n}\n",
  ruby: "def binary_search(data)\n  arr, target = data['arr'], data['target']\n  # Your solution here\n  -1\nend\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-binary-search",
  title: "Binary Search",
  description:
    "Implementiere binarySearch(data) mit data = { arr, target }.\n\n" +
    "arr ist aufsteigend sortiert. Gib den Index von target zurück – oder -1, wenn " +
    "target nicht enthalten ist.\n\n" +
    "Die binäre Suche nutzt aus, dass das Array sortiert ist: statt jedes Element zu " +
    "prüfen, halbiert sie den Suchbereich mit jedem Vergleich. Das ist O(log n) statt " +
    "O(n) – bei einer Million Einträgen rund 20 Schritte statt einer Million. Ein " +
    "indexOf besteht die Tests, geht aber an der Aufgabe vorbei.",
  difficulty: "easy",
  points: 120,
  categoryId: CATEGORY.algorithmen,
  hints: [
    {
      title: "Die Idee",
      body:
        "Vergleiche target mit dem Element in der Mitte. Ist das zu groß, kann target " +
        "nur links davon liegen; ist es zu klein, nur rechts. Jeder Vergleich wirft " +
        "also die Hälfte des Bereichs weg.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Halte den Suchbereich in zwei Indizes: low = 0 und high = arr.length - 1. " +
        "Solange low <= high, berechne mid = Math.floor((low + high) / 2). Trifft " +
        "arr[mid] das Ziel, gib mid zurück. Ist arr[mid] kleiner, suche rechts weiter " +
        "(low = mid + 1), sonst links (high = mid - 1).",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Die Grenze muss über mid hinaus wandern (mid + 1 bzw. mid - 1). Bleibt sie " +
        "auf mid stehen, schrumpft der Bereich irgendwann nicht mehr und die Schleife " +
        "läuft endlos.\n\n" +
        "Und mid gehört in jeden Durchlauf neu berechnet, nicht vor die Schleife.\n\n" +
        "Endet die Schleife ohne Treffer, ist die Antwort -1 – das deckt auch das " +
        "leere Array ab.",
    },
  ],
  translations: {
    en: {
      title: "Binary Search",
      description:
        "Implement binarySearch(data) with data = { arr, target }.\n\n" +
        "arr is sorted in ascending order. Return the index of target – or -1 if target " +
        "is not in it.\n\n" +
        "Binary search exploits the fact that the array is sorted: instead of checking " +
        "every element, it halves the search range with each comparison. That is " +
        "O(log n) instead of O(n) – with a million entries, around 20 steps instead of a " +
        "million. An indexOf passes the tests but misses the point of the task.",
      hints: [
        {
          title: "The idea",
          body:
            "Compare target with the element in the middle. If that one is too large, " +
            "target can only be to its left; if it is too small, only to its right. So " +
            "every comparison throws away half of the range.",
        },
        {
          title: "The implementation",
          body:
            "Keep the search range in two indices: low = 0 and high = arr.length - 1. " +
            "While low <= high, compute mid = Math.floor((low + high) / 2). If arr[mid] " +
            "hits the target, return mid. If arr[mid] is smaller, keep searching to the " +
            "right (low = mid + 1), otherwise to the left (high = mid - 1).",
        },
        {
          title: "Where most people go wrong",
          body:
            "The bound has to move past mid (mid + 1 or mid - 1). Leave it sitting on " +
            "mid and at some point the range stops shrinking and the loop runs " +
            "forever.\n\n" +
            "And mid has to be recomputed on every pass, not once in front of the " +
            "loop.\n\n" +
            "If the loop ends without a hit, the answer is -1 – that covers the empty " +
            "array too.",
        },
      ],
      testCaseNames: {
        "1": "Value in the middle",
        "2": "First element",
        "3": "Last element",
        "4": "Not present",
        "5": "Empty array",
      },
    },
  },
  examples: [
    { input: '{ "arr": [1,3,5,7,9], "target": 5 }', output: "2" },
    { input: '{ "arr": [1,3,5,7,9], "target": 4 }', output: "-1" },
  ],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "binarySearch",
      typescript: "binarySearch",
      python: "binary_search",
      ruby: "binary_search",
      php: "binarySearch",
      java: "binarySearch",
      go: "binarySearch",
      cpp: "binarySearch",
      csharp: "BinarySearch",
      rust: "binary_search",
    },
  },
  testCases: [
    { id: 1, name: "Wert in der Mitte", input: '{"arr":[1,3,5,7,9],"target":5}', expected: "2" },
    { id: 2, name: "Erstes Element", input: '{"arr":[1,3,5,7,9],"target":1}', expected: "0" },
    { id: 3, name: "Letztes Element", input: '{"arr":[1,3,5,7,9],"target":9}', expected: "4" },
    { id: 4, name: "Nicht vorhanden", input: '{"arr":[1,3,5,7,9],"target":4}', expected: "-1" },
    { id: 5, name: "Leeres Array", input: '{"arr":[],"target":1}', expected: "-1" },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
};
