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

  const anna = await prisma.user.upsert({
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

  const tom = await prisma.user.upsert({
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

  const max = await prisma.user.upsert({
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

  const lisa = await prisma.user.upsert({
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

  const sarah = await prisma.user.upsert({
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

  const jan = await prisma.user.upsert({
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

  const julia = await prisma.user.upsert({
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

  const peter = await prisma.user.upsert({
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

  const maria = await prisma.user.upsert({
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

  const david = await prisma.user.upsert({
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
    { id: "ach-3", title: "Blitzschnell",      description: "Challenge in unter 3 Minuten gelöst", iconKey: "Clock",        rarity: "rare"      as const },
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

  const challengeBinarySearch = await prisma.challenge.upsert({
    where: { id: "challenge-binary-search" },
    update: {
      supportedLanguages: [...supportedLangs],
      starterCodes: {
        javascript: "function binarySearch(arr, target) {\n  // Your solution here\n}",
        typescript:
          "function binarySearch(arr: number[], target: number): number {\n  // Your solution here\n  return -1;\n}",
        python:
          "def binary_search(arr, target):\n    # Your solution here\n    return -1\n",
        php: "<?php\n\nfunction binarySearch($arr, $target) {\n    // Your solution here\n    return -1;\n}\n",
      },
      starterCode: "function binarySearch(arr, target) {\n  // Your solution here\n}",
    },
    create: {
      id: "challenge-binary-search",
      title: "Binary Search",
      description: "Implementiere eine effiziente binäre Suche.",
      difficulty: "easy",
      points: 120,
      categoryId: catAlgorithmen.id,
      hint: "Teile das Array in der Mitte.",
      examples: [{ input: "[1,3,5,7,9], target=5", output: "2" }],
      testCases: [
        { id: 1, name: "Test Case 1", status: "pending" },
        { id: 2, name: "Test Case 2", status: "pending" },
      ],
      supportedLanguages: [...supportedLangs],
      starterCodes: {
        javascript: "function binarySearch(arr, target) {\n  // Your solution here\n}",
        typescript:
          "function binarySearch(arr: number[], target: number): number {\n  // Your solution here\n  return -1;\n}",
        python:
          "def binary_search(arr, target):\n    # Your solution here\n    return -1\n",
        php: "<?php\n\nfunction binarySearch($arr, $target) {\n    // Your solution here\n    return -1;\n}\n",
      },
      starterCode: "function binarySearch(arr, target) {\n  // Your solution here\n}",
      isActive: false,
      date: addUtcDays(anchor, -1),
    },
  });

  const challengeStringReversal = await prisma.challenge.upsert({
    where: { id: "challenge-string-reversal" },
    update: {
      supportedLanguages: [...supportedLangs],
      starterCodes: {
        javascript: "function reverseString(s) {\n  // Your solution here\n}",
        typescript:
          "function reverseString(s: string): string {\n  // Your solution here\n  return s;\n}",
        python:
          "def reverse_string(s: str):\n    # Your solution here\n    return s\n",
        php: "<?php\n\nfunction reverseString($s) {\n    // Your solution here\n    return $s;\n}\n",
      },
      starterCode: "function reverseString(s) {\n  // Your solution here\n}",
    },
    create: {
      id: "challenge-string-reversal",
      title: "String Reversal",
      description: "Kehre einen String um.",
      difficulty: "easy",
      points: 100,
      categoryId: catStrings.id,
      hint: "Nutze einen zwei-Zeiger-Ansatz.",
      examples: [{ input: '"hello"', output: '"olleh"' }],
      testCases: [
        { id: 1, name: "Test Case 1", status: "pending" },
        { id: 2, name: "Test Case 2", status: "pending" },
      ],
      supportedLanguages: [...supportedLangs],
      starterCodes: {
        javascript: "function reverseString(s) {\n  // Your solution here\n}",
        typescript:
          "function reverseString(s: string): string {\n  // Your solution here\n  return s;\n}",
        python:
          "def reverse_string(s: str):\n    # Your solution here\n    return s\n",
        php: "<?php\n\nfunction reverseString($s) {\n    // Your solution here\n    return $s;\n}\n",
      },
      starterCode: "function reverseString(s) {\n  // Your solution here\n}",
      isActive: false,
      date: addUtcDays(anchor, -2),
    },
  });

  const challengeHashMap = await prisma.challenge.upsert({
    where: { id: "challenge-hashmap" },
    update: {
      supportedLanguages: [...supportedLangs],
      starterCodes: {
        javascript: "class HashMap {\n  // Your solution here\n}",
        typescript: "class HashMap {\n  // Your solution here\n}",
        python: "class HashMap:\n    # Your solution here\n    pass\n",
        php: "<?php\n\nclass HashMap {\n    // Your solution here\n}\n",
      },
      starterCode: "class HashMap {\n  // Your solution here\n}",
    },
    create: {
      id: "challenge-hashmap",
      title: "Hash Map Implementation",
      description: "Implementiere eine einfache Hash Map.",
      difficulty: "medium",
      points: 150,
      categoryId: catDatenstrukturen.id,
      examples: [],
      testCases: [],
      supportedLanguages: [...supportedLangs],
      starterCodes: {
        javascript: "class HashMap {\n  // Your solution here\n}",
        typescript: "class HashMap {\n  // Your solution here\n}",
        python: "class HashMap:\n    # Your solution here\n    pass\n",
        php: "<?php\n\nclass HashMap {\n    // Your solution here\n}\n",
      },
      starterCode: "class HashMap {\n  // Your solution here\n}",
      isActive: false,
      date: addUtcDays(anchor, -3),
    },
  });

  const challengeRecursion = await prisma.challenge.upsert({
    where: { id: "challenge-recursion" },
    update: {
      supportedLanguages: [...supportedLangs],
      starterCodes: {
        javascript: "function fibonacci(n) {\n  // Your solution here\n}",
        typescript:
          "function fibonacci(n: number): number {\n  // Your solution here\n  return 0;\n}",
        python:
          "def fibonacci(n: int) -> int:\n    # Your solution here\n    return 0\n",
        php: "<?php\n\nfunction fibonacci($n) {\n    // Your solution here\n    return 0;\n}\n",
      },
      starterCode: "function fibonacci(n) {\n  // Your solution here\n}",
    },
    create: {
      id: "challenge-recursion",
      title: "Recursion Basics",
      description: "Löse eine Fibonacci-Berechnung rekursiv.",
      difficulty: "easy",
      points: 100,
      categoryId: catAlgorithmen.id,
      examples: [{ input: "5", output: "5" }],
      testCases: [],
      supportedLanguages: [...supportedLangs],
      starterCodes: {
        javascript: "function fibonacci(n) {\n  // Your solution here\n}",
        typescript:
          "function fibonacci(n: number): number {\n  // Your solution here\n  return 0;\n}",
        python:
          "def fibonacci(n: int) -> int:\n    # Your solution here\n    return 0\n",
        php: "<?php\n\nfunction fibonacci($n) {\n    // Your solution here\n    return 0;\n}\n",
      },
      starterCode: "function fibonacci(n) {\n  // Your solution here\n}",
      isActive: false,
      date: addUtcDays(anchor, -4),
    },
  });

  const challengeBinaryTree = await prisma.challenge.upsert({
    where: { id: "challenge-binary-tree" },
    update: {
      supportedLanguages: [...supportedLangs],
      starterCodes: {
        javascript: "function inorderTraversal(root) {\n  // Your solution here\n}",
        typescript:
          "function inorderTraversal(root: TreeNode | null): number[] {\n  // Your solution here\n  return [];\n}",
        python:
          "def inorder_traversal(root):\n    # Your solution here\n    return []\n",
        php: "<?php\n\nfunction inorderTraversal($root) {\n    // Your solution here\n    return [];\n}\n",
      },
      starterCode: "function inorderTraversal(root) {\n  // Your solution here\n}",
    },
    create: {
      id: "challenge-binary-tree",
      title: "Binary Tree Traversal",
      description: "Traversiere einen binären Baum in-order.",
      difficulty: "hard",
      points: 200,
      categoryId: catBaeume.id,
      examples: [],
      testCases: [],
      supportedLanguages: [...supportedLangs],
      starterCodes: {
        javascript: "function inorderTraversal(root) {\n  // Your solution here\n}",
        typescript:
          "function inorderTraversal(root: TreeNode | null): number[] {\n  // Your solution here\n  return [];\n}",
        python:
          "def inorder_traversal(root):\n    # Your solution here\n    return []\n",
        php: "<?php\n\nfunction inorderTraversal($root) {\n    // Your solution here\n    return [];\n}\n",
      },
      starterCode: "function inorderTraversal(root) {\n  // Your solution here\n}",
      isActive: false,
      date: addUtcDays(anchor, -5),
    },
  });

  // Keep seed reruns deterministic even when records already existed with drifted state.
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

  await prisma.challenge.updateMany({ data: { isActive: false } });
  await prisma.challenge.update({
    where: { id: challengeToday.id },
    data: { isActive: true, date: anchor },
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

  const submissionData = [
    { userId: max.id, challengeId: challengeToday.id, code: "// solved", status: "completed" as const, timeTaken: 323, rank: 8 },
    { userId: max.id, challengeId: challengeBinarySearch.id, code: "// solved", status: "completed" as const, timeTaken: 192, rank: 3 },
    { userId: max.id, challengeId: challengeBinaryTree.id, code: "// attempted", status: "failed" as const, timeTaken: 900 },
    { userId: max.id, challengeId: challengeHashMap.id, code: "// solved", status: "completed" as const, timeTaken: 525, rank: 12 },
    { userId: max.id, challengeId: challengeRecursion.id, code: "// solved", status: "completed" as const, timeTaken: 270, rank: 5 },
    { userId: anna.id, challengeId: challengeToday.id, code: "// solved", status: "completed" as const, timeTaken: 263, rank: 1 },
    { userId: tom.id, challengeId: challengeToday.id, code: "// solved", status: "completed" as const, timeTaken: 312, rank: 2 },
    { userId: lisa.id, challengeId: challengeToday.id, code: "// solved", status: "completed" as const, timeTaken: 345, rank: 3 },
    { userId: jan.id, challengeId: challengeToday.id, code: "// solved", status: "completed" as const, timeTaken: 362, rank: 4 },
    { userId: sarah.id, challengeId: challengeToday.id, code: "// solved", status: "completed" as const, timeTaken: 390, rank: 5 },
    { userId: anna.id, challengeId: challengeStringReversal.id, code: "// solved", status: "completed" as const, timeTaken: 180, rank: 1 },
    { userId: lisa.id, challengeId: challengeBinarySearch.id, code: "// solved", status: "completed" as const, timeTaken: 200, rank: 2 },
    { userId: jan.id, challengeId: challengeHashMap.id, code: "// solved", status: "completed" as const, timeTaken: 400, rank: 5 },
  ];

  for (let i = 0; i < submissionData.length; i++) {
    await prisma.submission.upsert({
      where: { id: `sub-${i + 1}` },
      update: {},
      create: { id: `sub-${i + 1}`, ...submissionData[i] },
    });
  }

  // ─── Ranking Entries (today) ──────────────────────────────────────────────────

  const today = anchor;

  const todayRankings = [
    { userId: anna.id, rank: 1, previousRank: 1, points: 150, timeTaken: 263 },
    { userId: tom.id, rank: 2, previousRank: 4, points: 145, timeTaken: 312 },
    { userId: lisa.id, rank: 3, previousRank: 2, points: 140, timeTaken: 345 },
    { userId: jan.id, rank: 4, previousRank: 3, points: 130, timeTaken: 362 },
    { userId: sarah.id, rank: 5, previousRank: 7, points: 125, timeTaken: 390 },
    { userId: max.id, rank: 6, previousRank: 5, points: 120, timeTaken: 435 },
    { userId: julia.id, rank: 7, previousRank: 8, points: 115, timeTaken: 465 },
    { userId: peter.id, rank: 8, previousRank: 6, points: 110, timeTaken: 500 },
    { userId: maria.id, rank: 9, previousRank: 9, points: 105, timeTaken: 535 },
    { userId: david.id, rank: 10, previousRank: 12, points: 100, timeTaken: 570 },
  ];

  for (const entry of todayRankings) {
    await prisma.rankingEntry.upsert({
      where: { userId_period_periodDate: { userId: entry.userId, period: "today", periodDate: today } },
      update: {},
      create: { period: "today", periodDate: today, ...entry },
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

  console.log("✅ Seed complete");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
