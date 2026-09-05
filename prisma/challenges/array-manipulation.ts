import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: "function transformArray(arr) {\n  // Your solution here\n}",
  typescript:
    "function transformArray(arr: number[]): number[] {\n  // Your solution here\n  return arr;\n}",
  python: "def transform_array(arr):\n    # Your solution here\n    pass\n",
  php: "<?php\n\nfunction transformArray($arr) {\n    // Your solution here\n}\n",
  java: "static int[] transformArray(int[] arr) {\n    // Your solution here\n    return new int[]{};\n}\n",
  go: "func transformArray(arr []int) []int {\n\t// Your solution here\n\treturn []int{}\n}\n",
  cpp: "vector<int> transformArray(vector<int> arr) {\n    // Your solution here\n    return {};\n}\n",
  csharp: "static int[] TransformArray(int[] arr) {\n    // Your solution here\n    return new int[]{};\n}\n",
  rust: "fn transform_array(arr: Vec<i64>) -> Vec<i64> {\n    // Your solution here\n    vec![]\n}\n",
  ruby: "def transform_array(arr)\n  # Your solution here\n  []\nend\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-array-manipulation",
  title: "Array Manipulation Challenge",
  description:
    "Implementiere transformArray(arr).\n\n" +
    "Gib ein neues Array zurück, in dem jedes Element die Summe aller Elemente bis zu " +
    "dieser Position enthält, sich selbst eingeschlossen.\n\n" +
    "Für jede Position von vorn neu zu summieren funktioniert und kostet O(n²). Es " +
    "geht in einem Durchlauf, denn die Summe bis Position i ist die Summe bis i-1 plus " +
    "das aktuelle Element.",
  difficulty: "medium",
  points: 150,
  categoryId: CATEGORY.algorithmen,
  hints: [
    {
      title: "Die Idee",
      body:
        "Jeder Wert im Ergebnis unterscheidet sich von seinem Vorgänger um genau ein " +
        "Element: das an dieser Stelle. Du musst also nichts wiederholt aufsummieren, " +
        "sondern nur eine laufende Summe mitführen und fortschreiben.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Leg eine Variable für die Summe an und starte sie bei 0. Geh das Array einmal " +
        "von links nach rechts durch, addiere das aktuelle Element auf die Summe und " +
        "häng ihren neuen Wert ans Ergebnis. Am Ende gibst du das Ergebnis-Array " +
        "zurück.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Die verschachtelte Schleife. Wer für jede Position wieder bei Index 0 " +
        "anfängt, bekommt dasselbe Ergebnis in quadratischer Zeit, bei dieser Aufgabe " +
        "geht es genau um den Unterschied.\n\n" +
        "Gefragt ist ein neues Array. Das übergebene zu überschreiben ist unsauber, " +
        "auch wenn die Tests es hier nicht bemerken.\n\n" +
        "Das leere Array muss ein leeres Array ergeben, keinen Fehler und keine [0].",
    },
  ],
  translations: {
    en: {
      title: "Array Manipulation Challenge",
      description:
        "Implement transformArray(arr).\n\n" +
        "Return a new array in which every element holds the sum of all elements up to " +
        "that position, itself included.\n\n" +
        "Summing from the start again for every position works and costs O(n²). One pass " +
        "is enough, because the sum up to position i is the sum up to i-1 plus the " +
        "current element.",
      hints: [
        {
          title: "The idea",
          body:
            "Every value in the result differs from the one before it by exactly one " +
            "element: the one at that position. So there is nothing to add up over and " +
            "over - you only carry a running sum along and keep extending it.",
        },
        {
          title: "The implementation",
          body:
            "Set up a variable for the sum and start it at 0. Walk the array once from " +
            "left to right, add the current element to the sum, and append its new value " +
            "to the result. At the end you return the result array.",
        },
        {
          title: "Where most people go wrong",
          body:
            "The nested loop. Start over at index 0 for every position and you get the " +
            "same result in quadratic time, and that difference is the whole point of " +
            "this task.\n\n" +
            "A new array is what is asked for. Overwriting the one you were handed is " +
            "sloppy, even if the tests here do not notice.\n\n" +
            "The empty array has to produce an empty array, not an error and not [0].",
        },
      ],
      testCaseNames: {
        "1": "Simple array",
        "2": "Empty array",
        "3": "Negative numbers",
        "4": "Mixed values",
        "5": "Single element",
      },
    },
  },
  examples: [
    { input: "[1, 2, 3, 4, 5]", output: "[1, 3, 6, 10, 15]" },
    { input: "[5, -2, 3, 1]", output: "[5, 3, 6, 7]" },
  ],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "transformArray",
      typescript: "transformArray",
      python: "transform_array",
      ruby: "transform_array",
      php: "transformArray",
      java: "transformArray",
      go: "transformArray",
      cpp: "transformArray",
      csharp: "TransformArray",
      rust: "transform_array",
    },
  },
  testCases: [
    {
      id: 1,
      name: "Einfaches Array",
      input: "[1,2,3,4,5]",
      expected: "[1,3,6,10,15]",
    },
    { id: 2, name: "Leeres Array", input: "[]", expected: "[]" },
    {
      id: 3,
      name: "Negative Zahlen",
      input: "[-1,-2,-3]",
      expected: "[-1,-3,-6]",
    },
    {
      id: 4,
      name: "Gemischte Werte",
      input: "[5,-2,3,1]",
      expected: "[5,3,6,7]",
    },
    { id: 5, name: "Ein Element", input: "[42]", expected: "[42]" },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
};
