import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: 'function rangeExtraction(nums) {\n  // Your solution here\n  return "";\n}',
  typescript:
    'function rangeExtraction(nums: number[]): string {\n  // Your solution here\n  return "";\n}',
  python: 'def range_extraction(nums):\n    # Your solution here\n    return ""\n',
  php: "<?php\n\nfunction rangeExtraction($nums) {\n    // Your solution here\n    return '';\n}\n",
  ruby: 'def range_extraction(nums)\n  # Your solution here\n  ""\nend\n',
  java: 'static String rangeExtraction(int[] nums) {\n    // Your solution here\n    return "";\n}\n',
  go: 'func rangeExtraction(nums []int) string {\n\t// Your solution here\n\treturn ""\n}\n',
  cpp: 'string rangeExtraction(vector<int> nums) {\n    // Your solution here\n    return "";\n}\n',
  csharp: 'static string RangeExtraction(int[] nums) {\n    // Your solution here\n    return "";\n}\n',
  rust: "fn range_extraction(nums: Vec<i64>) -> String {\n    // Your solution here\n    String::new()\n}\n",
  swift: 'func rangeExtraction(_ nums: [Int]) -> String {\n    // Your solution here\n    return ""\n}\n',
};

export const challenge: ChallengeContent = {
  id: "challenge-range-extraction",
  title: "Range Extraction",
  description:
    "Implementiere rangeExtraction(nums).\n\n" +
    "Du bekommst eine aufsteigend sortierte Liste ganzer Zahlen ohne Duplikate. Gib sie als " +
    "kommagetrennten String zurück, in dem jede Folge von mindestens drei aufeinanderfolgenden " +
    "Zahlen zu einem Bereich „erste-letzte“ zusammengefasst ist. Zwei aufeinanderfolgende " +
    "Zahlen sind noch kein Bereich und bleiben einzeln stehen.\n\n" +
    '[-6,-3,-2,-1,0,1,3,4,5,7,8,9,10,11,14,15,17,18,19,20] → "-6,-3-1,3-5,7-11,14,15,17-20"\n\n' +
    "Der Bindestrich hat hier zwei Bedeutungen: Vorzeichen und Bereich. Aus -10 bis -8 wird " +
    "„-10--8“, und genau so wird es erwartet. Die Liste hat mindestens ein Element.",
  difficulty: "medium",
  points: 150,
  categoryId: CATEGORY.strings,
  hints: [
    {
      title: "Die Idee",
      body:
        "Zerlege die Liste in Läufe: Ein Lauf geht so lange weiter, wie jede Zahl genau um eins " +
        "größer ist als ihr Vorgänger. Für jeden Lauf entscheidet nur seine Länge, wie er " +
        "ausgegeben wird: ab drei Zahlen als „erste-letzte“, sonst jede Zahl für sich.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Zwei Indizes genügen. i markiert den Anfang eines Laufs, j läuft weiter, solange " +
        "nums[j + 1] == nums[j] + 1. Ist j - i >= 2, hänge nums[i] + \"-\" + nums[j] an die " +
        "Teile an, sonst jede Zahl von i bis j einzeln. Dann setze i = j + 1 und mach weiter, " +
        "bis die Liste durch ist. Zum Schluss verbindest du die Teile mit Kommas.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Der Lauf aus genau zwei Zahlen. [14,15] wird zu „14,15“, nicht zu „14-15“. Die Grenze " +
        "liegt bei drei Zahlen, also bei einem Abstand j - i von mindestens 2.\n\n" +
        "Der letzte Lauf. Wer einen Lauf erst abschließt, wenn eine Lücke kommt, vergisst den, " +
        "der am Ende der Liste noch offen ist.\n\n" +
        "Negative Zahlen nicht als Sonderfall behandeln. „-3-1“ und „-10--8“ sehen seltsam aus, " +
        "entstehen aber von allein, wenn du einfach erste Zahl, Bindestrich und letzte Zahl " +
        "hintereinanderschreibst.",
    },
  ],
  examples: [
    {
      input: "[-10,-9,-8,-6,-3,-2,-1,0,1,3,4,5,7,8,9,10,11,14,15,17,18,19,20]",
      output: '"-10--8,-6,-3-1,3-5,7-11,14,15,17-20"',
    },
    { input: "[1,2]", output: '"1,2"' },
  ],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "rangeExtraction",
      typescript: "rangeExtraction",
      python: "range_extraction",
      ruby: "range_extraction",
      php: "rangeExtraction",
      java: "rangeExtraction",
      go: "rangeExtraction",
      cpp: "rangeExtraction",
      csharp: "RangeExtraction",
      rust: "range_extraction",
      swift: "rangeExtraction",
    },
  },
  testCases: [
    {
      id: 1,
      name: "Beispiel",
      input: "[-10,-9,-8,-6,-3,-2,-1,0,1,3,4,5,7,8,9,10,11,14,15,17,18,19,20]",
      expected: '"-10--8,-6,-3-1,3-5,7-11,14,15,17-20"',
    },
    { id: 2, name: "Ein einziger Bereich", input: "[1,2,3,4,5]", expected: '"1-5"' },
    { id: 3, name: "Nur zwei Zahlen", input: "[1,2]", expected: '"1,2"' },
    { id: 4, name: "Keine Nachbarn", input: "[1,3,5,7]", expected: '"1,3,5,7"' },
    {
      id: 5,
      name: "Bereich am Ende",
      input: "[-3,-2,-1,2,10,15,16,18,19,20]",
      expected: '"-3--1,2,10,15,16,18-20"',
    },
    { id: 6, name: "Ein Element", input: "[0]", expected: '"0"' },
    {
      id: 7,
      name: "Über die Null",
      input: "[-6,-3,-2,-1,0,1,3,4,5,7,8,9,10,11,14,15,17,18,19,20]",
      expected: '"-6,-3-1,3-5,7-11,14,15,17-20"',
    },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
  translations: {
    en: {
      title: "Range Extraction",
      description:
        "Implement rangeExtraction(nums).\n\n" +
        "You get a list of integers in ascending order without duplicates. Return it as a " +
        "comma-separated string in which every run of at least three consecutive numbers is " +
        'collapsed into a range "first-last". Two consecutive numbers are not a range yet ' +
        "and stay on their own.\n\n" +
        '[-6,-3,-2,-1,0,1,3,4,5,7,8,9,10,11,14,15,17,18,19,20] → "-6,-3-1,3-5,7-11,14,15,17-20"\n\n' +
        "The hyphen has two meanings here: sign and range. -10 to -8 becomes \"-10--8\", and " +
        "that is exactly what is expected. The list has at least one element.",
      hints: [
        {
          title: "The idea",
          body:
            "Split the list into runs: a run goes on as long as each number is exactly one " +
            "larger than the one before. For each run, only its length decides how it is " +
            'written: from three numbers on as "first-last", otherwise each number on its own.',
        },
        {
          title: "The implementation",
          body:
            "Two indices are enough. i marks the start of a run, j moves on as long as " +
            "nums[j + 1] == nums[j] + 1. If j - i >= 2, append nums[i] + \"-\" + nums[j] to the " +
            "parts, otherwise each number from i to j on its own. Then set i = j + 1 and carry " +
            "on until the list is done. Finally, join the parts with commas.",
        },
        {
          title: "Where most people go wrong",
          body:
            'The run of exactly two numbers. [14,15] becomes "14,15", not "14-15". The ' +
            "threshold is three numbers, so a distance j - i of at least 2.\n\n" +
            "The last run. Whoever only closes a run when a gap comes up forgets the one that " +
            "is still open at the end of the list.\n\n" +
            'Do not treat negative numbers as a special case. "-3-1" and "-10--8" look odd, but ' +
            "they come out by themselves if you simply write first number, hyphen and last " +
            "number one after the other.",
        },
      ],
      testCaseNames: {
        "1": "Example",
        "2": "A single range",
        "3": "Only two numbers",
        "4": "No neighbours",
        "5": "Range at the end",
        "6": "One element",
        "7": "Across zero",
      },
    },
  },
};
