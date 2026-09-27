import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: "function totalNQueens(n) {\n  // Your solution here\n  return 0;\n}",
  typescript: "function totalNQueens(n: number): number {\n  // Your solution here\n  return 0;\n}",
  python: "def total_n_queens(n):\n    # Your solution here\n    return 0\n",
  php: "<?php\n\nfunction totalNQueens($n) {\n    // Your solution here\n    return 0;\n}\n",
  ruby: "def total_n_queens(n)\n  # Your solution here\n  0\nend\n",
  java: "static int totalNQueens(int n) {\n    // Your solution here\n    return 0;\n}\n",
  go: "func totalNQueens(n int) int {\n\t// Your solution here\n\treturn 0\n}\n",
  cpp: "int totalNQueens(int n) {\n    // Your solution here\n    return 0;\n}\n",
  csharp: "static int TotalNQueens(int n) {\n    // Your solution here\n    return 0;\n}\n",
  rust: "fn total_n_queens(n: i64) -> i64 {\n    // Your solution here\n    0\n}\n",
  swift: "func totalNQueens(_ n: Int) -> Int {\n    // Your solution here\n    return 0\n}\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-n-queens",
  title: "N-Queens",
  description:
    "Implementiere totalNQueens(n).\n\n" +
    "Auf einem Schachbrett mit n × n Feldern sollen n Damen so stehen, dass keine eine andere " +
    "schlagen kann: keine zwei in derselben Zeile, derselben Spalte oder auf derselben " +
    "Diagonale. Gib zurück, wie viele verschiedene solche Aufstellungen es gibt.\n\n" +
    "Für n = 4 sind es zwei, für das normale Schachbrett mit n = 8 sind es 92. Für n = 2 und " +
    "n = 3 gibt es keine einzige. n liegt zwischen 1 und 10.\n\n" +
    "Das klassische Beispiel für Backtracking: Setze eine Dame nach der anderen und nimm sie " +
    "zurück, sobald klar ist, dass es von hier aus nicht weitergeht. Schwer ist nicht die " +
    "Idee, sondern die Buchführung darüber, welche Felder noch frei sind.",
  difficulty: "hard",
  points: 200,
  categoryId: CATEGORY.algorithmen,
  hints: [
    {
      title: "Die Idee",
      body:
        "In jeder Zeile steht genau eine Dame, also kannst du Zeile für Zeile vorgehen und nur " +
        "noch die Spalte wählen. Probiere in Zeile r jede Spalte, die von keiner Dame darüber " +
        "angegriffen wird, und steige in Zeile r + 1 ab. Erreichst du Zeile n, hast du eine " +
        "Aufstellung gefunden. Geht es nicht weiter, kehrst du zurück und probierst die nächste " +
        "Spalte.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Führe drei Mengen: belegte Spalten, belegte Diagonalen und belegte Gegendiagonalen. " +
        "Auf einer Diagonale ist r - c konstant, auf einer Gegendiagonale r + c. Eine Spalte c " +
        "ist in Zeile r frei, wenn weder c noch r - c noch r + c belegt sind. Trage alle drei " +
        "ein, rufe die Funktion für r + 1 auf und nimm die Einträge danach wieder heraus. Die " +
        "Funktion gibt die Summe der Treffer aus allen Zweigen zurück.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Nur eine der beiden Diagonalen prüfen. Die Damen schlagen in beide Richtungen, und " +
        "wer r + c vergisst, zählt bei n = 4 mehr als zwei Lösungen.\n\n" +
        "Das Zurücknehmen. Wer nach dem rekursiven Aufruf die Spalte und die Diagonalen nicht " +
        "wieder freigibt, blockiert Felder für alle späteren Versuche und findet zu wenig.\n\n" +
        "Das ganze Brett nach jedem Zug neu durchsuchen. Das funktioniert, macht jeden Schritt " +
        "aber um den Faktor n langsamer. Mit den drei Mengen ist die Prüfung ein einziger " +
        "Nachschlag.",
    },
  ],
  examples: [
    { input: "4", output: "2" },
    { input: "8", output: "92" },
  ],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "totalNQueens",
      typescript: "totalNQueens",
      python: "total_n_queens",
      ruby: "total_n_queens",
      php: "totalNQueens",
      java: "totalNQueens",
      go: "totalNQueens",
      cpp: "totalNQueens",
      csharp: "TotalNQueens",
      rust: "total_n_queens",
      swift: "totalNQueens",
    },
  },
  testCases: [
    { id: 1, name: "Eine Dame", input: "1", expected: "1" },
    { id: 2, name: "Zwei Damen", input: "2", expected: "0" },
    { id: 3, name: "Drei Damen", input: "3", expected: "0" },
    { id: 4, name: "Beispiel", input: "4", expected: "2" },
    { id: 5, name: "Fünf Damen", input: "5", expected: "10" },
    { id: 6, name: "Sechs Damen", input: "6", expected: "4" },
    { id: 7, name: "Schachbrett", input: "8", expected: "92" },
    { id: 8, name: "Zehn Damen", input: "10", expected: "724" },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
  translations: {
    en: {
      title: "N-Queens",
      description:
        "Implement totalNQueens(n).\n\n" +
        "On a chessboard of n × n squares, n queens are to be placed so that none can take " +
        "another: no two in the same row, the same column or on the same diagonal. Return " +
        "how many different such placements there are.\n\n" +
        "For n = 4 there are two, for the ordinary chessboard with n = 8 there are 92. For " +
        "n = 2 and n = 3 there is not a single one. n is between 1 and 10.\n\n" +
        "The classic example of backtracking: place one queen after the other and take it " +
        "back as soon as it is clear that there is no way on from here. The hard part is not " +
        "the idea, but keeping track of which squares are still free.",
      hints: [
        {
          title: "The idea",
          body:
            "Every row holds exactly one queen, so you can go row by row and only choose the " +
            "column. In row r, try every column that no queen above attacks, and descend into " +
            "row r + 1. If you reach row n, you have found a placement. If there is no way on, " +
            "go back and try the next column.",
        },
        {
          title: "The implementation",
          body:
            "Keep three sets: occupied columns, occupied diagonals and occupied " +
            "anti-diagonals. On a diagonal r - c is constant, on an anti-diagonal r + c. A " +
            "column c is free in row r if neither c nor r - c nor r + c is occupied. Add all " +
            "three, call the function for r + 1 and remove the entries again afterwards. The " +
            "function returns the sum of the hits from all branches.",
        },
        {
          title: "Where most people go wrong",
          body:
            "Checking only one of the two diagonals. Queens attack in both directions, and " +
            "whoever forgets r + c counts more than two solutions for n = 4.\n\n" +
            "Taking back. Whoever does not free the column and the diagonals again after the " +
            "recursive call blocks squares for every later attempt and finds too few.\n\n" +
            "Searching the whole board again after every move. It works, but makes every " +
            "step slower by a factor of n. With the three sets, the check is a single lookup.",
        },
      ],
      testCaseNames: {
        "1": "One queen",
        "2": "Two queens",
        "3": "Three queens",
        "4": "Example",
        "5": "Five queens",
        "6": "Six queens",
        "7": "Chessboard",
        "8": "Ten queens",
      },
    },
  },
};
