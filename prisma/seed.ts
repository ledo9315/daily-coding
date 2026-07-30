import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  startOfUtcDay,
  startOfUtcWeek,
  startOfUtcMonth,
} from "../lib/server/ranking-period";
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import bcrypt from "bcryptjs";

loadEnv({ path: resolve(process.cwd(), ".env") });
loadEnv({ path: resolve(process.cwd(), ".env.local"), override: true });

function addUtcDays(d: Date, delta: number): Date {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + delta);
  return x;
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL fehlt. Lege .env oder .env.local an (siehe .env.example)."
  );
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
      initials: "AD",
      avatar: "/user/minipix5.png",
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
      initials: "AS",
      avatar: "/user/chibi1.png",
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
      initials: "TW",
      avatar: "/user/chibi2.png",
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
      initials: "MM",
      avatar: "/user/minipix5.png",
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
      initials: "LM",
      avatar: "/user/chibi3.png",
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
      initials: "SK",
      avatar: "/user/minipix4.png",
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
      initials: "JB",
      avatar: "/user/minipix2.png",
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
      initials: "JF",
      avatar: "/user/minipix6.png",
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
      initials: "PH",
      avatar: "/user/pony2.png",
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
      initials: "MW",
      avatar: "/user/pony3.png",
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
      initials: "DS",
      avatar: "/user/pony4.png",
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

  const achievementDefs = [
    { id: "ach-1", title: "Erste Schritte",    description: "Erste Challenge abgeschlossen",        iconKey: "Check",        rarity: "common"    as const },
    { id: "ach-2", title: "Wochenend-Krieger", description: "7 Tage Streak erreicht",               iconKey: "CalendarWeek", rarity: "rare"      as const },
    { id: "ach-3", title: "Polyglott",         description: "In drei verschiedenen Sprachen gelöst", iconKey: "Code",       rarity: "rare"      as const },
    { id: "ach-4", title: "Code-Meister",      description: "10 schwere Challenges gelöst",         iconKey: "Trophy",       rarity: "epic"      as const },
    { id: "ach-5", title: "Unaufhaltsam",      description: "30 Tage Streak erreicht",              iconKey: "Zap",          rarity: "legendary" as const },
    { id: "ach-6", title: "Perfektionist",     description: "20 Challenges ohne Fehler",            iconKey: "Bullseye",     rarity: "epic"      as const },
  ];

  for (const def of achievementDefs) {
    await prisma.achievementDef.upsert({
      where: { id: def.id },
      update: {},
      create: def,
    });
  }

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

  const supportedLangs = ["javascript", "typescript", "python", "php"] as const;

  const challengeToday = await prisma.challenge.upsert({
    where: { id: "challenge-array-manipulation" },
    update: {
      supportedLanguages: [...supportedLangs],
      evaluationConfig: {
        callableByLanguage: {
          javascript: "transformArray",
          typescript: "transformArray",
          python: "transform_array",
          php: "transformArray",
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
      starterCodes: {
        javascript: "function transformArray(arr) {\n  // Your solution here\n}",
        typescript:
          "function transformArray(arr: number[]): number[] {\n  // Your solution here\n  return arr;\n}",
        python:
          "def transform_array(arr):\n    # Your solution here\n    pass\n",
        php: "<?php\n\nfunction transformArray($arr) {\n    // Your solution here\n}\n",
      },
      starterCode: "function transformArray(arr) {\n  // Your solution here\n}",
    },
    create: {
      id: "challenge-array-manipulation",
      title: "Array Manipulation Challenge",
      description: "Implementiere eine Funktion transformArray(arr), die ein Array von Zahlen nimmt und ein neues Array zurückgibt, bei dem jedes Element die kumulative Summe aller vorherigen Elemente (inklusive sich selbst) enthält.",
      difficulty: "medium",
      points: 150,
      categoryId: catAlgorithmen.id,
      hint: "Versuche die Lösung mit O(n) Zeitkomplexität und O(1) zusätzlichem Speicher zu implementieren.",
      examples: [
        { input: "[1, 2, 3, 4, 5]", output: "[1, 3, 6, 10, 15]" },
        { input: "[5, -2, 3, 1]", output: "[5, 3, 6, 7]" },
      ],
      evaluationConfig: {
        callableByLanguage: {
          javascript: "transformArray",
          typescript: "transformArray",
          python: "transform_array",
          php: "transformArray",
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
      supportedLanguages: [...supportedLangs],
      starterCodes: {
        javascript: "function transformArray(arr) {\n  // Your solution here\n}",
        typescript:
          "function transformArray(arr: number[]): number[] {\n  // Your solution here\n  return arr;\n}",
        python:
          "def transform_array(arr):\n    # Your solution here\n    pass\n",
        php: "<?php\n\nfunction transformArray($arr) {\n    // Your solution here\n}\n",
      },
      starterCode: "function transformArray(arr) {\n  // Your solution here\n}",
      isActive: true,
      date: anchor,
    },
  });

  const binarySearchFields = {
    supportedLanguages: [...supportedLangs],
    evaluationConfig: {
      callableByLanguage: {
        javascript: "binarySearch",
        typescript: "binarySearch",
        python: "binary_search",
        php: "binarySearch",
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
    },
    starterCode:
      "function binarySearch(data) {\n  const { arr, target } = data;\n  // Your solution here\n  return -1;\n}",
  };

  const challengeBinarySearch = await prisma.challenge.upsert({
    where: { id: "challenge-binary-search" },
    update: { ...binarySearchFields },
    create: {
      id: "challenge-binary-search",
      title: "Binary Search",
      description:
        "Implementiere binarySearch(data) mit data = { arr, target }: Gib den Index von target im aufsteigend sortierten Array arr zurück – oder -1, wenn target nicht enthalten ist.",
      difficulty: "easy",
      points: 120,
      categoryId: catAlgorithmen.id,
      hint: "Teile den Suchbereich in der Mitte und grenze ihn iterativ ein (O(log n)).",
      examples: [
        { input: '{ "arr": [1,3,5,7,9], "target": 5 }', output: "2" },
        { input: '{ "arr": [1,3,5,7,9], "target": 4 }', output: "-1" },
      ],
      ...binarySearchFields,
      isActive: false,
      date: addUtcDays(anchor, -1),
    },
  });

  const stringReversalFields = {
    supportedLanguages: [...supportedLangs],
    evaluationConfig: {
      callableByLanguage: {
        javascript: "reverseString",
        typescript: "reverseString",
        python: "reverse_string",
        php: "reverseString",
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
    },
    starterCode: "function reverseString(s) {\n  // Your solution here\n  return s;\n}",
  };

  const challengeStringReversal = await prisma.challenge.upsert({
    where: { id: "challenge-string-reversal" },
    update: { ...stringReversalFields },
    create: {
      id: "challenge-string-reversal",
      title: "String Reversal",
      description:
        "Implementiere reverseString(s): Gib den übergebenen String in umgekehrter Zeichenreihenfolge zurück.",
      difficulty: "easy",
      points: 100,
      categoryId: catStrings.id,
      hint: "Nutze einen Zwei-Zeiger-Ansatz oder kehre die Zeichen direkt um.",
      examples: [
        { input: '"hello"', output: '"olleh"' },
        { input: '"racecar"', output: '"racecar"' },
      ],
      ...stringReversalFields,
      isActive: false,
      date: addUtcDays(anchor, -2),
    },
  });

  const hashMapFields = {
    supportedLanguages: [...supportedLangs],
    evaluationConfig: {
      callableByLanguage: {
        javascript: "hashMap",
        typescript: "hashMap",
        python: "hash_map",
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
    },
    starterCode: "function hashMap(operations) {\n  // Your solution here\n  return [];\n}",
  };

  const challengeHashMap = await prisma.challenge.upsert({
    where: { id: "challenge-hashmap" },
    update: { ...hashMapFields },
    create: {
      id: "challenge-hashmap",
      title: "Hash Map Implementation",
      description:
        "Implementiere hashMap(operations): Verarbeite eine Liste von Operationen und gib ein Array mit dem Ergebnis jeder Operation zurück. Jede Operation ist [typ, key] oder [typ, key, value]. Typen: \"set\" speichert value (Ergebnis null), \"get\" gibt den gespeicherten value oder null zurück, \"has\" gibt einen Boolean zurück, \"delete\" gibt einen Boolean zurück (ob der Schlüssel vorhanden war).",
      difficulty: "medium",
      points: 150,
      categoryId: catDatenstrukturen.id,
      hint: "Verwende intern eine Map bzw. ein Dictionary und laufe die Operationen der Reihe nach durch.",
      examples: [
        {
          input: '[["set","a",1],["get","a"],["get","b"]]',
          output: "[null,1,null]",
        },
      ],
      ...hashMapFields,
      isActive: false,
      date: addUtcDays(anchor, -3),
    },
  });

  const recursionFields = {
    supportedLanguages: [...supportedLangs],
    evaluationConfig: {
      callableByLanguage: {
        javascript: "fibonacci",
        typescript: "fibonacci",
        python: "fibonacci",
        php: "fibonacci",
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
    },
    starterCode: "function fibonacci(n) {\n  // Your solution here\n  return 0;\n}",
  };

  const challengeRecursion = await prisma.challenge.upsert({
    where: { id: "challenge-recursion" },
    update: { ...recursionFields },
    create: {
      id: "challenge-recursion",
      title: "Recursion Basics",
      description:
        "Implementiere fibonacci(n): Gib die n-te Fibonacci-Zahl zurück (0-indiziert, d. h. fibonacci(0) = 0, fibonacci(1) = 1).",
      difficulty: "easy",
      points: 100,
      categoryId: catAlgorithmen.id,
      hint: "fibonacci(n) = fibonacci(n-1) + fibonacci(n-2), mit fibonacci(0) = 0 und fibonacci(1) = 1.",
      examples: [
        { input: "5", output: "5" },
        { input: "10", output: "55" },
      ],
      ...recursionFields,
      isActive: false,
      date: addUtcDays(anchor, -4),
    },
  });

  const binaryTreeFields = {
    supportedLanguages: [...supportedLangs],
    evaluationConfig: {
      callableByLanguage: {
        javascript: "inorderTraversal",
        typescript: "inorderTraversal",
        python: "inorder_traversal",
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
    },
    starterCode: "function inorderTraversal(root) {\n  // Your solution here\n  return [];\n}",
  };

  const challengeBinaryTree = await prisma.challenge.upsert({
    where: { id: "challenge-binary-tree" },
    update: { ...binaryTreeFields },
    create: {
      id: "challenge-binary-tree",
      title: "Binary Tree Traversal",
      description:
        'Implementiere inorderTraversal(root): Gib die In-order-Reihenfolge (links, Wurzel, rechts) der Knotenwerte als Array zurück. Ein Knoten hat die Form { val, left, right }; leere Teilbäume sind null.',
      difficulty: "hard",
      points: 200,
      categoryId: catBaeume.id,
      hint: "In-order: erst den linken Teilbaum, dann die Wurzel, dann den rechten Teilbaum besuchen.",
      examples: [
        {
          input: '{ "val": 2, "left": { "val": 1 }, "right": { "val": 3 } }',
          output: "[1,2,3]",
        },
      ],
      ...binaryTreeFields,
      isActive: false,
      date: addUtcDays(anchor, -5),
    },
  });

  // ─── Further challenges (LeetCode / Codewars classics) ────────────────────────

  const twoSumFields = {
    supportedLanguages: [...supportedLangs],
    evaluationConfig: {
      callableByLanguage: {
        javascript: "twoSum",
        typescript: "twoSum",
        python: "two_sum",
        php: "twoSum",
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
    },
    starterCode:
      "function twoSum(data) {\n  const { nums, target } = data;\n  // Your solution here\n  return [];\n}",
  };

  const challengeTwoSum = await prisma.challenge.upsert({
    where: { id: "challenge-two-sum" },
    update: { ...twoSumFields },
    create: {
      id: "challenge-two-sum",
      title: "Two Sum",
      description:
        "Implementiere twoSum(data) mit data = { nums, target }: Gib die beiden Indizes (aufsteigend) zurück, deren Werte zusammen target ergeben. Es existiert genau eine Lösung.",
      difficulty: "medium",
      points: 150,
      categoryId: catAlgorithmen.id,
      hint: "Speichere gesehene Werte in einer Map: für jedes Element prüfst du, ob target - element bereits vorkam.",
      examples: [{ input: '{ "nums": [2,7,11,15], "target": 9 }', output: "[0,1]" }],
      ...twoSumFields,
      isActive: false,
      date: addUtcDays(anchor, -6),
    },
  });

  const fizzBuzzFields = {
    supportedLanguages: [...supportedLangs],
    evaluationConfig: {
      callableByLanguage: {
        javascript: "fizzBuzz",
        typescript: "fizzBuzz",
        python: "fizz_buzz",
        php: "fizzBuzz",
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
    },
    starterCode: "function fizzBuzz(n) {\n  // Your solution here\n  return [];\n}",
  };

  const challengeFizzBuzz = await prisma.challenge.upsert({
    where: { id: "challenge-fizzbuzz" },
    update: { ...fizzBuzzFields },
    create: {
      id: "challenge-fizzbuzz",
      title: "FizzBuzz",
      description:
        'Implementiere fizzBuzz(n): Gib ein Array der Länge n zurück. Für jede Zahl 1..n: Vielfache von 3 werden zu "Fizz", von 5 zu "Buzz", von beiden zu "FizzBuzz", sonst die Zahl als String.',
      difficulty: "easy",
      points: 100,
      categoryId: catAlgorithmen.id,
      hint: "Prüfe zuerst auf teilbar durch 15, dann durch 3, dann durch 5.",
      examples: [{ input: "5", output: '["1","2","Fizz","4","Buzz"]' }],
      ...fizzBuzzFields,
      isActive: false,
      date: addUtcDays(anchor, -7),
    },
  });

  const validParenthesesFields = {
    supportedLanguages: [...supportedLangs],
    evaluationConfig: {
      callableByLanguage: {
        javascript: "isValid",
        typescript: "isValid",
        python: "is_valid",
        php: "isValid",
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
    },
    starterCode: "function isValid(s) {\n  // Your solution here\n  return false;\n}",
  };

  const challengeValidParentheses = await prisma.challenge.upsert({
    where: { id: "challenge-valid-parentheses" },
    update: { ...validParenthesesFields },
    create: {
      id: "challenge-valid-parentheses",
      title: "Valid Parentheses",
      description:
        "Implementiere isValid(s): Prüfe, ob die Klammern in s korrekt verschachtelt und geschlossen sind. Erlaubte Zeichen: (), [], {}. Gib true oder false zurück.",
      difficulty: "medium",
      points: 150,
      categoryId: catDatenstrukturen.id,
      hint: "Nutze einen Stack: öffnende Klammern legst du ab, bei schließenden muss die oberste passen.",
      examples: [
        { input: '"()[]{}"', output: "true" },
        { input: '"([)]"', output: "false" },
      ],
      ...validParenthesesFields,
      isActive: false,
      date: addUtcDays(anchor, -8),
    },
  });

  const countVowelsFields = {
    supportedLanguages: [...supportedLangs],
    evaluationConfig: {
      callableByLanguage: {
        javascript: "countVowels",
        typescript: "countVowels",
        python: "count_vowels",
        php: "countVowels",
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
    },
    starterCode: "function countVowels(s) {\n  // Your solution here\n  return 0;\n}",
  };

  const challengeCountVowels = await prisma.challenge.upsert({
    where: { id: "challenge-count-vowels" },
    update: { ...countVowelsFields },
    create: {
      id: "challenge-count-vowels",
      title: "Count Vowels",
      description:
        "Implementiere countVowels(s): Zähle die Vokale (a, e, i, o, u – Groß-/Kleinschreibung egal) im String s.",
      difficulty: "easy",
      points: 100,
      categoryId: catStrings.id,
      hint: "Wandle den String in Kleinbuchstaben um und prüfe jedes Zeichen gegen die Vokalmenge.",
      examples: [{ input: '"hello"', output: "2" }],
      ...countVowelsFields,
      isActive: false,
      date: addUtcDays(anchor, -9),
    },
  });

  const maxSubArrayFields = {
    supportedLanguages: [...supportedLangs],
    evaluationConfig: {
      callableByLanguage: {
        javascript: "maxSubArray",
        typescript: "maxSubArray",
        python: "max_sub_array",
        php: "maxSubArray",
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
    },
    starterCode: "function maxSubArray(nums) {\n  // Your solution here\n  return 0;\n}",
  };

  const challengeMaxSubArray = await prisma.challenge.upsert({
    where: { id: "challenge-max-subarray" },
    update: { ...maxSubArrayFields },
    create: {
      id: "challenge-max-subarray",
      title: "Maximum Subarray",
      description:
        "Implementiere maxSubArray(nums): Gib die größtmögliche Summe eines zusammenhängenden Teil-Arrays zurück (mindestens ein Element).",
      difficulty: "medium",
      points: 150,
      categoryId: catAlgorithmen.id,
      hint: "Kadane: laufe einmal durch und entscheide je Element, ob du die bisherige Summe fortführst oder neu beginnst.",
      examples: [{ input: "[-2,1,-3,4,-1,2,1,-5,4]", output: "6" }],
      ...maxSubArrayFields,
      isActive: false,
      date: addUtcDays(anchor, -10),
    },
  });

  const isAnagramFields = {
    supportedLanguages: [...supportedLangs],
    evaluationConfig: {
      callableByLanguage: {
        javascript: "isAnagram",
        typescript: "isAnagram",
        python: "is_anagram",
        php: "isAnagram",
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
    },
    starterCode:
      "function isAnagram(data) {\n  const { s, t } = data;\n  // Your solution here\n  return false;\n}",
  };

  const challengeIsAnagram = await prisma.challenge.upsert({
    where: { id: "challenge-valid-anagram" },
    update: { ...isAnagramFields },
    create: {
      id: "challenge-valid-anagram",
      title: "Valid Anagram",
      description:
        "Implementiere isAnagram(data) mit data = { s, t }: Gib true zurück, wenn t ein Anagramm von s ist (dieselben Buchstaben in derselben Anzahl).",
      difficulty: "easy",
      points: 100,
      categoryId: catStrings.id,
      hint: "Sortiere beide Strings und vergleiche – oder zähle die Buchstabenhäufigkeiten.",
      examples: [{ input: '{ "s": "listen", "t": "silent" }', output: "true" }],
      ...isAnagramFields,
      isActive: false,
      date: addUtcDays(anchor, -11),
    },
  });

  const digitalRootFields = {
    supportedLanguages: [...supportedLangs],
    evaluationConfig: {
      callableByLanguage: {
        javascript: "digitalRoot",
        typescript: "digitalRoot",
        python: "digital_root",
        php: "digitalRoot",
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
    },
    starterCode: "function digitalRoot(n) {\n  // Your solution here\n  return 0;\n}",
  };

  const challengeDigitalRoot = await prisma.challenge.upsert({
    where: { id: "challenge-digital-root" },
    update: { ...digitalRootFields },
    create: {
      id: "challenge-digital-root",
      title: "Digital Root",
      description:
        "Implementiere digitalRoot(n): Addiere wiederholt die Ziffern von n, bis nur noch eine einzelne Ziffer (0–9) übrig ist, und gib sie zurück.",
      difficulty: "easy",
      points: 100,
      categoryId: catAlgorithmen.id,
      hint: "Wiederhole die Quersumme, bis das Ergebnis kleiner als 10 ist.",
      examples: [{ input: "942", output: "6" }],
      ...digitalRootFields,
      isActive: false,
      date: addUtcDays(anchor, -12),
    },
  });

  const moveZeroesFields = {
    supportedLanguages: [...supportedLangs],
    evaluationConfig: {
      callableByLanguage: {
        javascript: "moveZeroes",
        typescript: "moveZeroes",
        python: "move_zeroes",
        php: "moveZeroes",
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
    },
    starterCode: "function moveZeroes(nums) {\n  // Your solution here\n  return nums;\n}",
  };

  const challengeMoveZeroes = await prisma.challenge.upsert({
    where: { id: "challenge-move-zeroes" },
    update: { ...moveZeroesFields },
    create: {
      id: "challenge-move-zeroes",
      title: "Move Zeroes",
      description:
        "Implementiere moveZeroes(nums): Verschiebe alle Nullen ans Ende des Arrays und behalte die Reihenfolge der übrigen Elemente bei.",
      difficulty: "easy",
      points: 100,
      categoryId: catDatenstrukturen.id,
      hint: "Sammle zuerst alle Nicht-Null-Werte, fülle danach mit Nullen auf.",
      examples: [{ input: "[0,1,0,3,12]", output: "[1,3,12,0,0]" }],
      ...moveZeroesFields,
      isActive: false,
      date: addUtcDays(anchor, -13),
    },
  });

  const romanToIntFields = {
    supportedLanguages: [...supportedLangs],
    evaluationConfig: {
      callableByLanguage: {
        javascript: "romanToInt",
        typescript: "romanToInt",
        python: "roman_to_int",
        php: "romanToInt",
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
    },
    starterCode: "function romanToInt(s) {\n  // Your solution here\n  return 0;\n}",
  };

  const challengeRomanToInt = await prisma.challenge.upsert({
    where: { id: "challenge-roman-to-integer" },
    update: { ...romanToIntFields },
    create: {
      id: "challenge-roman-to-integer",
      title: "Roman to Integer",
      description:
        "Implementiere romanToInt(s): Wandle eine römische Zahl (I=1, V=5, X=10, L=50, C=100, D=500, M=1000) in ihren ganzzahligen Wert um. Steht ein kleinerer Wert vor einem größeren, wird er subtrahiert (z. B. IV = 4).",
      difficulty: "medium",
      points: 150,
      categoryId: catStrings.id,
      hint: "Gehe von links nach rechts: ist der aktuelle Wert kleiner als der nächste, ziehe ihn ab, sonst addiere ihn.",
      examples: [
        { input: '"IX"', output: "9" },
        { input: '"MCMXCIV"', output: "1994" },
      ],
      ...romanToIntFields,
      isActive: false,
      date: addUtcDays(anchor, -14),
    },
  });

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

  // Since #67, `isActive` means "part of the rotation pool", not "is today's
  // challenge". Every finished challenge is eligible — otherwise the rotation would
  // hold a single element and the app would serve the same challenge forever.
  await prisma.challenge.updateMany({ data: { isActive: true } });
  // An explicit date still wins: on the seed day that is the well-known challenge.
  await prisma.challenge.update({
    where: { id: challengeToday.id },
    data: { date: anchor },
  });
  await prisma.challenge.update({
    where: { id: challengeBinarySearch.id },
    data: { date: addUtcDays(anchor, -1) },
  });
  await prisma.challenge.update({
    where: { id: challengeStringReversal.id },
    data: { date: addUtcDays(anchor, -2) },
  });
  await prisma.challenge.update({
    where: { id: challengeHashMap.id },
    data: { date: addUtcDays(anchor, -3) },
  });
  await prisma.challenge.update({
    where: { id: challengeRecursion.id },
    data: { date: addUtcDays(anchor, -4) },
  });
  await prisma.challenge.update({
    where: { id: challengeBinaryTree.id },
    data: { date: addUtcDays(anchor, -5) },
  });

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
      create: { id: `sub-${i + 1}`, ...submissionData[i] },
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
