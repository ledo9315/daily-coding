import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: 'function duplicateEncode(word) {\n  // Your solution here\n  return "";\n}',
  typescript: 'function duplicateEncode(word: string): string {\n  // Your solution here\n  return "";\n}',
  python: 'def duplicate_encode(word):\n    # Your solution here\n    return ""\n',
  php: "<?php\n\nfunction duplicateEncode($word) {\n    // Your solution here\n    return '';\n}\n",
  ruby: "def duplicate_encode(word)\n  # Your solution here\n  ''\nend\n",
  java: 'static String duplicateEncode(String word) {\n    // Your solution here\n    return "";\n}\n',
  go: 'func duplicateEncode(word string) string {\n\t// Your solution here\n\treturn ""\n}\n',
  cpp: 'string duplicateEncode(string word) {\n    // Your solution here\n    return "";\n}\n',
  csharp: 'static string DuplicateEncode(string word) {\n    // Your solution here\n    return "";\n}\n',
  rust: "fn duplicate_encode(word: String) -> String {\n    // Your solution here\n    String::new()\n}\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-duplicate-encoder",
  title: "Duplicate Encoder",
  description:
    "Implementiere duplicateEncode(word).\n\n" +
    'Wandle den String in einen neuen String gleicher Länge um: Jedes Zeichen wird zu "(", ' +
    'wenn es im Wort nur einmal vorkommt, und zu ")", wenn es mehrfach vorkommt. Groß- und ' +
    'Kleinschreibung spielen dabei keine Rolle – "a" und "A" sind dasselbe Zeichen. ' +
    "Leerzeichen, Klammern und Sonderzeichen werden wie Buchstaben behandelt.\n\n" +
    "Der Reflex ist, für jedes Zeichen den ganzen String abzusuchen – O(n²). Die Aufgabe " +
    "zielt auf zwei Durchläufe: erst zählen, dann übersetzen.",
  difficulty: "easy",
  points: 120,
  categoryId: CATEGORY.strings,
  hints: [
    {
      title: "Die Idee",
      body:
        "Die Frage „kommt dieses Zeichen mehr als einmal vor“ beantwortet sich für alle " +
        "Zeichen gleichzeitig, wenn du einmal durchzählst. Danach ist die Übersetzung ein " +
        "Nachschlagen: Zähler 1 heißt \"(\", alles darüber heißt \")\". Zwei Durchläufe, " +
        "O(n).",
    },
    {
      title: "Die Umsetzung",
      body:
        "Wandle word zuerst komplett in Kleinbuchstaben um. Laufe einmal darüber und zähle " +
        "in einer Map, wie oft jedes Zeichen vorkommt. Laufe ein zweites Mal darüber und " +
        'hänge pro Zeichen "(" oder ")" an das Ergebnis, je nachdem, ob der Zähler 1 ist ' +
        "oder größer. Gib den zusammengesetzten String zurück.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        'Die Groß-/Kleinschreibung. In "Success" sind das große S und das kleine s dasselbe ' +
        'Zeichen, also beide ")". Wer nicht normalisiert, bekommt "(())())" statt ")())())". ' +
        "Am einfachsten wandelst du einmal ganz am Anfang um und rechnest danach nur noch " +
        "mit der Kleinbuchstaben-Version.\n\n" +
        'Leerzeichen und Symbole zählen wie Buchstaben. In "(( @" kommt das Leerzeichen einmal ' +
        'vor und wird zu "(", die runden Klammern kommen zweimal vor und werden zu ")" – ' +
        "das Ergebnis besteht selbst aus Klammern, die mit den Klammern der Eingabe nichts zu " +
        "tun haben – und das ist richtig so.\n\n" +
        "Wer für jedes Zeichen indexOf und lastIndexOf vergleicht, bekommt zwar das richtige " +
        "Ergebnis, aber in O(n²). Das reicht hier, gehört aber nicht zur Idee.",
    },
  ],
  examples: [
    { input: '"din"', output: '"((("' },
    { input: '"recede"', output: '"()()()"' },
  ],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "duplicateEncode",
      typescript: "duplicateEncode",
      python: "duplicate_encode",
      ruby: "duplicate_encode",
      php: "duplicateEncode",
      java: "duplicateEncode",
      go: "duplicateEncode",
      cpp: "duplicateEncode",
      csharp: "DuplicateEncode",
      rust: "duplicate_encode",
    },
  },
  testCases: [
    { id: 1, name: "Alle einzeln", input: '"din"', expected: '"((("' },
    { id: 2, name: "Gemischt", input: '"recede"', expected: '"()()()"' },
    { id: 3, name: "Groß und klein", input: '"Success"', expected: '")())())"' },
    { id: 4, name: "Symbole und Leerzeichen", input: '"(( @"', expected: '"))(("' },
    { id: 5, name: "Nur Groß/Klein", input: '"aA"', expected: '"))"' },
    { id: 6, name: "Kurz", input: '"abc"', expected: '"((("' },
  ],
  translations: {
    en: {
      title: "Duplicate Encoder",
      description:
        "Implement duplicateEncode(word).\n\n" +
        'Turn the string into a new string of the same length: every character becomes "(" ' +
        'if it appears only once in the word, and ")" if it appears more than once. Case ' +
        'does not matter here – "a" and "A" are the same character. Spaces, parentheses and ' +
        "special characters are treated like letters.\n\n" +
        "The reflex is to search the whole string for every character – O(n²). The task aims " +
        "at two passes: count first, then translate.",
      hints: [
        {
          title: "The idea",
          body:
            'The question "does this character appear more than once" answers itself for ' +
            "every character at once if you count through the string one time. After that, " +
            'translating is a lookup: a count of 1 means "(", anything above it means ")". ' +
            "Two passes, O(n).",
        },
        {
          title: "The implementation",
          body:
            "First convert word to lowercase as a whole. Walk over it once and count in a " +
            "map how often each character appears. Walk over it a second time and append " +
            '"(" or ")" per character to the result, depending on whether the count is 1 or ' +
            "greater. Return the assembled string.",
        },
        {
          title: "Where most people go wrong",
          body:
            'Upper and lower case. In "Success" the capital S and the lowercase s are the ' +
            'same character, so both become ")". Without normalizing you get "(())())" ' +
            'instead of ")())())". The easiest way is to convert once at the very start and ' +
            "work only with the lowercase version from then on.\n\n" +
            'Spaces and symbols count like letters. In "(( @" the space appears once and ' +
            'becomes "(", the parentheses appear twice and become ")" – so the result is ' +
            "itself made of parentheses that have nothing to do with the parentheses in the " +
            "input – and that is exactly right.\n\n" +
            "Comparing indexOf and lastIndexOf for every character does give the right " +
            "result, but in O(n²). It is good enough here, yet it is not the idea.",
        },
      ],
      testCaseNames: {
        "1": "All unique",
        "2": "Mixed",
        "3": "Upper and lower case",
        "4": "Symbols and spaces",
        "5": "Case only",
        "6": "Short",
      },
    },
  },
  starterCodes: starter,
  starterCode: starter.javascript,
};
