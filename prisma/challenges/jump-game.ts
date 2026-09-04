import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: "function canJump(nums) {\n  // Your solution here\n  return false;\n}",
  typescript: "function canJump(nums: number[]): boolean {\n  // Your solution here\n  return false;\n}",
  python: "def can_jump(nums):\n    # Your solution here\n    return False\n",
  php: "<?php\n\nfunction canJump($nums) {\n    // Your solution here\n    return false;\n}\n",
  ruby: "def can_jump(nums)\n  # Your solution here\n  false\nend\n",
  java: "static boolean canJump(int[] nums) {\n    // Your solution here\n    return false;\n}\n",
  go: "func canJump(nums []int) bool {\n\t// Your solution here\n\treturn false\n}\n",
  cpp: "bool canJump(vector<int> nums) {\n    // Your solution here\n    return false;\n}\n",
  csharp: "static bool CanJump(int[] nums) {\n    // Your solution here\n    return false;\n}\n",
  rust: "fn can_jump(nums: Vec<i64>) -> bool {\n    // Your solution here\n    false\n}\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-jump-game",
  title: "Jump Game",
  description:
    "Implementiere canJump(nums).\n\n" +
    "Du stehst auf Index 0 eines Arrays; nums[i] ist die maximale Sprungweite von Position i " +
    "aus – kürzer springen darfst du immer. Gib true zurück, wenn du den letzten Index " +
    "erreichen kannst, sonst false. Alle Werte sind nicht negativ, und ein Array mit einem " +
    "einzigen Element gilt als erreicht.\n\n" +
    "Jeden möglichen Sprungpfad durchzuspielen explodiert schnell. Die Aufgabe zielt auf einen " +
    "einzigen Durchlauf mit einer einzigen Zahl: Wie weit kommst du bislang höchstens – und " +
    "reicht das, um überhaupt weiterzugehen?",
  difficulty: "medium",
  points: 150,
  categoryId: CATEGORY.algorithmen,
  hints: [
    {
      title: "Die Idee",
      body:
        "Welchen Weg du nimmst, ist egal; es zählt nur, wie weit du bislang höchstens kommst. " +
        "Diese Reichweite wächst, während du das Array durchgehst: Von jeder Position innerhalb " +
        "der Reichweite kommst du bis i + nums[i]. Erreicht die Reichweite den letzten Index, " +
        "lautet die Antwort ja. Stehst du an einer Position jenseits der Reichweite, lautet sie " +
        "nein – dorthin kommst du nie.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Eine Variable reach = 0. Für jeden Index i von 0 bis zum Ende: Ist i > reach, brich ab " +
        "und gib false zurück. Sonst setze reach = max(reach, i + nums[i]). Sobald reach den " +
        "letzten Index erreicht oder überschreitet, kannst du true zurückgeben – läuft die " +
        "Schleife durch, ebenfalls.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Der Vergleich ist i > reach, nicht i >= reach: Auf der Position genau am Rand der " +
        "Reichweite stehst du noch.\n\n" +
        "Eine Null blockiert nur, wenn nichts davor über sie hinausträgt. [2,0,0] geht, " +
        "[3,2,1,0,4] nicht – dort endet jeder Sprung genau auf der Null.\n\n" +
        "Ein einzelnes Element ist immer erreichbar, auch [0]: Du stehst schon am Ziel. Wer die " +
        "Schleife bei Index 1 beginnen lässt oder nums[0] = 0 pauschal als Sackgasse wertet, " +
        "gibt hier false zurück.",
    },
  ],
  examples: [{ input: "[2,3,1,1,4]", output: "true" }],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "canJump",
      typescript: "canJump",
      python: "can_jump",
      ruby: "can_jump",
      php: "canJump",
      java: "canJump",
      go: "canJump",
      cpp: "canJump",
      csharp: "CanJump",
      rust: "can_jump",
    },
  },
  testCases: [
    { id: 1, name: "Beispiel", input: "[2,3,1,1,4]", expected: "true" },
    { id: 2, name: "Blockiert", input: "[3,2,1,0,4]", expected: "false" },
    { id: 3, name: "Ein Element", input: "[0]", expected: "true" },
    { id: 4, name: "Zwei Elemente", input: "[1,0]", expected: "true" },
    { id: 5, name: "Null am Start", input: "[0,1]", expected: "false" },
    { id: 6, name: "Über Nullen hinweg", input: "[2,0,0]", expected: "true" },
  ],
  translations: {
    en: {
      title: "Jump Game",
      description:
        "Implement canJump(nums).\n\n" +
        "You start on index 0 of an array; nums[i] is the maximum jump distance from position i " +
        "– jumping shorter is always allowed. Return true if you can reach the last index, false " +
        "otherwise. All values are non-negative, and an array with a single element counts as " +
        "reached.\n\n" +
        "Playing through every possible path of jumps explodes fast. The task aims at a single " +
        "pass with a single number: how far can you get so far – and is that enough to move on " +
        "at all?",
      hints: [
        {
          title: "The idea",
          body:
            "Which path you take does not matter; all that counts is how far you can get so " +
            "far. That reach grows as you walk the array: from every position inside the reach " +
            "you get as far as i + nums[i]. Once the reach hits the last index, the answer is " +
            "yes. If you stand on a position beyond the reach, it is no – you will never get " +
            "there.",
        },
        {
          title: "The implementation",
          body:
            "One variable reach = 0. For every index i from 0 to the end: if i > reach, stop and " +
            "return false. Otherwise set reach = max(reach, i + nums[i]). As soon as reach meets " +
            "or passes the last index you can return true – and if the loop runs through, true " +
            "as well.",
        },
        {
          title: "Where most people go wrong",
          body:
            "The comparison is i > reach, not i >= reach: the position right at the edge of " +
            "the reach is still one you are standing on.\n\n" +
            "A zero only blocks you when nothing before it carries past it. [2,0,0] works, " +
            "[3,2,1,0,4] does not – there every jump lands exactly on the zero.\n\n" +
            "A single element is always reachable, [0] included: you are already at the goal. " +
            "Start the loop at index 1, or write off nums[0] = 0 as a dead end, and you return " +
            "false here.",
        },
      ],
      testCaseNames: {
        "1": "Example",
        "2": "Blocked",
        "3": "One element",
        "4": "Two elements",
        "5": "Zero at the start",
        "6": "Across zeros",
      },
    },
  },
  starterCodes: starter,
  starterCode: starter.javascript,
};
