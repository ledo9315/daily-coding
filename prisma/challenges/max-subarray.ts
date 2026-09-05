import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: "function maxSubArray(nums) {\n  // Your solution here\n  return 0;\n}",
  typescript: "function maxSubArray(nums: number[]): number {\n  // Your solution here\n  return 0;\n}",
  python: "def max_sub_array(nums):\n    # Your solution here\n    return 0\n",
  php: "<?php\n\nfunction maxSubArray($nums) {\n    // Your solution here\n    return 0;\n}\n",
  java: "static int maxSubArray(int[] nums) {\n    // Your solution here\n    return 0;\n}\n",
  go: "func maxSubArray(nums []int) int {\n\t// Your solution here\n\treturn 0\n}\n",
  cpp: "int maxSubArray(vector<int> nums) {\n    // Your solution here\n    return 0;\n}\n",
  csharp: "static int MaxSubArray(int[] nums) {\n    // Your solution here\n    return 0;\n}\n",
  rust: "fn max_sub_array(nums: Vec<i64>) -> i64 {\n    // Your solution here\n    0\n}\n",
  ruby: "def max_sub_array(nums)\n  # Your solution here\n  0\nend\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-max-subarray",
  title: "Maximum Subarray",
  description:
    "Implementiere maxSubArray(nums).\n\n" +
    "Gib die größtmögliche Summe eines zusammenhängenden Teil-Arrays zurück. Das " +
    "Teil-Array enthält mindestens ein Element.\n\n" +
    "Zusammenhängend heißt: kein Überspringen. Alle Start-Ende-Paare " +
    "durchzuprobieren kostet O(n²) und besteht die Tests. Interessant wird es bei " +
    "dem einen Durchlauf, der ohne Rückblick auskommt.",
  difficulty: "medium",
  points: 150,
  categoryId: CATEGORY.algorithmen,
  hints: [
    {
      title: "Die Idee",
      body:
        "Geh das Array von links nach rechts und frag dich an jeder Stelle nur eines: " +
        "Hilft mir, was links von mir liegt?\n\n" +
        "Ist die Summe bis hierher negativ, ist sie Ballast. Jedes Teil-Array, das sie " +
        "mitschleppt, wäre ohne sie größer. Dann fängst du beim aktuellen Element neu " +
        "an. Andernfalls führst du sie fort. Mehr musst du über die Vergangenheit nicht " +
        "wissen.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Halte zwei Werte: die beste Summe, die hier endet, und die beste Summe, die du " +
        "je gesehen hast. Beide startest du mit dem ersten Element.\n\n" +
        "Ab dem zweiten Element ist die hier endende Summe das Maximum aus dem Element " +
        "allein und dem Element plus der bisherigen Summe. Danach ziehst du das " +
        "Gesamtmaximum nach. Am Ende gibst du das Gesamtmaximum zurück.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Die Null als Startwert. Bei [-3,-1,-2] ist die Antwort -1, nicht 0, ein leeres " +
        "Teil-Array ist nicht erlaubt. Starte deshalb mit dem ersten Element, nicht mit " +
        "0, und laufe ab dem zweiten los.\n\n" +
        "Zwei getrennte Werte, nicht einer. Wer nur die laufende Summe führt und sie am " +
        "Ende zurückgibt, verliert ein Maximum, das in der Mitte lag und danach von " +
        "negativen Zahlen wieder aufgefressen wurde.\n\n" +
        "Das Gesamtmaximum gehört in jeden Durchlauf, nicht nur dorthin, wo du neu " +
        "anfängst.",
    },
  ],
  examples: [{ input: "[-2,1,-3,4,-1,2,1,-5,4]", output: "6" }],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "maxSubArray",
      typescript: "maxSubArray",
      python: "max_sub_array",
      ruby: "max_sub_array",
      php: "maxSubArray",
      java: "maxSubArray",
      go: "maxSubArray",
      cpp: "maxSubArray",
      csharp: "MaxSubArray",
      rust: "max_sub_array",
    },
  },
  testCases: [
    { id: 1, name: "Gemischt", input: "[-2,1,-3,4,-1,2,1,-5,4]", expected: "6" },
    { id: 2, name: "Ein Element", input: "[1]", expected: "1" },
    { id: 3, name: "Überwiegend positiv", input: "[5,4,-1,7,8]", expected: "23" },
    { id: 4, name: "Nur negativ", input: "[-1,-2,-3]", expected: "-1" },
    { id: 5, name: "Klein", input: "[3,-2,5,-1]", expected: "6" },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
  translations: {
    en: {
      title: "Maximum Subarray",
      description:
        "Implement maxSubArray(nums).\n\n" +
        "Return the largest possible sum of a contiguous subarray. The subarray holds at " +
        "least one element.\n\n" +
        "Contiguous means: no skipping. Trying out every start-end pair costs O(n²) and " +
        "passes the tests. It gets interesting with the single pass that needs no " +
        "looking back.",
      hints: [
        {
          title: "The idea",
          body:
            "Walk the array from left to right and ask yourself only one thing at every " +
            "position: does what lies to my left help me?\n\n" +
            "If the sum up to here is negative, it is dead weight. Every subarray that " +
            "drags it along would be larger without it. Then you start over at the current " +
            "element. Otherwise you carry it on. There is nothing else you need to know " +
            "about the past.",
        },
        {
          title: "The implementation",
          body:
            "Keep two values: the best sum that ends here, and the best sum you have ever " +
            "seen. Start both with the first element.\n\n" +
            "From the second element on, the sum ending here is the maximum of the element " +
            "alone and the element plus the sum so far. Then you update the overall " +
            "maximum. At the end you return the overall maximum.",
        },
        {
          title: "Where most people go wrong",
          body:
            "Zero as the starting value. For [-3,-1,-2] the answer is -1, not 0. An empty " +
            "subarray is not allowed. So start with the first element, not with 0, and run " +
            "from the second one on.\n\n" +
            "Two separate values, not one. Keep only the running sum and return it at the " +
            "end, and you lose a maximum that sat in the middle and was eaten up again by " +
            "the negative numbers after it.\n\n" +
            "The overall maximum belongs in every iteration, not only where you start over.",
        },
      ],
      testCaseNames: {
        "1": "Mixed",
        "2": "One element",
        "3": "Mostly positive",
        "4": "All negative",
        "5": "Small",
      },
    },
  },
};
