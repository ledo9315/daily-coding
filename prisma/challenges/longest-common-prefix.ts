import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: 'function longestCommonPrefix(strs) {\n  // Your solution here\n  return "";\n}',
  typescript:
    'function longestCommonPrefix(strs: string[]): string {\n  // Your solution here\n  return "";\n}',
  python: 'def longest_common_prefix(strs):\n    # Your solution here\n    return ""\n',
  php: "<?php\n\nfunction longestCommonPrefix($strs) {\n    // Your solution here\n    return '';\n}\n",
  ruby: "def longest_common_prefix(strs)\n  # Your solution here\n  ''\nend\n",
  java: 'static String longestCommonPrefix(String[] strs) {\n    // Your solution here\n    return "";\n}\n',
  go: 'func longestCommonPrefix(strs []string) string {\n\t// Your solution here\n\treturn ""\n}\n',
  cpp: 'string longestCommonPrefix(vector<string> strs) {\n    // Your solution here\n    return "";\n}\n',
  csharp:
    'static string LongestCommonPrefix(string[] strs) {\n    // Your solution here\n    return "";\n}\n',
  rust: "fn longest_common_prefix(strs: Vec<String>) -> String {\n    // Your solution here\n    String::new()\n}\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-longest-common-prefix",
  title: "Longest Common Prefix",
  description:
    "Implementiere longestCommonPrefix(strs).\n\n" +
    "Gib den längsten String zurück, mit dem alle Wörter im Array beginnen. Haben sie " +
    'keinen gemeinsamen Anfang, gib den leeren String "" zurück. Das Array enthält ' +
    "mindestens ein Wort; ein einzelnes Wort ist sein eigenes Präfix.\n\n" +
    "Das Präfix kann nie länger sein als das kürzeste Wort, und es kann nur schrumpfen: " +
    "Jedes weitere Wort kürzt es höchstens, verlängern kann es keines. Wer das nutzt, " +
    "muss nie zwei Wörter gegeneinander vergleichen, sondern immer nur eines gegen den " +
    "aktuellen Kandidaten.",
  difficulty: "easy",
  points: 100,
  categoryId: CATEGORY.strings,
  hints: [
    {
      title: "Die Idee",
      body:
        "Nimm das erste Wort als Kandidaten für das Präfix. Jedes weitere Wort kann " +
        "den Kandidaten nur kürzen – auf den Teil, den beide gemeinsam haben. Ist der " +
        "Kandidat nach allen Wörtern noch nicht leer, ist er das gesuchte Präfix.\n\n" +
        "Alternativ gehst du Position für Position: Solange alle Wörter an Stelle i " +
        "dasselbe Zeichen haben, gehört es zum Präfix. Beim ersten Unterschied ist Schluss.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Setze prefix auf strs[0]. Laufe über alle Wörter und kürze prefix um das letzte " +
        "Zeichen, solange das Wort nicht mit prefix beginnt. Wird prefix dabei leer, " +
        "kannst du sofort den leeren String zurückgeben. Bleibt nach dem letzten Wort " +
        "etwas übrig, gib es zurück.\n\n" +
        "Fast jede Sprache hat eine Funktion wie startsWith – die spart dir den " +
        "Zeichenvergleich von Hand.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Über das Ende eines kürzeren Wortes hinauslesen: \"flow\" hat kein fünftes " +
        "Zeichen. Wer zeichenweise vergleicht, prüft zuerst die Länge und dann das Zeichen.\n\n" +
        "Gesucht ist ein Präfix, kein gemeinsamer Teilstring. \"flow\" und \"slow\" teilen " +
        "sich \"low\", aber kein Präfix – das Ergebnis ist \"\".\n\n" +
        "Bei einem einzelnen Wort läuft der Vergleich ins Leere, das Wort selbst ist die " +
        "Antwort. Und gib bei „nichts gemeinsam“ den leeren String zurück, nicht null " +
        "oder undefined. Ein leeres Wort im Array macht das Präfix sofort leer – der Kandidat " +
        "wird auf nichts gekürzt.",
    },
  ],
  examples: [
    { input: '["flower","flow","flight"]', output: '"fl"' },
    { input: '["dog","racecar","car"]', output: '""' },
  ],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "longestCommonPrefix",
      typescript: "longestCommonPrefix",
      python: "longest_common_prefix",
      ruby: "longest_common_prefix",
      php: "longestCommonPrefix",
      java: "longestCommonPrefix",
      go: "longestCommonPrefix",
      cpp: "longestCommonPrefix",
      csharp: "LongestCommonPrefix",
      rust: "longest_common_prefix",
    },
  },
  testCases: [
    { id: 1, name: "Beispiel", input: '["flower","flow","flight"]', expected: '"fl"' },
    { id: 2, name: "Kein Präfix", input: '["dog","racecar","car"]', expected: '""' },
    { id: 3, name: "Ein Wort", input: '["alone"]', expected: '"alone"' },
    { id: 4, name: "Wort ist Präfix", input: '["interview","inter","internet"]', expected: '"inter"' },
    { id: 5, name: "Identisch", input: '["same","same","same"]', expected: '"same"' },
    { id: 6, name: "Teilstring, kein Präfix", input: '["flow","low","slow"]', expected: '""' },
    { id: 7, name: "Leeres Wort", input: '["abc","","abd"]', expected: '""' },
  ],
  translations: {
    en: {
      title: "Longest Common Prefix",
      description:
        "Implement longestCommonPrefix(strs).\n\n" +
        "Return the longest string that every word in the array starts with. If they share no " +
        'beginning, return the empty string "". The array holds at least one word; a single word ' +
        "is its own prefix.\n\n" +
        "The prefix can never be longer than the shortest word, and it can only shrink: every " +
        "further word cuts it at most, none can extend it. Use that and you never have to " +
        "compare two words against each other, only ever one against the current candidate.",
      hints: [
        {
          title: "The idea",
          body:
            "Take the first word as the candidate for the prefix. Every further word can only " +
            "cut the candidate down – to the part the two have in common. If the candidate is " +
            "still not empty after all the words, it is the prefix you are looking for.\n\n" +
            "Alternatively you go position by position: as long as every word has the same " +
            "character at position i, that character belongs to the prefix. The first difference " +
            "ends it.",
        },
        {
          title: "The implementation",
          body:
            "Set prefix to strs[0]. Walk over all the words and cut the last character off " +
            "prefix as long as the word does not start with prefix. If prefix runs empty on the " +
            "way, you can return the empty string right away. If something is left after the " +
            "last word, return it.\n\n" +
            "Almost every language has a function like startsWith – that saves you comparing " +
            "characters by hand.",
        },
        {
          title: "Where most people go wrong",
          body:
            'Reading past the end of a shorter word: "flow" has no fifth character. If you ' +
            "compare character by character, check the length first and the character second.\n\n" +
            'What is asked for is a prefix, not a common substring. "flow" and "slow" share ' +
            '"low", but no prefix – the result is "".\n\n' +
            "With a single word there is nothing to compare; the word itself is the " +
            'answer. And for "nothing in common" return the empty string, not null or ' +
            "undefined. An empty word in the array makes the prefix empty at once – the " +
            "candidate gets cut down to nothing.",
        },
      ],
      testCaseNames: {
        "1": "Example",
        "2": "No prefix",
        "3": "One word",
        "4": "Word is the prefix",
        "5": "Identical",
        "6": "Substring, not a prefix",
        "7": "Empty word",
      },
    },
  },
  starterCodes: starter,
  starterCode: starter.javascript,
};
