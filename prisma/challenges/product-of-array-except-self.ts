import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: "function productExceptSelf(nums) {\n  // Your solution here\n  return [];\n}",
  typescript:
    "function productExceptSelf(nums: number[]): number[] {\n  // Your solution here\n  return [];\n}",
  python: "def product_except_self(nums):\n    # Your solution here\n    return []\n",
  php: "<?php\n\nfunction productExceptSelf($nums) {\n    // Your solution here\n    return [];\n}\n",
  ruby: "def product_except_self(nums)\n  # Your solution here\n  []\nend\n",
  java: "static int[] productExceptSelf(int[] nums) {\n    // Your solution here\n    return new int[]{};\n}\n",
  go: "func productExceptSelf(nums []int) []int {\n\t// Your solution here\n\treturn []int{}\n}\n",
  cpp: "vector<int> productExceptSelf(vector<int> nums) {\n    // Your solution here\n    return {};\n}\n",
  csharp:
    "static int[] ProductExceptSelf(int[] nums) {\n    // Your solution here\n    return new int[]{};\n}\n",
  rust: "fn product_except_self(nums: Vec<i64>) -> Vec<i64> {\n    // Your solution here\n    vec![]\n}\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-product-of-array-except-self",
  title: "Product of Array Except Self",
  description:
    "Implementiere productExceptSelf(nums).\n\n" +
    "Gib ein Array derselben Länge zurück, in dem an Stelle i das Produkt aller Zahlen außer " +
    "nums[i] steht. Division ist nicht erlaubt – auch nicht der Umweg über das Gesamtprodukt. " +
    "nums hat zwischen 2 und 20 Elemente, und jedes Teilprodukt passt in einen 32-Bit-Integer.\n\n" +
    "Für jede Stelle alle anderen aufzumultiplizieren kostet O(n²). Die Aufgabe zielt auf zwei " +
    "Durchläufe: Was links von einer Stelle steht und was rechts von ihr steht, lässt sich " +
    "jeweils fortlaufend sammeln – und mehr braucht die Antwort nicht.",
  difficulty: "medium",
  points: 150,
  categoryId: CATEGORY.algorithmen,
  hints: [
    {
      title: "Die Idee",
      body:
        "Das Produkt aller anderen Zahlen zerfällt in zwei Teile: alles links von i und alles " +
        "rechts von i. Beide Teile wachsen Schritt für Schritt – das Präfixprodukt von links nach " +
        "rechts, das Suffixprodukt von rechts nach links. An jeder Stelle ist die Antwort das " +
        "Produkt der beiden.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Lege das Ergebnis-Array an und fülle es im ersten Durchlauf mit den Präfixprodukten: " +
        "result[i] ist das Produkt von nums[0] bis nums[i-1], für i = 0 also 1. Laufe dann von " +
        "rechts nach links mit einer Variable, die das Produkt aller bereits gesehenen rechten " +
        "Elemente hält. Multipliziere result[i] damit und aktualisiere die Variable erst danach " +
        "mit nums[i].",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Nullen. Wer das Gesamtprodukt bildet und teilt, teilt bei einer Null durch null, und bei " +
        "zwei Nullen führt kein Weg mehr zurück – genau deshalb ist Division verboten. Mit Präfix " +
        "und Suffix laufen Nullen einfach durch: [-1,1,0,-3,3] ergibt [0,0,9,0,0].\n\n" +
        "Die Startwerte: Präfix und Suffix beginnen bei 1, nicht bei 0 – sonst besteht das ganze " +
        "Ergebnis aus Nullen.\n\n" +
        "Die Reihenfolge im Rücklauf: Erst result[i] mit dem Suffix multiplizieren, dann das " +
        "Suffix um nums[i] erweitern. Andersherum steckt nums[i] in seinem eigenen Ergebnis.",
    },
  ],
  examples: [{ input: "[1,2,3,4]", output: "[24,12,8,6]" }],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "productExceptSelf",
      typescript: "productExceptSelf",
      python: "product_except_self",
      ruby: "product_except_self",
      php: "productExceptSelf",
      java: "productExceptSelf",
      go: "productExceptSelf",
      cpp: "productExceptSelf",
      csharp: "ProductExceptSelf",
      rust: "product_except_self",
    },
  },
  testCases: [
    { id: 1, name: "Beispiel", input: "[1,2,3,4]", expected: "[24,12,8,6]" },
    { id: 2, name: "Eine Null", input: "[-1,1,0,-3,3]", expected: "[0,0,9,0,0]" },
    { id: 3, name: "Zwei Elemente", input: "[3,7]", expected: "[7,3]" },
    { id: 4, name: "Zwei Nullen", input: "[0,4,0,5]", expected: "[0,0,0,0]" },
    { id: 5, name: "Negative", input: "[-2,-3,4,-1]", expected: "[12,8,-6,24]" },
    { id: 6, name: "Primzahlen", input: "[2,3,5,7,11,13]", expected: "[15015,10010,6006,4290,2730,2310]" },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
};
