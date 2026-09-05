import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript:
    "function findMedianSortedArrays(data) {\n  const { nums1, nums2 } = data;\n  // Your solution here\n  return 0;\n}",
  typescript:
    "function findMedianSortedArrays(data: { nums1: number[]; nums2: number[] }): number {\n  const { nums1, nums2 } = data;\n  // Your solution here\n  return 0;\n}",
  python:
    'def find_median_sorted_arrays(data):\n    nums1, nums2 = data["nums1"], data["nums2"]\n    # Your solution here\n    return 0.0\n',
  php: "<?php\n\nfunction findMedianSortedArrays($data) {\n    $nums1 = $data['nums1'];\n    $nums2 = $data['nums2'];\n    // Your solution here\n    return 0.0;\n}\n",
  ruby: "def find_median_sorted_arrays(data)\n  nums1, nums2 = data['nums1'], data['nums2']\n  # Your solution here\n  0.0\nend\n",
  java: "static double findMedianSortedArrays(int[] nums1, int[] nums2) {\n    // Your solution here\n    return 0.0;\n}\n",
  go: "func findMedianSortedArrays(nums1 []int, nums2 []int) float64 {\n\t// Your solution here\n\treturn 0.0\n}\n",
  cpp: "double findMedianSortedArrays(vector<int> nums1, vector<int> nums2) {\n    // Your solution here\n    return 0.0;\n}\n",
  csharp:
    "static double FindMedianSortedArrays(int[] nums1, int[] nums2) {\n    // Your solution here\n    return 0.0;\n}\n",
  rust: "fn find_median_sorted_arrays(nums1: Vec<i64>, nums2: Vec<i64>) -> f64 {\n    // Your solution here\n    0.0\n}\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-median-of-two-sorted-arrays",
  title: "Median of Two Sorted Arrays",
  description:
    "Implementiere findMedianSortedArrays(data) mit data = { nums1, nums2 }.\n\n" +
    "nums1 und nums2 sind jeweils aufsteigend sortiert. Gib den Median aller Zahlen aus " +
    "beiden Arrays zusammen zurück, als Gleitkommazahl. Bei ungerader Gesamtanzahl ist das " +
    "die mittlere Zahl, bei gerader der Mittelwert der beiden mittleren: [1,3] und [2] " +
    "ergeben 2, [1,2] und [3,4] ergeben 2.5.\n\n" +
    "Eines der Arrays kann leer sein, beide zusammen enthalten mindestens eine Zahl. Die " +
    "Längen dürfen sich beliebig unterscheiden.\n\n" +
    "Beide Arrays zusammenzuführen und in die Mitte zu greifen funktioniert und kostet " +
    "O(m+n), damit bestehst du. Die eigentliche Herausforderung ist O(log(m+n)): eine " +
    "binäre Suche nach der Trennlinie, die beide Arrays so teilt, dass links genau die " +
    "Hälfte aller Zahlen liegt.",
  difficulty: "hard",
  points: 200,
  categoryId: CATEGORY.algorithmen,
  hints: [
    {
      title: "Die Idee",
      body:
        "Der Median trennt alle Zahlen in eine linke und eine rechte Hälfte. Schneidest du " +
        "das kürzere Array an Position i, liegt der Schnitt im längeren damit fest: " +
        "j = (m + n + 1) / 2 - i. Der Schnitt stimmt, wenn alles links von beiden Schnitten " +
        "kleiner oder gleich allem rechts ist, und das prüfst du mit nur vier Werten: dem " +
        "letzten links und dem ersten rechts in jedem Array.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Sorge dafür, dass nums1 das kürzere Array ist, und suche i binär zwischen 0 und m. " +
        "Zu jedem i berechne j und die vier Randwerte; fehlt ein Rand, weil der Schnitt ganz " +
        "am Anfang oder Ende liegt, nimm minus bzw. plus unendlich. Ist nums1[i-1] > nums2[j], " +
        "liegt der Schnitt zu weit rechts, also i verkleinern; ist nums2[j-1] > nums1[i], zu " +
        "weit links, also vergrößern. Passt es, ist der Median bei ungerader Gesamtzahl das " +
        "Maximum der beiden linken Ränder, bei gerader der Mittelwert aus diesem Maximum und " +
        "dem Minimum der beiden rechten Ränder.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Die binäre Suche läuft über das kürzere Array, sonst kann j negativ werden oder " +
        "über das Ende hinauslaufen. Wer die Arrays nicht tauscht, bekommt Indexfehler, die " +
        "nur bei manchen Eingaben auftauchen.\n\n" +
        "Die Rückgabe ist eine Gleitkommazahl. In Sprachen mit Ganzzahldivision ergibt " +
        "(2 + 3) / 2 den Wert 2 statt 2.5. Teile durch 2.0 oder wandle vorher um. 2 und 2.0 " +
        "gelten dabei als gleich.\n\n" +
        "Ein leeres Array ist ein normaler Fall: Alle seine Ränder sind unendlich, der Median " +
        "ist der des anderen Arrays. Und [0,0] mit [0,0] ergibt 0. Doppelte Werte sind " +
        "erlaubt, die Vergleiche brauchen deshalb <= statt <.",
    },
  ],
  examples: [{ input: '{ "nums1": [1,3], "nums2": [2] }', output: "2" }],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "findMedianSortedArrays",
      typescript: "findMedianSortedArrays",
      python: "find_median_sorted_arrays",
      ruby: "find_median_sorted_arrays",
      php: "findMedianSortedArrays",
      java: "findMedianSortedArrays",
      go: "findMedianSortedArrays",
      cpp: "findMedianSortedArrays",
      csharp: "FindMedianSortedArrays",
      rust: "find_median_sorted_arrays",
    },
  },
  testCases: [
    { id: 1, name: "Beispiel", input: '{"nums1":[1,3],"nums2":[2]}', expected: "2" },
    { id: 2, name: "Gerade Anzahl", input: '{"nums1":[1,2],"nums2":[3,4]}', expected: "2.5" },
    { id: 3, name: "Erstes Array leer", input: '{"nums1":[],"nums2":[1]}', expected: "1" },
    { id: 4, name: "Nur Nullen", input: '{"nums1":[0,0],"nums2":[0,0]}', expected: "0" },
    {
      id: 5,
      name: "Ungleiche Längen",
      input: '{"nums1":[1,2,3,4,5],"nums2":[6,7,8]}',
      expected: "4.5",
    },
    { id: 6, name: "Zweites Array leer", input: '{"nums1":[2],"nums2":[]}', expected: "2" },
  ],
  translations: {
    en: {
      title: "Median of Two Sorted Arrays",
      description:
        "Implement findMedianSortedArrays(data) with data = { nums1, nums2 }.\n\n" +
        "nums1 and nums2 are each sorted in ascending order. Return the median of all the " +
        "numbers from both arrays together, as a floating-point number. With an odd total " +
        "count that is the middle number, with an even one the average of the two middle " +
        "ones: [1,3] and [2] give 2, [1,2] and [3,4] give 2.5.\n\n" +
        "One of the arrays may be empty, together they hold at least one number. The lengths " +
        "may differ by any amount.\n\n" +
        "Merging both arrays and reaching into the middle works and costs O(m+n). That gets " +
        "you a pass. The real challenge is O(log(m+n)): a binary search for the dividing line " +
        "that splits both arrays so that exactly half of all the numbers lie to its left.",
      hints: [
        {
          title: "The idea",
          body:
            "The median separates all the numbers into a left and a right half. Cut the " +
            "shorter array at position i and the cut in the longer one is fixed with it: " +
            "j = (m + n + 1) / 2 - i. The cut is right when everything left of both cuts is " +
            "less than or equal to everything on the right, and you check that with only four " +
            "values: the last one on the left and the first one on the right in each array.",
        },
        {
          title: "The implementation",
          body:
            "Make sure nums1 is the shorter array, and search for i with a binary search " +
            "between 0 and m. For each i compute j and the four boundary values; where a " +
            "boundary is missing because the cut sits at the very start or end, take minus or " +
            "plus infinity. If nums1[i-1] > nums2[j], the cut is too far right, so shrink i; " +
            "if nums2[j-1] > nums1[i], it is too far left, so grow it. Once it fits, the median " +
            "is the maximum of the two left boundaries for an odd total, and for an even one " +
            "the average of that maximum and the minimum of the two right boundaries.",
        },
        {
          title: "Where most people go wrong",
          body:
            "The binary search runs over the shorter array, otherwise j can go negative or " +
            "run past the end. Skip the swap and you get index errors that only show up on " +
            "some inputs.\n\n" +
            "The return value is a floating-point number. In languages with integer division " +
            "(2 + 3) / 2 comes out as 2 instead of 2.5. Divide by 2.0 or convert first. 2 and " +
            "2.0 count as equal here.\n\n" +
            "An empty array is a normal case: all of its boundaries are infinite, and the " +
            "median is the one of the other array. And [0,0] with [0,0] gives 0. Duplicate " +
            "values are allowed, which is why the comparisons need <= rather than <.",
        },
      ],
      testCaseNames: {
        "1": "Example",
        "2": "Even count",
        "3": "First array empty",
        "4": "Only zeros",
        "5": "Unequal lengths",
        "6": "Second array empty",
      },
    },
  },
  starterCodes: starter,
  starterCode: starter.javascript,
};
