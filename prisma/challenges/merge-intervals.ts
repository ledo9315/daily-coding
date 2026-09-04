import { BASE_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: "function merge(intervals) {\n  // Your solution here\n  return [];\n}",
  typescript:
    "function merge(intervals: number[][]): number[][] {\n  // Your solution here\n  return [];\n}",
  python: "def merge(intervals):\n    # Your solution here\n    return []\n",
  php: "<?php\n\nfunction merge($intervals) {\n    // Your solution here\n    return [];\n}\n",
  ruby: "def merge(intervals)\n  # Your solution here\n  []\nend\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-merge-intervals",
  title: "Merge Intervals",
  description:
    "Implementiere merge(intervals).\n\n" +
    "intervals ist eine Liste von Paaren [start, end]. Gib eine Liste zurück, in der alle " +
    "sich überlappenden Intervalle zu einem verschmolzen sind, aufsteigend nach start " +
    "sortiert. [[1,3],[2,6],[8,10],[15,18]] wird zu [[1,6],[8,10],[15,18]].\n\n" +
    "Zwei Intervalle, die sich nur berühren, überlappen auch: [1,4] und [4,5] ergeben [1,5]. " +
    "Die Eingabe ist nicht sortiert, und ein Intervall kann mehrere andere auf einmal " +
    "verschlucken.\n\n" +
    "Wer jedes Paar mit jedem vergleicht, landet bei O(n²) und muss danach noch einmal " +
    "aufräumen. Die Aufgabe ist einmal sortieren, dann ein Durchlauf: Danach kann ein " +
    "Intervall nur noch mit dem zuletzt gebauten Ergebnis verschmelzen.",
  difficulty: "medium",
  points: 150,
  categoryId: CATEGORY.algorithmen,
  hints: [
    {
      title: "Die Idee",
      body:
        "Sind die Intervalle nach start sortiert, kann sich ein Intervall nur noch mit seinem " +
        "Vorgänger im Ergebnis überlappen – alles davor endete früher oder steckt schon in " +
        "diesem Vorgänger. Damit bleibt pro Intervall genau eine Frage: Beginnt es, bevor das " +
        "letzte Ergebnis endet?",
    },
    {
      title: "Die Umsetzung",
      body:
        "Sortiere intervals nach dem ersten Element. Lege ein leeres Ergebnis an und geh die " +
        "sortierten Intervalle durch. Ist das Ergebnis leer oder beginnt das aktuelle " +
        "Intervall nach dem Ende des letzten Ergebnisses, häng es an. Sonst setze das Ende " +
        "des letzten Ergebnisses auf das Maximum aus beiden Enden.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Das neue Ende ist das Maximum beider Enden, nicht das des aktuellen Intervalls. Bei " +
        "[[1,10],[2,3]] endet das Ergebnis bei 10 – wer blind überschreibt, macht daraus " +
        "[1,3].\n\n" +
        "Berühren zählt als überlappen: Die Bedingung ist start <= letztes Ende, nicht <. " +
        "Sonst bleiben [1,4] und [4,5] getrennt.\n\n" +
        "Ohne Sortieren geht es nicht. [[4,7],[1,4]] muss zu [[1,7]] werden, und dafür muss " +
        "[1,4] zuerst dran sein.",
    },
  ],
  examples: [{ input: "[[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]" }],
  // Nested [start, end] pairs: the typed harness cannot express them, so interpreted languages only.
  supportedLanguages: [...BASE_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "merge",
      typescript: "merge",
      python: "merge",
      ruby: "merge",
      php: "merge",
    },
  },
  testCases: [
    {
      id: 1,
      name: "Beispiel",
      input: "[[1,3],[2,6],[8,10],[15,18]]",
      expected: "[[1,6],[8,10],[15,18]]",
    },
    { id: 2, name: "Berührung", input: "[[1,4],[4,5]]", expected: "[[1,5]]" },
    { id: 3, name: "Unsortiert", input: "[[4,7],[1,4]]", expected: "[[1,7]]" },
    { id: 4, name: "Ein Intervall", input: "[[1,4]]", expected: "[[1,4]]" },
    {
      id: 5,
      name: "Keine Überlappung",
      input: "[[1,2],[4,5],[7,8]]",
      expected: "[[1,2],[4,5],[7,8]]",
    },
    {
      id: 6,
      name: "Eines verschluckt alle",
      input: "[[2,3],[1,10],[4,5],[6,7]]",
      expected: "[[1,10]]",
    },
  ],
  translations: {
    en: {
      title: "Merge Intervals",
      description:
        "Implement merge(intervals).\n\n" +
        "intervals is a list of pairs [start, end]. Return a list in which all overlapping " +
        "intervals are merged into one, sorted ascending by start. " +
        "[[1,3],[2,6],[8,10],[15,18]] becomes [[1,6],[8,10],[15,18]].\n\n" +
        "Two intervals that only touch overlap as well: [1,4] and [4,5] give [1,5]. The input " +
        "is not sorted, and one interval can swallow several others at once.\n\n" +
        "Compare every pair with every other one and you land at O(n²) and still have to tidy " +
        "up afterwards. The task is: sort once, then a single pass – after that an interval can " +
        "only merge with the last result you built.",
      hints: [
        {
          title: "The idea",
          body:
            "Once the intervals are sorted by start, an interval can only overlap with its " +
            "predecessor in the result – everything before that ended earlier or is already " +
            "part of that predecessor. Which leaves exactly one question per interval: does it " +
            "begin before the last result ends?",
        },
        {
          title: "The implementation",
          body:
            "Sort intervals by their first element. Start with an empty result and walk " +
            "through the sorted intervals. If the result is empty, or the current interval " +
            "begins after the end of the last result, append it. Otherwise set the end of the " +
            "last result to the maximum of both ends.",
        },
        {
          title: "Where most people go wrong",
          body:
            "The new end is the maximum of both ends, not the end of the current interval. " +
            "For [[1,10],[2,3]] the result ends at 10 – overwrite it blindly and you turn it " +
            "into [1,3].\n\n" +
            "Touching counts as overlapping: the condition is start <= last end, not <. " +
            "Otherwise [1,4] and [4,5] stay apart.\n\n" +
            "There is no way around sorting. [[4,7],[1,4]] has to become [[1,7]], and for that " +
            "[1,4] has to come first.",
        },
      ],
      testCaseNames: {
        "1": "Example",
        "2": "Touching",
        "3": "Unsorted",
        "4": "One interval",
        "5": "No overlap",
        "6": "One swallows all",
      },
    },
  },
  starterCodes: starter,
  starterCode: starter.javascript,
};
