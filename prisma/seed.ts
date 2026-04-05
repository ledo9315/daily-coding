import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ─── Teams ───────────────────────────────────────────────────────────────────

  const teamFrontend = await prisma.team.upsert({
    where: { id: "team-frontend" },
    update: {},
    create: {
      id: "team-frontend",
      name: "Team Frontend",
      initials: "TF",
      avatar: "/user/pony2.png",
      level: 25,
      points: 9500,
      challengesSolved: 78,
    },
  });

  const teamBackend = await prisma.team.upsert({
    where: { id: "team-backend" },
    update: {},
    create: {
      id: "team-backend",
      name: "Team Backend",
      initials: "TB",
      avatar: "/user/minipix2.png",
      level: 23,
      points: 8780,
      challengesSolved: 72,
    },
  });

  const teamDevOps = await prisma.team.upsert({
    where: { id: "team-devops" },
    update: {},
    create: {
      id: "team-devops",
      name: "Team DevOps",
      initials: "TD",
      avatar: "/user/pony3.png",
      level: 21,
      points: 7650,
      challengesSolved: 65,
    },
  });

  const teamMobile = await prisma.team.upsert({
    where: { id: "team-mobile" },
    update: {},
    create: {
      id: "team-mobile",
      name: "Team Mobile",
      initials: "TM",
      avatar: "/user/minipix4.png",
      level: 20,
      points: 7200,
      challengesSolved: 60,
    },
  });

  const teamQA = await prisma.team.upsert({
    where: { id: "team-qa" },
    update: {},
    create: {
      id: "team-qa",
      name: "Team QA",
      initials: "TQ",
      avatar: "/user/minipix5.png",
      level: 18,
      points: 5800,
      challengesSolved: 48,
    },
  });

  // ─── Users ───────────────────────────────────────────────────────────────────

  const anna = await prisma.user.upsert({
    where: { email: "anna.schmidt@company.com" },
    update: {},
    create: {
      id: "user-anna",
      name: "Anna Schmidt",
      initials: "AS",
      avatar: "/user/chibi1.png",
      email: "anna.schmidt@company.com",
      role: "Administrator",
      status: "active",
      department: "Frontend",
      joinDate: new Date("2024-01-01"),
      level: 15,
      points: 3450,
      streak: 5,
      streakRecord: 28,
      totalSolved: 28,
      badges: 5,
      teamId: teamFrontend.id,
    },
  });

  const tom = await prisma.user.upsert({
    where: { email: "tom.weber@company.com" },
    update: {},
    create: {
      id: "user-tom",
      name: "Tom Weber",
      initials: "TW",
      avatar: "/user/chibi2.png",
      email: "tom.weber@company.com",
      role: "Mitglied",
      status: "active",
      department: "Backend",
      joinDate: new Date("2024-02-15"),
      level: 14,
      points: 3280,
      streak: 7,
      streakRecord: 30,
      totalSolved: 27,
      badges: 4,
      teamId: teamBackend.id,
    },
  });

  const max = await prisma.user.upsert({
    where: { email: "max.mustermann@company.com" },
    update: {},
    create: {
      id: "user-max",
      name: "Max Mustermann",
      initials: "MM",
      avatar: "/user/minipix5.png",
      email: "max.mustermann@company.com",
      role: "Mitglied",
      status: "invited",
      department: "Frontend",
      level: 12,
      points: 2450,
      streak: 12,
      streakRecord: 28,
      totalSolved: 47,
      badges: 4,
      teamId: teamFrontend.id,
    },
  });

  const lisa = await prisma.user.upsert({
    where: { email: "lisa.mueller@company.com" },
    update: {},
    create: {
      id: "user-lisa",
      name: "Lisa Müller",
      initials: "LM",
      avatar: "/user/chibi3.png",
      email: "lisa.mueller@company.com",
      role: "Mitglied",
      status: "active",
      department: "Design",
      joinDate: new Date("2024-03-03"),
      level: 13,
      points: 3100,
      streak: 3,
      streakRecord: 20,
      totalSolved: 26,
      badges: 3,
      teamId: teamFrontend.id,
    },
  });

  const sarah = await prisma.user.upsert({
    where: { email: "sarah.klein@company.com" },
    update: {},
    create: {
      id: "user-sarah",
      name: "Sarah Klein",
      initials: "SK",
      avatar: "/user/minipix4.png",
      email: "sarah.klein@company.com",
      role: "Beobachter",
      status: "inactive",
      department: "Marketing",
      joinDate: new Date("2024-01-01"),
      level: 11,
      points: 2650,
      streak: 0,
      streakRecord: 15,
      totalSolved: 22,
      badges: 2,
      teamId: teamMobile.id,
    },
  });

  const jan = await prisma.user.upsert({
    where: { email: "jan.becker@company.com" },
    update: {},
    create: {
      id: "user-jan",
      name: "Jan Becker",
      initials: "JB",
      avatar: "/user/minipix2.png",
      email: "jan.becker@company.com",
      role: "Mitglied",
      status: "active",
      department: "DevOps",
      level: 12,
      points: 2800,
      streak: 2,
      streakRecord: 18,
      totalSolved: 23,
      badges: 3,
      teamId: teamDevOps.id,
    },
  });

  const julia = await prisma.user.upsert({
    where: { email: "julia.fischer@company.com" },
    update: {},
    create: {
      id: "user-julia",
      name: "Julia Fischer",
      initials: "JF",
      avatar: "/user/minipix6.png",
      email: "julia.fischer@company.com",
      role: "Mitglied",
      status: "active",
      department: "Backend",
      level: 10,
      points: 2500,
      streak: 4,
      streakRecord: 14,
      totalSolved: 21,
      badges: 2,
      teamId: teamBackend.id,
    },
  });

  const peter = await prisma.user.upsert({
    where: { email: "peter.hoffmann@company.com" },
    update: {},
    create: {
      id: "user-peter",
      name: "Peter Hoffmann",
      initials: "PH",
      avatar: "/user/pony2.png",
      email: "peter.hoffmann@company.com",
      role: "Mitglied",
      status: "active",
      department: "QA",
      level: 9,
      points: 2350,
      streak: 1,
      streakRecord: 10,
      totalSolved: 20,
      badges: 2,
      teamId: teamQA.id,
    },
  });

  const maria = await prisma.user.upsert({
    where: { email: "maria.wagner@company.com" },
    update: {},
    create: {
      id: "user-maria",
      name: "Maria Wagner",
      initials: "MW",
      avatar: "/user/pony3.png",
      email: "maria.wagner@company.com",
      role: "Mitglied",
      status: "active",
      department: "DevOps",
      level: 9,
      points: 2200,
      streak: 2,
      streakRecord: 12,
      totalSolved: 19,
      badges: 2,
      teamId: teamDevOps.id,
    },
  });

  const david = await prisma.user.upsert({
    where: { email: "david.schulz@company.com" },
    update: {},
    create: {
      id: "user-david",
      name: "David Schulz",
      initials: "DS",
      avatar: "/user/pony4.png",
      email: "david.schulz@company.com",
      role: "Mitglied",
      status: "active",
      department: "Mobile",
      level: 8,
      points: 2050,
      streak: 3,
      streakRecord: 9,
      totalSolved: 18,
      badges: 1,
      teamId: teamMobile.id,
    },
  });

  // ─── Achievements for Max (current user) ─────────────────────────────────────

  const achievementDefs = [
    { id: "ach-1", title: "Erste Schritte", description: "Erste Challenge abgeschlossen", iconKey: "Check", unlocked: true, rarity: "common", unlockedAt: new Date("2026-01-15") },
    { id: "ach-2", title: "Wochenend-Krieger", description: "7 Tage Streak erreicht", iconKey: "CalendarWeek", unlocked: true, rarity: "rare", unlockedAt: new Date("2026-01-22") },
    { id: "ach-3", title: "Blitzschnell", description: "Challenge in unter 3 Minuten gelöst", iconKey: "Clock", unlocked: true, rarity: "rare", unlockedAt: new Date("2026-01-25") },
    { id: "ach-4", title: "Code-Meister", description: "10 schwere Challenges gelöst", iconKey: "Trophy", unlocked: true, rarity: "epic", unlockedAt: new Date("2026-01-28") },
    { id: "ach-5", title: "Unaufhaltsam", description: "30 Tage Streak erreicht", iconKey: "Zap", unlocked: false, rarity: "legendary" },
    { id: "ach-6", title: "Perfektionist", description: "20 Challenges ohne Fehler", iconKey: "Bullseye", unlocked: false, rarity: "epic" },
  ];

  for (const ach of achievementDefs) {
    await prisma.achievement.upsert({
      where: { id: ach.id },
      update: {},
      create: { ...ach, userId: max.id },
    });
  }

  // ─── Challenges ───────────────────────────────────────────────────────────────

  const challengeToday = await prisma.challenge.upsert({
    where: { id: "challenge-array-manipulation" },
    update: {},
    create: {
      id: "challenge-array-manipulation",
      title: "Array Manipulation Challenge",
      description: "Implementiere eine Funktion transformArray(arr), die ein Array von Zahlen nimmt und ein neues Array zurückgibt, bei dem jedes Element die kumulative Summe aller vorherigen Elemente (inklusive sich selbst) enthält.",
      difficulty: "medium",
      points: 150,
      category: "Algorithmen • Tag 47",
      hint: "Versuche die Lösung mit O(n) Zeitkomplexität und O(1) zusätzlichem Speicher zu implementieren.",
      examples: [
        { input: "[1, 2, 3, 4, 5]", output: "[1, 3, 6, 10, 15]" },
        { input: "[5, -2, 3, 1]", output: "[5, 3, 6, 7]" },
      ],
      testCases: [
        { id: 1, name: "Test Case 1: Einfaches Array", status: "pending" },
        { id: 2, name: "Test Case 2: Leeres Array", status: "pending" },
        { id: 3, name: "Test Case 3: Negative Zahlen", status: "pending" },
        { id: 4, name: "Test Case 4: Großes Array", status: "pending" },
        { id: 5, name: "Test Case 5: Edge Cases", status: "pending" },
      ],
      starterCode: "function transformArray(arr) {\n  // Your solution here\n}",
      isActive: true,
      date: new Date("2026-04-05"),
    },
  });

  const challengeBinarySearch = await prisma.challenge.upsert({
    where: { id: "challenge-binary-search" },
    update: {},
    create: {
      id: "challenge-binary-search",
      title: "Binary Search",
      description: "Implementiere eine effiziente binäre Suche.",
      difficulty: "easy",
      points: 120,
      category: "Algorithmen • Tag 46",
      hint: "Teile das Array in der Mitte.",
      examples: [{ input: "[1,3,5,7,9], target=5", output: "2" }],
      testCases: [
        { id: 1, name: "Test Case 1", status: "pending" },
        { id: 2, name: "Test Case 2", status: "pending" },
      ],
      starterCode: "function binarySearch(arr, target) {\n  // Your solution here\n}",
      isActive: false,
      date: new Date("2026-04-04"),
    },
  });

  const challengeStringReversal = await prisma.challenge.upsert({
    where: { id: "challenge-string-reversal" },
    update: {},
    create: {
      id: "challenge-string-reversal",
      title: "String Reversal",
      description: "Kehre einen String um.",
      difficulty: "easy",
      points: 100,
      category: "Strings • Tag 45",
      hint: "Nutze einen zwei-Zeiger-Ansatz.",
      examples: [{ input: '"hello"', output: '"olleh"' }],
      testCases: [
        { id: 1, name: "Test Case 1", status: "pending" },
        { id: 2, name: "Test Case 2", status: "pending" },
      ],
      starterCode: "function reverseString(s) {\n  // Your solution here\n}",
      isActive: false,
      date: new Date("2026-04-03"),
    },
  });

  const challengeHashMap = await prisma.challenge.upsert({
    where: { id: "challenge-hashmap" },
    update: {},
    create: {
      id: "challenge-hashmap",
      title: "Hash Map Implementation",
      description: "Implementiere eine einfache Hash Map.",
      difficulty: "medium",
      points: 150,
      category: "Datenstrukturen • Tag 44",
      examples: [],
      testCases: [],
      starterCode: "class HashMap {\n  // Your solution here\n}",
      isActive: false,
      date: new Date("2026-04-02"),
    },
  });

  const challengeRecursion = await prisma.challenge.upsert({
    where: { id: "challenge-recursion" },
    update: {},
    create: {
      id: "challenge-recursion",
      title: "Recursion Basics",
      description: "Löse eine Fibonacci-Berechnung rekursiv.",
      difficulty: "easy",
      points: 100,
      category: "Algorithmen • Tag 43",
      examples: [{ input: "5", output: "5" }],
      testCases: [],
      starterCode: "function fibonacci(n) {\n  // Your solution here\n}",
      isActive: false,
      date: new Date("2026-04-01"),
    },
  });

  const challengeBinaryTree = await prisma.challenge.upsert({
    where: { id: "challenge-binary-tree" },
    update: {},
    create: {
      id: "challenge-binary-tree",
      title: "Binary Tree Traversal",
      description: "Traversiere einen binären Baum in-order.",
      difficulty: "hard",
      points: 200,
      category: "Bäume • Tag 42",
      examples: [],
      testCases: [],
      starterCode: "function inorderTraversal(root) {\n  // Your solution here\n}",
      isActive: false,
      date: new Date("2026-03-31"),
    },
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

  const today = new Date("2026-04-05");

  const todayRankings = [
    { userId: anna.id, rank: 1, previousRank: 1, points: 150, timeTaken: "4:23" },
    { userId: tom.id, rank: 2, previousRank: 4, points: 145, timeTaken: "5:12" },
    { userId: lisa.id, rank: 3, previousRank: 2, points: 140, timeTaken: "5:45" },
    { userId: jan.id, rank: 4, previousRank: 3, points: 130, timeTaken: "6:02" },
    { userId: sarah.id, rank: 5, previousRank: 7, points: 125, timeTaken: "6:30" },
    { userId: max.id, rank: 6, previousRank: 5, points: 120, timeTaken: "7:15" },
    { userId: julia.id, rank: 7, previousRank: 8, points: 115, timeTaken: "7:45" },
    { userId: peter.id, rank: 8, previousRank: 6, points: 110, timeTaken: "8:20" },
    { userId: maria.id, rank: 9, previousRank: 9, points: 105, timeTaken: "8:55" },
    { userId: david.id, rank: 10, previousRank: 12, points: 100, timeTaken: "9:30" },
  ];

  for (const entry of todayRankings) {
    await prisma.rankingEntry.upsert({
      where: { userId_period_periodDate: { userId: entry.userId, period: "today", periodDate: today } },
      update: {},
      create: { period: "today", periodDate: today, ...entry },
    });
  }

  // Weekly rankings
  const weekDate = new Date("2026-04-05");
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
  const monthDate = new Date("2026-04-05");
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

  // Team rankings
  const teams = [
    { team: teamFrontend, rank: 1, previousRank: 1, points: 9500, challengesSolved: 78 },
    { team: teamBackend, rank: 2, previousRank: 2, points: 8780, challengesSolved: 72 },
    { team: teamDevOps, rank: 3, previousRank: 4, points: 7650, challengesSolved: 65 },
    { team: teamMobile, rank: 4, previousRank: 3, points: 7200, challengesSolved: 60 },
    { team: teamQA, rank: 5, previousRank: 5, points: 5800, challengesSolved: 48 },
  ];

  for (const entry of teams) {
    await prisma.rankingEntry.upsert({
      where: { teamId_period_periodDate: { teamId: entry.team.id, period: "team", periodDate: today } },
      update: {},
      create: { period: "team", periodDate: today, teamId: entry.team.id, rank: entry.rank, previousRank: entry.previousRank, points: entry.points, challengesSolved: entry.challengesSolved },
    });
  }

  console.log("✅ Seed complete");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
