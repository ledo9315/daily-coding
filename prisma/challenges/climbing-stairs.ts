import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: "function climbStairs(n) {\n  // Your solution here\n  return 0;\n}",
  typescript: "function climbStairs(n: number): number {\n  // Your solution here\n  return 0;\n}",
  python: "def climb_stairs(n):\n    # Your solution here\n    return 0\n",
  php: "<?php\n\nfunction climbStairs($n) {\n    // Your solution here\n    return 0;\n}\n",
  ruby: "def climb_stairs(n)\n  # Your solution here\n  0\nend\n",
  java: "static int climbStairs(int n) {\n    // Your solution here\n    return 0;\n}\n",
  go: "func climbStairs(n int) int {\n\t// Your solution here\n\treturn 0\n}\n",
  cpp: "int climbStairs(int n) {\n    // Your solution here\n    return 0;\n}\n",
  csharp: "static int ClimbStairs(int n) {\n    // Your solution here\n    return 0;\n}\n",
  rust: "fn climb_stairs(n: i64) -> i64 {\n    // Your solution here\n    0\n}\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-climbing-stairs",
  title: "Climbing Stairs",
  description:
    "Implementiere climbStairs(n).\n\n" +
    "Eine Treppe hat n Stufen (1 ≤ n ≤ 45). Mit jedem Schritt nimmst du eine oder zwei " +
    "Stufen. Gib zurück, auf wie viele verschiedene Arten du oben ankommst. Die " +
    "Reihenfolge zählt: 1+2 und 2+1 sind zwei Arten.\n\n" +
    "Alle Wege einzeln aufzuzählen scheitert schon bei n = 40 an der Zeit. Die Aufgabe " +
    "zielt auf die Erkenntnis, dass die Anzahl für n allein aus den Anzahlen für n-1 und " +
    "n-2 folgt – und dass man dafür nur zwei Zahlen mitführen muss.",
  difficulty: "easy",
  points: 100,
  categoryId: CATEGORY.algorithmen,
  hints: [
    {
      title: "Die Idee",
      body:
        "Der letzte Schritt auf Stufe n kommt entweder von Stufe n-1 oder von Stufe n-2. " +
        "Also ist die Anzahl der Wege zu n die Summe der Wege zu n-1 und zu n-2. Für eine " +
        "Stufe gibt es einen Weg, für zwei Stufen zwei. Das ist die Fibonacci-Folge, nur " +
        "um eine Position verschoben.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Halte zwei Variablen: die Anzahl für die vorletzte und die für die letzte Stufe, " +
        "zu Beginn 1 und 2. Laufe von 3 bis einschließlich n und berechne in jedem Schritt " +
        "die Summe beider; die ältere fällt weg, die Summe rückt nach. Für n = 1 gibst du " +
        "direkt 1 zurück. Am Ende steht das Ergebnis in der Variablen für die letzte Stufe.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Die naive Rekursion climbStairs(n-1) + climbStairs(n-2) ohne Zwischenspeicher " +
        "berechnet dieselben Teilergebnisse milliardenfach: Für n = 45 sind das über drei " +
        "Milliarden Aufrufe, und der Test läuft in die Zeitüberschreitung. Entweder " +
        "merkst du dir jedes Ergebnis in einer Map (Memoisierung) oder du rechnest von " +
        "unten nach oben.\n\n" +
        "Die Startwerte sind 1 und 2 für n = 1 und n = 2. Wer mit 0 und 1 beginnt, liegt " +
        "um eine Stufe daneben, wenn die Schleife nicht dazu passt.\n\n" +
        "Das Ergebnis für n = 45 ist 1836311903 und passt gerade noch in einen 32-Bit-" +
        "Integer – größere n sind nicht gefragt.",
    },
  ],
  translations: {
    en: {
      title: "Climbing Stairs",
      description:
        "Implement climbStairs(n).\n\n" +
        "A staircase has n steps (1 ≤ n ≤ 45). With every stride you take one or two steps. " +
        "Return how many different ways there are to reach the top. Order matters: 1+2 and 2+1 " +
        "are two ways.\n\n" +
        "Listing every path one by one runs out of time at n = 40 already. This task aims at the " +
        "realisation that the count for n follows from the counts for n-1 and n-2 alone – and " +
        "that you only have to carry two numbers along for it.",
      hints: [
        {
          title: "The idea",
          body:
            "The last stride onto step n comes either from step n-1 or from step n-2. So the " +
            "number of ways to n is the sum of the ways to n-1 and to n-2. For one step there is " +
            "one way, for two steps there are two. That is the Fibonacci sequence, just shifted " +
            "by one position.",
        },
        {
          title: "The implementation",
          body:
            "Keep two variables: the count for the second-to-last step and the one for the last " +
            "step, 1 and 2 to begin with. Run from 3 up to and including n and compute the sum of " +
            "the two in every step; the older one drops out, the sum moves up. For n = 1 you " +
            "return 1 directly. At the end the result sits in the variable for the last step.",
        },
        {
          title: "Where most people go wrong",
          body:
            "The naive recursion climbStairs(n-1) + climbStairs(n-2) without a cache computes the " +
            "same partial results billions of times over: for n = 45 that is more than three " +
            "billion calls, and the test runs into the timeout. Either you remember every result " +
            "in a map (memoization) or you compute from the bottom up.\n\n" +
            "The starting values are 1 and 2, for n = 1 and n = 2. Beginning with 0 and 1 puts " +
            "you one step off unless the loop is built to match.\n\n" +
            "The result for n = 45 is 1836311903 and just fits into a 32-bit integer – larger n " +
            "are not asked for.",
        },
      ],
      testCaseNames: {
        "1": "One step",
        "2": "Example",
        "3": "Three steps",
        "4": "Five steps",
        "5": "Ten steps",
        "6": "Maximum",
      },
    },
  },
  examples: [
    { input: "2", output: "2" },
    { input: "3", output: "3" },
  ],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "climbStairs",
      typescript: "climbStairs",
      python: "climb_stairs",
      ruby: "climb_stairs",
      php: "climbStairs",
      java: "climbStairs",
      go: "climbStairs",
      cpp: "climbStairs",
      csharp: "ClimbStairs",
      rust: "climb_stairs",
    },
  },
  testCases: [
    { id: 1, name: "Eine Stufe", input: "1", expected: "1" },
    { id: 2, name: "Beispiel", input: "2", expected: "2" },
    { id: 3, name: "Drei Stufen", input: "3", expected: "3" },
    { id: 4, name: "Fünf Stufen", input: "5", expected: "8" },
    { id: 5, name: "Zehn Stufen", input: "10", expected: "89" },
    { id: 6, name: "Maximum", input: "45", expected: "1836311903" },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
};
