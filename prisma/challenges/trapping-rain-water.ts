import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: "function trap(height) {\n  // Your solution here\n  return 0;\n}",
  typescript: "function trap(height: number[]): number {\n  // Your solution here\n  return 0;\n}",
  python: "def trap(height):\n    # Your solution here\n    return 0\n",
  php: "<?php\n\nfunction trap($height) {\n    // Your solution here\n    return 0;\n}\n",
  ruby: "def trap(height)\n  # Your solution here\n  0\nend\n",
  java: "static int trap(int[] height) {\n    // Your solution here\n    return 0;\n}\n",
  go: "func trap(height []int) int {\n\t// Your solution here\n\treturn 0\n}\n",
  cpp: "int trap(vector<int> height) {\n    // Your solution here\n    return 0;\n}\n",
  csharp: "static int Trap(int[] height) {\n    // Your solution here\n    return 0;\n}\n",
  rust: "fn trap(height: Vec<i64>) -> i64 {\n    // Your solution here\n    0\n}\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-trapping-rain-water",
  title: "Trapping Rain Water",
  description:
    "Implementiere trap(height).\n\n" +
    "height ist ein Höhenprofil: height[i] ist die Höhe der Säule an Position i, jede Säule " +
    "ist 1 breit. Gib zurück, wie viele Einheiten Wasser nach einem Regen zwischen den Säulen " +
    "stehen bleiben. Bei [0,1,0,2,1,0,1,3,2,1,2,1] sind es 6.\n\n" +
    "Ein leeres oder durchgehend steigendes Profil hält kein Wasser. Wasser steht nur dort, wo " +
    "es links und rechts eine höhere Wand gibt – die Frage ist, wie hoch es an jeder Stelle " +
    "steigt.\n\n" +
    "Für jede Position beide Maxima zu suchen funktioniert und kostet O(n²). Die Aufgabe " +
    "zielt auf einen Durchlauf mit zwei Zeigern, die von außen nach innen laufen – oder auf " +
    "zwei Hilfsarrays, wenn du es dir erst einmal einfacher machen willst.",
  difficulty: "hard",
  points: 200,
  categoryId: CATEGORY.algorithmen,
  hints: [
    {
      title: "Die Idee",
      body:
        "Für eine Position i zählt nur eins: die höchste Säule irgendwo links (maxLeft) und " +
        "die höchste irgendwo rechts (maxRight). Der Wasserstand über i ist " +
        "min(maxLeft, maxRight) - height[i]; ist das negativ, steht dort nichts. Alles andere " +
        "ist Buchhaltung, wie du diese beiden Maxima günstig bekommst.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Zwei Zeiger, left am Anfang und right am Ende, dazu maxLeft und maxRight, beide 0. " +
        "Solange left < right: Ist height[left] kleiner als height[right], ist die linke Seite " +
        "die begrenzende – aktualisiere maxLeft mit height[left], addiere " +
        "maxLeft - height[left] zum Wasser und schiebe left nach rechts. Sonst dasselbe " +
        "spiegelverkehrt mit right. Am Ende ist die Summe das Ergebnis.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Der Trick der zwei Zeiger ist, dass du die Seite bewegst, deren Säule niedriger " +
        "ist. Nur dann steht fest, dass ihr Maximum den Wasserstand begrenzt, obwohl du das " +
        "Maximum der anderen Seite noch gar nicht vollständig kennst. Wer immer dieselbe " +
        "Seite bewegt, rechnet mit einem falschen Wasserstand.\n\n" +
        "Erst das Maximum aktualisieren, dann das Wasser addieren – sonst wird der Beitrag " +
        "bei einer neuen höchsten Säule negativ.\n\n" +
        "Ein leeres Array ergibt 0. In Sprachen mit vorzeichenlosen Längen ist len - 1 dann " +
        "kein -1, sondern eine riesige Zahl – fang den Fall vorher ab.",
    },
  ],
  examples: [{ input: "[0,1,0,2,1,0,1,3,2,1,2,1]", output: "6" }],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "trap",
      typescript: "trap",
      python: "trap",
      ruby: "trap",
      php: "trap",
      java: "trap",
      go: "trap",
      cpp: "trap",
      csharp: "Trap",
      rust: "trap",
    },
  },
  testCases: [
    { id: 1, name: "Beispiel", input: "[0,1,0,2,1,0,1,3,2,1,2,1]", expected: "6" },
    { id: 2, name: "Tiefes Becken", input: "[4,2,0,3,2,5]", expected: "9" },
    { id: 3, name: "Leer", input: "[]", expected: "0" },
    { id: 4, name: "Monoton steigend", input: "[1,2,3]", expected: "0" },
    { id: 5, name: "Ein Becken", input: "[3,0,3]", expected: "3" },
    { id: 6, name: "Rechte Wand niedriger", input: "[5,4,1,2]", expected: "1" },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
};
