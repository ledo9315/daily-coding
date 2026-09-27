import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: "function score(dice) {\n  // Your solution here\n  return 0;\n}",
  typescript: "function score(dice: number[]): number {\n  // Your solution here\n  return 0;\n}",
  python: "def score(dice):\n    # Your solution here\n    return 0\n",
  php: "<?php\n\nfunction score($dice) {\n    // Your solution here\n    return 0;\n}\n",
  ruby: "def score(dice)\n  # Your solution here\n  0\nend\n",
  java: "static int score(int[] dice) {\n    // Your solution here\n    return 0;\n}\n",
  go: "func score(dice []int) int {\n\t// Your solution here\n\treturn 0\n}\n",
  cpp: "int score(vector<int> dice) {\n    // Your solution here\n    return 0;\n}\n",
  csharp: "static int Score(int[] dice) {\n    // Your solution here\n    return 0;\n}\n",
  rust: "fn score(dice: Vec<i64>) -> i64 {\n    // Your solution here\n    0\n}\n",
  swift: "func score(_ dice: [Int]) -> Int {\n    // Your solution here\n    return 0\n}\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-greed-is-good",
  title: "Greed is Good",
  description:
    "Implementiere score(dice).\n\n" +
    "Greed ist ein Würfelspiel mit fünf Würfeln. Du bekommst die fünf Augenzahlen eines Wurfs " +
    "und gibst die Punkte zurück, die er nach diesen Regeln wert ist:\n\n" +
    "Drei Einsen → 1000\n" +
    "Drei Sechsen → 600\n" +
    "Drei Fünfen → 500\n" +
    "Drei Vieren → 400\n" +
    "Drei Dreien → 300\n" +
    "Drei Zweien → 200\n" +
    "Eine Eins → 100\n" +
    "Eine Fünf → 50\n\n" +
    "Jeder Würfel zählt höchstens einmal. [5,1,3,4,1] ist 250 wert: zwei Einsen und eine " +
    "Fünf. [1,1,1,3,1] ist 1100 wert: drei Einsen als Dreier, die vierte einzeln. Ein Wurf " +
    "ohne Wertung ergibt 0.\n\n" +
    "Die Regeln sind schnell gelesen. Die Aufgabe prüft, ob du sie so umsetzt, dass kein " +
    "Würfel doppelt oder gar nicht gezählt wird.",
  difficulty: "easy",
  points: 120,
  categoryId: CATEGORY.algorithmen,
  hints: [
    {
      title: "Die Idee",
      body:
        "Die Reihenfolge der Würfel spielt keine Rolle, nur wie oft jede Augenzahl vorkommt. " +
        "Zähle also zuerst, dann rechnest du pro Augenzahl: Kommt sie mindestens dreimal vor, " +
        "gibt es den Dreier und drei Würfel sind verbraucht. Was danach übrig bleibt, zählt " +
        "nur bei Eins und Fünf, jeweils einzeln.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Ein Array mit sieben Plätzen reicht als Zähler, Index 1 bis 6. Laufe über die " +
        "Augenzahlen v von 1 bis 6: Ist count[v] >= 3, addiere 1000 für die Eins oder v * 100 " +
        "für alle anderen und ziehe 3 vom Zähler ab. Danach addiere count[1] * 100 und " +
        "count[5] * 50.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Die Würfel eines Dreiers noch einmal einzeln zählen. [1,1,1,3,1] ist 1100 wert, " +
        "nicht 1400: Nach dem Dreier bleibt eine einzige Eins übrig.\n\n" +
        "Vier oder fünf Gleiche sind kein doppelter Dreier. Mit fünf Würfeln gibt es höchstens " +
        "einen, und [3,3,3,3,3] bringt 300, weil die beiden übrigen Dreien nichts wert sind.\n\n" +
        "Die Eins ist die Ausnahme von v * 100: Drei Einsen bringen 1000, nicht 100.",
    },
  ],
  examples: [
    { input: "[5,1,3,4,1]", output: "250" },
    { input: "[1,1,1,3,1]", output: "1100" },
    { input: "[2,4,4,5,4]", output: "450" },
  ],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "score",
      typescript: "score",
      python: "score",
      ruby: "score",
      php: "score",
      java: "score",
      go: "score",
      cpp: "score",
      csharp: "Score",
      rust: "score",
      swift: "score",
    },
  },
  testCases: [
    { id: 1, name: "Beispiel", input: "[5,1,3,4,1]", expected: "250" },
    { id: 2, name: "Vier Einsen", input: "[1,1,1,3,1]", expected: "1100" },
    { id: 3, name: "Dreier mit Fünf", input: "[2,4,4,5,4]", expected: "450" },
    { id: 4, name: "Keine Wertung", input: "[2,3,4,6,2]", expected: "0" },
    { id: 5, name: "Fünf Einsen", input: "[1,1,1,1,1]", expected: "1200" },
    { id: 6, name: "Fünf Fünfen", input: "[5,5,5,5,5]", expected: "600" },
    { id: 7, name: "Fünf Dreien", input: "[3,3,3,3,3]", expected: "300" },
    { id: 8, name: "Dreier und Einzelne", input: "[6,6,6,1,5]", expected: "750" },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
  translations: {
    en: {
      title: "Greed is Good",
      description:
        "Implement score(dice).\n\n" +
        "Greed is a dice game played with five dice. You get the five values of one throw and " +
        "return the points it is worth under these rules:\n\n" +
        "Three ones → 1000\n" +
        "Three sixes → 600\n" +
        "Three fives → 500\n" +
        "Three fours → 400\n" +
        "Three threes → 300\n" +
        "Three twos → 200\n" +
        "One one → 100\n" +
        "One five → 50\n\n" +
        "Each die counts at most once. [5,1,3,4,1] is worth 250: two ones and a five. " +
        "[1,1,1,3,1] is worth 1100: three ones as a triple, the fourth on its own. A throw " +
        "that scores nothing is worth 0.\n\n" +
        "The rules are quickly read. The task checks whether you implement them so that no " +
        "die is counted twice or not at all.",
      hints: [
        {
          title: "The idea",
          body:
            "The order of the dice does not matter, only how often each value comes up. So " +
            "count first, then work value by value: if it comes up at least three times, the " +
            "triple scores and three dice are used up. Whatever is left only counts for ones " +
            "and fives, one at a time.",
        },
        {
          title: "The implementation",
          body:
            "An array with seven slots is enough as a counter, index 1 to 6. Go through the " +
            "values v from 1 to 6: if count[v] >= 3, add 1000 for ones or v * 100 for " +
            "everything else and subtract 3 from the counter. Then add count[1] * 100 and " +
            "count[5] * 50.",
        },
        {
          title: "Where most people go wrong",
          body:
            "Counting the dice of a triple again on their own. [1,1,1,3,1] is worth 1100, not " +
            "1400: after the triple there is a single one left.\n\n" +
            "Four or five of a kind are not two triples. With five dice there is at most one, " +
            "and [3,3,3,3,3] scores 300, because the two remaining threes are worth nothing.\n\n" +
            "The one is the exception to v * 100: three ones score 1000, not 100.",
        },
      ],
      testCaseNames: {
        "1": "Example",
        "2": "Four ones",
        "3": "Triple with a five",
        "4": "No score",
        "5": "Five ones",
        "6": "Five fives",
        "7": "Five threes",
        "8": "Triple and singles",
      },
    },
  },
};
