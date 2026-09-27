import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: "function nextBigger(n) {\n  // Your solution here\n  return -1;\n}",
  typescript: "function nextBigger(n: number): number {\n  // Your solution here\n  return -1;\n}",
  python: "def next_bigger(n):\n    # Your solution here\n    return -1\n",
  php: "<?php\n\nfunction nextBigger($n) {\n    // Your solution here\n    return -1;\n}\n",
  ruby: "def next_bigger(n)\n  # Your solution here\n  -1\nend\n",
  java: "static int nextBigger(int n) {\n    // Your solution here\n    return -1;\n}\n",
  go: "func nextBigger(n int) int {\n\t// Your solution here\n\treturn -1\n}\n",
  cpp: "int nextBigger(int n) {\n    // Your solution here\n    return -1;\n}\n",
  csharp: "static int NextBigger(int n) {\n    // Your solution here\n    return -1;\n}\n",
  rust: "fn next_bigger(n: i64) -> i64 {\n    // Your solution here\n    -1\n}\n",
  swift: "func nextBigger(_ n: Int) -> Int {\n    // Your solution here\n    return -1\n}\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-next-bigger-number",
  title: "Next Bigger Number",
  description:
    "Implementiere nextBigger(n).\n\n" +
    "Gib die kleinste Zahl zurück, die größer ist als n und aus genau denselben Ziffern " +
    "besteht, nur anders angeordnet. Gibt es keine, gib -1 zurück.\n\n" +
    "12 → 21\n" +
    "513 → 531\n" +
    "2017 → 2071\n" +
    "531 → -1\n\n" +
    "n ist positiv, und das Ergebnis passt in einen 32-Bit-Integer.\n\n" +
    "Alle Anordnungen durchzuprobieren funktioniert bei vier Ziffern und ist bei zehn schon " +
    "hoffnungslos: 3,6 Millionen Permutationen. Dabei steht die Antwort fast vollständig in " +
    "den letzten Ziffern der Zahl.",
  difficulty: "medium",
  points: 150,
  categoryId: CATEGORY.algorithmen,
  hints: [
    {
      title: "Die Idee",
      body:
        "Um eine Zahl möglichst wenig zu vergrößern, änderst du sie so weit rechts wie möglich. " +
        "Ein Endstück, dessen Ziffern von links nach rechts nicht steigen, ist schon die größte " +
        "Anordnung seiner Ziffern. Zu vergrößern ist also die erste Ziffer links davon, der " +
        "Pivot, und zwar um so wenig wie möglich.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Zerlege n in seine Ziffern. Suche von rechts die erste Position i mit d[i] < d[i + 1]. " +
        "Gibt es keine, ist die Antwort -1. Suche dann von rechts die erste Ziffer d[j], die " +
        "größer ist als d[i], und tausche die beiden. Zum Schluss drehst du das Endstück ab " +
        "i + 1 um, damit es so klein wie möglich wird, und setzt die Ziffern wieder zu einer " +
        "Zahl zusammen. Das ist der Algorithmus „Next Permutation“.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Doppelte Ziffern. Beim Suchen des Pivots und des Tauschpartners zählt echt kleiner " +
        "bzw. echt größer. Wer bei 1232 auch Gleichheit zulässt, tauscht die beiden Zweien und " +
        "landet bei 1223, einer kleineren Zahl statt 1322.\n\n" +
        "Das Endstück sortieren statt umdrehen ist richtig, aber unnötig: Nach dem Tausch fällt " +
        "es immer noch, Umdrehen genügt.\n\n" +
        "Einstellige Zahlen und solche, deren Ziffern nirgends steigen, wie 9, 111 und 531. " +
        "Für sie gibt es keine größere Anordnung, und erwartet ist -1.",
    },
  ],
  examples: [
    { input: "12", output: "21" },
    { input: "2017", output: "2071" },
    { input: "531", output: "-1" },
  ],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "nextBigger",
      typescript: "nextBigger",
      python: "next_bigger",
      ruby: "next_bigger",
      php: "nextBigger",
      java: "nextBigger",
      go: "nextBigger",
      cpp: "nextBigger",
      csharp: "NextBigger",
      rust: "next_bigger",
      swift: "nextBigger",
    },
  },
  testCases: [
    { id: 1, name: "Zwei Ziffern", input: "12", expected: "21" },
    { id: 2, name: "Drei Ziffern", input: "513", expected: "531" },
    { id: 3, name: "Mit Null", input: "2017", expected: "2071" },
    { id: 4, name: "Einstellig", input: "9", expected: "-1" },
    { id: 5, name: "Absteigend", input: "531", expected: "-1" },
    { id: 6, name: "Gleiche Ziffern", input: "111", expected: "-1" },
    { id: 7, name: "Doppelte Ziffer", input: "1232", expected: "1322" },
    { id: 8, name: "Zehn Ziffern", input: "1234567890", expected: "1234567908" },
    { id: 9, name: "Lange Zahl", input: "59884848", expected: "59884884" },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
  translations: {
    en: {
      title: "Next Bigger Number",
      description:
        "Implement nextBigger(n).\n\n" +
        "Return the smallest number that is larger than n and made of exactly the same " +
        "digits, only arranged differently. If there is none, return -1.\n\n" +
        "12 → 21\n" +
        "513 → 531\n" +
        "2017 → 2071\n" +
        "531 → -1\n\n" +
        "n is positive, and the result fits into a 32-bit integer.\n\n" +
        "Trying every arrangement works for four digits and is already hopeless for ten: 3.6 " +
        "million permutations. And yet the answer is almost entirely in the last digits of " +
        "the number.",
      hints: [
        {
          title: "The idea",
          body:
            "To make a number as little larger as possible, you change it as far to the right " +
            "as possible. A tail whose digits do not rise from left to right is already the " +
            "largest arrangement of its digits. So the digit to raise is the first one to the " +
            "left of it, the pivot, and by as little as possible.",
        },
        {
          title: "The implementation",
          body:
            "Split n into its digits. From the right, find the first position i with " +
            "d[i] < d[i + 1]. If there is none, the answer is -1. Then find, from the right, " +
            "the first digit d[j] that is larger than d[i], and swap the two. Finally, reverse " +
            "the tail from i + 1 so that it becomes as small as possible, and put the digits " +
            'back together into a number. This is the "next permutation" algorithm.',
        },
        {
          title: "Where most people go wrong",
          body:
            "Repeated digits. When looking for the pivot and the swap partner, it has to be " +
            "strictly smaller and strictly larger. Whoever allows equality with 1232 swaps the " +
            "two twos and lands on 1223, a smaller number, instead of 1322.\n\n" +
            "Sorting the tail instead of reversing it is correct but unnecessary: after the " +
            "swap it still descends, so reversing is enough.\n\n" +
            "Single-digit numbers and those whose digits never rise, such as 9, 111 and 531. " +
            "There is no larger arrangement for them, and -1 is expected.",
        },
      ],
      testCaseNames: {
        "1": "Two digits",
        "2": "Three digits",
        "3": "With a zero",
        "4": "Single digit",
        "5": "Descending",
        "6": "Same digits",
        "7": "Repeated digit",
        "8": "Ten digits",
        "9": "Long number",
      },
    },
  },
};
