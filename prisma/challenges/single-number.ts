import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: "function singleNumber(nums) {\n  // Your solution here\n  return 0;\n}",
  typescript: "function singleNumber(nums: number[]): number {\n  // Your solution here\n  return 0;\n}",
  python: "def single_number(nums):\n    # Your solution here\n    return 0\n",
  php: "<?php\n\nfunction singleNumber($nums) {\n    // Your solution here\n    return 0;\n}\n",
  ruby: "def single_number(nums)\n  # Your solution here\n  0\nend\n",
  java: "static int singleNumber(int[] nums) {\n    // Your solution here\n    return 0;\n}\n",
  go: "func singleNumber(nums []int) int {\n\t// Your solution here\n\treturn 0\n}\n",
  cpp: "int singleNumber(vector<int> nums) {\n    // Your solution here\n    return 0;\n}\n",
  csharp: "static int SingleNumber(int[] nums) {\n    // Your solution here\n    return 0;\n}\n",
  rust: "fn single_number(nums: Vec<i64>) -> i64 {\n    // Your solution here\n    0\n}\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-single-number",
  title: "Single Number",
  description:
    "Implementiere singleNumber(nums).\n\n" +
    "In nums kommt jede Zahl genau zweimal vor – bis auf eine, die nur einmal da ist. Gib " +
    "diese Zahl zurück. Das Array ist nie leer, die Werte können negativ sein, und die " +
    "Reihenfolge ist beliebig: Die einzelne Zahl kann vorne, hinten oder irgendwo in der " +
    "Mitte stehen.\n\n" +
    "Zählen mit einer Map funktioniert und kostet O(n) Zeit, aber auch O(n) Speicher. Die " +
    "Aufgabe zielt auf die Lösung mit konstantem Speicher: ein Durchlauf, eine Variable, " +
    "und die Paare löschen sich gegenseitig aus.",
  difficulty: "easy",
  points: 120,
  categoryId: CATEGORY.algorithmen,
  hints: [
    {
      title: "Die Idee",
      body:
        "Es gibt eine Verknüpfung, bei der eine Zahl mit sich selbst 0 ergibt und 0 mit " +
        "irgendetwas dieses Etwas: das bitweise XOR. a ^ a ist 0, a ^ 0 ist a. Verknüpfst " +
        "du alle Elemente miteinander, heben sich die Paare gegenseitig auf – egal, wie " +
        "weit sie auseinanderliegen, denn XOR ist kommutativ und assoziativ. Übrig bleibt " +
        "die Zahl ohne Partner.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Starte mit result = 0. Laufe einmal durch nums und setze in jedem Schritt " +
        "result = result ^ nums[i]. Nach dem Durchlauf steht in result die gesuchte Zahl. " +
        "Kein Sortieren, keine Map, kein zweiter Durchlauf.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "XOR ist ^ – in allen Sprachen dieser Aufgabe, von JavaScript bis Rust. Wer ^ für " +
        "„hoch“ hält, denkt in Mathe-Notation: Potenzen sind ** oder pow, und mit ihnen löscht " +
        "sich hier nichts aus.\n\n" +
        "Negative Zahlen machen dem XOR nichts aus: Das Zweierkomplement wird bitweise " +
        "genauso ausgelöscht wie positive Werte. Wer stattdessen sortiert und Nachbarn " +
        "vergleicht, muss das erste und das letzte Element gesondert behandeln, sonst liest " +
        "er über den Rand.\n\n" +
        "Ein Array mit einem einzigen Element ist bereits die Antwort. Wenn deine Schleife " +
        "in Zweierschritten läuft, übersieht sie genau diesen Fall.",
    },
  ],
  examples: [
    { input: "[2,2,1]", output: "1" },
    { input: "[4,1,2,1,2]", output: "4" },
  ],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "singleNumber",
      typescript: "singleNumber",
      python: "single_number",
      ruby: "single_number",
      php: "singleNumber",
      java: "singleNumber",
      go: "singleNumber",
      cpp: "singleNumber",
      csharp: "SingleNumber",
      rust: "single_number",
    },
  },
  testCases: [
    { id: 1, name: "Beispiel", input: "[2,2,1]", expected: "1" },
    { id: 2, name: "Mitte", input: "[4,1,2,1,2]", expected: "4" },
    { id: 3, name: "Ein Element", input: "[1]", expected: "1" },
    { id: 4, name: "Negative", input: "[-3,5,-3,7,7]", expected: "5" },
    { id: 5, name: "Vorne", input: "[9,3,3,8,8,6,6]", expected: "9" },
    { id: 6, name: "Negativ allein", input: "[0,0,-1,4,4]", expected: "-1" },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
};
