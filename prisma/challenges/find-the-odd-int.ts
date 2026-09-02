import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: "function findOdd(arr) {\n  // Your solution here\n  return 0;\n}",
  typescript: "function findOdd(arr: number[]): number {\n  // Your solution here\n  return 0;\n}",
  python: "def find_odd(arr):\n    # Your solution here\n    return 0\n",
  php: "<?php\n\nfunction findOdd($arr) {\n    // Your solution here\n    return 0;\n}\n",
  ruby: "def find_odd(arr)\n  # Your solution here\n  0\nend\n",
  java: "static int findOdd(int[] arr) {\n    // Your solution here\n    return 0;\n}\n",
  go: "func findOdd(arr []int) int {\n\t// Your solution here\n\treturn 0\n}\n",
  cpp: "int findOdd(vector<int> arr) {\n    // Your solution here\n    return 0;\n}\n",
  csharp: "static int FindOdd(int[] arr) {\n    // Your solution here\n    return 0;\n}\n",
  rust: "fn find_odd(arr: Vec<i64>) -> i64 {\n    // Your solution here\n    0\n}\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-find-the-odd-int",
  title: "Find the Odd Int",
  description:
    "Implementiere findOdd(arr).\n\n" +
    "In arr kommt genau eine Zahl ungerade oft vor – einmal, dreimal, fünfmal. Alle anderen " +
    "Zahlen kommen gerade oft vor. Gib die Zahl mit der ungeraden Anzahl zurück. Das Array " +
    "ist nie leer, die Werte können negativ sein, und die Vorkommen einer Zahl stehen nicht " +
    "zwangsläufig nebeneinander.\n\n" +
    "Die Aufgabe ist Zählen mit einer Map – und dann die richtige Frage an die Zähler: nicht " +
    "„gleich 1“, sondern „ungerade“. Wer Single Number kennt, ahnt, dass es auch ohne Map " +
    "geht; das ist hier die Zugabe, nicht die Aufgabe.",
  difficulty: "easy",
  points: 100,
  categoryId: CATEGORY.algorithmen,
  hints: [
    {
      title: "Die Idee",
      body:
        "Zähle in einer Map, wie oft jede Zahl vorkommt. Die Antwort ist der Schlüssel, dessen " +
        "Zähler ungerade ist – und ungerade heißt 1, 3, 5, …, nicht nur 1. Zwei Durchläufe, " +
        "O(n).",
    },
    {
      title: "Die Umsetzung",
      body:
        "Ein Durchlauf über arr, in dem du den Zähler jeder Zahl um eins erhöhst. Ein zweiter " +
        "über die Map, in dem du den Eintrag mit count % 2 === 1 zurückgibst. Ohne Map geht es " +
        "auch: Alle Zahlen mit ^ verknüpfen – Paare löschen sich aus, von drei gleichen bleibt " +
        "eines stehen. Dieselbe Idee wie bei Single Number, nur dass hier „ungerade“ statt " +
        "„genau einmal“ genügt.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Wer die Zahl 0 sucht und mit „falsy“ arbeitet, übersieht sie: In [0,1,0,1,0] ist 0 " +
        "das Ergebnis, und if (result) schlägt fehl, obwohl result stimmt. Prüfe auf den " +
        "Zähler, nicht auf den Wert.\n\n" +
        "Ungerade heißt nicht „einmal“. In [0,1,0,1,0] kommt die 0 dreimal vor und ist trotzdem " +
        "die Antwort – wer nur nach count === 1 sucht, findet sie nicht. Gefragt ist " +
        "count % 2 === 1. Umgekehrt steht in [1,2,2,3,3,3,4,3,3,3,2,2,1] die 3 sechsmal, also " +
        "gerade, und fällt heraus.\n\n" +
        "Ein Array mit einem Element ist bereits die Antwort, auch wenn dieses Element 0 ist. " +
        "Negative Zahlen sind gewöhnliche Schlüssel und gewöhnliche XOR-Operanden.",
    },
  ],
  examples: [
    { input: "[1,1,2]", output: "2" },
    { input: "[0,1,0,1,0]", output: "0" },
  ],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "findOdd",
      typescript: "findOdd",
      python: "find_odd",
      ruby: "find_odd",
      php: "findOdd",
      java: "findOdd",
      go: "findOdd",
      cpp: "findOdd",
      csharp: "FindOdd",
      rust: "find_odd",
    },
  },
  testCases: [
    { id: 1, name: "Ein Element", input: "[7]", expected: "7" },
    { id: 2, name: "Null allein", input: "[0]", expected: "0" },
    { id: 3, name: "Beispiel", input: "[1,1,2]", expected: "2" },
    { id: 4, name: "Null dreimal", input: "[0,1,0,1,0]", expected: "0" },
    { id: 5, name: "Mehrfach verstreut", input: "[1,2,2,3,3,3,4,3,3,3,2,2,1]", expected: "4" },
    {
      id: 6,
      name: "Negative",
      input: "[20,1,-1,2,-2,3,3,5,5,1,2,4,20,4,-1,-2,5]",
      expected: "5",
    },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
};
