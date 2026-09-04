import { BASE_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: 'function likes(names) {\n  // Your solution here\n  return "";\n}',
  typescript: 'function likes(names: string[]): string {\n  // Your solution here\n  return "";\n}',
  python: 'def likes(names):\n    # Your solution here\n    return ""\n',
  php: "<?php\n\nfunction likes($names) {\n    // Your solution here\n    return '';\n}\n",
  ruby: 'def likes(names)\n  # Your solution here\n  ""\nend\n',
};

export const challenge: ChallengeContent = {
  id: "challenge-who-likes-it",
  title: "Who likes it?",
  description:
    "Implementiere likes(names).\n\n" +
    "Du kennst die Zeile unter jedem Beitrag in sozialen Netzwerken: wer das hier mit " +
    "„Gefällt mir“ markiert hat. Gib genau diesen Text zurück, abhängig davon, wie viele Namen " +
    "im Array stehen:\n\n" +
    '[] → "no one likes this"\n' +
    '["Peter"] → "Peter likes this"\n' +
    '["Jacob", "Alex"] → "Jacob and Alex like this"\n' +
    '["Max", "John", "Mark"] → "Max, John and Mark like this"\n' +
    '["Alex", "Jacob", "Mark", "Max"] → "Alex, Jacob and 2 others like this"\n\n' +
    "Ab vier Namen werden die ersten beiden genannt und der Rest gezählt. Die Ausgabe bleibt " +
    "englisch – sie ist die Vorgabe der Aufgabe und wird Zeichen für Zeichen verglichen.\n\n" +
    "Zu berechnen gibt es fast nichts. Die Aufgabe prüft, ob du die Fälle sauber trennst und " +
    "beim Zusammensetzen der Strings keine Kleinigkeit übersiehst.",
  difficulty: "easy",
  points: 120,
  categoryId: CATEGORY.strings,
  hints: [
    {
      title: "Die Idee",
      body:
        "Es gibt genau fünf Fälle, und sie hängen nur an der Länge des Arrays: 0, 1, 2, 3 und " +
        "alles ab 4. Die ersten vier sind Schablonen mit null bis drei Namen; der letzte nennt " +
        "zwei Namen und zählt den Rest, also names.length - 2.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Verzweige über die Länge – switch, if-Kette oder eine Map von Schablonen, das ist " +
        "Geschmackssache. Setze in jedem Zweig den String aus den passenden Namen zusammen und " +
        "gib ihn zurück. Der Fall ab vier Namen ist der default-Zweig, in dem du die Zahl der " +
        "Übrigen berechnest.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Singular und Plural: Ein Name bekommt „likes“, ab zwei Namen heißt es „like“. Der " +
        "Unterschied ist ein einzelner Buchstabe, und der Vergleich ist exakt.\n\n" +
        "Die Trennzeichen: Komma nach dem ersten Namen, „and“ vor dem letzten. Bei drei Namen " +
        "steht kein Komma vor dem „and“, und nirgends ein doppeltes Leerzeichen.\n\n" +
        "Ab vier Namen zählt die Zahl der übrigen, nicht die aller Namen: Bei vier Namen sind es " +
        "„2 others“, nicht „4 others“.",
    },
  ],
  examples: [
    { input: '["Jacob","Alex"]', output: '"Jacob and Alex like this"' },
    { input: '["Alex","Jacob","Mark","Max"]', output: '"Alex, Jacob and 2 others like this"' },
  ],
  // Interpreted only: the harness types the empty array as int[], which would not compile against String[] names.
  supportedLanguages: [...BASE_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "likes",
      typescript: "likes",
      python: "likes",
      ruby: "likes",
      php: "likes",
    },
  },
  testCases: [
    { id: 1, name: "Niemand", input: "[]", expected: '"no one likes this"' },
    { id: 2, name: "Ein Name", input: '["Peter"]', expected: '"Peter likes this"' },
    { id: 3, name: "Zwei Namen", input: '["Jacob","Alex"]', expected: '"Jacob and Alex like this"' },
    {
      id: 4,
      name: "Drei Namen",
      input: '["Max","John","Mark"]',
      expected: '"Max, John and Mark like this"',
    },
    {
      id: 5,
      name: "Vier Namen",
      input: '["Alex","Jacob","Mark","Max"]',
      expected: '"Alex, Jacob and 2 others like this"',
    },
    {
      id: 6,
      name: "Fünf Namen",
      input: '["Alex","Jacob","Mark","Max","Peter"]',
      expected: '"Alex, Jacob and 3 others like this"',
    },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
  translations: {
    en: {
      title: "Who likes it?",
      description:
        "Implement likes(names).\n\n" +
        "You know the line under every post on social networks: who marked this one with " +
        '"Like". Return exactly that text, depending on how many names are in the array:\n\n' +
        '[] → "no one likes this"\n' +
        '["Peter"] → "Peter likes this"\n' +
        '["Jacob", "Alex"] → "Jacob and Alex like this"\n' +
        '["Max", "John", "Mark"] → "Max, John and Mark like this"\n' +
        '["Alex", "Jacob", "Mark", "Max"] → "Alex, Jacob and 2 others like this"\n\n' +
        "From four names on, the first two are named and the rest are counted. The output is " +
        "compared character by character, so every space and every comma has to match.\n\n" +
        "There is almost nothing to compute. The task checks whether you keep the cases apart " +
        "cleanly and do not overlook some small thing while putting the strings together.",
      hints: [
        {
          title: "The idea",
          body:
            "There are exactly five cases, and they depend only on the length of the array: 0, " +
            "1, 2, 3 and everything from 4 on. The first four are templates with zero to three " +
            "names; the last one names two of them and counts the rest, so names.length - 2.",
        },
        {
          title: "The implementation",
          body:
            "Branch on the length – switch, a chain of ifs or a map of templates, that is a " +
            "matter of taste. In each branch, put the string together from the matching names " +
            "and return it. The case from four names on is the default branch, the one where " +
            "you work out how many are left over.",
        },
        {
          title: "Where most people go wrong",
          body:
            'Singular and plural: one name gets "likes", from two names on it is "like". The ' +
            "difference is a single letter, and the comparison is exact.\n\n" +
            'The separators: a comma after the first name, "and" before the last one. With ' +
            'three names there is no comma before the "and", and nowhere a double space.\n\n' +
            "From four names on, the number counts the ones left over, not all the names: with " +
            'four names it is "2 others", not "4 others".',
        },
      ],
      testCaseNames: {
        "1": "No one",
        "2": "One name",
        "3": "Two names",
        "4": "Three names",
        "5": "Four names",
        "6": "Five names",
      },
    },
  },
};
