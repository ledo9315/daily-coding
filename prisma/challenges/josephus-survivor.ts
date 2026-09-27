import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript:
    "function josephusSurvivor(data) {\n  const { n, k } = data;\n  // Your solution here\n  return 0;\n}",
  typescript:
    "function josephusSurvivor(data: { n: number; k: number }): number {\n  const { n, k } = data;\n  // Your solution here\n  return 0;\n}",
  python:
    'def josephus_survivor(data):\n    n, k = data["n"], data["k"]\n    # Your solution here\n    return 0\n',
  php: "<?php\n\nfunction josephusSurvivor($data) {\n    $n = $data['n'];\n    $k = $data['k'];\n    // Your solution here\n    return 0;\n}\n",
  ruby: "def josephus_survivor(data)\n  n, k = data['n'], data['k']\n  # Your solution here\n  0\nend\n",
  java: "static int josephusSurvivor(int n, int k) {\n    // Your solution here\n    return 0;\n}\n",
  go: "func josephusSurvivor(n int, k int) int {\n\t// Your solution here\n\treturn 0\n}\n",
  cpp: "int josephusSurvivor(int n, int k) {\n    // Your solution here\n    return 0;\n}\n",
  csharp: "static int JosephusSurvivor(int n, int k) {\n    // Your solution here\n    return 0;\n}\n",
  rust: "fn josephus_survivor(n: i64, k: i64) -> i64 {\n    // Your solution here\n    0\n}\n",
  swift: "func josephusSurvivor(n: Int, k: Int) -> Int {\n    // Your solution here\n    return 0\n}\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-josephus-survivor",
  title: "Josephus Survivor",
  description:
    "Implementiere josephusSurvivor(data) mit data = { n, k }.\n\n" +
    "n Personen stehen im Kreis, nummeriert von 1 bis n. Beginnend bei Person 1 wird gezählt, " +
    "und wer als k-ter an der Reihe ist, scheidet aus. Beim Nächsten beginnt die Zählung von " +
    "vorn, immer weiter im Kreis, bis nur noch eine Person übrig ist. Gib ihre Nummer zurück.\n\n" +
    "Bei n = 7 und k = 3 scheiden der Reihe nach 3, 6, 2, 7, 5 und 1 aus, übrig bleibt 4.\n\n" +
    "n und k sind mindestens 1, und k darf größer sein als n. Das Problem ist fast zweitausend " +
    "Jahre alt. Simulieren genügt, aber es gibt eine Formel, die ohne jede Liste auskommt.",
  difficulty: "easy",
  points: 120,
  categoryId: CATEGORY.algorithmen,
  hints: [
    {
      title: "Die Idee",
      body:
        "Stell den Kreis als Liste dar und merke dir, wo gerade gezählt wird. Von dort aus ist " +
        "der k-te der Platz (i + k - 1) modulo der aktuellen Länge. Wer dort steht, fliegt raus, " +
        "und die Zählung beginnt beim Nachrücker auf demselben Platz.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Fülle eine Liste mit 1 bis n und setze i = 0. Solange mehr als ein Element drin ist: " +
        "i = (i + k - 1) % Länge, entferne das Element an Position i. Am Ende steht die Antwort " +
        "als einziges Element in der Liste.\n\n" +
        "Ohne Liste geht es mit der Rekursion J(1) = 0, J(m) = (J(m - 1) + k) % m für m von 2 " +
        "bis n. Das Ergebnis ist nullbasiert, die gesuchte Nummer also J(n) + 1.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Nach dem Entfernen den Index noch einmal weiterschieben. Der Nachrücker steht schon " +
        "auf Platz i und ist der Erste der neuen Zählung, darum steht in der Formel k - 1.\n\n" +
        "Die Nummerierung beginnt bei 1, Listen bei 0. Wer die Formel nimmt und das + 1 " +
        "vergisst, liegt bei jedem Test um genau eins daneben.\n\n" +
        "k größer als die Zahl der Übrigen: Ohne Modulo läufst du aus der Liste. Bei n = 5 und " +
        "k = 300 wird mehrfach im Kreis gezählt, übrig bleibt 1.",
    },
  ],
  examples: [
    { input: '{ "n": 7, "k": 3 }', output: "4" },
    { input: '{ "n": 11, "k": 19 }', output: "10" },
  ],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "josephusSurvivor",
      typescript: "josephusSurvivor",
      python: "josephus_survivor",
      ruby: "josephus_survivor",
      php: "josephusSurvivor",
      java: "josephusSurvivor",
      go: "josephusSurvivor",
      cpp: "josephusSurvivor",
      csharp: "JosephusSurvivor",
      rust: "josephus_survivor",
      swift: "josephusSurvivor",
    },
  },
  testCases: [
    { id: 1, name: "Beispiel", input: '{"n":7,"k":3}', expected: "4" },
    { id: 2, name: "k größer als n", input: '{"n":11,"k":19}', expected: "10" },
    { id: 3, name: "Allein im Kreis", input: '{"n":1,"k":300}', expected: "1" },
    { id: 4, name: "Jeder Zweite", input: '{"n":14,"k":2}', expected: "13" },
    { id: 5, name: "k gleich 1", input: '{"n":100,"k":1}', expected: "100" },
    { id: 6, name: "Viele Runden", input: '{"n":5,"k":300}', expected: "1" },
    { id: 7, name: "Die Legende", input: '{"n":40,"k":3}', expected: "28" },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
  translations: {
    en: {
      title: "Josephus Survivor",
      description:
        "Implement josephusSurvivor(data) with data = { n, k }.\n\n" +
        "n people stand in a circle, numbered 1 to n. Counting starts at person 1, and whoever " +
        "is the k-th in line drops out. Counting starts over with the next one, round and " +
        "round the circle, until only one person is left. Return that person's number.\n\n" +
        "With n = 7 and k = 3, the people dropping out are 3, 6, 2, 7, 5 and 1 in that order, " +
        "and 4 is left.\n\n" +
        "n and k are at least 1, and k may be larger than n. The problem is almost two thousand " +
        "years old. Simulating it is enough, but there is a formula that needs no list at all.",
      hints: [
        {
          title: "The idea",
          body:
            "Represent the circle as a list and remember where the count currently stands. " +
            "From there, the k-th is the slot (i + k - 1) modulo the current length. Whoever " +
            "stands there is out, and counting starts with the one moving up into that same " +
            "slot.",
        },
        {
          title: "The implementation",
          body:
            "Fill a list with 1 to n and set i = 0. While there is more than one element left: " +
            "i = (i + k - 1) % length, remove the element at position i. At the end, the " +
            "answer is the only element in the list.\n\n" +
            "Without a list, use the recurrence J(1) = 0, J(m) = (J(m - 1) + k) % m for m from " +
            "2 to n. The result is zero-based, so the number you want is J(n) + 1.",
        },
        {
          title: "Where most people go wrong",
          body:
            "Moving the index on once more after removing. The one moving up is already in " +
            "slot i and is the first of the new count, which is why the formula says k - 1.\n\n" +
            "Numbering starts at 1, lists at 0. Whoever uses the formula and forgets the + 1 " +
            "is off by exactly one on every test.\n\n" +
            "k larger than the number left: without the modulo you run off the end of the " +
            "list. With n = 5 and k = 300 the count goes round the circle many times, and 1 " +
            "is left.",
        },
      ],
      testCaseNames: {
        "1": "Example",
        "2": "k larger than n",
        "3": "Alone in the circle",
        "4": "Every second one",
        "5": "k equals 1",
        "6": "Many rounds",
        "7": "The legend",
      },
    },
  },
};
