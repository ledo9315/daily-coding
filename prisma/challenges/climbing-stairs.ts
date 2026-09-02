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
