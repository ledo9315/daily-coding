import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: "function numIslands(grid) {\n  // Your solution here\n  return 0;\n}",
  typescript: "function numIslands(grid: string[]): number {\n  // Your solution here\n  return 0;\n}",
  python: "def num_islands(grid):\n    # Your solution here\n    return 0\n",
  php: "<?php\n\nfunction numIslands($grid) {\n    // Your solution here\n    return 0;\n}\n",
  ruby: "def num_islands(grid)\n  # Your solution here\n  0\nend\n",
  java: "static int numIslands(String[] grid) {\n    // Your solution here\n    return 0;\n}\n",
  go: "func numIslands(grid []string) int {\n\t// Your solution here\n\treturn 0\n}\n",
  cpp: "int numIslands(vector<string> grid) {\n    // Your solution here\n    return 0;\n}\n",
  csharp: "static int NumIslands(string[] grid) {\n    // Your solution here\n    return 0;\n}\n",
  rust: "fn num_islands(grid: Vec<String>) -> i64 {\n    // Your solution here\n    0\n}\n",
  swift: "func numIslands(_ grid: [String]) -> Int {\n    // Your solution here\n    return 0\n}\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-number-of-islands",
  title: "Number of Islands",
  description:
    "Implementiere numIslands(grid).\n\n" +
    "Das Gitter ist eine Karte: ein Array von Zeilen gleicher Länge, jede ein String aus " +
    "„1“ für Land und „0“ für Wasser. Eine Insel ist eine zusammenhängende Fläche aus Land, " +
    "wobei nur waagerechte und senkrechte Nachbarn zusammenhängen, keine diagonalen. Gib " +
    "zurück, wie viele Inseln auf der Karte liegen.\n\n" +
    '["11000",\n "11000",\n "00100",\n "00011"] → 3\n\n' +
    "Alles außerhalb des Gitters gilt als Wasser. Die Karte hat mindestens eine Zeile.\n\n" +
    "Eine der bekanntesten Aufgaben zu Graphen, obwohl kein Graph in Sicht ist: Jede Zelle " +
    "ist ein Knoten, jeder Nachbar eine Kante.",
  difficulty: "medium",
  points: 150,
  categoryId: CATEGORY.algorithmen,
  hints: [
    {
      title: "Die Idee",
      body:
        "Laufe Zelle für Zelle über die Karte. Triffst du auf Land, das du noch nicht kennst, " +
        "hast du eine neue Insel gefunden. Bevor du weitergehst, markierst du die ganze Insel " +
        "als besucht, sodass keines ihrer Felder später noch einmal als neue Insel zählt. Das " +
        "nennt sich Flood Fill.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Wandle die Zeilen in veränderbare Zeichen-Arrays um oder führe ein zweites Gitter mit " +
        "besuchten Feldern. Bei jedem unbesuchten „1“ erhöhst du den Zähler und startest eine " +
        "Tiefensuche: Feld markieren, dann die vier Nachbarn oben, unten, links und rechts " +
        "prüfen und bei Land dort weitermachen. Mit einem Stack oder einer Queue statt Rekursion " +
        "geht es genauso.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Diagonalen. [\"101\",\"010\",\"101\"] sind fünf Inseln, nicht eine: Felder, die sich " +
        "nur an der Ecke berühren, hängen nicht zusammen.\n\n" +
        "Grenzen prüfen, bevor du zugreifst. Der Nachbar links von Spalte 0 existiert nicht, " +
        "und in vielen Sprachen ist ein Zugriff dort ein Absturz statt Wasser.\n\n" +
        "Strings sind in den meisten Sprachen unveränderlich. Wer ein Feld markieren will, " +
        "indem er ein Zeichen im String überschreibt, braucht eine Kopie als Array. Und wer " +
        "nur zeilenweise vergleicht, statt der Insel wirklich zu folgen, zählt eine U-förmige " +
        "Insel doppelt.",
    },
  ],
  examples: [
    { input: '["11110","11010","11000","00000"]', output: "1" },
    { input: '["11000","11000","00100","00011"]', output: "3" },
  ],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "numIslands",
      typescript: "numIslands",
      python: "num_islands",
      ruby: "num_islands",
      php: "numIslands",
      java: "numIslands",
      go: "numIslands",
      cpp: "numIslands",
      csharp: "NumIslands",
      rust: "num_islands",
      swift: "numIslands",
    },
  },
  testCases: [
    { id: 1, name: "Eine große Insel", input: '["11110","11010","11000","00000"]', expected: "1" },
    { id: 2, name: "Drei Inseln", input: '["11000","11000","00100","00011"]', expected: "3" },
    { id: 3, name: "Nur Wasser", input: '["000","000"]', expected: "0" },
    { id: 4, name: "Diagonalen", input: '["101","010","101"]', expected: "5" },
    { id: 5, name: "Nur Land", input: '["111","111"]', expected: "1" },
    { id: 6, name: "Eine Zeile", input: '["1011011"]', expected: "3" },
    {
      id: 7,
      name: "Spirale",
      input: '["11111","00001","11101","10001","11111"]',
      expected: "1",
    },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
  translations: {
    en: {
      title: "Number of Islands",
      description:
        "Implement numIslands(grid).\n\n" +
        'The grid is a map: an array of rows of equal length, each a string of "1" for land ' +
        'and "0" for water. An island is a connected area of land, where only horizontal and ' +
        "vertical neighbours connect, not diagonal ones. Return how many islands there are " +
        "on the map.\n\n" +
        '["11000",\n "11000",\n "00100",\n "00011"] → 3\n\n' +
        "Everything outside the grid counts as water. The map has at least one row.\n\n" +
        "One of the best-known graph problems, even though there is no graph in sight: every " +
        "cell is a node, every neighbour an edge.",
      hints: [
        {
          title: "The idea",
          body:
            "Walk over the map cell by cell. When you hit land you do not know yet, you have " +
            "found a new island. Before moving on, mark the whole island as visited, so that " +
            "none of its cells counts as a new island later. This is called flood fill.",
        },
        {
          title: "The implementation",
          body:
            "Turn the rows into mutable character arrays or keep a second grid of visited " +
            'cells. At every unvisited "1", increase the counter and start a depth-first ' +
            "search: mark the cell, then check the four neighbours above, below, left and " +
            "right, and carry on wherever there is land. A stack or a queue instead of " +
            "recursion works just as well.",
        },
        {
          title: "Where most people go wrong",
          body:
            'Diagonals. ["101","010","101"] are five islands, not one: cells that only touch ' +
            "at a corner are not connected.\n\n" +
            "Check bounds before you access. The neighbour to the left of column 0 does not " +
            "exist, and in many languages an access there is a crash rather than water.\n\n" +
            "Strings are immutable in most languages. Whoever wants to mark a cell by " +
            "overwriting a character in the string needs a copy as an array. And whoever only " +
            "compares row by row instead of really following the island counts a U-shaped " +
            "island twice.",
        },
      ],
      testCaseNames: {
        "1": "One big island",
        "2": "Three islands",
        "3": "Only water",
        "4": "Diagonals",
        "5": "Only land",
        "6": "A single row",
        "7": "Spiral",
      },
    },
  },
};
