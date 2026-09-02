import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: "function containsDuplicate(nums) {\n  // Your solution here\n  return false;\n}",
  typescript:
    "function containsDuplicate(nums: number[]): boolean {\n  // Your solution here\n  return false;\n}",
  python: "def contains_duplicate(nums):\n    # Your solution here\n    return False\n",
  php: "<?php\n\nfunction containsDuplicate($nums) {\n    // Your solution here\n    return false;\n}\n",
  ruby: "def contains_duplicate(nums)\n  # Your solution here\n  false\nend\n",
  java: "static boolean containsDuplicate(int[] nums) {\n    // Your solution here\n    return false;\n}\n",
  go: "func containsDuplicate(nums []int) bool {\n\t// Your solution here\n\treturn false\n}\n",
  cpp: "bool containsDuplicate(vector<int> nums) {\n    // Your solution here\n    return false;\n}\n",
  csharp: "static bool ContainsDuplicate(int[] nums) {\n    // Your solution here\n    return false;\n}\n",
  rust: "fn contains_duplicate(nums: Vec<i64>) -> bool {\n    // Your solution here\n    false\n}\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-contains-duplicate",
  title: "Contains Duplicate",
  description:
    "Implementiere containsDuplicate(nums).\n\n" +
    "Gib true zurück, wenn irgendein Wert im Array mindestens zweimal vorkommt, sonst false. " +
    "Das Array kann leer sein und negative Zahlen enthalten. Ein leeres Array und ein " +
    "einzelnes Element haben kein Duplikat.\n\n" +
    "Jedes Element mit jedem anderen zu vergleichen funktioniert und kostet O(n²). Die " +
    "Aufgabe zielt auf den einen Durchlauf: Wer sich merkt, was er schon gesehen hat, " +
    "erkennt die Wiederholung genau in dem Moment, in dem sie auftritt.",
  difficulty: "easy",
  points: 100,
  categoryId: CATEGORY.datenstrukturen,
  hints: [
    {
      title: "Die Idee",
      body:
        "Ein Duplikat ist ein Wert, den du vorher schon einmal gesehen hast. Die Frage " +
        "„habe ich diesen Wert schon gesehen“ beantwortet ein Set in einem Schritt – " +
        "unabhängig davon, wie viele Werte schon darin liegen. Damit reicht ein einziger " +
        "Durchlauf.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Lege ein leeres Set an und laufe durch das Array. Steht der aktuelle Wert schon " +
        "im Set, gib sofort true zurück. Steht er nicht darin, trage ihn ein und geh " +
        "weiter. Kommst du am Ende an, ohne fündig geworden zu sein, gib false zurück.\n\n" +
        "Noch kürzer geht es, wenn du das ganze Array in ein Set steckst und die Größen " +
        "vergleichst: Ist das Set kleiner als das Array, ist etwas doppelt.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Das false gehört hinter die Schleife, nicht hinein. Wer beim ersten neuen Wert " +
        "schon false zurückgibt, sieht das Duplikat am Ende nie.\n\n" +
        "Bei einem leeren Array läuft die Schleife kein einziges Mal – das Ergebnis ist " +
        "trotzdem false, nicht ein Fehler oder undefined.\n\n" +
        "Wer stattdessen sortiert und Nachbarn vergleicht, darf i+1 nicht über das Ende " +
        "hinauslaufen lassen. Und -1 und 1 sind verschiedene Werte, auch wenn sie nach " +
        "dem Sortieren nebeneinanderliegen.",
    },
  ],
  examples: [
    { input: "[1,2,3,1]", output: "true" },
    { input: "[1,2,3,4]", output: "false" },
  ],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "containsDuplicate",
      typescript: "containsDuplicate",
      python: "contains_duplicate",
      ruby: "contains_duplicate",
      php: "containsDuplicate",
      java: "containsDuplicate",
      go: "containsDuplicate",
      cpp: "containsDuplicate",
      csharp: "ContainsDuplicate",
      rust: "contains_duplicate",
    },
  },
  testCases: [
    { id: 1, name: "Beispiel", input: "[1,2,3,1]", expected: "true" },
    { id: 2, name: "Alle verschieden", input: "[1,2,3,4]", expected: "false" },
    { id: 3, name: "Leer", input: "[]", expected: "false" },
    { id: 4, name: "Ein Element", input: "[7]", expected: "false" },
    { id: 5, name: "An den Enden", input: "[5,1,2,3,5]", expected: "true" },
    { id: 6, name: "Negative", input: "[-1,2,-3,-1]", expected: "true" },
    { id: 7, name: "Vorzeichen", input: "[-1,1,-2,2]", expected: "false" },
    { id: 8, name: "Viele Duplikate", input: "[1,1,1,3,3,4,3,2,4,2]", expected: "true" },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
};
