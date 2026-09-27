import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript:
    'function createPhoneNumber(numbers) {\n  // Your solution here\n  return "";\n}',
  typescript:
    'function createPhoneNumber(numbers: number[]): string {\n  // Your solution here\n  return "";\n}',
  python: 'def create_phone_number(numbers):\n    # Your solution here\n    return ""\n',
  php: "<?php\n\nfunction createPhoneNumber($numbers) {\n    // Your solution here\n    return '';\n}\n",
  ruby: 'def create_phone_number(numbers)\n  # Your solution here\n  ""\nend\n',
  java: 'static String createPhoneNumber(int[] numbers) {\n    // Your solution here\n    return "";\n}\n',
  go: 'func createPhoneNumber(numbers []int) string {\n\t// Your solution here\n\treturn ""\n}\n',
  cpp: 'string createPhoneNumber(vector<int> numbers) {\n    // Your solution here\n    return "";\n}\n',
  csharp:
    'static string CreatePhoneNumber(int[] numbers) {\n    // Your solution here\n    return "";\n}\n',
  rust: "fn create_phone_number(numbers: Vec<i64>) -> String {\n    // Your solution here\n    String::new()\n}\n",
  swift:
    'func createPhoneNumber(_ numbers: [Int]) -> String {\n    // Your solution here\n    return ""\n}\n',
};

export const challenge: ChallengeContent = {
  id: "challenge-create-phone-number",
  title: "Create Phone Number",
  description:
    "Implementiere createPhoneNumber(numbers).\n\n" +
    "Du bekommst ein Array aus genau zehn Ziffern, jede zwischen 0 und 9. Gib sie als " +
    "Telefonnummer im US-Format zurück: die ersten drei in Klammern, ein Leerzeichen, die " +
    "nächsten drei, ein Bindestrich, die letzten vier.\n\n" +
    '[1,2,3,4,5,6,7,8,9,0] → "(123) 456-7890"\n\n' +
    "Die Ausgabe wird Zeichen für Zeichen verglichen. Es geht nicht ums Rechnen, sondern " +
    "darum, aus Zahlen einen String zu machen, ohne dass unterwegs eine Null oder ein " +
    "Leerzeichen verloren geht.",
  difficulty: "easy",
  points: 100,
  categoryId: CATEGORY.strings,
  hints: [
    {
      title: "Die Idee",
      body:
        "Das Format steht fest, nur die Ziffern ändern sich. Du brauchst drei Teilstücke des " +
        "Arrays: Positionen 0 bis 2, 3 bis 5 und 6 bis 9. Jedes wird zu einem String aus " +
        "Ziffern, und die drei setzt du mit Klammern, Leerzeichen und Bindestrich zusammen.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Mach aus dem Array einen String aus zehn Zeichen, etwa mit join(\"\") oder indem du " +
        "jede Ziffer anhängst. Dann schneidest du ihn in die drei Stücke und baust daraus " +
        "\"(\" + a + \") \" + b + \"-\" + c. Eine Alternative ist eine Schablone " +
        "\"(xxx) xxx-xxxx\", in der du jedes x der Reihe nach durch die nächste Ziffer ersetzt.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Nicht über eine Zahl gehen. Wer die Ziffern erst zu einer Zahl zusammenrechnet, " +
        "verliert führende Nullen: Aus [0,0,0,1,2,3,4,5,6,7] muss \"(000) 123-4567\" werden.\n\n" +
        "Das Leerzeichen nach der schließenden Klammer, und nur dort. Vor und nach dem " +
        "Bindestrich steht keines.\n\n" +
        "In typisierten Sprachen sind die Elemente Zahlen, keine Zeichen. Eine Ziffer d wird " +
        "zum Zeichen über ihre Stringdarstellung oder über '0' + d, nicht über einen Cast der " +
        "Zahl selbst, der bei 1 ein Steuerzeichen liefert.",
    },
  ],
  examples: [
    { input: "[1,2,3,4,5,6,7,8,9,0]", output: '"(123) 456-7890"' },
    { input: "[1,1,1,1,1,1,1,1,1,1]", output: '"(111) 111-1111"' },
  ],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "createPhoneNumber",
      typescript: "createPhoneNumber",
      python: "create_phone_number",
      ruby: "create_phone_number",
      php: "createPhoneNumber",
      java: "createPhoneNumber",
      go: "createPhoneNumber",
      cpp: "createPhoneNumber",
      csharp: "CreatePhoneNumber",
      rust: "create_phone_number",
      swift: "createPhoneNumber",
    },
  },
  testCases: [
    { id: 1, name: "Beispiel", input: "[1,2,3,4,5,6,7,8,9,0]", expected: '"(123) 456-7890"' },
    { id: 2, name: "Nur Einsen", input: "[1,1,1,1,1,1,1,1,1,1]", expected: '"(111) 111-1111"' },
    { id: 3, name: "Führende Nullen", input: "[0,0,0,1,2,3,4,5,6,7]", expected: '"(000) 123-4567"' },
    { id: 4, name: "Absteigend", input: "[9,8,7,6,5,4,3,2,1,0]", expected: '"(987) 654-3210"' },
    { id: 5, name: "Gemischt", input: "[5,5,5,8,6,7,5,3,0,9]", expected: '"(555) 867-5309"' },
    { id: 6, name: "Nur Nullen", input: "[0,0,0,0,0,0,0,0,0,0]", expected: '"(000) 000-0000"' },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
  translations: {
    en: {
      title: "Create Phone Number",
      description:
        "Implement createPhoneNumber(numbers).\n\n" +
        "You get an array of exactly ten digits, each between 0 and 9. Return them as a phone " +
        "number in US format: the first three in parentheses, a space, the next three, a " +
        "hyphen, the last four.\n\n" +
        '[1,2,3,4,5,6,7,8,9,0] → "(123) 456-7890"\n\n' +
        "The output is compared character by character. There is nothing to calculate; the " +
        "task is turning numbers into a string without losing a zero or a space on the way.",
      hints: [
        {
          title: "The idea",
          body:
            "The format is fixed, only the digits change. You need three slices of the array: " +
            "positions 0 to 2, 3 to 5 and 6 to 9. Each becomes a string of digits, and you put " +
            "the three together with parentheses, a space and a hyphen.",
        },
        {
          title: "The implementation",
          body:
            "Turn the array into a string of ten characters, with join(\"\") or by appending " +
            "each digit. Then cut it into the three pieces and build " +
            "\"(\" + a + \") \" + b + \"-\" + c. An alternative is a template " +
            "\"(xxx) xxx-xxxx\" in which you replace each x in turn with the next digit.",
        },
        {
          title: "Where most people go wrong",
          body:
            "Do not go through a number. Whoever adds the digits up into one number first " +
            "loses leading zeros: [0,0,0,1,2,3,4,5,6,7] has to become \"(000) 123-4567\".\n\n" +
            "The space after the closing parenthesis, and only there. There is none before or " +
            "after the hyphen.\n\n" +
            "In typed languages the elements are numbers, not characters. A digit d becomes a " +
            "character through its string representation or through '0' + d, not through a " +
            "cast of the number itself, which gives a control character for 1.",
        },
      ],
      testCaseNames: {
        "1": "Example",
        "2": "Only ones",
        "3": "Leading zeros",
        "4": "Descending",
        "5": "Mixed",
        "6": "Only zeros",
      },
    },
  },
};
