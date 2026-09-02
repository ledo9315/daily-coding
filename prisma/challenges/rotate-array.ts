import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript:
    "function rotate(data) {\n  const { nums, k } = data;\n  // Your solution here\n  return [];\n}",
  typescript:
    "function rotate(data: { nums: number[]; k: number }): number[] {\n  const { nums, k } = data;\n  // Your solution here\n  return [];\n}",
  python: 'def rotate(data):\n    nums, k = data["nums"], data["k"]\n    # Your solution here\n    return []\n',
  php: "<?php\n\nfunction rotate($data) {\n    $nums = $data['nums'];\n    $k = $data['k'];\n    // Your solution here\n    return [];\n}\n",
  ruby: "def rotate(data)\n  nums, k = data['nums'], data['k']\n  # Your solution here\n  []\nend\n",
  java: "static int[] rotate(int[] nums, int k) {\n    // Your solution here\n    return new int[]{};\n}\n",
  go: "func rotate(nums []int, k int) []int {\n\t// Your solution here\n\treturn []int{}\n}\n",
  cpp: "vector<int> rotate(vector<int> nums, int k) {\n    // Your solution here\n    return {};\n}\n",
  csharp: "static int[] Rotate(int[] nums, int k) {\n    // Your solution here\n    return new int[]{};\n}\n",
  rust: "fn rotate(nums: Vec<i64>, k: i64) -> Vec<i64> {\n    // Your solution here\n    vec![]\n}\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-rotate-array",
  title: "Rotate Array",
  description:
    "Implementiere rotate(data) mit data = { nums, k }.\n\n" +
    "Drehe das Array um k Schritte nach rechts und gib das Ergebnis zurück: Jedes Element rückt " +
    "k Positionen weiter, was hinten herausfällt, kommt vorne wieder hinein. Aus [1,2,3,4,5,6,7] " +
    "und k = 3 wird [5,6,7,1,2,3,4].\n\n" +
    "k ist nicht negativ und darf größer sein als die Länge des Arrays. Das Array hat mindestens " +
    "ein Element.\n\n" +
    "Mit einer Kopie ist die Aufgabe in einer Zeile gelöst. Interessant wird sie, wenn du ohne " +
    "zusätzlichen Speicher auskommen willst – es gibt einen Trick mit drei Umkehrungen, der " +
    "genau das schafft.",
  difficulty: "medium",
  points: 150,
  categoryId: CATEGORY.algorithmen,
  hints: [
    {
      title: "Die Idee",
      body:
        "Das Element an Position i landet an Position (i + k) % n. Anders gelesen: Die letzten k " +
        "Elemente wandern nach vorne, die ersten n - k rücken nach hinten. Rotation um k ist " +
        "dasselbe wie Rotation um k % n – nach n Schritten steht alles wieder an seinem Platz.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Der direkte Weg: Reduziere k auf k % n und gib die letzten k Elemente gefolgt von den " +
        "ersten n - k zurück – mit slice bzw. Slicing sind das zwei Teilstücke, die du " +
        "aneinanderhängst. Alternativ legst du ein neues Array gleicher Länge an und schreibst " +
        "nums[i] an Position (i + k) % n.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "k größer als die Länge. Wer ohne k % n arbeitet, greift bei [1,2,3] und k = 5 neben das " +
        "Array oder dreht falsch – erwartet ist [2,3,1]. Und k = n muss das Array unverändert " +
        "lassen.\n\n" +
        "Die Richtung: Rechts heißt, das letzte Element kommt nach vorne. Wer die ersten k " +
        "Elemente ans Ende schiebt, dreht nach links.\n\n" +
        "Wer es ohne zusätzlichen Speicher versucht: dreimal umkehren – erst das ganze Array, " +
        "dann die ersten k Elemente, dann den Rest ab Position k. Das ergibt genau die " +
        "Rechtsrotation in O(1) Zusatzspeicher, und die Reihenfolge der drei Schritte ist nicht " +
        "beliebig.",
    },
  ],
  examples: [{ input: '{ "nums": [1,2,3,4,5,6,7], "k": 3 }', output: "[5,6,7,1,2,3,4]" }],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "rotate",
      typescript: "rotate",
      python: "rotate",
      ruby: "rotate",
      php: "rotate",
      java: "rotate",
      go: "rotate",
      cpp: "rotate",
      csharp: "Rotate",
      rust: "rotate",
    },
  },
  testCases: [
    { id: 1, name: "Beispiel", input: '{"nums":[1,2,3,4,5,6,7],"k":3}', expected: "[5,6,7,1,2,3,4]" },
    { id: 2, name: "Negative", input: '{"nums":[-1,-100,3,99],"k":2}', expected: "[3,99,-1,-100]" },
    { id: 3, name: "k gleich null", input: '{"nums":[1,2,3],"k":0}', expected: "[1,2,3]" },
    { id: 4, name: "k gleich Länge", input: '{"nums":[1,2,3,4],"k":4}', expected: "[1,2,3,4]" },
    { id: 5, name: "k größer als Länge", input: '{"nums":[1,2,3],"k":5}', expected: "[2,3,1]" },
    { id: 6, name: "Ein Element", input: '{"nums":[7],"k":10}', expected: "[7]" },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
};
