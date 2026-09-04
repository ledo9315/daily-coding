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
  translations: {
    en: {
      title: "Product of Array Except Self",
      description:
        "Implement productExceptSelf(nums).\n\n" +
        "Return an array of the same length in which position i holds the product of all the " +
        "numbers except nums[i]. Division is not allowed – not even the detour via the total " +
        "product. nums has between 2 and 20 elements, and every partial product fits into a " +
        "32-bit integer.\n\n" +
        "Multiplying all the others together for every position works and costs O(n²). The task " +
        "is after two passes: what stands to the left of a position and what stands to the right " +
        "of it can each be collected as you go – and the answer needs nothing more.",
      hints: [
        {
          title: "The idea",
          body:
            "The product of all the other numbers splits into two parts: everything to the left " +
            "of i and everything to the right of i. Both parts grow step by step – the prefix " +
            "product from left to right, the suffix product from right to left. At every " +
            "position the answer is the product of the two.",
        },
        {
          title: "The implementation",
          body:
            "Create the result array and fill it in a first pass with the prefix products: " +
            "result[i] is the product of nums[0] up to nums[i-1], so 1 for i = 0. Then walk from " +
            "right to left with a variable that holds the product of all the right-hand elements " +
            "you have seen so far. Multiply result[i] by it and only update the variable with " +
            "nums[i] afterwards.",
        },
        {
          title: "Where most people go wrong",
          body:
            "Zeros. If you build the total product and divide, a single zero makes you divide by " +
            "zero, and with two zeros there is no way back at all – which is exactly why " +
            "division is forbidden. With prefix and suffix, zeros simply pass through: " +
            "[-1,1,0,-3,3] gives [0,0,9,0,0].\n\n" +
            "The starting values: prefix and suffix start at 1, not at 0 – otherwise the whole " +
            "result is zeros.\n\n" +
            "The order on the way back: first multiply result[i] by the suffix, then extend the " +
            "suffix by nums[i]. The other way round, nums[i] ends up in its own result.",
        },
      ],
      testCaseNames: {
        "1": "Example",
        "2": "One zero",
        "3": "Two elements",
        "4": "Two zeros",
        "5": "Negatives",
        "6": "Primes",
      },
    },
  },
};
