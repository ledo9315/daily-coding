import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: 'function decodeString(s) {\n  // Your solution here\n  return "";\n}',
  typescript: 'function decodeString(s: string): string {\n  // Your solution here\n  return "";\n}',
  python: 'def decode_string(s):\n    # Your solution here\n    return ""\n',
  php: "<?php\n\nfunction decodeString($s) {\n    // Your solution here\n    return '';\n}\n",
  ruby: 'def decode_string(s)\n  # Your solution here\n  ""\nend\n',
  java: 'static String decodeString(String s) {\n    // Your solution here\n    return "";\n}\n',
  go: 'func decodeString(s string) string {\n\t// Your solution here\n\treturn ""\n}\n',
  cpp: 'string decodeString(string s) {\n    // Your solution here\n    return "";\n}\n',
  csharp: 'static string DecodeString(string s) {\n    // Your solution here\n    return "";\n}\n',
  rust: "fn decode_string(s: String) -> String {\n    // Your solution here\n    String::new()\n}\n",
  swift: 'func decodeString(_ s: String) -> String {\n    // Your solution here\n    return ""\n}\n',
};

export const challenge: ChallengeContent = {
  id: "challenge-decode-string",
  title: "Decode String",
  description:
    "Implementiere decodeString(s).\n\n" +
    "Der String ist kodiert nach der Regel k[text]: Der Text in den eckigen Klammern wird " +
    "genau k-mal hintereinander geschrieben. Klammern dürfen verschachtelt sein, und " +
    "Buchstaben dürfen auch außerhalb jeder Klammer stehen. Gib den dekodierten String " +
    "zurück.\n\n" +
    '"3[a]2[bc]" → "aaabcbc"\n' +
    '"3[a2[c]]" → "accaccacc"\n' +
    '"2[abc]3[cd]ef" → "abcabccdcdcdef"\n\n' +
    "Die Eingabe ist immer wohlgeformt: Vor jeder öffnenden Klammer steht eine positive Zahl, " +
    "die auch mehrstellig sein kann, und Ziffern kommen nur als solche Zahlen vor.\n\n" +
    "Die Schwierigkeit ist die Verschachtelung. Das innere Stück muss fertig sein, bevor das " +
    "äußere wiederholt werden kann, und genau dafür gibt es den Stack.",
  difficulty: "medium",
  points: 150,
  categoryId: CATEGORY.datenstrukturen,
  hints: [
    {
      title: "Die Idee",
      body:
        "Lies den String von links nach rechts und baue dabei den aktuellen Text auf. Eine " +
        "öffnende Klammer unterbricht ihn: Merke dir, was du bisher hattest und wie oft das " +
        "Kommende wiederholt werden soll, und fang innen mit leerem Text an. Eine schließende " +
        "Klammer holt beides zurück und hängt den inneren Text so oft an, wie verlangt.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Du brauchst den aktuellen Text, die gerade gelesene Zahl und einen Stack aus Paaren. " +
        "Ziffer: zahl = zahl * 10 + ziffer. „[“: lege (text, zahl) auf den Stack, setze text " +
        "auf leer und zahl auf 0. „]“: nimm (vorher, k) vom Stack, text = vorher + text * k. " +
        "Buchstabe: an text anhängen. Am Ende ist text das Ergebnis.\n\n" +
        "Rekursiv geht es ebenso: Eine Funktion liest bis zur passenden schließenden Klammer " +
        "und gibt den Text und die Position dahinter zurück.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Mehrstellige Zahlen. „10[a]“ sind zehn a, nicht ein a nach einer Eins und einer Null. " +
        "Sammle Ziffern, bis die Klammer kommt, statt jede einzeln zu verarbeiten.\n\n" +
        "Den Text vor der Klammer vergessen. Bei „2[b3[a]]c“ muss das b erhalten bleiben, " +
        "während innen die drei a entstehen. Darum wandert der bisherige Text mit auf den " +
        "Stack.\n\n" +
        "Buchstaben nach der letzten Klammer. Das „ef“ am Ende von „2[abc]3[cd]ef“ gehört zum " +
        "Ergebnis und steht in keiner Klammer.",
    },
  ],
  examples: [
    { input: '"3[a]2[bc]"', output: '"aaabcbc"' },
    { input: '"3[a2[c]]"', output: '"accaccacc"' },
  ],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "decodeString",
      typescript: "decodeString",
      python: "decode_string",
      ruby: "decode_string",
      php: "decodeString",
      java: "decodeString",
      go: "decodeString",
      cpp: "decodeString",
      csharp: "DecodeString",
      rust: "decode_string",
      swift: "decodeString",
    },
  },
  testCases: [
    { id: 1, name: "Beispiel", input: '"3[a]2[bc]"', expected: '"aaabcbc"' },
    { id: 2, name: "Verschachtelt", input: '"3[a2[c]]"', expected: '"accaccacc"' },
    { id: 3, name: "Text am Ende", input: '"2[abc]3[cd]ef"', expected: '"abcabccdcdcdef"' },
    { id: 4, name: "Ohne Klammern", input: '"abc"', expected: '"abc"' },
    { id: 5, name: "Zweistellige Zahl", input: '"10[a]"', expected: '"aaaaaaaaaa"' },
    { id: 6, name: "Text vor der Klammer", input: '"2[b3[a]]c"', expected: '"baaabaaac"' },
    {
      id: 7,
      name: "Tief verschachtelt",
      input: '"3[z]2[2[y]pq4[2[jk]e1[f]]]ef"',
      expected: '"zzzyypqjkjkefjkjkefjkjkefjkjkefyypqjkjkefjkjkefjkjkefjkjkefef"',
    },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
  translations: {
    en: {
      title: "Decode String",
      description:
        "Implement decodeString(s).\n\n" +
        "The string is encoded by the rule k[text]: the text inside the square brackets is " +
        "written exactly k times in a row. Brackets may be nested, and letters may also stand " +
        "outside any bracket. Return the decoded string.\n\n" +
        '"3[a]2[bc]" → "aaabcbc"\n' +
        '"3[a2[c]]" → "accaccacc"\n' +
        '"2[abc]3[cd]ef" → "abcabccdcdcdef"\n\n' +
        "The input is always well-formed: every opening bracket is preceded by a positive " +
        "number, which may have several digits, and digits only appear as such numbers.\n\n" +
        "The difficulty is the nesting. The inner piece has to be finished before the outer " +
        "one can be repeated, and that is exactly what a stack is for.",
      hints: [
        {
          title: "The idea",
          body:
            "Read the string from left to right and build up the current text as you go. An " +
            "opening bracket interrupts it: remember what you had so far and how often what " +
            "follows is to be repeated, and start inside with an empty text. A closing " +
            "bracket brings both back and appends the inner text as many times as asked.",
        },
        {
          title: "The implementation",
          body:
            "You need the current text, the number read so far and a stack of pairs. Digit: " +
            'num = num * 10 + digit. "[": push (text, num) onto the stack, set text to empty ' +
            'and num to 0. "]": pop (before, k) from the stack, text = before + text * k. ' +
            "Letter: append to text. At the end, text is the result.\n\n" +
            "It works recursively as well: a function reads up to the matching closing " +
            "bracket and returns the text and the position after it.",
        },
        {
          title: "Where most people go wrong",
          body:
            'Numbers with several digits. "10[a]" is ten a, not an a after a one and a zero. ' +
            "Collect digits until the bracket comes instead of handling each one on its own." +
            "\n\n" +
            'Forgetting the text before the bracket. In "2[b3[a]]c" the b has to survive ' +
            "while the three a are being built inside. That is why the text so far goes onto " +
            "the stack as well.\n\n" +
            'Letters after the last bracket. The "ef" at the end of "2[abc]3[cd]ef" belongs to ' +
            "the result and is not inside any bracket.",
        },
      ],
      testCaseNames: {
        "1": "Example",
        "2": "Nested",
        "3": "Text at the end",
        "4": "No brackets",
        "5": "Two-digit number",
        "6": "Text before the bracket",
        "7": "Deeply nested",
      },
    },
  },
};
