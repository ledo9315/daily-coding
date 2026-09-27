import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: "function isValidSudoku(board) {\n  // Your solution here\n  return false;\n}",
  typescript:
    "function isValidSudoku(board: string[]): boolean {\n  // Your solution here\n  return false;\n}",
  python: "def is_valid_sudoku(board):\n    # Your solution here\n    return False\n",
  php: "<?php\n\nfunction isValidSudoku($board) {\n    // Your solution here\n    return false;\n}\n",
  ruby: "def is_valid_sudoku(board)\n  # Your solution here\n  false\nend\n",
  java: "static boolean isValidSudoku(String[] board) {\n    // Your solution here\n    return false;\n}\n",
  go: "func isValidSudoku(board []string) bool {\n\t// Your solution here\n\treturn false\n}\n",
  cpp: "bool isValidSudoku(vector<string> board) {\n    // Your solution here\n    return false;\n}\n",
  csharp: "static bool IsValidSudoku(string[] board) {\n    // Your solution here\n    return false;\n}\n",
  rust: "fn is_valid_sudoku(board: Vec<String>) -> bool {\n    // Your solution here\n    false\n}\n",
  swift: "func isValidSudoku(_ board: [String]) -> Bool {\n    // Your solution here\n    return false\n}\n",
};

const EMPTY = '"........."';
const emptyRows = (count: number) => Array(count).fill(EMPTY).join(",");

const EXAMPLE =
  '["53..7....","6..195...",".98....6.","8...6...3","4..8.3..1","7...2...6",".6....28.","...419..5","....8..79"]';
const SOLVED =
  '["534678912","672195348","198342567","859761423","426853791","713924856","961537284","287419635","345286179"]';

export const challenge: ChallengeContent = {
  id: "challenge-valid-sudoku",
  title: "Valid Sudoku",
  description:
    "Implementiere isValidSudoku(board).\n\n" +
    "Das Brett ist ein Array aus neun Strings mit je neun Zeichen: eine Ziffer von 1 bis 9 " +
    "für ein ausgefülltes Feld, ein Punkt für ein leeres. Gib true zurück, wenn der bisherige " +
    "Stand keine Regel verletzt:\n\n" +
    "Keine Ziffer kommt in einer Zeile doppelt vor.\n" +
    "Keine Ziffer kommt in einer Spalte doppelt vor.\n" +
    "Keine Ziffer kommt in einem der neun 3×3-Blöcke doppelt vor.\n\n" +
    "Nur die ausgefüllten Felder zählen. Ob sich das Sudoku zu Ende lösen lässt, spielt keine " +
    "Rolle: Ein leeres Brett ist gültig.\n\n" +
    "Die Aufgabe ist weniger ein Algorithmus als eine Frage der Buchführung. Wer die richtigen " +
    "Mengen anlegt, schafft es in einem einzigen Durchlauf über die 81 Felder.",
  difficulty: "medium",
  points: 150,
  categoryId: CATEGORY.datenstrukturen,
  hints: [
    {
      title: "Die Idee",
      body:
        "Es gibt 27 Einheiten, die jede Ziffer höchstens einmal enthalten dürfen: neun Zeilen, " +
        "neun Spalten, neun Blöcke. Jedes Feld gehört zu genau einer von jeder Sorte. Führe pro " +
        "Einheit eine Menge der schon gesehenen Ziffern, dann ist ein Verstoß nichts anderes als " +
        "eine Ziffer, die schon in der Menge steht.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Lege neun Mengen für die Zeilen, neun für die Spalten und neun für die Blöcke an. " +
        "Laufe über r und c von 0 bis 8, überspringe Punkte und berechne den Block als " +
        "(r / 3) * 3 + c / 3 mit ganzzahliger Division. Steht die Ziffer schon in rows[r], " +
        "cols[c] oder boxes[b], gib false zurück, sonst trage sie in alle drei ein. Kommst du " +
        "durch, ist das Brett gültig.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Die Blocknummer. r / 3 und c / 3 müssen ganzzahlig geteilt werden, sonst landet jedes " +
        "Feld in einem eigenen Block. In JavaScript heißt das Math.floor, in Python //.\n\n" +
        "Den Punkt mitzählen. Leere Felder sind keine Ziffer, und zwei Punkte in einer Zeile " +
        "sind kein Verstoß.\n\n" +
        "Zu viel prüfen. Gefragt ist nur, ob die Regeln bisher eingehalten sind, nicht ob das " +
        "Rätsel eine Lösung hat. Ein Backtracking-Löser ist hier Arbeit ohne Nutzen.",
    },
  ],
  examples: [
    {
      input:
        '["53..7....",\n "6..195...",\n ".98....6.",\n "8...6...3",\n "4..8.3..1",\n' +
        ' "7...2...6",\n ".6....28.",\n "...419..5",\n "....8..79"]',
      output: "true",
    },
  ],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "isValidSudoku",
      typescript: "isValidSudoku",
      python: "is_valid_sudoku",
      ruby: "is_valid_sudoku",
      php: "isValidSudoku",
      java: "isValidSudoku",
      go: "isValidSudoku",
      cpp: "isValidSudoku",
      csharp: "IsValidSudoku",
      rust: "is_valid_sudoku",
      swift: "isValidSudoku",
    },
  },
  testCases: [
    { id: 1, name: "Beispiel", input: EXAMPLE, expected: "true" },
    {
      id: 2,
      name: "Eine Acht zu viel",
      input: EXAMPLE.replace('"53..7...."', '"83..7...."'),
      expected: "false",
    },
    { id: 3, name: "Leeres Brett", input: `[${emptyRows(9)}]`, expected: "true" },
    {
      id: 4,
      name: "Doppelt in der Zeile",
      input: `["5...5....",${emptyRows(8)}]`,
      expected: "false",
    },
    {
      id: 5,
      name: "Doppelt in der Spalte",
      input: `["1........",${emptyRows(4)},"1........",${emptyRows(3)}]`,
      expected: "false",
    },
    {
      id: 6,
      name: "Doppelt im Block",
      input: `["1........",".1.......",${emptyRows(7)}]`,
      expected: "false",
    },
    { id: 7, name: "Gelöst", input: SOLVED, expected: "true" },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
  translations: {
    en: {
      title: "Valid Sudoku",
      description:
        "Implement isValidSudoku(board).\n\n" +
        "The board is an array of nine strings of nine characters each: a digit from 1 to 9 " +
        "for a filled cell, a dot for an empty one. Return true if the current state breaks " +
        "no rule:\n\n" +
        "No digit appears twice in a row.\n" +
        "No digit appears twice in a column.\n" +
        "No digit appears twice in any of the nine 3×3 boxes.\n\n" +
        "Only the filled cells count. Whether the sudoku can be solved to the end does not " +
        "matter: an empty board is valid.\n\n" +
        "The task is less an algorithm than a question of bookkeeping. Whoever sets up the " +
        "right sets gets through in a single pass over the 81 cells.",
      hints: [
        {
          title: "The idea",
          body:
            "There are 27 units that may each contain every digit at most once: nine rows, " +
            "nine columns, nine boxes. Every cell belongs to exactly one of each kind. Keep a " +
            "set of the digits seen so far per unit, and a violation is nothing more than a " +
            "digit that is already in the set.",
        },
        {
          title: "The implementation",
          body:
            "Set up nine sets for the rows, nine for the columns and nine for the boxes. Go " +
            "over r and c from 0 to 8, skip dots and work out the box as (r / 3) * 3 + c / 3 " +
            "with integer division. If the digit is already in rows[r], cols[c] or boxes[b], " +
            "return false, otherwise add it to all three. If you get through, the board is " +
            "valid.",
        },
        {
          title: "Where most people go wrong",
          body:
            "The box number. r / 3 and c / 3 have to be divided as integers, otherwise every " +
            "cell ends up in a box of its own. In JavaScript that means Math.floor, in Python " +
            "//.\n\n" +
            "Counting the dot. Empty cells are not a digit, and two dots in a row are not a " +
            "violation.\n\n" +
            "Checking too much. The question is only whether the rules have been kept so far, " +
            "not whether the puzzle has a solution. A backtracking solver is work without any " +
            "benefit here.",
        },
      ],
      testCaseNames: {
        "1": "Example",
        "2": "One eight too many",
        "3": "Empty board",
        "4": "Twice in a row",
        "5": "Twice in a column",
        "6": "Twice in a box",
        "7": "Solved",
      },
    },
  },
};
