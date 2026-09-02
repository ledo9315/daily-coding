import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript:
    "function minDistance(data) {\n  const { word1, word2 } = data;\n  // Your solution here\n  return 0;\n}",
  typescript:
    "function minDistance(data: { word1: string; word2: string }): number {\n  const { word1, word2 } = data;\n  // Your solution here\n  return 0;\n}",
  python:
    'def min_distance(data):\n    word1, word2 = data["word1"], data["word2"]\n    # Your solution here\n    return 0\n',
  php: "<?php\n\nfunction minDistance($data) {\n    $word1 = $data['word1'];\n    $word2 = $data['word2'];\n    // Your solution here\n    return 0;\n}\n",
  ruby: "def min_distance(data)\n  word1, word2 = data['word1'], data['word2']\n  # Your solution here\n  0\nend\n",
  java: "static int minDistance(String word1, String word2) {\n    // Your solution here\n    return 0;\n}\n",
  go: "func minDistance(word1 string, word2 string) int {\n\t// Your solution here\n\treturn 0\n}\n",
  cpp: "int minDistance(string word1, string word2) {\n    // Your solution here\n    return 0;\n}\n",
  csharp: "static int MinDistance(string word1, string word2) {\n    // Your solution here\n    return 0;\n}\n",
  rust: "fn min_distance(word1: String, word2: String) -> i64 {\n    // Your solution here\n    0\n}\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-edit-distance",
  title: "Edit Distance",
  description:
    "Implementiere minDistance(data) mit data = { word1, word2 }.\n\n" +
    "Gib die kleinste Anzahl an Operationen zurück, mit der word1 zu word2 wird. Erlaubt " +
    "sind drei Operationen, jede kostet 1: ein Zeichen einfügen, ein Zeichen löschen, ein " +
    "Zeichen ersetzen. horse wird in 3 Schritten zu ros: horse → rorse → rose → ros.\n\n" +
    "Beide Wörter können leer sein; die Distanz zu einem leeren Wort ist die Länge des " +
    "anderen. Identische Wörter haben Distanz 0.\n\n" +
    "Alle Wege durchzuprobieren explodiert exponentiell. Die Aufgabe ist dynamische " +
    "Programmierung in einer Tabelle: Die Distanz zweier Präfixe hängt nur von drei bereits " +
    "berechneten Nachbarn ab.",
  difficulty: "hard",
  points: 200,
  categoryId: CATEGORY.strings,
  hints: [
    {
      title: "Die Idee",
      body:
        "Sei dp[i][j] die Distanz zwischen den ersten i Zeichen von word1 und den ersten j " +
        "Zeichen von word2. Sind die letzten Zeichen beider Präfixe gleich, kostet der Schritt " +
        "nichts: dp[i][j] = dp[i-1][j-1]. Sonst nimmst du das günstigste von drei Dingen und " +
        "zahlst 1: löschen (dp[i-1][j]), einfügen (dp[i][j-1]) oder ersetzen " +
        "(dp[i-1][j-1]).",
    },
    {
      title: "Die Umsetzung",
      body:
        "Lege eine Tabelle mit (m+1) × (n+1) Feldern an. Erste Zeile und erste Spalte sind " +
        "die Basisfälle: dp[i][0] = i und dp[0][j] = j, denn gegen ein leeres Wort hilft nur " +
        "löschen bzw. einfügen. Fülle dann Zeile für Zeile mit der Regel aus dem ersten " +
        "Hinweis. Das Ergebnis steht in dp[m][n].",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Die Tabelle ist um eins größer als die Wörter, weil Zeile 0 und Spalte 0 die leeren " +
        "Präfixe darstellen. dp[i][j] vergleicht deshalb word1[i-1] mit word2[j-1] – wer " +
        "word1[i] nimmt, liest ein Zeichen zu weit.\n\n" +
        "Die erste Zeile und Spalte müssen wirklich mit 0, 1, 2, … gefüllt sein, nicht mit Nullen. " +
        "Sonst ist die Distanz zu einem leeren Wort 0.\n\n" +
        "Alle drei Übergänge gehören ins Minimum. Wer das Ersetzen vergisst, macht aus " +
        "kitten → sitting 5 statt 3.",
    },
  ],
  examples: [{ input: '{ "word1": "horse", "word2": "ros" }', output: "3" }],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "minDistance",
      typescript: "minDistance",
      python: "min_distance",
      ruby: "min_distance",
      php: "minDistance",
      java: "minDistance",
      go: "minDistance",
      cpp: "minDistance",
      csharp: "MinDistance",
      rust: "min_distance",
    },
  },
  testCases: [
    { id: 1, name: "Beispiel", input: '{"word1":"horse","word2":"ros"}', expected: "3" },
    {
      id: 2,
      name: "Längere Wörter",
      input: '{"word1":"intention","word2":"execution"}',
      expected: "5",
    },
    { id: 3, name: "Erstes Wort leer", input: '{"word1":"","word2":"abc"}', expected: "3" },
    { id: 4, name: "Zweites Wort leer", input: '{"word1":"abc","word2":""}', expected: "3" },
    { id: 5, name: "Identisch", input: '{"word1":"same","word2":"same"}', expected: "0" },
    { id: 6, name: "Klassiker", input: '{"word1":"kitten","word2":"sitting"}', expected: "3" },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
};
