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
};
