import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript:
    "function isAnagram(data) {\n  const { s, t } = data;\n  // Your solution here\n  return false;\n}",
  typescript:
    "function isAnagram(data: { s: string; t: string }): boolean {\n  const { s, t } = data;\n  // Your solution here\n  return false;\n}",
  python:
    'def is_anagram(data):\n    s, t = data["s"], data["t"]\n    # Your solution here\n    return False\n',
  php: "<?php\n\nfunction isAnagram($data) {\n    $s = $data['s'];\n    $t = $data['t'];\n    // Your solution here\n    return false;\n}\n",
  java: "static boolean isAnagram(String s, String t) {\n    // Your solution here\n    return false;\n}\n",
  go: "func isAnagram(s string, t string) bool {\n\t// Your solution here\n\treturn false\n}\n",
  cpp: "bool isAnagram(string s, string t) {\n    // Your solution here\n    return false;\n}\n",
  csharp: "static bool IsAnagram(string s, string t) {\n    // Your solution here\n    return false;\n}\n",
  rust: "fn is_anagram(s: String, t: String) -> bool {\n    // Your solution here\n    false\n}\n",
  ruby: "def is_anagram(data)\n  s, t = data['s'], data['t']\n  # Your solution here\n  false\nend\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-valid-anagram",
  title: "Valid Anagram",
  description:
    "Implementiere isAnagram(data) mit data = { s, t }.\n\n" +
    "Gib true zurück, wenn t ein Anagramm von s ist, also aus denselben Buchstaben in " +
    "derselben Anzahl besteht.\n\n" +
    "Zwei Wege führen zum Ziel: sortieren und vergleichen, oder zählen und " +
    "vergleichen. Der erste ist kürzer, der zweite schneller, ein Fall, an dem sich " +
    "gut sehen lässt, was ein Sortiervorgang kostet.",
  difficulty: "easy",
  points: 100,
  categoryId: CATEGORY.strings,
  hints: [
    {
      title: "Die Idee",
      body:
        "Die Reihenfolge der Buchstaben ist egal, ihre Anzahl nicht. Du brauchst also " +
        "eine Darstellung, in der die Reihenfolge verschwindet: entweder beide Wörter " +
        "sortiert, oder für jedes Wort eine Tabelle, wie oft jeder Buchstabe " +
        "vorkommt.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Kurz: beide Strings in Zeichen zerlegen, sortieren, wieder zusammensetzen " +
        "und vergleichen. Das kostet O(n log n).\n\n" +
        "Schnell: eine Map anlegen, für jeden Buchstaben aus s hochzählen, für jeden " +
        "aus t herunterzählen. Bleibt am Ende jeder Zähler auf 0, sind es Anagramme. " +
        "Das ist ein Durchlauf pro Wort.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Die Länge zuerst. Sind s und t unterschiedlich lang, kann es kein Anagramm " +
        "sein, und beim Zählweg würdest du das sonst leicht übersehen, weil ein " +
        "zusätzlicher Buchstabe in t nur einen Zähler ins Minus schiebt.\n\n" +
        "Zwei leere Strings sind ein Anagramm: die Antwort ist true, nicht false.\n\n" +
        "Beim Vergleich von Buchstabentabellen reicht es nicht, dass jeder Buchstabe " +
        "aus s in t vorkommt. Es geht um die Anzahl. Prüfe die Zähler, nicht bloß " +
        "die Anwesenheit.",
    },
  ],
  examples: [{ input: '{ "s": "listen", "t": "silent" }', output: "true" }],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "isAnagram",
      typescript: "isAnagram",
      python: "is_anagram",
      ruby: "is_anagram",
      php: "isAnagram",
      java: "isAnagram",
      go: "isAnagram",
      cpp: "isAnagram",
      csharp: "IsAnagram",
      rust: "is_anagram",
    },
  },
  testCases: [
    { id: 1, name: "Anagramm", input: '{"s":"anagram","t":"nagaram"}', expected: "true" },
    { id: 2, name: "Kein Anagramm", input: '{"s":"rat","t":"car"}', expected: "false" },
    { id: 3, name: "Beide leer", input: '{"s":"","t":""}', expected: "true" },
    { id: 4, name: "Verschiedene Länge", input: '{"s":"a","t":"ab"}', expected: "false" },
    { id: 5, name: "Klassiker", input: '{"s":"listen","t":"silent"}', expected: "true" },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
  translations: {
    en: {
      title: "Valid Anagram",
      description:
        "Implement isAnagram(data) with data = { s, t }.\n\n" +
        "Return true if t is an anagram of s, meaning it consists of the same letters " +
        "in the same counts.\n\n" +
        "Two ways get you there: sort and compare, or count and compare. The first is " +
        "shorter, the second faster, a case where it is easy to see what a sort " +
        "actually costs.",
      hints: [
        {
          title: "The idea",
          body:
            "The order of the letters does not matter, their count does. So you need " +
            "a representation in which the order disappears: either both words sorted, " +
            "or a table per word of how often each letter occurs.",
        },
        {
          title: "The implementation",
          body:
            "Short: split both strings into characters, sort them, join them back " +
            "together and compare. That costs O(n log n).\n\n" +
            "Fast: set up a map, count up for every letter from s, count down for " +
            "every letter from t. If every counter ends at 0, they are anagrams. That " +
            "is one pass per word.",
        },
        {
          title: "Where most people go wrong",
          body:
            "The length first. If s and t have different lengths it cannot be an " +
            "anagram, and when counting you would easily miss that, " +
            "because one extra letter in t only pushes a single counter below zero.\n\n" +
            "Two empty strings are an anagram: the answer is true, not false.\n\n" +
            "When comparing letter tables it is not enough that every letter from s " +
            "occurs in t. It is about the counts. Check the counters, not just " +
            "presence.",
        },
      ],
      testCaseNames: {
        "1": "Anagram",
        "2": "Not an anagram",
        "3": "Both empty",
        "4": "Different lengths",
        "5": "The classic",
      },
    },
  },
};
