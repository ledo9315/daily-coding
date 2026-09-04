import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript:
    "function twoSum(data) {\n  const { nums, target } = data;\n  // Your solution here\n  return [];\n}",
  typescript:
    "function twoSum(data: { nums: number[]; target: number }): number[] {\n  const { nums, target } = data;\n  // Your solution here\n  return [];\n}",
  python:
    'def two_sum(data):\n    nums, target = data["nums"], data["target"]\n    # Your solution here\n    return []\n',
  php: "<?php\n\nfunction twoSum($data) {\n    $nums = $data['nums'];\n    $target = $data['target'];\n    // Your solution here\n    return [];\n}\n",
  java: "static int[] twoSum(int[] nums, int target) {\n    // Your solution here\n    return new int[]{};\n}\n",
  go: "func twoSum(nums []int, target int) []int {\n\t// Your solution here\n\treturn []int{}\n}\n",
  cpp: "vector<int> twoSum(vector<int> nums, int target) {\n    // Your solution here\n    return {};\n}\n",
  csharp: "static int[] TwoSum(int[] nums, int target) {\n    // Your solution here\n    return new int[]{};\n}\n",
  rust: "fn two_sum(nums: Vec<i64>, target: i64) -> Vec<i64> {\n    // Your solution here\n    vec![]\n}\n",
  ruby: "def two_sum(data)\n  nums, target = data['nums'], data['target']\n  # Your solution here\n  []\nend\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-two-sum",
  title: "Two Sum",
  description:
    "Implementiere twoSum(data) mit data = { nums, target }.\n\n" +
    "Gib die beiden Indizes (aufsteigend) zurück, deren Werte zusammen target ergeben. " +
    "Es existiert genau eine Lösung.\n\n" +
    "Jedes Paar durchzuprobieren funktioniert und kostet O(n²). Die Aufgabe zielt auf " +
    "den einen Durchlauf: Wer sich merkt, was er schon gesehen hat, muss den Partner " +
    "nicht suchen – er weiß, ob es ihn gibt.",
  difficulty: "medium",
  points: 150,
  categoryId: CATEGORY.algorithmen,
  hints: [
    {
      title: "Die Idee",
      body:
        "Zu jedem Element steht der gesuchte Partner fest: target - nums[i]. Die Frage " +
        "ist nicht mehr „welche zwei Zahlen passen zusammen\", sondern „kam diese eine " +
        "Zahl vorher schon vor\". Und das ist eine Frage, die eine Map in einem Schritt " +
        "beantwortet.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Lege eine Map an, die Wert auf Index abbildet. Laufe einmal durch das Array " +
        "und prüfe für jedes nums[i], ob target - nums[i] bereits in der Map steht. " +
        "Steht es dort, hast du beide Indizes: den gespeicherten und i. Steht es nicht " +
        "dort, trage nums[i] mit seinem Index ein und geh weiter.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Erst nachschlagen, dann eintragen. In der anderen Reihenfolge findet sich ein " +
        "Element bei target = 2 * nums[i] selbst und du gibst zweimal denselben Index " +
        "zurück.\n\n" +
        "Gefragt sind die Indizes, nicht die Werte – und aufsteigend. Wenn du beim " +
        "Treffer den gespeicherten Index zuerst nennst, stimmt die Reihenfolge von " +
        "allein, denn er liegt zwangsläufig vor i.\n\n" +
        "Doppelte Werte sind erlaubt: Die Map darf einen bereits belegten Wert " +
        "überschreiben, das kostet dich hier nichts.",
    },
  ],
  examples: [{ input: '{ "nums": [2,7,11,15], "target": 9 }', output: "[0,1]" }],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "twoSum",
      typescript: "twoSum",
      python: "two_sum",
      ruby: "two_sum",
      php: "twoSum",
      java: "twoSum",
      go: "twoSum",
      cpp: "twoSum",
      csharp: "TwoSum",
      rust: "two_sum",
    },
  },
  testCases: [
    { id: 1, name: "Beispiel", input: '{"nums":[2,7,11,15],"target":9}', expected: "[0,1]" },
    { id: 2, name: "Mitte", input: '{"nums":[3,2,4],"target":6}', expected: "[1,2]" },
    { id: 3, name: "Duplikate", input: '{"nums":[3,3],"target":6}', expected: "[0,1]" },
    { id: 4, name: "Ende", input: '{"nums":[1,2,3,4,5],"target":9}', expected: "[3,4]" },
    { id: 5, name: "Negative", input: '{"nums":[-1,-2,-3,-4],"target":-6}', expected: "[1,3]" },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
  translations: {
    en: {
      title: "Two Sum",
      description:
        "Implement twoSum(data) with data = { nums, target }.\n\n" +
        "Return the two indices (in ascending order) whose values add up to target. " +
        "There is exactly one solution.\n\n" +
        "Trying every pair works and costs O(n²). The point of the task is the single " +
        "pass: if you remember what you have already seen, you do not have to search " +
        "for the partner – you know whether it exists.",
      hints: [
        {
          title: "The idea",
          body:
            "For every element the partner you are looking for is fixed: " +
            "target - nums[i]. The question is no longer \"which two numbers fit " +
            "together\", it is \"has this one number come up before\". And that is a " +
            "question a map answers in a single step.",
        },
        {
          title: "The implementation",
          body:
            "Set up a map from value to index. Walk through the array once and check " +
            "for each nums[i] whether target - nums[i] is already in the map. If it " +
            "is, you have both indices: the stored one and i. If it is not, put " +
            "nums[i] in with its index and move on.",
        },
        {
          title: "Where most people go wrong",
          body:
            "Look up first, then insert. In the other order an element finds itself " +
            "when target = 2 * nums[i] and you return the same index twice.\n\n" +
            "You are asked for the indices, not the values – and in ascending order. " +
            "If you name the stored index first on a hit, the order comes out right by " +
            "itself, because it necessarily lies before i.\n\n" +
            "Duplicate values are allowed: the map may overwrite a value that is " +
            "already there, and that costs you nothing here.",
        },
      ],
      testCaseNames: {
        "1": "Example",
        "2": "Middle",
        "3": "Duplicates",
        "4": "End",
        "5": "Negatives",
      },
    },
  },
};
