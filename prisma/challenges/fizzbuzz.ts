import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: "function fizzBuzz(n) {\n  // Your solution here\n  return [];\n}",
  typescript: "function fizzBuzz(n: number): string[] {\n  // Your solution here\n  return [];\n}",
  python: "def fizz_buzz(n):\n    # Your solution here\n    return []\n",
  php: "<?php\n\nfunction fizzBuzz($n) {\n    // Your solution here\n    return [];\n}\n",
  java: "static String[] fizzBuzz(int n) {\n    // Your solution here\n    return new String[]{};\n}\n",
  go: "func fizzBuzz(n int) []string {\n\t// Your solution here\n\treturn []string{}\n}\n",
  cpp: "vector<string> fizzBuzz(int n) {\n    // Your solution here\n    return {};\n}\n",
  csharp: "static string[] FizzBuzz(int n) {\n    // Your solution here\n    return new string[]{};\n}\n",
  rust: "fn fizz_buzz(n: i64) -> Vec<String> {\n    // Your solution here\n    vec![]\n}\n",
  ruby: "def fizz_buzz(n)\n  # Your solution here\n  []\nend\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-fizzbuzz",
  title: "FizzBuzz",
  description:
    "Implementiere fizzBuzz(n).\n\n" +
    'Gib ein Array der Länge n zurück. Für jede Zahl 1..n: Vielfache von 3 werden zu ' +
    '"Fizz", von 5 zu "Buzz", von beiden zu "FizzBuzz", sonst die Zahl als String.\n\n' +
    "Rechnen muss man hier nichts. Die Aufgabe prüft, ob du die Fälle in eine " +
    "Reihenfolge bringst, in der sich keiner vor dem anderen wegnimmt.",
  difficulty: "easy",
  points: 100,
  categoryId: CATEGORY.algorithmen,
  hints: [
    {
      title: "Die Idee",
      body:
        "Jede Zahl steht für sich, es gibt nichts zu merken. Teilbarkeit fragst du mit " +
        "dem Restoperator ab: n % 3 === 0 heißt „durch 3 teilbar\". Vier Fälle, ein " +
        "Durchlauf.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Laufe von 1 bis einschließlich n. Prüfe pro Zahl zuerst, ob sie durch 3 und " +
        "durch 5 teilbar ist, dann nur durch 3, dann nur durch 5, sonst nimm die Zahl " +
        "selbst. Häng das Ergebnis an ein Array und gib es am Ende zurück.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Die Reihenfolge der Abfragen entscheidet. Steht die Prüfung auf 3 vor der auf " +
        "15, greift sie bei 15 zuerst und „FizzBuzz\" kommt nie zustande.\n\n" +
        "Im Array stehen ausschließlich Strings, auch die Zahlen selbst: 1 wird zu \"1\". " +
        "Eine Zahl im Array lässt den Vergleich mit der Erwartung scheitern.\n\n" +
        "Die Schleife läuft bei 1 los und schließt n mit ein – nicht bei 0 beginnen und " +
        "nicht vor n abbrechen.",
    },
  ],
  examples: [{ input: "5", output: '["1","2","Fizz","4","Buzz"]' }],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "fizzBuzz",
      typescript: "fizzBuzz",
      python: "fizz_buzz",
      ruby: "fizz_buzz",
      php: "fizzBuzz",
      java: "fizzBuzz",
      go: "fizzBuzz",
      cpp: "fizzBuzz",
      csharp: "FizzBuzz",
      rust: "fizz_buzz",
    },
  },
  testCases: [
    { id: 1, name: "Eins", input: "1", expected: '["1"]' },
    { id: 2, name: "Bis 3", input: "3", expected: '["1","2","Fizz"]' },
    { id: 3, name: "Bis 5", input: "5", expected: '["1","2","Fizz","4","Buzz"]' },
    { id: 4, name: "Bis 6", input: "6", expected: '["1","2","Fizz","4","Buzz","Fizz"]' },
    {
      id: 5,
      name: "Bis 15",
      input: "15",
      expected:
        '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]',
    },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
  translations: {
    en: {
      title: "FizzBuzz",
      description:
        "Implement fizzBuzz(n).\n\n" +
        "Return an array of length n. For every number 1..n: multiples of 3 become " +
        '"Fizz", multiples of 5 become "Buzz", multiples of both become "FizzBuzz", ' +
        "otherwise the number as a string.\n\n" +
        "There is nothing to calculate here. The task checks whether you get the cases " +
        "into an order in which none of them takes another one's turn.",
      hints: [
        {
          title: "The idea",
          body:
            "Every number stands on its own, there is nothing to remember. You ask about " +
            'divisibility with the remainder operator: n % 3 === 0 means "divisible by 3". ' +
            "Four cases, one pass.",
        },
        {
          title: "The implementation",
          body:
            "Run from 1 up to and including n. For each number, check first whether it is " +
            "divisible by 3 and by 5, then by 3 only, then by 5 only, otherwise take the " +
            "number itself. Append the result to an array and return it at the end.",
        },
        {
          title: "Where most people go wrong",
          body:
            "The order of the checks decides everything. If the check for 3 comes before " +
            'the one for 15, it catches 15 first and "FizzBuzz" never happens.\n\n' +
            "The array holds strings and nothing else, the numbers included: 1 becomes " +
            '"1". A number in the array makes the comparison with the expected value ' +
            "fail.\n\n" +
            "The loop starts at 1 and includes n – do not start at 0 and do not stop " +
            "before n.",
        },
      ],
      testCaseNames: {
        "1": "One",
        "2": "Up to 3",
        "3": "Up to 5",
        "4": "Up to 6",
        "5": "Up to 15",
      },
    },
  },
};
