import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: "function lengthOfLongestSubstring(s) {\n  // Your solution here\n  return 0;\n}",
  typescript:
    "function lengthOfLongestSubstring(s: string): number {\n  // Your solution here\n  return 0;\n}",
  python: "def length_of_longest_substring(s):\n    # Your solution here\n    return 0\n",
  php: "<?php\n\nfunction lengthOfLongestSubstring($s) {\n    // Your solution here\n    return 0;\n}\n",
  ruby: "def length_of_longest_substring(s)\n  # Your solution here\n  0\nend\n",
  java: "static int lengthOfLongestSubstring(String s) {\n    // Your solution here\n    return 0;\n}\n",
  go: "func lengthOfLongestSubstring(s string) int {\n\t// Your solution here\n\treturn 0\n}\n",
  cpp: "int lengthOfLongestSubstring(string s) {\n    // Your solution here\n    return 0;\n}\n",
  csharp: "static int LengthOfLongestSubstring(string s) {\n    // Your solution here\n    return 0;\n}\n",
  rust: "fn length_of_longest_substring(s: String) -> i64 {\n    // Your solution here\n    0\n}\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-longest-substring-without-repeating",
  title: "Longest Substring Without Repeating Characters",
  description:
    "Implementiere lengthOfLongestSubstring(s).\n\n" +
    "Gib die Länge des längsten zusammenhängenden Teilstrings von s zurück, in dem kein Zeichen " +
    'doppelt vorkommt. In "abcabcbb" ist das "abc" mit Länge 3, in "bbbbb" ist es "b" mit Länge 1. ' +
    "Der leere String ergibt 0.\n\n" +
    "Gesucht ist ein Teilstring, keine Teilfolge: Die Zeichen müssen direkt aufeinanderfolgen. " +
    'In "pwwkew" ist die Antwort 3 ("wke"), nicht 4 ("pwke").\n\n' +
    "Alle Teilstrings zu prüfen kostet O(n²) oder mehr. Die Aufgabe zielt auf das gleitende " +
    "Fenster: zwei Zeiger, die nur vorwärts laufen, und ein Gedächtnis dafür, wo jedes Zeichen " +
    "zuletzt stand.",
  difficulty: "medium",
  points: 150,
  categoryId: CATEGORY.strings,
  hints: [
    {
      title: "Die Idee",
      body:
        "Halte ein Fenster [left, right] ohne doppelte Zeichen. Rückt right um eins vor und das " +
        "neue Zeichen steht bereits im Fenster, springt left hinter dessen letztes Vorkommen – " +
        "alles davor kann ohnehin kein längeres gültiges Fenster mehr liefern. Die größte " +
        "Fensterbreite unterwegs ist die Antwort.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Leg eine Map von Zeichen auf den Index seines letzten Vorkommens an, dazu left = 0 und " +
        "best = 0. Laufe mit right über den String: Steht s[right] in der Map mit einem Index " +
        ">= left, setze left auf diesen Index + 1. Trage dann s[right] mit right ein und " +
        "aktualisiere best mit right - left + 1.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        'Der linke Zeiger darf nie zurückwandern. Bei "abba" steht beim letzten a das erste a ' +
        "mit Index 0 in der Map – left ist aber schon bei 2. Wer left blind auf 0 + 1 setzt, " +
        'zieht das Fenster wieder auf und zählt "bba" als gültig; erwartet ist 2. Daher die ' +
        "Bedingung: nur springen, wenn das gespeicherte Vorkommen im aktuellen Fenster liegt – " +
        "oder left = max(left, index + 1).\n\n" +
        "Der leere String ergibt 0, ein einzelnes Leerzeichen ist ein gültiges Zeichen und " +
        "ergibt 1.\n\n" +
        'Das Fenster nach jedem Schritt messen, nicht nur bei einem Treffer: Bei "dvdf" entsteht ' +
        'das längste Fenster "vdf" ganz am Ende, ohne dass noch ein Duplikat folgt.',
    },
  ],
  examples: [
    { input: '"abcabcbb"', output: "3" },
    { input: '"pwwkew"', output: "3" },
  ],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "lengthOfLongestSubstring",
      typescript: "lengthOfLongestSubstring",
      python: "length_of_longest_substring",
      ruby: "length_of_longest_substring",
      php: "lengthOfLongestSubstring",
      java: "lengthOfLongestSubstring",
      go: "lengthOfLongestSubstring",
      cpp: "lengthOfLongestSubstring",
      csharp: "LengthOfLongestSubstring",
      rust: "length_of_longest_substring",
    },
  },
  testCases: [
    { id: 1, name: "Beispiel", input: '"abcabcbb"', expected: "3" },
    { id: 2, name: "Nur ein Zeichen", input: '"bbbbb"', expected: "1" },
    { id: 3, name: "Teilstring, nicht Teilfolge", input: '"pwwkew"', expected: "3" },
    { id: 4, name: "Leer", input: '""', expected: "0" },
    { id: 5, name: "Leerzeichen", input: '" "', expected: "1" },
    { id: 6, name: "Fenster am Ende", input: '"dvdf"', expected: "3" },
    { id: 7, name: "Zeiger zurück", input: '"abba"', expected: "2" },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
};
