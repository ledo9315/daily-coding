import { ALL_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: 'function humanReadable(seconds) {\n  // Your solution here\n  return "";\n}',
  typescript:
    'function humanReadable(seconds: number): string {\n  // Your solution here\n  return "";\n}',
  python: 'def human_readable(seconds):\n    # Your solution here\n    return ""\n',
  php: "<?php\n\nfunction humanReadable($seconds) {\n    // Your solution here\n    return '';\n}\n",
  ruby: 'def human_readable(seconds)\n  # Your solution here\n  ""\nend\n',
  java: 'static String humanReadable(int seconds) {\n    // Your solution here\n    return "";\n}\n',
  go: 'func humanReadable(seconds int) string {\n\t// Your solution here\n\treturn ""\n}\n',
  cpp: 'string humanReadable(int seconds) {\n    // Your solution here\n    return "";\n}\n',
  csharp: 'static string HumanReadable(int seconds) {\n    // Your solution here\n    return "";\n}\n',
  rust: "fn human_readable(seconds: i64) -> String {\n    // Your solution here\n    String::new()\n}\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-human-readable-time",
  title: "Human Readable Time",
  description:
    "Implementiere humanReadable(seconds).\n\n" +
    "Wandle eine Anzahl Sekunden in einen String im Format HH:MM:SS um. Jeder Teil hat genau " +
    'zwei Stellen, bei Bedarf mit führender Null: 5 Sekunden werden zu "00:00:05", 3661 ' +
    'Sekunden zu "01:01:01".\n\n' +
    "seconds liegt zwischen 0 und 359999. Die Stunden laufen nicht bei 24 über, sondern zählen " +
    'einfach weiter. Der größte Wert ergibt "99:59:59".\n\n' +
    "Die Rechnung ist Division mit Rest, dreimal. Die Aufgabe prüft, ob du die Anteile in der " +
    "richtigen Reihenfolge herauslöst und die Formatierung nicht dem Zufall überlässt.",
  difficulty: "easy",
  points: 120,
  categoryId: CATEGORY.strings,
  hints: [
    {
      title: "Die Idee",
      body:
        "Eine Stunde hat 3600 Sekunden, eine Minute 60. Die Stunden sind seconds ganzzahlig " +
        "durch 3600; was danach übrig bleibt (seconds % 3600), teilst du durch 60 für die " +
        "Minuten, und der Rest davon sind die Sekunden. Drei Zahlen, jede kleiner als 100.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Berechne h, m und s wie in der Idee beschrieben. Formatiere jede Zahl zweistellig: " +
        'padStart(2, "0") in JavaScript, f"{h:02d}" in Python, String.format("%02d") in Java, ' +
        "und füge sie mit Doppelpunkten zusammen. Wer lieber selbst rechnet: Bei Werten unter " +
        'zehn eine "0" voranstellen tut es auch.',
    },
    {
      title: "Woran die meisten scheitern",
      body:
        'Die Stunden bei 24 abschneiden. Es sind Dauern, keine Uhrzeiten. 86400 Sekunden sind "24:00:00", ' +
        'nicht "00:00:00".\n\n' +
        "Die Division muss ganzzahlig sein. In JavaScript liefert 3661 / 3600 einen Bruch, du " +
        "brauchst Math.floor; in Python ist es // statt /.\n\n" +
        'Die führende Null vergessen: "1:1:1" ist falsch, verlangt ist "01:01:01". Und für 0 ' +
        'kommt "00:00:00" heraus, kein leerer String.',
    },
  ],
  examples: [
    { input: "3661", output: '"01:01:01"' },
    { input: "86399", output: '"23:59:59"' },
  ],
  supportedLanguages: [...ALL_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "humanReadable",
      typescript: "humanReadable",
      python: "human_readable",
      ruby: "human_readable",
      php: "humanReadable",
      java: "humanReadable",
      go: "humanReadable",
      cpp: "humanReadable",
      csharp: "HumanReadable",
      rust: "human_readable",
    },
  },
  testCases: [
    { id: 1, name: "Null", input: "0", expected: '"00:00:00"' },
    { id: 2, name: "Nur Sekunden", input: "5", expected: '"00:00:05"' },
    { id: 3, name: "Eine Minute", input: "60", expected: '"00:01:00"' },
    { id: 4, name: "Beispiel", input: "3661", expected: '"01:01:01"' },
    { id: 5, name: "Fast ein Tag", input: "86399", expected: '"23:59:59"' },
    { id: 6, name: "Maximum", input: "359999", expected: '"99:59:59"' },
  ],
  translations: {
    en: {
      title: "Human Readable Time",
      description:
        "Implement humanReadable(seconds).\n\n" +
        "Turn a number of seconds into a string in HH:MM:SS format. Every part has exactly two " +
        'digits, padded with a leading zero where needed: 5 seconds become "00:00:05", 3661 ' +
        'seconds become "01:01:01".\n\n' +
        "seconds is between 0 and 359999. The hours do not wrap at 24, they simply keep " +
        'counting. The largest value gives "99:59:59".\n\n' +
        "The math is integer division with a remainder, three times. The task checks whether " +
        "you pull the parts out in the right order and do not leave the formatting to chance.",
      hints: [
        {
          title: "The idea",
          body:
            "An hour has 3600 seconds, a minute 60. The hours are seconds divided by 3600 with " +
            "the fraction dropped; what is left over (seconds % 3600) you divide by 60 for the " +
            "minutes, and the remainder of that is the seconds. Three numbers, each below 100.",
        },
        {
          title: "The implementation",
          body:
            "Compute h, m and s as described in the idea. Format each number to two digits: " +
            'padStart(2, "0") in JavaScript, f"{h:02d}" in Python, String.format("%02d") in ' +
            'Java, and join them with colons. If you would rather do it by hand: prefixing a "0" ' +
            "for values below ten works just as well.",
        },
        {
          title: "Where most people go wrong",
          body:
            "Cutting the hours off at 24. These are durations, not clock times. 86400 Seconds " +
            'are "24:00:00", not "00:00:00".\n\n' +
            "The division has to drop the fraction. In JavaScript 3661 / 3600 gives a decimal, " +
            "you need Math.floor; in Python it is // instead of /.\n\n" +
            'Forgetting the leading zero: "1:1:1" is wrong, "01:01:01" is what is asked for. And ' +
            '0 comes out as "00:00:00", not as an empty string.',
        },
      ],
      testCaseNames: {
        "1": "Zero",
        "2": "Seconds only",
        "3": "One minute",
        "4": "Example",
        "5": "Almost a day",
        "6": "Maximum",
      },
    },
  },
  starterCodes: starter,
  starterCode: starter.javascript,
};
