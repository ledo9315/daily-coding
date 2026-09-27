import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: "function largestRectangleArea(heights) {\n  // Your solution here\n  return 0;\n}",
  typescript:
    "function largestRectangleArea(heights: number[]): number {\n  // Your solution here\n  return 0;\n}",
  python: "def largest_rectangle_area(heights):\n    # Your solution here\n    return 0\n",
  php: "<?php\n\nfunction largestRectangleArea($heights) {\n    // Your solution here\n    return 0;\n}\n",
  ruby: "def largest_rectangle_area(heights)\n  # Your solution here\n  0\nend\n",
  java: "static int largestRectangleArea(int[] heights) {\n    // Your solution here\n    return 0;\n}\n",
  go: "func largestRectangleArea(heights []int) int {\n\t// Your solution here\n\treturn 0\n}\n",
  cpp: "int largestRectangleArea(vector<int> heights) {\n    // Your solution here\n    return 0;\n}\n",
  csharp:
    "static int LargestRectangleArea(int[] heights) {\n    // Your solution here\n    return 0;\n}\n",
  rust: "fn largest_rectangle_area(heights: Vec<i64>) -> i64 {\n    // Your solution here\n    0\n}\n",
  swift:
    "func largestRectangleArea(_ heights: [Int]) -> Int {\n    // Your solution here\n    return 0\n}\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-largest-rectangle-in-histogram",
  title: "Largest Rectangle in Histogram",
  description:
    "Implementiere largestRectangleArea(heights).\n\n" +
    "heights beschreibt ein Histogramm: nebeneinanderstehende Balken, jeder genau eine " +
    "Einheit breit, mit den angegebenen Höhen. Gib die Fläche des größten Rechtecks zurück, " +
    "das vollständig innerhalb der Balken liegt.\n\n" +
    "Bei [2,1,5,6,2,3] ist das die Fläche 10: die Balken mit den Höhen 5 und 6, zwei Einheiten " +
    "breit und fünf hoch.\n\n" +
    "Die Höhen sind nicht negativ, und es gibt mindestens einen Balken.\n\n" +
    "Für jedes Paar aus linkem und rechtem Rand die kleinste Höhe dazwischen zu suchen, ist " +
    "O(n²). Mit einem Stack, der die Balken aufsteigend hält, genügt ein einziger Durchlauf. " +
    "Den zu finden, ist die eigentliche Aufgabe.",
  difficulty: "hard",
  points: 200,
  categoryId: CATEGORY.datenstrukturen,
  hints: [
    {
      title: "Die Idee",
      body:
        "Jedes größte Rechteck hat einen niedrigsten Balken, und seine Höhe ist genau dessen " +
        "Höhe. Frag also für jeden Balken: Wie weit reicht ein Rechteck seiner Höhe nach links " +
        "und rechts, bis ein niedrigerer Balken im Weg steht? Die Breite bis dorthin mal seine " +
        "Höhe ist ein Kandidat, und das Maximum aller Kandidaten ist die Antwort.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Halte einen Stack aus Indizes, deren Höhen von unten nach oben steigen. Kommt ein " +
        "Balken i, der niedriger ist als der oberste, dann endet dessen Rechteck hier: Nimm " +
        "ihn herunter, seine rechte Grenze ist i, seine linke der Index darunter auf dem " +
        "Stack. Breite = i - neuer oberster - 1, oder i, wenn der Stack leer ist. Wiederhole, " +
        "bis der oberste nicht mehr höher ist, und lege dann i auf den Stack.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Balken, die am Ende noch auf dem Stack liegen. Bei [1,2,3,4,5] wird bis zum Schluss " +
        "nichts heruntergenommen. Ein gedachter Balken der Höhe 0 hinter dem letzten räumt den " +
        "Stack zuverlässig ab.\n\n" +
        "Die Breite, wenn der Stack nach dem Herunternehmen leer ist. Dann reicht das Rechteck " +
        "bis ganz nach links, und die Breite ist i, nicht i - 1.\n\n" +
        "Zu kurz greifen. Bei [6,2,5,4,5,1,6] ist die Antwort 12: drei Balken breit und nur " +
        "vier hoch, so hoch wie der niedrigste der drei. Wer nur einzelne Balken und Paare " +
        "von Nachbarn betrachtet, kommt hier auf 8.",
    },
  ],
  examples: [
    { input: "[2,1,5,6,2,3]", output: "10" },
    { input: "[2,4]", output: "4" },
  ],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "largestRectangleArea",
      typescript: "largestRectangleArea",
      python: "largest_rectangle_area",
      ruby: "largest_rectangle_area",
      php: "largestRectangleArea",
      java: "largestRectangleArea",
      go: "largestRectangleArea",
      cpp: "largestRectangleArea",
      csharp: "LargestRectangleArea",
      rust: "largest_rectangle_area",
      swift: "largestRectangleArea",
    },
  },
  testCases: [
    { id: 1, name: "Beispiel", input: "[2,1,5,6,2,3]", expected: "10" },
    { id: 2, name: "Zwei Balken", input: "[2,4]", expected: "4" },
    { id: 3, name: "Ein Balken", input: "[1]", expected: "1" },
    { id: 4, name: "Gleich hoch", input: "[2,2,2,2]", expected: "8" },
    { id: 5, name: "Aufsteigend", input: "[1,2,3,4,5]", expected: "9" },
    { id: 6, name: "Absteigend", input: "[5,4,3,2,1]", expected: "9" },
    { id: 7, name: "Über eine Lücke", input: "[6,2,5,4,5,1,6]", expected: "12" },
    { id: 8, name: "Tal in der Mitte", input: "[2,1,2]", expected: "3" },
    { id: 9, name: "Nur Nullen", input: "[0,0]", expected: "0" },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
  translations: {
    en: {
      title: "Largest Rectangle in Histogram",
      description:
        "Implement largestRectangleArea(heights).\n\n" +
        "heights describes a histogram: bars standing side by side, each exactly one unit " +
        "wide, with the given heights. Return the area of the largest rectangle that lies " +
        "entirely within the bars.\n\n" +
        "For [2,1,5,6,2,3] that is the area 10: the bars with heights 5 and 6, two units wide " +
        "and five high.\n\n" +
        "The heights are not negative, and there is at least one bar.\n\n" +
        "Looking for the lowest height between every pair of left and right edges is O(n²). " +
        "With a stack that keeps the bars in ascending order, a single pass is enough. " +
        "Finding it is the real task.",
      hints: [
        {
          title: "The idea",
          body:
            "Every largest rectangle has a lowest bar, and its height is exactly that bar's " +
            "height. So ask for every bar: how far does a rectangle of its height reach to the " +
            "left and the right before a lower bar is in the way? The width up to there times " +
            "its height is a candidate, and the maximum of all candidates is the answer.",
        },
        {
          title: "The implementation",
          body:
            "Keep a stack of indices whose heights rise from bottom to top. When a bar i comes " +
            "along that is lower than the top one, the top one's rectangle ends here: pop it, " +
            "its right boundary is i, its left one the index below it on the stack. Width = " +
            "i - new top - 1, or i if the stack is empty. Repeat until the top one is no " +
            "longer higher, then push i.",
        },
        {
          title: "Where most people go wrong",
          body:
            "Bars still on the stack at the end. With [1,2,3,4,5] nothing is popped until the " +
            "very end. An imaginary bar of height 0 after the last one reliably clears the " +
            "stack.\n\n" +
            "The width when the stack is empty after popping. The rectangle then reaches all " +
            "the way to the left, and the width is i, not i - 1.\n\n" +
            "Reaching too short. For [6,2,5,4,5,1,6] the answer is 12: three bars wide and only " +
            "four high, as high as the lowest of the three. Whoever only looks at single bars " +
            "and pairs of neighbours gets 8 here.",
        },
      ],
      testCaseNames: {
        "1": "Example",
        "2": "Two bars",
        "3": "One bar",
        "4": "Equal height",
        "5": "Ascending",
        "6": "Descending",
        "7": "Across a gap",
        "8": "Valley in the middle",
        "9": "Only zeros",
      },
    },
  },
};
