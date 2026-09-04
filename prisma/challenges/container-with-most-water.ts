import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: "function maxArea(height) {\n  // Your solution here\n  return 0;\n}",
  typescript: "function maxArea(height: number[]): number {\n  // Your solution here\n  return 0;\n}",
  python: "def max_area(height):\n    # Your solution here\n    return 0\n",
  php: "<?php\n\nfunction maxArea($height) {\n    // Your solution here\n    return 0;\n}\n",
  ruby: "def max_area(height)\n  # Your solution here\n  0\nend\n",
  java: "static int maxArea(int[] height) {\n    // Your solution here\n    return 0;\n}\n",
  go: "func maxArea(height []int) int {\n\t// Your solution here\n\treturn 0\n}\n",
  cpp: "int maxArea(vector<int> height) {\n    // Your solution here\n    return 0;\n}\n",
  csharp: "static int MaxArea(int[] height) {\n    // Your solution here\n    return 0;\n}\n",
  rust: "fn max_area(height: Vec<i64>) -> i64 {\n    // Your solution here\n    0\n}\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-container-with-most-water",
  title: "Container With Most Water",
  description:
    "Implementiere maxArea(height).\n\n" +
    "height beschreibt senkrechte Linien: height[i] ist die Höhe der Linie an Position i. Zwei " +
    "Linien bilden zusammen mit der x-Achse einen Behälter, und der fasst so viel Wasser, wie " +
    "die niedrigere der beiden hoch ist, mal den Abstand zwischen ihnen. Gib die größte Fläche " +
    "zurück, die zwei Linien einschließen können. height hat mindestens zwei Einträge, alle " +
    "Höhen sind nicht negativ, und der Behälter darf nicht gekippt werden.\n\n" +
    "Alle Paare durchzurechnen kostet O(n²). Die Aufgabe zielt darauf, Paare auszuschließen, " +
    "ohne sie anzusehen: Wer von außen nach innen läuft, weiß bei jedem Schritt, auf welcher " +
    "Seite nichts Besseres mehr zu holen ist.",
  difficulty: "medium",
  points: 150,
  categoryId: CATEGORY.algorithmen,
  hints: [
    {
      title: "Die Idee",
      body:
        "Fang mit dem breitesten Behälter an: die Linie ganz links und die ganz rechts. Jeder " +
        "Schritt nach innen macht ihn schmaler, also lohnt er sich nur, wenn die Höhe wachsen " +
        "kann – und die gibt die niedrigere Linie vor. Die höhere Seite stehen zu lassen und die " +
        "niedrigere nach innen zu schieben ist deshalb der einzige Zug, der etwas gewinnen kann.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Zwei Zeiger, left = 0 und right = Länge - 1, dazu ein Maximum. Solange left < right: " +
        "Berechne min(height[left], height[right]) * (right - left) und behalte den größeren " +
        "Wert. Dann rückt der Zeiger mit der kleineren Höhe einen Schritt nach innen; bei " +
        "Gleichstand ist es egal, welcher. Am Ende gibst du das Maximum zurück.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Die Fläche ist die Höhe der niedrigeren Linie mal den Abstand der Indizes – nicht die " +
        "Summe der Höhen und nicht der Abstand plus eins. Bei [1,1] ist der Abstand 1, also ist " +
        "die Fläche 1.\n\n" +
        "Wer den höheren Zeiger bewegt, verliert Breite ohne eine Chance auf mehr Höhe: Beim " +
        "Beispiel [1,8,6,2,5,4,8,3,7] kommt so nur 8 heraus statt 49.\n\n" +
        "Die Zeiger dürfen sich nicht überholen: Die Schleife endet, wenn sie sich treffen. Ein " +
        "Behälter aus einer einzigen Linie fasst nichts.",
    },
  ],
  translations: {
    en: {
      title: "Container With Most Water",
      description:
        "Implement maxArea(height).\n\n" +
        "height describes vertical lines: height[i] is the height of the line at position i. Two " +
        "lines together with the x-axis form a container, and it holds as much water as the " +
        "shorter of the two is tall, times the distance between them. Return the largest area two " +
        "lines can enclose. height has at least two entries, all heights are non-negative, and " +
        "the container must not be tilted.\n\n" +
        "Computing every pair costs O(n²). This task aims at ruling pairs out without looking at " +
        "them: walking from the outside in, you know at every step which side has nothing better " +
        "left to offer.",
      hints: [
        {
          title: "The idea",
          body:
            "Start with the widest container: the leftmost line and the rightmost one. Every step " +
            "inwards makes it narrower, so it only pays off if the height can grow – and the " +
            "shorter line is what sets that height. Leaving the taller side where it is and " +
            "moving the shorter one inwards is therefore the only move that can gain anything.",
        },
        {
          title: "The implementation",
          body:
            "Two pointers, left = 0 and right = length - 1, plus a maximum. As long as left < " +
            "right: compute min(height[left], height[right]) * (right - left) and keep the larger " +
            "value. Then the pointer with the smaller height moves one step inwards; when they " +
            "are equal it does not matter which. At the end you return the maximum.",
        },
        {
          title: "Where most people go wrong",
          body:
            "The area is the height of the shorter line times the distance between the indices – " +
            "not the sum of the heights, and not the distance plus one. For [1,1] the distance is " +
            "1, so the area is 1.\n\n" +
            "Moving the taller pointer loses width without any chance at more height: on the " +
            "example [1,8,6,2,5,4,8,3,7] that yields only 8 instead of 49.\n\n" +
            "The pointers must not pass each other: the loop ends when they meet. A container " +
            "made of a single line holds nothing.",
        },
      ],
      testCaseNames: {
        "1": "Example",
        "2": "Two lines",
        "3": "Equal at the ends",
        "4": "Three lines",
        "5": "Ascending",
        "6": "With zeros",
      },
    },
  },
  examples: [{ input: "[1,8,6,2,5,4,8,3,7]", output: "49" }],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "maxArea",
      typescript: "maxArea",
      python: "max_area",
      ruby: "max_area",
      php: "maxArea",
      java: "maxArea",
      go: "maxArea",
      cpp: "maxArea",
      csharp: "MaxArea",
      rust: "max_area",
    },
  },
  testCases: [
    { id: 1, name: "Beispiel", input: "[1,8,6,2,5,4,8,3,7]", expected: "49" },
    { id: 2, name: "Zwei Linien", input: "[1,1]", expected: "1" },
    { id: 3, name: "Außen gleich hoch", input: "[4,3,2,1,4]", expected: "16" },
    { id: 4, name: "Drei Linien", input: "[1,2,1]", expected: "2" },
    { id: 5, name: "Aufsteigend", input: "[1,2,3,4,5]", expected: "6" },
    { id: 6, name: "Mit Nullen", input: "[0,3,0,0,3,0]", expected: "9" },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
};
