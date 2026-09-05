import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: "function rob(nums) {\n  // Your solution here\n  return 0;\n}",
  typescript: "function rob(nums: number[]): number {\n  // Your solution here\n  return 0;\n}",
  python: "def rob(nums):\n    # Your solution here\n    return 0\n",
  php: "<?php\n\nfunction rob($nums) {\n    // Your solution here\n    return 0;\n}\n",
  ruby: "def rob(nums)\n  # Your solution here\n  0\nend\n",
  java: "static int rob(int[] nums) {\n    // Your solution here\n    return 0;\n}\n",
  go: "func rob(nums []int) int {\n\t// Your solution here\n\treturn 0\n}\n",
  cpp: "int rob(vector<int> nums) {\n    // Your solution here\n    return 0;\n}\n",
  csharp: "static int Rob(int[] nums) {\n    // Your solution here\n    return 0;\n}\n",
  rust: "fn rob(nums: Vec<i64>) -> i64 {\n    // Your solution here\n    0\n}\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-house-robber",
  title: "House Robber",
  description:
    "Implementiere rob(nums).\n\n" +
    "nums[i] ist der Geldbetrag im i-ten Haus einer Straße. Du darfst beliebig viele Häuser " +
    "ausrauben, aber keine zwei benachbarten, sonst geht der Alarm los. Gib den höchsten " +
    "Betrag zurück, den du erbeuten kannst. Alle Beträge sind nicht negativ; ein leeres Array " +
    "bringt 0.\n\n" +
    "Einfach jedes zweite Haus zu nehmen scheitert schon an [2,7,9,3,1]. Die Aufgabe zielt " +
    "darauf, die Entscheidung an jedem Haus auf das zurückzuführen, was du über die beiden " +
    "Häuser davor schon weißt.",
  difficulty: "medium",
  points: 150,
  categoryId: CATEGORY.algorithmen,
  hints: [
    {
      title: "Die Idee",
      body:
        "An jedem Haus gibt es genau zwei Möglichkeiten. Du nimmst es: Dann steht dir das Beste " +
        "bis zwei Häuser davor plus sein Betrag zu. Oder du lässt es aus: Dann bleibt das Beste " +
        "bis zum Haus davor. Das Maximum der beiden ist das Beste bis hierher, und mehr als " +
        "diese zwei Zwischenstände musst du nie kennen.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Zwei Variablen, prev2 und prev1, beide 0: das Beste bis vor zwei Häusern und das Beste " +
        "bis zum letzten Haus. Für jedes nums[i] rechnest du current = max(prev1, prev2 + " +
        "nums[i]) und rückst dann auf: prev2 = prev1, prev1 = current. Nach dem letzten Haus " +
        "steht die Antwort in prev1, bei einem leeren Array ist das 0, ganz ohne Sonderfall.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Die Gier nach jedem zweiten Haus: Bei [2,7,9,3,1] bringen 2 + 9 + 1 = 12 mehr als " +
        "7 + 3 = 10, bei [2,1,1,2] die beiden äußeren 4 statt 3. Zwischen zwei genommenen " +
        "Häusern dürfen auch zwei oder mehr liegen.\n\n" +
        "Die Reihenfolge beim Aufrücken: Wer prev1 überschreibt, bevor er es in prev2 gesichert " +
        "hat, rechnet im nächsten Schritt mit dem falschen Wert.\n\n" +
        "Ein Array mit einem Haus liefert dessen Betrag, ein leeres 0. Beides sollte deine " +
        "Schleife überstehen, ohne je auf nums[1] zuzugreifen.",
    },
  ],
  examples: [{ input: "[1,2,3,1]", output: "4" }],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "rob",
      typescript: "rob",
      python: "rob",
      ruby: "rob",
      php: "rob",
      java: "rob",
      go: "rob",
      cpp: "rob",
      csharp: "Rob",
      rust: "rob",
    },
  },
  testCases: [
    { id: 1, name: "Beispiel", input: "[1,2,3,1]", expected: "4" },
    { id: 2, name: "Nicht jedes zweite", input: "[2,7,9,3,1]", expected: "12" },
    { id: 3, name: "Außen statt Mitte", input: "[2,1,1,2]", expected: "4" },
    { id: 4, name: "Ein Haus", input: "[5]", expected: "5" },
    { id: 5, name: "Leer", input: "[]", expected: "0" },
    { id: 6, name: "Alle gleich", input: "[3,3,3,3,3]", expected: "9" },
    { id: 7, name: "Zwei Häuser", input: "[2,9]", expected: "9" },
  ],
  translations: {
    en: {
      title: "House Robber",
      description:
        "Implement rob(nums).\n\n" +
        "nums[i] is the amount of money in the i-th house on a street. You may rob as many " +
        "houses as you like, but never two neighboring ones, otherwise the alarm goes off. " +
        "Return the highest amount you can get away with. All amounts are non-negative; an " +
        "empty array yields 0.\n\n" +
        "Simply taking every second house already fails on [2,7,9,3,1]. The task aims at " +
        "reducing the decision at each house to what you already know about the two houses " +
        "before it.",
      hints: [
        {
          title: "The idea",
          body:
            "At every house there are exactly two options. You take it: then you get the best " +
            "up to two houses before it plus its amount. Or you skip it: then the best up to " +
            "the previous house stays. The maximum of the two is the best up to here, and " +
            "you never need to know more than these two running values.",
        },
        {
          title: "The implementation",
          body:
            "Two variables, prev2 and prev1, both 0: the best up to two houses back and the " +
            "best up to the last house. For every nums[i] you compute current = max(prev1, " +
            "prev2 + nums[i]) and then shift along: prev2 = prev1, prev1 = current. After the " +
            "last house the answer sits in prev1, for an empty array that is 0, without any " +
            "special case.",
        },
        {
          title: "Where most people go wrong",
          body:
            "The greed for every second house: for [2,7,9,3,1] 2 + 9 + 1 = 12 beats " +
            "7 + 3 = 10, for [2,1,1,2] the two outer ones give 4 instead of 3. Between two " +
            "houses you take there may also be two or more.\n\n" +
            "The order when shifting along: overwriting prev1 before saving it into prev2 " +
            "means computing with the wrong value in the next step.\n\n" +
            "An array with one house yields its amount, an empty one 0. Your loop should " +
            "survive both without ever reaching for nums[1].",
        },
      ],
      testCaseNames: {
        "1": "Example",
        "2": "Not every second house",
        "3": "Outer instead of middle",
        "4": "One house",
        "5": "Empty",
        "6": "All equal",
        "7": "Two houses",
      },
    },
  },
  starterCodes: starter,
  starterCode: starter.javascript,
};
