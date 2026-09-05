import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: "function moveZeroes(nums) {\n  // Your solution here\n  return nums;\n}",
  typescript: "function moveZeroes(nums: number[]): number[] {\n  // Your solution here\n  return nums;\n}",
  python: "def move_zeroes(nums):\n    # Your solution here\n    return nums\n",
  php: "<?php\n\nfunction moveZeroes($nums) {\n    // Your solution here\n    return $nums;\n}\n",
  java: "static int[] moveZeroes(int[] nums) {\n    // Your solution here\n    return nums;\n}\n",
  go: "func moveZeroes(nums []int) []int {\n\t// Your solution here\n\treturn nums\n}\n",
  cpp: "vector<int> moveZeroes(vector<int> nums) {\n    // Your solution here\n    return nums;\n}\n",
  csharp: "static int[] MoveZeroes(int[] nums) {\n    // Your solution here\n    return nums;\n}\n",
  rust: "fn move_zeroes(nums: Vec<i64>) -> Vec<i64> {\n    // Your solution here\n    nums\n}\n",
  ruby: "def move_zeroes(nums)\n  # Your solution here\n  nums\nend\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-move-zeroes",
  title: "Move Zeroes",
  description:
    "Implementiere moveZeroes(nums).\n\n" +
    "Verschiebe alle Nullen ans Ende des Arrays. Die Reihenfolge der übrigen Elemente " +
    "bleibt dabei erhalten.\n\n" +
    "Ohne diese Bedingung wäre es Sortieren. Mit ihr ist es eine Aufgabe über " +
    "Reihenfolge: Die Nicht-Nullen dürfen untereinander nicht die Plätze tauschen.",
  difficulty: "easy",
  points: 100,
  categoryId: CATEGORY.datenstrukturen,
  hints: [
    {
      title: "Die Idee",
      body:
        "Dreh die Aufgabe um. Statt Nullen nach hinten zu schieben, ziehst du alles, " +
        "was keine Null ist, nach vorn, in genau der Reihenfolge, in der es " +
        "vorkommt. Was hinten übrig bleibt, sind zwangsläufig die Nullen.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Der einfache Weg: filtere die Nicht-Null-Werte in ein neues Array und häng " +
        "so viele Nullen an, wie zur ursprünglichen Länge fehlen.\n\n" +
        "Der Weg ohne zweites Array: Führe einen Schreibzeiger mit, der bei 0 startet. " +
        "Läufst du auf einen Wert ungleich null, schreibst du ihn an die Position des " +
        "Schreibzeigers und rückst ihn eins weiter. Am Ende füllst du von dort bis " +
        "zum Ende mit Nullen.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Nullen einzeln nach hinten zu tauschen. Bei [4,0,5,0,0,6] holt jeder Tausch " +
        "ein Element von hinten nach vorn und zerstört die Reihenfolge, aus 4,5,6 " +
        "wird 4,6,5.\n\n" +
        "Die Länge. Das Ergebnis hat genauso viele Elemente wie die Eingabe. Wer die " +
        "Nullen nur herausfiltert und das Auffüllen vergisst, gibt ein zu kurzes " +
        "Array zurück.\n\n" +
        "Und die Rückgabe: Auch wenn du direkt in nums schreibst, muss die Funktion " +
        "das Array zurückgeben. Ohne return kommt beim Test nichts an.",
    },
  ],
  examples: [{ input: "[0,1,0,3,12]", output: "[1,3,12,0,0]" }],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "moveZeroes",
      typescript: "moveZeroes",
      python: "move_zeroes",
      ruby: "move_zeroes",
      php: "moveZeroes",
      java: "moveZeroes",
      go: "moveZeroes",
      cpp: "moveZeroes",
      csharp: "MoveZeroes",
      rust: "move_zeroes",
    },
  },
  testCases: [
    { id: 1, name: "Beispiel", input: "[0,1,0,3,12]", expected: "[1,3,12,0,0]" },
    { id: 2, name: "Nur Null", input: "[0]", expected: "[0]" },
    { id: 3, name: "Keine Null", input: "[1,2,3]", expected: "[1,2,3]" },
    { id: 4, name: "Führende Nullen", input: "[0,0,1]", expected: "[1,0,0]" },
    { id: 5, name: "Verteilt", input: "[4,0,5,0,0,6]", expected: "[4,5,6,0,0,0]" },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
  translations: {
    en: {
      title: "Move Zeroes",
      description:
        "Implement moveZeroes(nums).\n\n" +
        "Move all zeroes to the end of the array. The order of the remaining elements " +
        "stays as it was.\n\n" +
        "Without that condition it would be sorting. With it, it is a task about order: " +
        "the non-zeroes must not swap places among themselves.",
      hints: [
        {
          title: "The idea",
          body:
            "Turn the task around. Instead of pushing zeroes to the back, you pull " +
            "everything that is not a zero to the front, in exactly the order it " +
            "appears. What is left at the back is bound to be the zeroes.",
        },
        {
          title: "The implementation",
          body:
            "The easy way: filter the non-zero values into a new array and append enough " +
            "zeroes to get back to the original length.\n\n" +
            "The way without a second array: keep a write pointer that starts at 0. When " +
            "you run into a value other than zero, you write it at the position of the " +
            "write pointer and move it on by one. At the end you fill from there to the " +
            "end with zeroes.",
        },
        {
          title: "Where most people go wrong",
          body:
            "Swapping zeroes to the back one at a time. For [4,0,5,0,0,6] every swap pulls " +
            "an element from the back to the front and destroys the order. 4,5,6 Turns " +
            "into 4,6,5.\n\n" +
            "The length. The result has exactly as many elements as the input. Filter the " +
            "zeroes out and forget the padding, and you return an array that is too " +
            "short.\n\n" +
            "And the return: even if you write into nums directly, the function has to " +
            "return the array. Without a return, nothing arrives at the test.",
        },
      ],
      testCaseNames: {
        "1": "Example",
        "2": "Only a zero",
        "3": "No zero",
        "4": "Leading zeroes",
        "5": "Spread out",
      },
    },
  },
};
