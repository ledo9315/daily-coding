import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript:
    "function coinChange(data) {\n  const { coins, amount } = data;\n  // Your solution here\n  return -1;\n}",
  typescript:
    "function coinChange(data: { coins: number[]; amount: number }): number {\n  const { coins, amount } = data;\n  // Your solution here\n  return -1;\n}",
  python:
    'def coin_change(data):\n    coins, amount = data["coins"], data["amount"]\n    # Your solution here\n    return -1\n',
  php: "<?php\n\nfunction coinChange($data) {\n    $coins = $data['coins'];\n    $amount = $data['amount'];\n    // Your solution here\n    return -1;\n}\n",
  ruby: "def coin_change(data)\n  coins, amount = data['coins'], data['amount']\n  # Your solution here\n  -1\nend\n",
  java: "static int coinChange(int[] coins, int amount) {\n    // Your solution here\n    return -1;\n}\n",
  go: "func coinChange(coins []int, amount int) int {\n\t// Your solution here\n\treturn -1\n}\n",
  cpp: "int coinChange(vector<int> coins, int amount) {\n    // Your solution here\n    return -1;\n}\n",
  csharp: "static int CoinChange(int[] coins, int amount) {\n    // Your solution here\n    return -1;\n}\n",
  rust: "fn coin_change(coins: Vec<i64>, amount: i64) -> i64 {\n    // Your solution here\n    -1\n}\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-coin-change",
  title: "Coin Change",
  description:
    "Implementiere coinChange(data) mit data = { coins, amount }.\n\n" +
    "coins enthält Münzwerte, von jedem gibt es unbegrenzt viele. Gib die kleinste Anzahl an " +
    "Münzen zurück, die zusammen genau amount ergeben – oder -1, wenn das nicht geht. Für " +
    "amount = 0 ist die Antwort 0. Alle Münzwerte sind positiv, und coins ist nicht " +
    "sortiert.\n\n" +
    "Immer die größte passende Münze zu nehmen sieht richtig aus und ist es nicht. Die Aufgabe " +
    "zielt auf die Einsicht, dass die beste Lösung für einen Betrag aus den besten Lösungen " +
    "für kleinere Beträge folgt – jeder Betrag ist genau eine Münze von einem kleineren " +
    "entfernt, und welche, probierst du durch.",
  difficulty: "medium",
  points: 150,
  categoryId: CATEGORY.algorithmen,
  hints: [
    {
      title: "Die Idee",
      body:
        "Die kleinste Münzzahl für einen Betrag b ist eins mehr als die kleinste Münzzahl für b " +
        "minus die zuletzt gelegte Münze. Welche Münze das ist, weißt du nicht – aber du kannst " +
        "alle durchprobieren, sobald die Antworten für alle kleineren Beträge feststehen. Also " +
        "baust du sie von 0 bis amount auf.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Ein Array dp der Länge amount + 1, gefüllt mit einem Wert, der „unerreichbar“ bedeutet " +
        "– amount + 1 reicht, denn keine gültige Lösung braucht mehr Münzen. dp[0] = 0. Für " +
        "jeden Betrag b von 1 bis amount und jede Münze c mit c <= b setzt du dp[b] = " +
        "min(dp[b], dp[b - c] + 1). Am Ende ist dp[amount] die Antwort – es sei denn, dort steht " +
        "noch der Unerreichbar-Wert, dann gibst du -1 zurück.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Die Gier: Bei coins = [1,3,4] und amount = 6 nimmt sie 4 + 1 + 1 und meldet 3. Richtig " +
        "sind 3 + 3, also 2 Münzen.\n\n" +
        "„Unerreichbar“ als Integer-Maximum kodieren und dann + 1 rechnen: In typisierten " +
        "Sprachen läuft das zu einer negativen Zahl über, die jedes Minimum gewinnt. Deshalb " +
        "amount + 1.\n\n" +
        "dp[0] muss 0 sein, nicht unerreichbar – sonst ist gar kein Betrag erreichbar. Für " +
        "amount = 0 ist das zugleich schon die Antwort.",
    },
  ],
  examples: [{ input: '{ "coins": [1,2,5], "amount": 11 }', output: "3" }],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "coinChange",
      typescript: "coinChange",
      python: "coin_change",
      ruby: "coin_change",
      php: "coinChange",
      java: "coinChange",
      go: "coinChange",
      cpp: "coinChange",
      csharp: "CoinChange",
      rust: "coin_change",
    },
  },
  testCases: [
    { id: 1, name: "Beispiel", input: '{"coins":[1,2,5],"amount":11}', expected: "3" },
    { id: 2, name: "Unmöglich", input: '{"coins":[2],"amount":3}', expected: "-1" },
    { id: 3, name: "Betrag null", input: '{"coins":[1],"amount":0}', expected: "0" },
    { id: 4, name: "Gier scheitert", input: '{"coins":[1,3,4],"amount":6}', expected: "2" },
    { id: 5, name: "Groß", input: '{"coins":[186,419,83,408],"amount":6249}', expected: "20" },
    { id: 6, name: "Unsortiert", input: '{"coins":[2,5,10,1],"amount":27}', expected: "4" },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
};
