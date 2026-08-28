import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  startOfUtcDay,
  startOfUtcWeek,
  startOfUtcMonth,
} from "../lib/server/ranking-period";
import { seedAchievementDefs } from "../lib/server/achievement-defs";
import { starterAvatarPath } from "../lib/user-avatars";
import { nameKeyOf } from "../lib/display-name";
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import bcrypt from "bcryptjs";
import { challengeUpsertArgs } from "./challenge-upsert";

loadEnv({ path: resolve(process.cwd(), ".env") });
loadEnv({ path: resolve(process.cwd(), ".env.local"), override: true });

function addUtcDays(d: Date, delta: number): Date {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + delta);
  return x;
}

/*
  PROD_DATABASE_URL wins, and no .env file may touch it — same contract as
  prisma.production.config.ts. The two loadEnv calls above run with override: true, so a
  DATABASE_URL passed on the command line is silently replaced by whatever sits in .env.local:
  the seed then reports success against the local database while the caller believes it wrote to
  production. A separate name is the only thing those files cannot overwrite.
*/
const databaseUrl = process.env.PROD_DATABASE_URL?.trim() || process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL fehlt. Lege .env oder .env.local an (siehe .env.example)."
  );
}
if (process.env.PROD_DATABASE_URL?.trim()) {
  // Host only: the URL carries credentials.
  const host = (() => {
    try {
      return new URL(databaseUrl).host;
    } catch {
      return "(unlesbare URL)";
    }
  })();
  console.log(`[seed] PROD_DATABASE_URL gesetzt, Ziel ist ${host}`);
}
const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  const anchor = startOfUtcDay(new Date());
  const rankingWeekStart = startOfUtcWeek(anchor);
  const rankingMonthStart = startOfUtcMonth(anchor);

  const devPassword = process.env.SEED_DEV_PASSWORD ?? "DailyDev2024!";
  const devPasswordHash = await bcrypt.hash(devPassword, 12);
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? devPassword;
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);

  // ─── Users ───────────────────────────────────────────────────────────────────
  // Demo data (users, rankings, submissions, default admin) only on a full seed.
  // For production set SEED_CONTENT_ONLY=true: categories, achievements, challenges only.
  const contentOnly = process.env.SEED_CONTENT_ONLY === "true";

  /*
    A full seed creates demo users with a default password, plus fixture submissions and
    rankings. Against production that is not a mess to clean up, it is eleven accounts whose
    credentials are in this file. One forgotten variable is too little between here and there.
  */
  if (process.env.PROD_DATABASE_URL?.trim() && !contentOnly) {
    throw new Error(
      "PROD_DATABASE_URL ohne SEED_CONTENT_ONLY=true: Das würde Demo-Nutzer, " +
        "Beispiel-Abgaben und Rankings in die Produktionsdatenbank schreiben. Abgebrochen."
    );
  }

  let anna!: { id: string }, tom!: { id: string }, max!: { id: string },
    lisa!: { id: string }, sarah!: { id: string }, jan!: { id: string },
    julia!: { id: string }, peter!: { id: string }, maria!: { id: string },
    david!: { id: string };

  if (!contentOnly) {
  await prisma.user.upsert({
    where: { email: "admin@dailydev.local" },
    update: {
      passwordHash: adminPasswordHash,
      role: "admin",
    },
    create: {
      id: "user-admin",
      name: "Admin",
      nameKey: nameKeyOf("Admin"),
      initials: "AD",
      avatar: starterAvatarPath("Admin"),
      email: "admin@dailydev.local",
      passwordHash: adminPasswordHash,
      role: "admin",
      streak: 0,
      streakRecord: 0,
    },
  });

  anna = await prisma.user.upsert({
    where: { email: "anna.schmidt@company.com" },
    update: { passwordHash: devPasswordHash },
    create: {
      id: "user-anna",
      name: "Anna Schmidt",
      nameKey: nameKeyOf("Anna Schmidt"),
      initials: "AS",
      avatar: starterAvatarPath("Anna Schmidt"),
      email: "anna.schmidt@company.com",
      passwordHash: devPasswordHash,
      streak: 5,
      streakRecord: 28,
    },
  });

  tom = await prisma.user.upsert({
    where: { email: "tom.weber@company.com" },
    update: { passwordHash: devPasswordHash },
    create: {
      id: "user-tom",
      name: "Tom Weber",
      nameKey: nameKeyOf("Tom Weber"),
      initials: "TW",
      avatar: starterAvatarPath("Tom Weber"),
      email: "tom.weber@company.com",
      passwordHash: devPasswordHash,
      streak: 7,
      streakRecord: 30,
    },
  });

  max = await prisma.user.upsert({
    where: { email: "max.mustermann@company.com" },
    update: { passwordHash: devPasswordHash },
    create: {
      id: "user-max",
      name: "Max Mustermann",
      nameKey: nameKeyOf("Max Mustermann"),
      initials: "MM",
      avatar: starterAvatarPath("Max Mustermann"),
      email: "max.mustermann@company.com",
      passwordHash: devPasswordHash,
      streak: 12,
      streakRecord: 28,
    },
  });

  lisa = await prisma.user.upsert({
    where: { email: "lisa.mueller@company.com" },
    update: { passwordHash: devPasswordHash },
    create: {
      id: "user-lisa",
      name: "Lisa Müller",
      nameKey: nameKeyOf("Lisa Müller"),
      initials: "LM",
      avatar: starterAvatarPath("Lisa Müller"),
      email: "lisa.mueller@company.com",
      passwordHash: devPasswordHash,
      streak: 3,
      streakRecord: 20,
    },
  });

  sarah = await prisma.user.upsert({
    where: { email: "sarah.klein@company.com" },
    update: { passwordHash: devPasswordHash },
    create: {
      id: "user-sarah",
      name: "Sarah Klein",
      nameKey: nameKeyOf("Sarah Klein"),
      initials: "SK",
      avatar: starterAvatarPath("Sarah Klein"),
      email: "sarah.klein@company.com",
      passwordHash: devPasswordHash,
      streak: 0,
      streakRecord: 15,
    },
  });

  jan = await prisma.user.upsert({
    where: { email: "jan.becker@company.com" },
    update: { passwordHash: devPasswordHash },
    create: {
      id: "user-jan",
      name: "Jan Becker",
      nameKey: nameKeyOf("Jan Becker"),
      initials: "JB",
      avatar: starterAvatarPath("Jan Becker"),
      email: "jan.becker@company.com",
      passwordHash: devPasswordHash,
      streak: 2,
      streakRecord: 18,
    },
  });

  julia = await prisma.user.upsert({
    where: { email: "julia.fischer@company.com" },
    update: { passwordHash: devPasswordHash },
    create: {
      id: "user-julia",
      name: "Julia Fischer",
      nameKey: nameKeyOf("Julia Fischer"),
      initials: "JF",
      avatar: starterAvatarPath("Julia Fischer"),
      email: "julia.fischer@company.com",
      passwordHash: devPasswordHash,
      streak: 4,
      streakRecord: 14,
    },
  });

  peter = await prisma.user.upsert({
    where: { email: "peter.hoffmann@company.com" },
    update: { passwordHash: devPasswordHash },
    create: {
      id: "user-peter",
      name: "Peter Hoffmann",
      nameKey: nameKeyOf("Peter Hoffmann"),
      initials: "PH",
      avatar: starterAvatarPath("Peter Hoffmann"),
      email: "peter.hoffmann@company.com",
      passwordHash: devPasswordHash,
      streak: 1,
      streakRecord: 10,
    },
  });

  maria = await prisma.user.upsert({
    where: { email: "maria.wagner@company.com" },
    update: { passwordHash: devPasswordHash },
    create: {
      id: "user-maria",
      name: "Maria Wagner",
      nameKey: nameKeyOf("Maria Wagner"),
      initials: "MW",
      avatar: starterAvatarPath("Maria Wagner"),
      email: "maria.wagner@company.com",
      passwordHash: devPasswordHash,
      streak: 2,
      streakRecord: 12,
    },
  });

  david = await prisma.user.upsert({
    where: { email: "david.schulz@company.com" },
    update: { passwordHash: devPasswordHash },
    create: {
      id: "user-david",
      name: "David Schulz",
      nameKey: nameKeyOf("David Schulz"),
      initials: "DS",
      avatar: starterAvatarPath("David Schulz"),
      email: "david.schulz@company.com",
      passwordHash: devPasswordHash,
      streak: 3,
      streakRecord: 9,
    },
  });
  } // Ende Demo-Nutzer

  // ─── Categories ──────────────────────────────────────────────────────────────

  const catAlgorithmen = await prisma.category.upsert({
    where: { id: "cat-algorithmen" },
    update: {},
    create: { id: "cat-algorithmen", name: "Algorithmen" },
  });
  const catBaeume = await prisma.category.upsert({
    where: { id: "cat-baeume" },
    update: {},
    create: { id: "cat-baeume", name: "Bäume" },
  });
  const catDatenstrukturen = await prisma.category.upsert({
    where: { id: "cat-datenstrukturen" },
    update: {},
    create: { id: "cat-datenstrukturen", name: "Datenstrukturen" },
  });
  const catStrings = await prisma.category.upsert({
    where: { id: "cat-strings" },
    update: {},
    create: { id: "cat-strings", name: "Strings" },
  });

  // ─── Achievement Definitions (global) ────────────────────────────────────────

  await seedAchievementDefs(prisma);

  // ─── User Achievements ────────────────────────────────────────────────────────

  if (!contentOnly) {
  const userAchievements = [
    { userId: max.id, achievementId: "ach-1", unlockedAt: new Date("2026-01-15") },
    { userId: max.id, achievementId: "ach-2", unlockedAt: new Date("2026-01-22") },
    { userId: max.id, achievementId: "ach-3", unlockedAt: new Date("2026-01-25") },
    { userId: max.id, achievementId: "ach-4", unlockedAt: new Date("2026-01-28") },
    { userId: max.id, achievementId: "ach-5", unlockedAt: null },
    { userId: max.id, achievementId: "ach-6", unlockedAt: null },
  ];

  for (const ua of userAchievements) {
    await prisma.userAchievement.upsert({
      where: { userId_achievementId: { userId: ua.userId, achievementId: ua.achievementId } },
      update: {},
      create: ua,
    });
  }
  } // Ende Demo-User-Achievements

  // ─── Challenges ───────────────────────────────────────────────────────────────

  const supportedLangs = ["javascript", "typescript", "python", "php", "ruby"] as const;
  /*
    The typed languages need the shape of a test case to be expressible as typed parameters, so
    they are opt-in per challenge rather than part of the base set. Hash Map (values of mixed type in one
    array) and Binary Tree Traversal (a recursive node structure) stay without them — offering a
    language whose submission cannot pass is worse than not offering it. The two share one list
    because the limit is the same: it comes from the test data, not from the language.
  */
  const langsWithTypes = [...supportedLangs, "java", "go", "cpp", "csharp", "rust"] as const;

  const challengeToday = await prisma.challenge.upsert(
    challengeUpsertArgs({
      id: "challenge-array-manipulation",
      title: "Array Manipulation Challenge",
      description:
        "Implementiere transformArray(arr).\n\n" +
        "Gib ein neues Array zurück, in dem jedes Element die Summe aller Elemente bis zu " +
        "dieser Position enthält, sich selbst eingeschlossen.\n\n" +
        "Für jede Position von vorn neu zu summieren funktioniert und kostet O(n²). Es " +
        "geht in einem Durchlauf, denn die Summe bis Position i ist die Summe bis i-1 plus " +
        "das aktuelle Element.",
      difficulty: "medium",
      points: 150,
      categoryId: catAlgorithmen.id,
      hints: [
        {
          title: "Die Idee",
          body:
            "Jeder Wert im Ergebnis unterscheidet sich von seinem Vorgänger um genau ein " +
            "Element: das an dieser Stelle. Du musst also nichts wiederholt aufsummieren, " +
            "sondern nur eine laufende Summe mitführen und fortschreiben.",
        },
        {
          title: "Die Umsetzung",
          body:
            "Leg eine Variable für die Summe an und starte sie bei 0. Geh das Array einmal " +
            "von links nach rechts durch, addiere das aktuelle Element auf die Summe und " +
            "häng ihren neuen Wert ans Ergebnis. Am Ende gibst du das Ergebnis-Array " +
            "zurück.",
        },
        {
          title: "Woran die meisten scheitern",
          body:
            "Die verschachtelte Schleife. Wer für jede Position wieder bei Index 0 " +
            "anfängt, bekommt dasselbe Ergebnis in quadratischer Zeit – bei dieser Aufgabe " +
            "geht es genau um den Unterschied.\n\n" +
            "Gefragt ist ein neues Array. Das übergebene zu überschreiben ist unsauber, " +
            "auch wenn die Tests es hier nicht bemerken.\n\n" +
            "Das leere Array muss ein leeres Array ergeben, keinen Fehler und keine [0].",
        },
      ],
      examples: [
        { input: "[1, 2, 3, 4, 5]", output: "[1, 3, 6, 10, 15]" },
        { input: "[5, -2, 3, 1]", output: "[5, 3, 6, 7]" },
      ],
      evaluationConfig: {
        callableByLanguage: {
          javascript: "transformArray",
          typescript: "transformArray",
          python: "transform_array",
          ruby: "transform_array",
          php: "transformArray",
          java: "transformArray",
          go: "transformArray",
          cpp: "transformArray",
          csharp: "TransformArray",
          rust: "transform_array",
        },
      },
      testCases: [
        {
          id: 1,
          name: "Einfaches Array",
          input: "[1,2,3,4,5]",
          expected: "[1,3,6,10,15]",
        },
        { id: 2, name: "Leeres Array", input: "[]", expected: "[]" },
        {
          id: 3,
          name: "Negative Zahlen",
          input: "[-1,-2,-3]",
          expected: "[-1,-3,-6]",
        },
        {
          id: 4,
          name: "Gemischte Werte",
          input: "[5,-2,3,1]",
          expected: "[5,3,6,7]",
        },
        { id: 5, name: "Ein Element", input: "[42]", expected: "[42]" },
      ],
      supportedLanguages: [...langsWithTypes],
      starterCodes: {
        javascript: "function transformArray(arr) {\n  // Your solution here\n}",
        typescript:
          "function transformArray(arr: number[]): number[] {\n  // Your solution here\n  return arr;\n}",
        python:
          "def transform_array(arr):\n    # Your solution here\n    pass\n",
        php: "<?php\n\nfunction transformArray($arr) {\n    // Your solution here\n}\n",
        java: "static int[] transformArray(int[] arr) {\n    // Your solution here\n    return new int[]{};\n}\n",
        go: "func transformArray(arr []int) []int {\n\t// Your solution here\n\treturn []int{}\n}\n",
        cpp: "vector<int> transformArray(vector<int> arr) {\n    // Your solution here\n    return {};\n}\n",
        csharp: "static int[] TransformArray(int[] arr) {\n    // Your solution here\n    return new int[]{};\n}\n",
        rust: "fn transform_array(arr: Vec<i64>) -> Vec<i64> {\n    // Your solution here\n    vec![]\n}\n",
        ruby: "def transform_array(arr)\n  # Your solution here\n  []\nend\n",
      },
      starterCode: "function transformArray(arr) {\n  // Your solution here\n}",
      isActive: true,
      date: anchor,
    }),
  );

  const binarySearchFields = {
    supportedLanguages: [...langsWithTypes],
    evaluationConfig: {
      callableByLanguage: {
        javascript: "binarySearch",
        typescript: "binarySearch",
        python: "binary_search",
        ruby: "binary_search",
        php: "binarySearch",
        java: "binarySearch",
        go: "binarySearch",
        cpp: "binarySearch",
        csharp: "BinarySearch",
        rust: "binary_search",
      },
    },
    testCases: [
      { id: 1, name: "Wert in der Mitte", input: '{"arr":[1,3,5,7,9],"target":5}', expected: "2" },
      { id: 2, name: "Erstes Element", input: '{"arr":[1,3,5,7,9],"target":1}', expected: "0" },
      { id: 3, name: "Letztes Element", input: '{"arr":[1,3,5,7,9],"target":9}', expected: "4" },
      { id: 4, name: "Nicht vorhanden", input: '{"arr":[1,3,5,7,9],"target":4}', expected: "-1" },
      { id: 5, name: "Leeres Array", input: '{"arr":[],"target":1}', expected: "-1" },
    ],
    starterCodes: {
      javascript:
        "function binarySearch(data) {\n  const { arr, target } = data;\n  // Your solution here\n  return -1;\n}",
      typescript:
        "function binarySearch(data: { arr: number[]; target: number }): number {\n  const { arr, target } = data;\n  // Your solution here\n  return -1;\n}",
      python:
        'def binary_search(data):\n    arr, target = data["arr"], data["target"]\n    # Your solution here\n    return -1\n',
      php: "<?php\n\nfunction binarySearch($data) {\n    $arr = $data['arr'];\n    $target = $data['target'];\n    // Your solution here\n    return -1;\n}\n",
      java: "static int binarySearch(int[] arr, int target) {\n    // Your solution here\n    return -1;\n}\n",
      go: "func binarySearch(arr []int, target int) int {\n\t// Your solution here\n\treturn -1\n}\n",
      cpp: "int binarySearch(vector<int> arr, int target) {\n    // Your solution here\n    return -1;\n}\n",
      csharp: "static int BinarySearch(int[] arr, int target) {\n    // Your solution here\n    return -1;\n}\n",
      rust: "fn binary_search(arr: Vec<i64>, target: i64) -> i64 {\n    // Your solution here\n    -1\n}\n",
      ruby: "def binary_search(data)\n  arr, target = data['arr'], data['target']\n  # Your solution here\n  -1\nend\n",
    },
    starterCode:
      "function binarySearch(data) {\n  const { arr, target } = data;\n  // Your solution here\n  return -1;\n}",
  };

  const challengeBinarySearch = await prisma.challenge.upsert(
    challengeUpsertArgs({
      id: "challenge-binary-search",
      title: "Binary Search",
      description:
        "Implementiere binarySearch(data) mit data = { arr, target }.\n\n" +
        "arr ist aufsteigend sortiert. Gib den Index von target zurück – oder -1, wenn " +
        "target nicht enthalten ist.\n\n" +
        "Die binäre Suche nutzt aus, dass das Array sortiert ist: statt jedes Element zu " +
        "prüfen, halbiert sie den Suchbereich mit jedem Vergleich. Das ist O(log n) statt " +
        "O(n) – bei einer Million Einträgen rund 20 Schritte statt einer Million. Ein " +
        "indexOf besteht die Tests, geht aber an der Aufgabe vorbei.",
      difficulty: "easy",
      points: 120,
      categoryId: catAlgorithmen.id,
      hints: [
        {
          title: "Die Idee",
          body:
            "Vergleiche target mit dem Element in der Mitte. Ist das zu groß, kann target " +
            "nur links davon liegen; ist es zu klein, nur rechts. Jeder Vergleich wirft " +
            "also die Hälfte des Bereichs weg.",
        },
        {
          title: "Die Umsetzung",
          body:
            "Halte den Suchbereich in zwei Indizes: low = 0 und high = arr.length - 1. " +
            "Solange low <= high, berechne mid = Math.floor((low + high) / 2). Trifft " +
            "arr[mid] das Ziel, gib mid zurück. Ist arr[mid] kleiner, suche rechts weiter " +
            "(low = mid + 1), sonst links (high = mid - 1).",
        },
        {
          title: "Woran die meisten scheitern",
          body:
            "Die Grenze muss über mid hinaus wandern (mid + 1 bzw. mid - 1). Bleibt sie " +
            "auf mid stehen, schrumpft der Bereich irgendwann nicht mehr und die Schleife " +
            "läuft endlos.\n\n" +
            "Und mid gehört in jeden Durchlauf neu berechnet, nicht vor die Schleife.\n\n" +
            "Endet die Schleife ohne Treffer, ist die Antwort -1 – das deckt auch das " +
            "leere Array ab.",
        },
      ],
      examples: [
        { input: '{ "arr": [1,3,5,7,9], "target": 5 }', output: "2" },
        { input: '{ "arr": [1,3,5,7,9], "target": 4 }', output: "-1" },
      ],
      ...binarySearchFields,
      isActive: false,
      date: addUtcDays(anchor, -1),
    }),
  );

  const stringReversalFields = {
    supportedLanguages: [...langsWithTypes],
    evaluationConfig: {
      callableByLanguage: {
        javascript: "reverseString",
        typescript: "reverseString",
        python: "reverse_string",
        ruby: "reverse_string",
        php: "reverseString",
        java: "reverseString",
        go: "reverseString",
        cpp: "reverseString",
        csharp: "ReverseString",
        rust: "reverse_string",
      },
    },
    testCases: [
      { id: 1, name: "Einfaches Wort", input: '"hello"', expected: '"olleh"' },
      { id: 2, name: "Leerer String", input: '""', expected: '""' },
      { id: 3, name: "Ein Zeichen", input: '"a"', expected: '"a"' },
      { id: 4, name: "Palindrom", input: '"racecar"', expected: '"racecar"' },
      { id: 5, name: "Mit Satzzeichen", input: '"Hello, World!"', expected: '"!dlroW ,olleH"' },
    ],
    starterCodes: {
      javascript: "function reverseString(s) {\n  // Your solution here\n  return s;\n}",
      typescript:
        "function reverseString(s: string): string {\n  // Your solution here\n  return s;\n}",
      python: "def reverse_string(s):\n    # Your solution here\n    return s\n",
      php: "<?php\n\nfunction reverseString($s) {\n    // Your solution here\n    return $s;\n}\n",
      java: "static String reverseString(String s) {\n    // Your solution here\n    return s;\n}\n",
      go: "func reverseString(s string) string {\n\t// Your solution here\n\treturn s\n}\n",
      cpp: "string reverseString(string s) {\n    // Your solution here\n    return s;\n}\n",
      csharp: "static string ReverseString(string s) {\n    // Your solution here\n    return s;\n}\n",
      rust: "fn reverse_string(s: String) -> String {\n    // Your solution here\n    s\n}\n",
      ruby: "def reverse_string(s)\n  # Your solution here\n  s\nend\n",
    },
    starterCode: "function reverseString(s) {\n  // Your solution here\n  return s;\n}",
  };

  const challengeStringReversal = await prisma.challenge.upsert(
    challengeUpsertArgs({
      id: "challenge-string-reversal",
      title: "String Reversal",
      description:
        "Implementiere reverseString(s).\n\n" +
        "Gib den übergebenen String in umgekehrter Zeichenreihenfolge zurück.\n\n" +
        "Jede Sprache hat dafür einen Einzeiler, und der ist hier auch eine gültige " +
        "Antwort. Wer etwas mitnehmen will, schreibt die Schleife einmal selbst – sie " +
        "steckt in jedem Palindrom-Check und in jeder Zwei-Zeiger-Aufgabe wieder.",
      difficulty: "easy",
      points: 100,
      categoryId: catStrings.id,
      hints: [
        {
          title: "Die Idee",
          body:
            "Ein String ist eine Folge von Zeichen mit Positionen. Umdrehen heißt: das " +
            "letzte Zeichen kommt an Position 0, das vorletzte an Position 1, und so " +
            "weiter. Entweder liest du von hinten nach vorn, oder du tauschst paarweise " +
            "von außen nach innen.",
        },
        {
          title: "Die Umsetzung",
          body:
            "Der kurze Weg: in Zeichen zerlegen, die Reihenfolge umkehren, wieder " +
            "zusammensetzen. In JavaScript s.split(\"\").reverse().join(\"\"), in Python " +
            "s[::-1], in PHP strrev.\n\n" +
            "Der lehrreiche Weg: eine Schleife vom letzten Index rückwärts bis 0, die " +
            "jedes Zeichen an ein Ergebnis hängt.",
        },
        {
          title: "Woran die meisten scheitern",
          body:
            "Der letzte Index ist Länge minus 1. Bei Länge zu starten liefert nichts oder " +
            "einen Fehler, je nach Sprache.\n\n" +
            "Strings sind in JavaScript und Python unveränderlich: Du kannst kein Zeichen " +
            "über s[i] = … zuweisen, sondern baust ein neues Ergebnis auf.\n\n" +
            "Der leere String ergibt den leeren String. Ein Palindrom ergibt sich selbst – " +
            "beides sind gültige Eingaben und keine Sonderfälle, die du abfangen musst.",
        },
      ],
      examples: [
        { input: '"hello"', output: '"olleh"' },
        { input: '"racecar"', output: '"racecar"' },
      ],
      ...stringReversalFields,
      isActive: false,
      date: addUtcDays(anchor, -2),
    }),
  );

  const hashMapFields = {
    supportedLanguages: [...supportedLangs],
    evaluationConfig: {
      callableByLanguage: {
        javascript: "hashMap",
        typescript: "hashMap",
        python: "hash_map",
        ruby: "hash_map",
        php: "hashMap",
      },
    },
    testCases: [
      {
        id: 1,
        name: "Set und Get",
        input: '[["set","a",1],["get","a"],["get","b"]]',
        expected: "[null,1,null]",
      },
      {
        id: 2,
        name: "Überschreiben",
        input: '[["set","x",5],["set","x",9],["get","x"]]',
        expected: "[null,null,9]",
      },
      {
        id: 3,
        name: "Has und Delete",
        input: '[["set","k",7],["has","k"],["delete","k"],["has","k"],["get","k"]]',
        expected: "[null,true,true,false,null]",
      },
      { id: 4, name: "Fehlender Schlüssel", input: '[["get","nope"]]', expected: "[null]" },
      {
        id: 5,
        name: "Delete nicht vorhanden",
        input: '[["set","a",1],["set","b",2],["delete","c"],["get","b"]]',
        expected: "[null,null,false,2]",
      },
    ],
    starterCodes: {
      javascript: "function hashMap(operations) {\n  // Your solution here\n  return [];\n}",
      typescript: "function hashMap(operations: any[]): any[] {\n  // Your solution here\n  return [];\n}",
      python: "def hash_map(operations):\n    # Your solution here\n    return []\n",
      php: "<?php\n\nfunction hashMap($operations) {\n    // Your solution here\n    return [];\n}\n",
      ruby: "def hash_map(operations)\n  # Your solution here\n  []\nend\n",
    },
    starterCode: "function hashMap(operations) {\n  // Your solution here\n  return [];\n}",
  };

  const challengeHashMap = await prisma.challenge.upsert(
    challengeUpsertArgs({
      id: "challenge-hashmap",
      title: "Hash Map Implementation",
      description:
        "Implementiere hashMap(operations).\n\n" +
        "Verarbeite eine Liste von Operationen und gib ein Array mit dem Ergebnis jeder " +
        "Operation zurück. Jede Operation ist [typ, key] oder [typ, key, value].\n\n" +
        '"set" speichert value und ergibt null. "get" gibt den gespeicherten value zurück ' +
        'oder null, wenn der Schlüssel fehlt. "has" gibt einen Boolean zurück. "delete" ' +
        "gibt zurück, ob der Schlüssel vorhanden war.\n\n" +
        "Die Datenstruktur bringt jede Sprache mit. Die Aufgabe ist, ihr Verhalten exakt " +
        "nachzubilden: Was passiert beim Überschreiben, was beim Löschen von etwas, das " +
        "gar nicht da war.",
      difficulty: "medium",
      points: 150,
      categoryId: catDatenstrukturen.id,
      hints: [
        {
          title: "Die Idee",
          body:
            "Zwei Dinge laufen parallel: der Zustand, der zwischen den Operationen " +
            "bestehen bleibt, und das Protokoll, das du zurückgibst. Jede Operation " +
            "verändert den Zustand und hängt genau einen Eintrag ans Protokoll – auch " +
            "dann, wenn sie nichts Sichtbares liefert.",
        },
        {
          title: "Die Umsetzung",
          body:
            "Leg eine Map bzw. ein Dictionary an und ein leeres Ergebnis-Array. Geh die " +
            "Operationen der Reihe nach durch und verzweige über den Typ im ersten " +
            "Element.\n\n" +
            "Bei set schreibst du den Wert und hängst null an. Bei get liest du und hängst " +
            "den Wert oder null an. Bei has hängst du an, ob der Schlüssel existiert. Bei " +
            "delete fragst du zuerst, ob er existiert, entfernst ihn dann und hängst die " +
            "Antwort von vorher an.",
        },
        {
          title: "Woran die meisten scheitern",
          body:
            "Das Ergebnis-Array ist genauso lang wie die Operationsliste. Wer bei set " +
            "nichts anhängt, weil es nichts zurückgibt, verschiebt alle folgenden " +
            "Ergebnisse um eine Position.\n\n" +
            "Bei delete muss die Prüfung vor dem Löschen stehen. Danach ist der Schlüssel " +
            "weg und die Antwort immer false.\n\n" +
            "Ein fehlender Schlüssel ergibt null, nicht undefined und nicht None. In " +
            "JavaScript liefert map.get genau dann undefined – das musst du auf null " +
            "abbilden, sonst fällt es beim JSON-Vergleich auf.",
        },
      ],
      examples: [
        {
          input: '[["set","a",1],["get","a"],["get","b"]]',
          output: "[null,1,null]",
        },
      ],
      ...hashMapFields,
      isActive: false,
      date: addUtcDays(anchor, -3),
    }),
  );

  const recursionFields = {
    supportedLanguages: [...langsWithTypes],
    evaluationConfig: {
      callableByLanguage: {
        javascript: "fibonacci",
        typescript: "fibonacci",
        python: "fibonacci",
        ruby: "fibonacci",
        php: "fibonacci",
        java: "fibonacci",
        go: "fibonacci",
        cpp: "fibonacci",
        csharp: "Fibonacci",
        rust: "fibonacci",
      },
    },
    testCases: [
      { id: 1, name: "Basisfall 0", input: "0", expected: "0" },
      { id: 2, name: "Basisfall 1", input: "1", expected: "1" },
      { id: 3, name: "Kleiner Wert", input: "5", expected: "5" },
      { id: 4, name: "Mittlerer Wert", input: "10", expected: "55" },
      { id: 5, name: "Größerer Wert", input: "15", expected: "610" },
    ],
    starterCodes: {
      javascript: "function fibonacci(n) {\n  // Your solution here\n  return 0;\n}",
      typescript:
        "function fibonacci(n: number): number {\n  // Your solution here\n  return 0;\n}",
      python: "def fibonacci(n):\n    # Your solution here\n    return 0\n",
      php: "<?php\n\nfunction fibonacci($n) {\n    // Your solution here\n    return 0;\n}\n",
      java: "static int fibonacci(int n) {\n    // Your solution here\n    return 0;\n}\n",
      go: "func fibonacci(n int) int {\n\t// Your solution here\n\treturn 0\n}\n",
      cpp: "int fibonacci(int n) {\n    // Your solution here\n    return 0;\n}\n",
      csharp: "static int Fibonacci(int n) {\n    // Your solution here\n    return 0;\n}\n",
      rust: "fn fibonacci(n: i64) -> i64 {\n    // Your solution here\n    0\n}\n",
      ruby: "def fibonacci(n)\n  # Your solution here\n  0\nend\n",
    },
    starterCode: "function fibonacci(n) {\n  // Your solution here\n  return 0;\n}",
  };

  const challengeRecursion = await prisma.challenge.upsert(
    challengeUpsertArgs({
      id: "challenge-recursion",
      title: "Recursion Basics",
      description:
        "Implementiere fibonacci(n).\n\n" +
        "Gib die n-te Fibonacci-Zahl zurück, 0-indiziert: fibonacci(0) = 0, " +
        "fibonacci(1) = 1, jede weitere ist die Summe ihrer beiden Vorgänger.\n\n" +
        "Die Rekursion schreibt sich in drei Zeilen und ist die eigentliche Übung: Wann " +
        "hört sie auf, und was gibt sie dann zurück.",
      difficulty: "easy",
      points: 100,
      categoryId: catAlgorithmen.id,
      hints: [
        {
          title: "Die Idee",
          body:
            "Die Definition ist schon der Algorithmus: fibonacci(n) ist fibonacci(n-1) " +
            "plus fibonacci(n-2). Damit das nicht endlos weiterläuft, brauchst du " +
            "Haltepunkte – zwei Werte, die du direkt weißt, ohne weiter zu fragen: 0 und " +
            "1.",
        },
        {
          title: "Die Umsetzung",
          body:
            "Prüfe zuerst die beiden Basisfälle und gib n zurück, wenn n kleiner als 2 " +
            "ist. Sonst gib die Summe der beiden rekursiven Aufrufe zurück.\n\n" +
            "Alternativ ohne Rekursion: Halte zwei Variablen mit 0 und 1 und schiebe sie " +
            "in einer Schleife n-mal weiter. Das ist der Weg, der auch bei großem n noch " +
            "in Sekundenbruchteilen antwortet.",
        },
        {
          title: "Woran die meisten scheitern",
          body:
            "Der Basisfall fehlt oder ist zu eng. Nur n === 0 abzufangen reicht nicht: " +
            "fibonacci(1) fragt dann nach fibonacci(-1) und läuft ins Negative, bis der " +
            "Stack voll ist.\n\n" +
            "Der Index. 0-indiziert heißt fibonacci(5) = 5 und fibonacci(10) = 55. Wer bei " +
            "1 zu zählen beginnt, liegt in jeder Antwort um eine Stelle daneben.\n\n" +
            "Die naive Rekursion berechnet dieselben Werte immer wieder und wird ab etwa " +
            "n = 40 unbrauchbar langsam. Hier reicht sie, aber merk dir die Stelle: Ein " +
            "Zwischenspeicher für bereits berechnete n macht daraus wieder eine schnelle " +
            "Funktion.",
        },
      ],
      examples: [
        { input: "5", output: "5" },
        { input: "10", output: "55" },
      ],
      ...recursionFields,
      isActive: false,
      date: addUtcDays(anchor, -4),
    }),
  );

  const binaryTreeFields = {
    supportedLanguages: [...supportedLangs],
    evaluationConfig: {
      callableByLanguage: {
        javascript: "inorderTraversal",
        typescript: "inorderTraversal",
        python: "inorder_traversal",
        ruby: "inorder_traversal",
        php: "inorderTraversal",
      },
    },
    testCases: [
      { id: 1, name: "Leerer Baum", input: "null", expected: "[]" },
      {
        id: 2,
        name: "Einzelner Knoten",
        input: '{"val":1,"left":null,"right":null}',
        expected: "[1]",
      },
      {
        id: 3,
        name: "Rechts-lastig",
        input:
          '{"val":1,"left":null,"right":{"val":2,"left":{"val":3,"left":null,"right":null},"right":null}}',
        expected: "[1,3,2]",
      },
      {
        id: 4,
        name: "Suchbaum",
        input:
          '{"val":2,"left":{"val":1,"left":null,"right":null},"right":{"val":3,"left":null,"right":null}}',
        expected: "[1,2,3]",
      },
      {
        id: 5,
        name: "Vollständiger Baum",
        input:
          '{"val":4,"left":{"val":2,"left":{"val":1,"left":null,"right":null},"right":{"val":3,"left":null,"right":null}},"right":{"val":6,"left":{"val":5,"left":null,"right":null},"right":{"val":7,"left":null,"right":null}}}',
        expected: "[1,2,3,4,5,6,7]",
      },
    ],
    starterCodes: {
      javascript: "function inorderTraversal(root) {\n  // Your solution here\n  return [];\n}",
      typescript:
        "function inorderTraversal(root: any): number[] {\n  // Your solution here\n  return [];\n}",
      python: "def inorder_traversal(root):\n    # Your solution here\n    return []\n",
      php: "<?php\n\nfunction inorderTraversal($root) {\n    // Your solution here\n    return [];\n}\n",
      ruby: "def inorder_traversal(root)\n  # Your solution here\n  []\nend\n",
    },
    starterCode: "function inorderTraversal(root) {\n  // Your solution here\n  return [];\n}",
  };

  const challengeBinaryTree = await prisma.challenge.upsert(
    challengeUpsertArgs({
      id: "challenge-binary-tree",
      title: "Binary Tree Traversal",
      description:
        "Implementiere inorderTraversal(root).\n\n" +
        "Gib die Knotenwerte in In-order-Reihenfolge als Array zurück: erst der linke " +
        "Teilbaum, dann die Wurzel, dann der rechte. Ein Knoten hat die Form " +
        "{ val, left, right }, leere Teilbäume sind null.\n\n" +
        "Bei einem Suchbaum ist das Ergebnis sortiert – nicht durch Zufall, sondern weil " +
        "genau das die Ordnung ist, die ein Suchbaum herstellt.",
      difficulty: "hard",
      points: 200,
      categoryId: catBaeume.id,
      hints: [
        {
          title: "Die Idee",
          body:
            "Jeder Teilbaum ist selbst wieder ein Baum. Was du für die Wurzel tust, tust " +
            "du für jeden Knoten: links alles einsammeln, dann den eigenen Wert, dann " +
            "rechts alles einsammeln.\n\n" +
            "Die Rekursion endet dort, wo kein Knoten mehr ist – und ein leerer Baum " +
            "steuert eine leere Liste bei.",
        },
        {
          title: "Die Umsetzung",
          body:
            "Ist root null, gib ein leeres Array zurück. Sonst setze drei Teile " +
            "aneinander: das Ergebnis des Aufrufs für root.left, den Wert root.val als " +
            "einzelnes Element, das Ergebnis des Aufrufs für root.right.\n\n" +
            "Wer keine Arrays zusammenbauen will, gibt stattdessen eine gemeinsame Liste " +
            "durch alle Aufrufe durch und hängt den Wert an der richtigen Stelle an.",
        },
        {
          title: "Woran die meisten scheitern",
          body:
            "Die Reihenfolge der drei Schritte. Wird der eigene Wert vor dem linken " +
            "Teilbaum angehängt, ist das Pre-order: der Suchbaum kommt dann als [2,1,3] " +
            "statt [1,2,3] heraus. Alle Testfälle bis auf den Einzelknoten fallen darüber.\n\n" +
            "Der Abbruch bei null muss vor jedem Zugriff stehen, nicht nur ganz oben. " +
            "Jeder Blattknoten hat zwei null-Kinder – ohne die Prüfung greifst du auf " +
            "root.val eines nicht vorhandenen Knotens zu.\n\n" +
            "Der leere Baum ist selbst eine Eingabe: root ist dann direkt null, und die " +
            "Antwort ist das leere Array.",
        },
      ],
      examples: [
        {
          input: '{ "val": 2, "left": { "val": 1 }, "right": { "val": 3 } }',
          output: "[1,2,3]",
        },
      ],
      ...binaryTreeFields,
      isActive: false,
      date: addUtcDays(anchor, -5),
    }),
  );

  // ─── Further challenges (LeetCode / Codewars classics) ────────────────────────

  const twoSumFields = {
    supportedLanguages: [...langsWithTypes],
    evaluationConfig: {
      callableByLanguage: {
        javascript: "twoSum",
        typescript: "twoSum",
        python: "two_sum",
        ruby: "two_sum",
        php: "twoSum",
        java: "twoSum",
        go: "twoSum",
        cpp: "twoSum",
        csharp: "TwoSum",
        rust: "two_sum",
      },
    },
    testCases: [
      { id: 1, name: "Beispiel", input: '{"nums":[2,7,11,15],"target":9}', expected: "[0,1]" },
      { id: 2, name: "Mitte", input: '{"nums":[3,2,4],"target":6}', expected: "[1,2]" },
      { id: 3, name: "Duplikate", input: '{"nums":[3,3],"target":6}', expected: "[0,1]" },
      { id: 4, name: "Ende", input: '{"nums":[1,2,3,4,5],"target":9}', expected: "[3,4]" },
      { id: 5, name: "Negative", input: '{"nums":[-1,-2,-3,-4],"target":-6}', expected: "[1,3]" },
    ],
    starterCodes: {
      javascript:
        "function twoSum(data) {\n  const { nums, target } = data;\n  // Your solution here\n  return [];\n}",
      typescript:
        "function twoSum(data: { nums: number[]; target: number }): number[] {\n  const { nums, target } = data;\n  // Your solution here\n  return [];\n}",
      python:
        'def two_sum(data):\n    nums, target = data["nums"], data["target"]\n    # Your solution here\n    return []\n',
      php: "<?php\n\nfunction twoSum($data) {\n    $nums = $data['nums'];\n    $target = $data['target'];\n    // Your solution here\n    return [];\n}\n",
      java: "static int[] twoSum(int[] nums, int target) {\n    // Your solution here\n    return new int[]{};\n}\n",
      go: "func twoSum(nums []int, target int) []int {\n\t// Your solution here\n\treturn []int{}\n}\n",
      cpp: "vector<int> twoSum(vector<int> nums, int target) {\n    // Your solution here\n    return {};\n}\n",
      csharp: "static int[] TwoSum(int[] nums, int target) {\n    // Your solution here\n    return new int[]{};\n}\n",
      rust: "fn two_sum(nums: Vec<i64>, target: i64) -> Vec<i64> {\n    // Your solution here\n    vec![]\n}\n",
      ruby: "def two_sum(data)\n  nums, target = data['nums'], data['target']\n  # Your solution here\n  []\nend\n",
    },
    starterCode:
      "function twoSum(data) {\n  const { nums, target } = data;\n  // Your solution here\n  return [];\n}",
  };

  const challengeTwoSum = await prisma.challenge.upsert(
    challengeUpsertArgs({
      id: "challenge-two-sum",
      title: "Two Sum",
      description:
        "Implementiere twoSum(data) mit data = { nums, target }.\n\n" +
        "Gib die beiden Indizes (aufsteigend) zurück, deren Werte zusammen target ergeben. " +
        "Es existiert genau eine Lösung.\n\n" +
        "Jedes Paar durchzuprobieren funktioniert und kostet O(n²). Die Aufgabe zielt auf " +
        "den einen Durchlauf: Wer sich merkt, was er schon gesehen hat, muss den Partner " +
        "nicht suchen – er weiß, ob es ihn gibt.",
      difficulty: "medium",
      points: 150,
      categoryId: catAlgorithmen.id,
      hints: [
        {
          title: "Die Idee",
          body:
            "Zu jedem Element steht der gesuchte Partner fest: target - nums[i]. Die Frage " +
            "ist nicht mehr „welche zwei Zahlen passen zusammen\", sondern „kam diese eine " +
            "Zahl vorher schon vor\". Und das ist eine Frage, die eine Map in einem Schritt " +
            "beantwortet.",
        },
        {
          title: "Die Umsetzung",
          body:
            "Lege eine Map an, die Wert auf Index abbildet. Laufe einmal durch das Array " +
            "und prüfe für jedes nums[i], ob target - nums[i] bereits in der Map steht. " +
            "Steht es dort, hast du beide Indizes: den gespeicherten und i. Steht es nicht " +
            "dort, trage nums[i] mit seinem Index ein und geh weiter.",
        },
        {
          title: "Woran die meisten scheitern",
          body:
            "Erst nachschlagen, dann eintragen. In der anderen Reihenfolge findet sich ein " +
            "Element bei target = 2 * nums[i] selbst und du gibst zweimal denselben Index " +
            "zurück.\n\n" +
            "Gefragt sind die Indizes, nicht die Werte – und aufsteigend. Wenn du beim " +
            "Treffer den gespeicherten Index zuerst nennst, stimmt die Reihenfolge von " +
            "allein, denn er liegt zwangsläufig vor i.\n\n" +
            "Doppelte Werte sind erlaubt: Die Map darf einen bereits belegten Wert " +
            "überschreiben, das kostet dich hier nichts.",
        },
      ],
      examples: [{ input: '{ "nums": [2,7,11,15], "target": 9 }', output: "[0,1]" }],
      ...twoSumFields,
      isActive: false,
      date: addUtcDays(anchor, -6),
    }),
  );

  const fizzBuzzFields = {
    supportedLanguages: [...langsWithTypes],
    evaluationConfig: {
      callableByLanguage: {
        javascript: "fizzBuzz",
        typescript: "fizzBuzz",
        python: "fizz_buzz",
        ruby: "fizz_buzz",
        php: "fizzBuzz",
        java: "fizzBuzz",
        go: "fizzBuzz",
        cpp: "fizzBuzz",
        csharp: "FizzBuzz",
        rust: "fizz_buzz",
      },
    },
    testCases: [
      { id: 1, name: "Eins", input: "1", expected: '["1"]' },
      { id: 2, name: "Bis 3", input: "3", expected: '["1","2","Fizz"]' },
      { id: 3, name: "Bis 5", input: "5", expected: '["1","2","Fizz","4","Buzz"]' },
      { id: 4, name: "Bis 6", input: "6", expected: '["1","2","Fizz","4","Buzz","Fizz"]' },
      {
        id: 5,
        name: "Bis 15",
        input: "15",
        expected:
          '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]',
      },
    ],
    starterCodes: {
      javascript: "function fizzBuzz(n) {\n  // Your solution here\n  return [];\n}",
      typescript: "function fizzBuzz(n: number): string[] {\n  // Your solution here\n  return [];\n}",
      python: "def fizz_buzz(n):\n    # Your solution here\n    return []\n",
      php: "<?php\n\nfunction fizzBuzz($n) {\n    // Your solution here\n    return [];\n}\n",
      java: "static String[] fizzBuzz(int n) {\n    // Your solution here\n    return new String[]{};\n}\n",
      go: "func fizzBuzz(n int) []string {\n\t// Your solution here\n\treturn []string{}\n}\n",
      cpp: "vector<string> fizzBuzz(int n) {\n    // Your solution here\n    return {};\n}\n",
      csharp: "static string[] FizzBuzz(int n) {\n    // Your solution here\n    return new string[]{};\n}\n",
      rust: "fn fizz_buzz(n: i64) -> Vec<String> {\n    // Your solution here\n    vec![]\n}\n",
      ruby: "def fizz_buzz(n)\n  # Your solution here\n  []\nend\n",
    },
    starterCode: "function fizzBuzz(n) {\n  // Your solution here\n  return [];\n}",
  };

  const challengeFizzBuzz = await prisma.challenge.upsert(
    challengeUpsertArgs({
      id: "challenge-fizzbuzz",
      title: "FizzBuzz",
      description:
        "Implementiere fizzBuzz(n).\n\n" +
        'Gib ein Array der Länge n zurück. Für jede Zahl 1..n: Vielfache von 3 werden zu ' +
        '"Fizz", von 5 zu "Buzz", von beiden zu "FizzBuzz", sonst die Zahl als String.\n\n' +
        "Rechnen muss man hier nichts. Die Aufgabe prüft, ob du die Fälle in eine " +
        "Reihenfolge bringst, in der sich keiner vor dem anderen wegnimmt.",
      difficulty: "easy",
      points: 100,
      categoryId: catAlgorithmen.id,
      hints: [
        {
          title: "Die Idee",
          body:
            "Jede Zahl steht für sich, es gibt nichts zu merken. Teilbarkeit fragst du mit " +
            "dem Restoperator ab: n % 3 === 0 heißt „durch 3 teilbar\". Vier Fälle, ein " +
            "Durchlauf.",
        },
        {
          title: "Die Umsetzung",
          body:
            "Laufe von 1 bis einschließlich n. Prüfe pro Zahl zuerst, ob sie durch 3 und " +
            "durch 5 teilbar ist, dann nur durch 3, dann nur durch 5, sonst nimm die Zahl " +
            "selbst. Häng das Ergebnis an ein Array und gib es am Ende zurück.",
        },
        {
          title: "Woran die meisten scheitern",
          body:
            "Die Reihenfolge der Abfragen entscheidet. Steht die Prüfung auf 3 vor der auf " +
            "15, greift sie bei 15 zuerst und „FizzBuzz\" kommt nie zustande.\n\n" +
            "Im Array stehen ausschließlich Strings, auch die Zahlen selbst: 1 wird zu \"1\". " +
            "Eine Zahl im Array lässt den Vergleich mit der Erwartung scheitern.\n\n" +
            "Die Schleife läuft bei 1 los und schließt n mit ein – nicht bei 0 beginnen und " +
            "nicht vor n abbrechen.",
        },
      ],
      examples: [{ input: "5", output: '["1","2","Fizz","4","Buzz"]' }],
      ...fizzBuzzFields,
      isActive: false,
      date: addUtcDays(anchor, -7),
    }),
  );

  const validParenthesesFields = {
    supportedLanguages: [...langsWithTypes],
    evaluationConfig: {
      callableByLanguage: {
        javascript: "isValid",
        typescript: "isValid",
        python: "is_valid",
        ruby: "is_valid",
        php: "isValid",
        java: "isValid",
        go: "isValid",
        cpp: "isValid",
        csharp: "IsValid",
        rust: "is_valid",
      },
    },
    testCases: [
      { id: 1, name: "Einfaches Paar", input: '"()"', expected: "true" },
      { id: 2, name: "Alle Typen", input: '"()[]{}"', expected: "true" },
      { id: 3, name: "Falsch geschlossen", input: '"(]"', expected: "false" },
      { id: 4, name: "Falsche Reihenfolge", input: '"([)]"', expected: "false" },
      { id: 5, name: "Verschachtelt", input: '"{[]}"', expected: "true" },
    ],
    starterCodes: {
      javascript: "function isValid(s) {\n  // Your solution here\n  return false;\n}",
      typescript: "function isValid(s: string): boolean {\n  // Your solution here\n  return false;\n}",
      python: "def is_valid(s):\n    # Your solution here\n    return False\n",
      php: "<?php\n\nfunction isValid($s) {\n    // Your solution here\n    return false;\n}\n",
      java: "static boolean isValid(String s) {\n    // Your solution here\n    return false;\n}\n",
      go: "func isValid(s string) bool {\n\t// Your solution here\n\treturn false\n}\n",
      cpp: "bool isValid(string s) {\n    // Your solution here\n    return false;\n}\n",
      csharp: "static bool IsValid(string s) {\n    // Your solution here\n    return false;\n}\n",
      rust: "fn is_valid(s: String) -> bool {\n    // Your solution here\n    false\n}\n",
      ruby: "def is_valid(s)\n  # Your solution here\n  false\nend\n",
    },
    starterCode: "function isValid(s) {\n  // Your solution here\n  return false;\n}",
  };

  const challengeValidParentheses = await prisma.challenge.upsert(
    challengeUpsertArgs({
      id: "challenge-valid-parentheses",
      title: "Valid Parentheses",
      description:
        "Implementiere isValid(s).\n\n" +
        "Prüfe, ob die Klammern in s korrekt verschachtelt und geschlossen sind. Erlaubte " +
        "Zeichen sind (), [] und {}. Gib true oder false zurück.\n\n" +
        "Klammern zu zählen reicht nicht: \"([)]\" hat von jeder Sorte gleich viele und ist " +
        "trotzdem falsch. Es geht um die Reihenfolge, und die verlangt eine Struktur, die " +
        "sich merkt, was zuletzt geöffnet wurde.",
      difficulty: "medium",
      points: 150,
      categoryId: catDatenstrukturen.id,
      hints: [
        {
          title: "Die Idee",
          body:
            "Zuletzt geöffnet, zuerst geschlossen. Genau das ist ein Stack: Du legst " +
            "öffnende Klammern oben ab, und eine schließende Klammer darf nur die " +
            "wegnehmen, die gerade obenauf liegt.\n\n" +
            "Passt sie nicht zur obersten, war die Verschachtelung falsch, und du kannst " +
            "sofort aufhören.",
        },
        {
          title: "Die Umsetzung",
          body:
            "Geh den String Zeichen für Zeichen durch. Bei einer öffnenden Klammer legst " +
            "du sie auf den Stack. Bei einer schließenden nimmst du das oberste Element " +
            "herunter und prüfst, ob es die passende Öffnung ist – sonst gib sofort false " +
            "zurück.\n\n" +
            "Eine Map von schließender auf öffnende Klammer erspart dir drei " +
            "Vergleichsketten.",
        },
        {
          title: "Woran die meisten scheitern",
          body:
            "Der Stack am Ende. Wer nur prüft, dass jede schließende Klammer gepasst hat, " +
            "hält \"(((\" für gültig. Die Antwort ist nur dann true, wenn der Stack " +
            "danach leer ist – jede offene Klammer wurde geschlossen.\n\n" +
            "Die schließende Klammer auf leerem Stack. Bei \")\" gibt es nichts " +
            "herunterzunehmen; ohne Prüfung liest du undefined und vergleichst ins Leere. " +
            "Ein leerer Stack an dieser Stelle heißt false.\n\n" +
            "Und der eigentliche Testfall: \"([)]\" scheitert nur, wenn du die oberste " +
            "Klammer prüfst und nicht bloß irgendeine offene.",
        },
      ],
      examples: [
        { input: '"()[]{}"', output: "true" },
        { input: '"([)]"', output: "false" },
      ],
      ...validParenthesesFields,
      isActive: false,
      date: addUtcDays(anchor, -8),
    }),
  );

  const countVowelsFields = {
    supportedLanguages: [...langsWithTypes],
    evaluationConfig: {
      callableByLanguage: {
        javascript: "countVowels",
        typescript: "countVowels",
        python: "count_vowels",
        ruby: "count_vowels",
        php: "countVowels",
        java: "countVowels",
        go: "countVowels",
        cpp: "countVowels",
        csharp: "CountVowels",
        rust: "count_vowels",
      },
    },
    testCases: [
      { id: 1, name: "Wort", input: '"hello"', expected: "2" },
      { id: 2, name: "Leer", input: '""', expected: "0" },
      { id: 3, name: "Keine Vokale", input: '"why"', expected: "0" },
      { id: 4, name: "Nur Vokale", input: '"AEIOU"', expected: "5" },
      { id: 5, name: "Gemischt", input: '"Programming"', expected: "3" },
    ],
    starterCodes: {
      javascript: "function countVowels(s) {\n  // Your solution here\n  return 0;\n}",
      typescript: "function countVowels(s: string): number {\n  // Your solution here\n  return 0;\n}",
      python: "def count_vowels(s):\n    # Your solution here\n    return 0\n",
      php: "<?php\n\nfunction countVowels($s) {\n    // Your solution here\n    return 0;\n}\n",
      java: "static int countVowels(String s) {\n    // Your solution here\n    return 0;\n}\n",
      go: "func countVowels(s string) int {\n\t// Your solution here\n\treturn 0\n}\n",
      cpp: "int countVowels(string s) {\n    // Your solution here\n    return 0;\n}\n",
      csharp: "static int CountVowels(string s) {\n    // Your solution here\n    return 0;\n}\n",
      rust: "fn count_vowels(s: String) -> i64 {\n    // Your solution here\n    0\n}\n",
      ruby: "def count_vowels(s)\n  # Your solution here\n  0\nend\n",
    },
    starterCode: "function countVowels(s) {\n  // Your solution here\n  return 0;\n}",
  };

  const challengeCountVowels = await prisma.challenge.upsert(
    challengeUpsertArgs({
      id: "challenge-count-vowels",
      title: "Count Vowels",
      description:
        "Implementiere countVowels(s).\n\n" +
        "Zähle die Vokale im String s. Vokale sind a, e, i, o und u, " +
        "Groß-/Kleinschreibung spielt keine Rolle.\n\n" +
        "Der Kern der Aufgabe ist nicht das Zählen, sondern die Frage „gehört dieses " +
        "Zeichen dazu\" so zu stellen, dass sie nicht bei jedem Sonderfall neu " +
        "beantwortet werden muss.",
      difficulty: "easy",
      points: 100,
      categoryId: catStrings.id,
      hints: [
        {
          title: "Die Idee",
          body:
            "Statt jedes Zeichen gegen zehn Varianten zu vergleichen – a, A, e, E und so " +
            "weiter – bringst du es erst in eine einheitliche Form und prüfst dann gegen " +
            "eine einzige Menge von fünf Buchstaben.",
        },
        {
          title: "Die Umsetzung",
          body:
            "Wandle den String einmal komplett in Kleinbuchstaben um. Halte die Vokale in " +
            "einer Zeichenkette oder Menge, etwa \"aeiou\". Geh dann Zeichen für Zeichen " +
            "durch und erhöhe einen Zähler, wenn das Zeichen darin vorkommt.",
        },
        {
          title: "Woran die meisten scheitern",
          body:
            "Die Groß-/Kleinschreibung. \"AEIOU\" muss 5 ergeben – wer nur gegen " +
            "Kleinbuchstaben prüft und nicht umwandelt, bekommt 0.\n\n" +
            "y ist hier kein Vokal. \"why\" ergibt 0, auch wenn man es im Englischen " +
            "anders sehen kann. Halte dich an die fünf, die in der Aufgabe stehen.\n\n" +
            "Der leere String ergibt 0, nicht null oder einen Fehler – die Schleife läuft " +
            "dann einfach keinmal, wenn der Zähler vorher bei 0 startet.",
        },
      ],
      examples: [{ input: '"hello"', output: "2" }],
      ...countVowelsFields,
      isActive: false,
      date: addUtcDays(anchor, -9),
    }),
  );

  const maxSubArrayFields = {
    supportedLanguages: [...langsWithTypes],
    evaluationConfig: {
      callableByLanguage: {
        javascript: "maxSubArray",
        typescript: "maxSubArray",
        python: "max_sub_array",
        ruby: "max_sub_array",
        php: "maxSubArray",
        java: "maxSubArray",
        go: "maxSubArray",
        cpp: "maxSubArray",
        csharp: "MaxSubArray",
        rust: "max_sub_array",
      },
    },
    testCases: [
      { id: 1, name: "Gemischt", input: "[-2,1,-3,4,-1,2,1,-5,4]", expected: "6" },
      { id: 2, name: "Ein Element", input: "[1]", expected: "1" },
      { id: 3, name: "Überwiegend positiv", input: "[5,4,-1,7,8]", expected: "23" },
      { id: 4, name: "Nur negativ", input: "[-1,-2,-3]", expected: "-1" },
      { id: 5, name: "Klein", input: "[3,-2,5,-1]", expected: "6" },
    ],
    starterCodes: {
      javascript: "function maxSubArray(nums) {\n  // Your solution here\n  return 0;\n}",
      typescript: "function maxSubArray(nums: number[]): number {\n  // Your solution here\n  return 0;\n}",
      python: "def max_sub_array(nums):\n    # Your solution here\n    return 0\n",
      php: "<?php\n\nfunction maxSubArray($nums) {\n    // Your solution here\n    return 0;\n}\n",
      java: "static int maxSubArray(int[] nums) {\n    // Your solution here\n    return 0;\n}\n",
      go: "func maxSubArray(nums []int) int {\n\t// Your solution here\n\treturn 0\n}\n",
      cpp: "int maxSubArray(vector<int> nums) {\n    // Your solution here\n    return 0;\n}\n",
      csharp: "static int MaxSubArray(int[] nums) {\n    // Your solution here\n    return 0;\n}\n",
      rust: "fn max_sub_array(nums: Vec<i64>) -> i64 {\n    // Your solution here\n    0\n}\n",
      ruby: "def max_sub_array(nums)\n  # Your solution here\n  0\nend\n",
    },
    starterCode: "function maxSubArray(nums) {\n  // Your solution here\n  return 0;\n}",
  };

  const challengeMaxSubArray = await prisma.challenge.upsert(
    challengeUpsertArgs({
      id: "challenge-max-subarray",
      title: "Maximum Subarray",
      description:
        "Implementiere maxSubArray(nums).\n\n" +
        "Gib die größtmögliche Summe eines zusammenhängenden Teil-Arrays zurück. Das " +
        "Teil-Array enthält mindestens ein Element.\n\n" +
        "Zusammenhängend heißt: kein Überspringen. Alle Start-Ende-Paare " +
        "durchzuprobieren kostet O(n²) und besteht die Tests. Interessant wird es bei " +
        "dem einen Durchlauf, der ohne Rückblick auskommt.",
      difficulty: "medium",
      points: 150,
      categoryId: catAlgorithmen.id,
      hints: [
        {
          title: "Die Idee",
          body:
            "Geh das Array von links nach rechts und frag dich an jeder Stelle nur eines: " +
            "Hilft mir, was links von mir liegt?\n\n" +
            "Ist die Summe bis hierher negativ, ist sie Ballast – jedes Teil-Array, das sie " +
            "mitschleppt, wäre ohne sie größer. Dann fängst du beim aktuellen Element neu " +
            "an. Andernfalls führst du sie fort. Mehr musst du über die Vergangenheit nicht " +
            "wissen.",
        },
        {
          title: "Die Umsetzung",
          body:
            "Halte zwei Werte: die beste Summe, die hier endet, und die beste Summe, die du " +
            "je gesehen hast. Beide startest du mit dem ersten Element.\n\n" +
            "Ab dem zweiten Element ist die hier endende Summe das Maximum aus dem Element " +
            "allein und dem Element plus der bisherigen Summe. Danach ziehst du das " +
            "Gesamtmaximum nach. Am Ende gibst du das Gesamtmaximum zurück.",
        },
        {
          title: "Woran die meisten scheitern",
          body:
            "Die Null als Startwert. Bei [-3,-1,-2] ist die Antwort -1, nicht 0 – ein leeres " +
            "Teil-Array ist nicht erlaubt. Starte deshalb mit dem ersten Element, nicht mit " +
            "0, und laufe ab dem zweiten los.\n\n" +
            "Zwei getrennte Werte, nicht einer. Wer nur die laufende Summe führt und sie am " +
            "Ende zurückgibt, verliert ein Maximum, das in der Mitte lag und danach von " +
            "negativen Zahlen wieder aufgefressen wurde.\n\n" +
            "Das Gesamtmaximum gehört in jeden Durchlauf, nicht nur dorthin, wo du neu " +
            "anfängst.",
        },
      ],
      examples: [{ input: "[-2,1,-3,4,-1,2,1,-5,4]", output: "6" }],
      ...maxSubArrayFields,
      isActive: false,
      date: addUtcDays(anchor, -10),
    }),
  );

  const isAnagramFields = {
    supportedLanguages: [...langsWithTypes],
    evaluationConfig: {
      callableByLanguage: {
        javascript: "isAnagram",
        typescript: "isAnagram",
        python: "is_anagram",
        ruby: "is_anagram",
        php: "isAnagram",
        java: "isAnagram",
        go: "isAnagram",
        cpp: "isAnagram",
        csharp: "IsAnagram",
        rust: "is_anagram",
      },
    },
    testCases: [
      { id: 1, name: "Anagramm", input: '{"s":"anagram","t":"nagaram"}', expected: "true" },
      { id: 2, name: "Kein Anagramm", input: '{"s":"rat","t":"car"}', expected: "false" },
      { id: 3, name: "Beide leer", input: '{"s":"","t":""}', expected: "true" },
      { id: 4, name: "Verschiedene Länge", input: '{"s":"a","t":"ab"}', expected: "false" },
      { id: 5, name: "Klassiker", input: '{"s":"listen","t":"silent"}', expected: "true" },
    ],
    starterCodes: {
      javascript:
        "function isAnagram(data) {\n  const { s, t } = data;\n  // Your solution here\n  return false;\n}",
      typescript:
        "function isAnagram(data: { s: string; t: string }): boolean {\n  const { s, t } = data;\n  // Your solution here\n  return false;\n}",
      python:
        'def is_anagram(data):\n    s, t = data["s"], data["t"]\n    # Your solution here\n    return False\n',
      php: "<?php\n\nfunction isAnagram($data) {\n    $s = $data['s'];\n    $t = $data['t'];\n    // Your solution here\n    return false;\n}\n",
      java: "static boolean isAnagram(String s, String t) {\n    // Your solution here\n    return false;\n}\n",
      go: "func isAnagram(s string, t string) bool {\n\t// Your solution here\n\treturn false\n}\n",
      cpp: "bool isAnagram(string s, string t) {\n    // Your solution here\n    return false;\n}\n",
      csharp: "static bool IsAnagram(string s, string t) {\n    // Your solution here\n    return false;\n}\n",
      rust: "fn is_anagram(s: String, t: String) -> bool {\n    // Your solution here\n    false\n}\n",
      ruby: "def is_anagram(data)\n  s, t = data['s'], data['t']\n  # Your solution here\n  false\nend\n",
    },
    starterCode:
      "function isAnagram(data) {\n  const { s, t } = data;\n  // Your solution here\n  return false;\n}",
  };

  const challengeIsAnagram = await prisma.challenge.upsert(
    challengeUpsertArgs({
      id: "challenge-valid-anagram",
      title: "Valid Anagram",
      description:
        "Implementiere isAnagram(data) mit data = { s, t }.\n\n" +
        "Gib true zurück, wenn t ein Anagramm von s ist, also aus denselben Buchstaben in " +
        "derselben Anzahl besteht.\n\n" +
        "Zwei Wege führen zum Ziel: sortieren und vergleichen, oder zählen und " +
        "vergleichen. Der erste ist kürzer, der zweite schneller – ein Fall, an dem sich " +
        "gut sehen lässt, was ein Sortiervorgang kostet.",
      difficulty: "easy",
      points: 100,
      categoryId: catStrings.id,
      hints: [
        {
          title: "Die Idee",
          body:
            "Die Reihenfolge der Buchstaben ist egal, ihre Anzahl nicht. Du brauchst also " +
            "eine Darstellung, in der die Reihenfolge verschwindet: entweder beide Wörter " +
            "sortiert, oder für jedes Wort eine Tabelle, wie oft jeder Buchstabe " +
            "vorkommt.",
        },
        {
          title: "Die Umsetzung",
          body:
            "Kurz: beide Strings in Zeichen zerlegen, sortieren, wieder zusammensetzen " +
            "und vergleichen. Das kostet O(n log n).\n\n" +
            "Schnell: eine Map anlegen, für jeden Buchstaben aus s hochzählen, für jeden " +
            "aus t herunterzählen. Bleibt am Ende jeder Zähler auf 0, sind es Anagramme. " +
            "Das ist ein Durchlauf pro Wort.",
        },
        {
          title: "Woran die meisten scheitern",
          body:
            "Die Länge zuerst. Sind s und t unterschiedlich lang, kann es kein Anagramm " +
            "sein – und beim Zählweg würdest du das sonst leicht übersehen, weil ein " +
            "zusätzlicher Buchstabe in t nur einen Zähler ins Minus schiebt.\n\n" +
            "Zwei leere Strings sind ein Anagramm: die Antwort ist true, nicht false.\n\n" +
            "Beim Vergleich von Buchstabentabellen reicht es nicht, dass jeder Buchstabe " +
            "aus s in t vorkommt. Es geht um die Anzahl – prüfe die Zähler, nicht bloß " +
            "die Anwesenheit.",
        },
      ],
      examples: [{ input: '{ "s": "listen", "t": "silent" }', output: "true" }],
      ...isAnagramFields,
      isActive: false,
      date: addUtcDays(anchor, -11),
    }),
  );

  const digitalRootFields = {
    supportedLanguages: [...langsWithTypes],
    evaluationConfig: {
      callableByLanguage: {
        javascript: "digitalRoot",
        typescript: "digitalRoot",
        python: "digital_root",
        ruby: "digital_root",
        php: "digitalRoot",
        java: "digitalRoot",
        go: "digitalRoot",
        cpp: "digitalRoot",
        csharp: "DigitalRoot",
        rust: "digital_root",
      },
    },
    testCases: [
      { id: 1, name: "Null", input: "0", expected: "0" },
      { id: 2, name: "Einstellig", input: "5", expected: "5" },
      { id: 3, name: "Dreistellig", input: "942", expected: "6" },
      { id: 4, name: "Mehrfach falten", input: "132189", expected: "6" },
      { id: 5, name: "Groß", input: "493193", expected: "2" },
    ],
    starterCodes: {
      javascript: "function digitalRoot(n) {\n  // Your solution here\n  return 0;\n}",
      typescript: "function digitalRoot(n: number): number {\n  // Your solution here\n  return 0;\n}",
      python: "def digital_root(n):\n    # Your solution here\n    return 0\n",
      php: "<?php\n\nfunction digitalRoot($n) {\n    // Your solution here\n    return 0;\n}\n",
      java: "static int digitalRoot(int n) {\n    // Your solution here\n    return 0;\n}\n",
      go: "func digitalRoot(n int) int {\n\t// Your solution here\n\treturn 0\n}\n",
      cpp: "int digitalRoot(int n) {\n    // Your solution here\n    return 0;\n}\n",
      csharp: "static int DigitalRoot(int n) {\n    // Your solution here\n    return 0;\n}\n",
      rust: "fn digital_root(n: i64) -> i64 {\n    // Your solution here\n    0\n}\n",
      ruby: "def digital_root(n)\n  # Your solution here\n  0\nend\n",
    },
    starterCode: "function digitalRoot(n) {\n  // Your solution here\n  return 0;\n}",
  };

  const challengeDigitalRoot = await prisma.challenge.upsert(
    challengeUpsertArgs({
      id: "challenge-digital-root",
      title: "Digital Root",
      description:
        "Implementiere digitalRoot(n).\n\n" +
        "Addiere wiederholt die Ziffern von n, bis nur noch eine einzelne Ziffer von 0 " +
        "bis 9 übrig ist, und gib sie zurück.\n\n" +
        "Aus 132189 wird 24, daraus 6. Einmal Quersumme reicht also nicht – gefragt ist " +
        "das Falten, bis nichts mehr zu falten ist.",
      difficulty: "easy",
      points: 100,
      categoryId: catAlgorithmen.id,
      hints: [
        {
          title: "Die Idee",
          body:
            "Zwei Vorgänge stecken ineinander: die Quersumme einer Zahl bilden, und das " +
            "so lange wiederholen, bis das Ergebnis einstellig ist.\n\n" +
            "Trenn sie gedanklich. Die Quersumme ist eine Schleife über die Ziffern, das " +
            "Falten eine Schleife über die Quersummen.",
        },
        {
          title: "Die Umsetzung",
          body:
            "Die Ziffern bekommst du mit Rest und Ganzzahldivision: n % 10 ist die letzte " +
            "Ziffer, n / 10 abgerundet der Rest der Zahl. Wiederhole das, bis nichts mehr " +
            "übrig ist, und summiere.\n\n" +
            "Diesen Schritt legst du in eine äußere Schleife, die läuft, solange n " +
            "mindestens 10 ist. Am Ende gibst du n zurück. Wer mag, geht über den Umweg " +
            "String und zerlegt die Zahl in Zeichen – das ist langsamer, aber genauso " +
            "richtig.",
        },
        {
          title: "Woran die meisten scheitern",
          body:
            "Nur einmal falten. Bei 942 kommt 15 heraus, und 15 ist keine Ziffer. Die " +
            "Bedingung muss geprüft werden, bevor und nachdem summiert wurde – eine " +
            "while-Schleife tut genau das.\n\n" +
            "Die 0. Sie ist bereits einstellig, die Antwort ist 0. Eine Schleife mit " +
            "do-while oder eine Bedingung auf n > 0 kann hier danebengreifen.\n\n" +
            "Ganzzahldivision. In JavaScript ist n / 10 eine Kommazahl – ohne " +
            "Math.floor summierst du Nachkommastellen mit.",
        },
      ],
      examples: [{ input: "942", output: "6" }],
      ...digitalRootFields,
      isActive: false,
      date: addUtcDays(anchor, -12),
    }),
  );

  const moveZeroesFields = {
    supportedLanguages: [...langsWithTypes],
    evaluationConfig: {
      callableByLanguage: {
        javascript: "moveZeroes",
        typescript: "moveZeroes",
        python: "move_zeroes",
        ruby: "move_zeroes",
        php: "moveZeroes",
        java: "moveZeroes",
        go: "moveZeroes",
        cpp: "moveZeroes",
        csharp: "MoveZeroes",
        rust: "move_zeroes",
      },
    },
    testCases: [
      { id: 1, name: "Beispiel", input: "[0,1,0,3,12]", expected: "[1,3,12,0,0]" },
      { id: 2, name: "Nur Null", input: "[0]", expected: "[0]" },
      { id: 3, name: "Keine Null", input: "[1,2,3]", expected: "[1,2,3]" },
      { id: 4, name: "Führende Nullen", input: "[0,0,1]", expected: "[1,0,0]" },
      { id: 5, name: "Verteilt", input: "[4,0,5,0,0,6]", expected: "[4,5,6,0,0,0]" },
    ],
    starterCodes: {
      javascript: "function moveZeroes(nums) {\n  // Your solution here\n  return nums;\n}",
      typescript: "function moveZeroes(nums: number[]): number[] {\n  // Your solution here\n  return nums;\n}",
      python: "def move_zeroes(nums):\n    # Your solution here\n    return nums\n",
      php: "<?php\n\nfunction moveZeroes($nums) {\n    // Your solution here\n    return $nums;\n}\n",
      java: "static int[] moveZeroes(int[] nums) {\n    // Your solution here\n    return nums;\n}\n",
      go: "func moveZeroes(nums []int) []int {\n\t// Your solution here\n\treturn nums\n}\n",
      cpp: "vector<int> moveZeroes(vector<int> nums) {\n    // Your solution here\n    return nums;\n}\n",
      csharp: "static int[] MoveZeroes(int[] nums) {\n    // Your solution here\n    return nums;\n}\n",
      rust: "fn move_zeroes(nums: Vec<i64>) -> Vec<i64> {\n    // Your solution here\n    nums\n}\n",
      ruby: "def move_zeroes(nums)\n  # Your solution here\n  nums\nend\n",
    },
    starterCode: "function moveZeroes(nums) {\n  // Your solution here\n  return nums;\n}",
  };

  const challengeMoveZeroes = await prisma.challenge.upsert(
    challengeUpsertArgs({
      id: "challenge-move-zeroes",
      title: "Move Zeroes",
      description:
        "Implementiere moveZeroes(nums).\n\n" +
        "Verschiebe alle Nullen ans Ende des Arrays. Die Reihenfolge der übrigen Elemente " +
        "bleibt dabei erhalten.\n\n" +
        "Ohne diese Bedingung wäre es Sortieren. Mit ihr ist es eine Aufgabe über " +
        "Reihenfolge: Die Nicht-Nullen dürfen untereinander nicht die Plätze tauschen.",
      difficulty: "easy",
      points: 100,
      categoryId: catDatenstrukturen.id,
      hints: [
        {
          title: "Die Idee",
          body:
            "Dreh die Aufgabe um. Statt Nullen nach hinten zu schieben, ziehst du alles, " +
            "was keine Null ist, nach vorn – in genau der Reihenfolge, in der es " +
            "vorkommt. Was hinten übrig bleibt, sind zwangsläufig die Nullen.",
        },
        {
          title: "Die Umsetzung",
          body:
            "Der einfache Weg: filtere die Nicht-Null-Werte in ein neues Array und häng " +
            "so viele Nullen an, wie zur ursprünglichen Länge fehlen.\n\n" +
            "Der Weg ohne zweites Array: Führe einen Schreibzeiger mit, der bei 0 startet. " +
            "Läufst du auf einen Wert ungleich null, schreibst du ihn an die Position des " +
            "Schreibzeigers und rückst ihn eins weiter. Am Ende füllst du von dort bis " +
            "zum Ende mit Nullen.",
        },
        {
          title: "Woran die meisten scheitern",
          body:
            "Nullen einzeln nach hinten zu tauschen. Bei [4,0,5,0,0,6] holt jeder Tausch " +
            "ein Element von hinten nach vorn und zerstört die Reihenfolge – aus 4,5,6 " +
            "wird 4,6,5.\n\n" +
            "Die Länge. Das Ergebnis hat genauso viele Elemente wie die Eingabe. Wer die " +
            "Nullen nur herausfiltert und das Auffüllen vergisst, gibt ein zu kurzes " +
            "Array zurück.\n\n" +
            "Und die Rückgabe: Auch wenn du direkt in nums schreibst, muss die Funktion " +
            "das Array zurückgeben. Ohne return kommt beim Test nichts an.",
        },
      ],
      examples: [{ input: "[0,1,0,3,12]", output: "[1,3,12,0,0]" }],
      ...moveZeroesFields,
      isActive: false,
      date: addUtcDays(anchor, -13),
    }),
  );

  const romanToIntFields = {
    supportedLanguages: [...langsWithTypes],
    evaluationConfig: {
      callableByLanguage: {
        javascript: "romanToInt",
        typescript: "romanToInt",
        python: "roman_to_int",
        ruby: "roman_to_int",
        php: "romanToInt",
        java: "romanToInt",
        go: "romanToInt",
        cpp: "romanToInt",
        csharp: "RomanToInt",
        rust: "roman_to_int",
      },
    },
    testCases: [
      { id: 1, name: "Einfach", input: '"III"', expected: "3" },
      { id: 2, name: "Mit Subtraktion", input: '"IV"', expected: "4" },
      { id: 3, name: "Neun", input: '"IX"', expected: "9" },
      { id: 4, name: "Mittel", input: '"LVIII"', expected: "58" },
      { id: 5, name: "Komplex", input: '"MCMXCIV"', expected: "1994" },
    ],
    starterCodes: {
      javascript: "function romanToInt(s) {\n  // Your solution here\n  return 0;\n}",
      typescript: "function romanToInt(s: string): number {\n  // Your solution here\n  return 0;\n}",
      python: "def roman_to_int(s):\n    # Your solution here\n    return 0\n",
      php: "<?php\n\nfunction romanToInt($s) {\n    // Your solution here\n    return 0;\n}\n",
      java: "static int romanToInt(String s) {\n    // Your solution here\n    return 0;\n}\n",
      go: "func romanToInt(s string) int {\n\t// Your solution here\n\treturn 0\n}\n",
      cpp: "int romanToInt(string s) {\n    // Your solution here\n    return 0;\n}\n",
      csharp: "static int RomanToInt(string s) {\n    // Your solution here\n    return 0;\n}\n",
      rust: "fn roman_to_int(s: String) -> i64 {\n    // Your solution here\n    0\n}\n",
      ruby: "def roman_to_int(s)\n  # Your solution here\n  0\nend\n",
    },
    starterCode: "function romanToInt(s) {\n  // Your solution here\n  return 0;\n}",
  };

  const challengeRomanToInt = await prisma.challenge.upsert(
    challengeUpsertArgs({
      id: "challenge-roman-to-integer",
      title: "Roman to Integer",
      description:
        "Implementiere romanToInt(s).\n\n" +
        "Wandle eine römische Zahl in ihren ganzzahligen Wert um. Es gilt I=1, V=5, X=10, " +
        "L=50, C=100, D=500, M=1000.\n\n" +
        "Steht ein kleinerer Wert vor einem größeren, wird er abgezogen statt addiert: IV " +
        "ist 4, IX ist 9. Diese eine Ausnahme ist die ganze Aufgabe – man braucht keine " +
        "Liste der sechs Sonderfälle, sondern eine Regel, die sie alle erzeugt.",
      difficulty: "medium",
      points: 150,
      categoryId: catStrings.id,
      hints: [
        {
          title: "Die Idee",
          body:
            "Sieh dir jedes Zeichen zusammen mit seinem Nachfolger an. Ist der Nachfolger " +
            "größer, gehört das Zeichen zu einer Subtraktion und zählt negativ. In allen " +
            "anderen Fällen zählt es positiv.\n\n" +
            "Mehr Regeln braucht es nicht: IV, IX, XL, XC, CD und CM fallen alle unter " +
            "diese eine.",
        },
        {
          title: "Die Umsetzung",
          body:
            "Leg eine Zuordnung von Zeichen auf Wert an. Geh den String von links nach " +
            "rechts durch und vergleiche den Wert an Position i mit dem an Position i+1. " +
            "Ist er kleiner, ziehe ihn von der Summe ab, sonst addiere ihn.\n\n" +
            "Genauso gut geht es von rechts nach links: Merk dir den größten bisher " +
            "gesehenen Wert und ziehe alles ab, was kleiner ist als er.",
        },
        {
          title: "Woran die meisten scheitern",
          body:
            "Das letzte Zeichen hat keinen Nachfolger. Ohne Absicherung liest du über das " +
            "Ende hinaus – in JavaScript kommt undefined heraus, der Vergleich wird " +
            "false, und das Zeichen wird zufällig richtig addiert. Verlass dich nicht " +
            "darauf, behandle den letzten Schritt bewusst.\n\n" +
            "Die Sonderfälle einzeln abzufangen. Wer nach \"IV\" und \"IX\" im String " +
            "sucht und sie ersetzt, hat bei MCMXCIV drei Ersetzungen zu bedenken und " +
            "übersieht eine.\n\n" +
            "Kleiner als der Nachfolger heißt echt kleiner. Bei II ist der Nachfolger " +
            "gleich groß, und beide zählen positiv.",
        },
      ],
      examples: [
        { input: '"IX"', output: "9" },
        { input: '"MCMXCIV"', output: "1994" },
      ],
      ...romanToIntFields,
      isActive: false,
      date: addUtcDays(anchor, -14),
    }),
  );

  // These challenges are only created; nothing references them later.
  void [
    challengeTwoSum,
    challengeFizzBuzz,
    challengeValidParentheses,
    challengeCountVowels,
    challengeMaxSubArray,
    challengeIsAnagram,
    challengeDigitalRoot,
    challengeMoveZeroes,
    challengeRomanToInt,
  ];

  // Keep seed reruns deterministic even when records already existed with drifted state.
  if (!contentOnly)
  await prisma.user.updateMany({
    where: {
      email: {
        in: [
          "admin@dailydev.local",
          "anna.schmidt@company.com",
          "tom.weber@company.com",
          "max.mustermann@company.com",
          "lisa.mueller@company.com",
          "sarah.klein@company.com",
          "jan.becker@company.com",
          "julia.fischer@company.com",
          "peter.hoffmann@company.com",
          "maria.wagner@company.com",
          "david.schulz@company.com",
        ],
      },
    },
    data: { emailVerified: true },
  });

  /*
    Operational state, and therefore off-limits to a content refresh. `challengeUpsertArgs`
    already keeps isActive, position and date out of its update — this block wrote all three
    anyway, plus the ring pointer, so refreshing prose on a running instance reset the order
    someone arranged in the admin and jumped the daily challenge to the front of the ring.
  */
  if (!contentOnly) {
  // Since #67, `isActive` means "part of the rotation pool", not "is today's
  // challenge". Every finished challenge is eligible — otherwise the rotation would
  // hold a single element and the app would serve the same challenge forever.
  await prisma.challenge.updateMany({ data: { isActive: true } });
  /**
   * The order of the daily ring. `Challenge.date` is deprecated and stays null: the ring has no
   * dates, it has an order plus a pointer at where it stands.
   *
   * The six named challenges take the front so a seeded database has a predictable first week;
   * everything else follows in id order. Positions are not unique, but handing out distinct ones
   * keeps the arrows in the admin panel meaningful from the start.
   */
  await prisma.challenge.updateMany({ data: { date: null } });
  const ringOrder = [
    challengeToday.id,
    challengeBinarySearch.id,
    challengeStringReversal.id,
    challengeHashMap.id,
    challengeRecursion.id,
    challengeBinaryTree.id,
  ];
  for (const [index, id] of ringOrder.entries()) {
    await prisma.challenge.update({ where: { id }, data: { position: index } });
  }
  const rest = await prisma.challenge.findMany({
    where: { id: { notIn: ringOrder } },
    orderBy: { id: "asc" },
    select: { id: true },
  });
  for (const [index, c] of rest.entries()) {
    await prisma.challenge.update({
      where: { id: c.id },
      data: { position: ringOrder.length + index },
    });
  }

  // The ring starts on the well-known challenge, so a fresh database serves the same daily the
  // dashboard fixtures and the landing badge talk about.
  await prisma.rotationState.upsert({
    where: { id: "current" },
    create: { id: "current", challengeId: challengeToday.id, position: 0, day: anchor },
    update: { challengeId: challengeToday.id, position: 0, day: anchor },
  });
  }

  // ─── Submissions ─────────────────────────────────────────────────────────────

  if (!contentOnly) {
  // max spans three languages so „Polyglott" (ach-3) is derivable from the data, not
  // only granted by the explicit UserAchievement row above.
  const submissionData = [
    { userId: max.id, challengeId: challengeToday.id, code: "// solved", status: "completed" as const, language: "javascript" as const, rank: 8 },
    { userId: max.id, challengeId: challengeBinarySearch.id, code: "// solved", status: "completed" as const, language: "python" as const, rank: 3 },
    { userId: max.id, challengeId: challengeBinaryTree.id, code: "// attempted", status: "failed" as const, language: "python" as const },
    { userId: max.id, challengeId: challengeHashMap.id, code: "// solved", status: "completed" as const, language: "php" as const, rank: 12 },
    { userId: max.id, challengeId: challengeRecursion.id, code: "// solved", status: "completed" as const, language: "typescript" as const, rank: 5 },
    { userId: anna.id, challengeId: challengeToday.id, code: "// solved", status: "completed" as const, rank: 1 },
    { userId: tom.id, challengeId: challengeToday.id, code: "// solved", status: "completed" as const, rank: 2 },
    { userId: lisa.id, challengeId: challengeToday.id, code: "// solved", status: "completed" as const, rank: 3 },
    { userId: jan.id, challengeId: challengeToday.id, code: "// solved", status: "completed" as const, rank: 4 },
    { userId: sarah.id, challengeId: challengeToday.id, code: "// solved", status: "completed" as const, rank: 5 },
    { userId: anna.id, challengeId: challengeStringReversal.id, code: "// solved", status: "completed" as const, rank: 1 },
    { userId: lisa.id, challengeId: challengeBinarySearch.id, code: "// solved", status: "completed" as const, rank: 2 },
    { userId: jan.id, challengeId: challengeHashMap.id, code: "// solved", status: "completed" as const, rank: 5 },
  ];

  for (let i = 0; i < submissionData.length; i++) {
    await prisma.submission.upsert({
      where: { id: `sub-${i + 1}` },
      update: {},
      create: {
        id: `sub-${i + 1}`,
        ...submissionData[i],
        submissionDay: new Date(anchor.getTime() + i),
      },
    });
  }

  // Weekly rankings
  const weekDate = rankingWeekStart;
  const weeklyRankings = [
    { userId: tom.id, rank: 1, previousRank: 2, points: 890, challengesSolved: 7 },
    { userId: anna.id, rank: 2, previousRank: 1, points: 875, challengesSolved: 7 },
    { userId: lisa.id, rank: 3, previousRank: 3, points: 820, challengesSolved: 6 },
    { userId: max.id, rank: 4, previousRank: 5, points: 780, challengesSolved: 6 },
    { userId: jan.id, rank: 5, previousRank: 4, points: 750, challengesSolved: 5 },
    { userId: sarah.id, rank: 6, previousRank: 6, points: 720, challengesSolved: 5 },
    { userId: julia.id, rank: 7, previousRank: 9, points: 690, challengesSolved: 5 },
    { userId: peter.id, rank: 8, previousRank: 7, points: 660, challengesSolved: 4 },
    { userId: maria.id, rank: 9, previousRank: 8, points: 630, challengesSolved: 4 },
    { userId: david.id, rank: 10, previousRank: 10, points: 600, challengesSolved: 4 },
  ];

  for (const entry of weeklyRankings) {
    await prisma.rankingEntry.upsert({
      where: { userId_period_periodDate: { userId: entry.userId, period: "week", periodDate: weekDate } },
      update: {},
      create: { period: "week", periodDate: weekDate, ...entry },
    });
  }

  // Monthly rankings
  const monthDate = rankingMonthStart;
  const monthlyRankings = [
    { userId: anna.id, rank: 1, previousRank: 1, points: 3450, challengesSolved: 28 },
    { userId: tom.id, rank: 2, previousRank: 3, points: 3280, challengesSolved: 27 },
    { userId: lisa.id, rank: 3, previousRank: 2, points: 3100, challengesSolved: 26 },
    { userId: max.id, rank: 4, previousRank: 4, points: 2950, challengesSolved: 24 },
    { userId: jan.id, rank: 5, previousRank: 6, points: 2800, challengesSolved: 23 },
    { userId: sarah.id, rank: 6, previousRank: 5, points: 2650, challengesSolved: 22 },
    { userId: julia.id, rank: 7, previousRank: 7, points: 2500, challengesSolved: 21 },
    { userId: peter.id, rank: 8, previousRank: 8, points: 2350, challengesSolved: 20 },
    { userId: maria.id, rank: 9, previousRank: 10, points: 2200, challengesSolved: 19 },
    { userId: david.id, rank: 10, previousRank: 9, points: 2050, challengesSolved: 18 },
  ];

  for (const entry of monthlyRankings) {
    await prisma.rankingEntry.upsert({
      where: { userId_period_periodDate: { userId: entry.userId, period: "month", periodDate: monthDate } },
      update: {},
      create: { period: "month", periodDate: monthDate, ...entry },
    });
  }
  } // Ende Demo-Submissions/Rankings

  console.log("✅ Seed complete");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
