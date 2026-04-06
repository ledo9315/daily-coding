// API abstraction layer for daily coding challenge platform

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RankingEntry {
  rank: number;
  previousRank?: number;
  name: string;
  initials: string;
  points: number;
  time?: string;
  avatar: string;
  level: number;
  challengesSolved?: number;
}

export interface TodayChallenge {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  category: string;
}

export interface UserStats {
  rank: string;
  points: string;
  streak: number;
  streakRecord: number;
  totalSolved: number;
  level: number;
  levelMax: number;
  badges: number;
  badgesTotal: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconKey: string;
  unlocked: boolean;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlockedAt?: string;
}

export interface ChallengeHistoryEntry {
  id: string;
  title: string;
  date: string;
  difficulty: "easy" | "medium" | "hard";
  status: "completed" | "failed" | "skipped";
  points: number;
  time: string;
  rank?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  initials: string;
  avatar: string;
  role: string;
  stats: UserStats;
  achievements: Achievement[];
  challengeHistory: ChallengeHistoryEntry[];
}

export interface ChallengeTestCase {
  id: number;
  name: string;
  status: "pending" | "passed" | "failed";
  input?: string;
  expected?: string;
  actual?: string;
  time?: string;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  category: string;
  hint: string;
  examples: Array<{ input: string; output: string }>;
  testCases: ChallengeTestCase[];
  starterCode: string;
}

export interface CommunityFeedItem {
  id: string;
  user: {
    name: string;
    initials: string;
    avatar: string;
    level: number;
  };
  action: string;
  challenge?: string;
  points?: number;
  time: string;
}

// ─── Internal fetch helper ────────────────────────────────────────────────────

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base =
    typeof window === "undefined"
      ? (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
      : "";
  const res = await fetch(`${base}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`);
  }
  return res.json() as Promise<T>;
}

// ─── Ranking ──────────────────────────────────────────────────────────────────

export function getRanking(
  period: "today" | "week" | "month"
): Promise<RankingEntry[]> {
  return apiFetch<RankingEntry[]>(`/api/ranking?period=${period}`);
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function getTodayChallenge(): Promise<TodayChallenge> {
  return apiFetch<TodayChallenge>("/api/challenge/today");
}

export function getDashboardRankingPreview(): Promise<{
  today: RankingEntry[];
}> {
  return apiFetch("/api/ranking/preview");
}

export function getUserStats(): Promise<UserStats> {
  return apiFetch<UserStats>("/api/user/stats");
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export function getUserProfile(): Promise<UserProfile> {
  return apiFetch<UserProfile>("/api/user/profile");
}

// ─── Challenge ────────────────────────────────────────────────────────────────

export function getDailyChallenge(): Promise<DailyChallenge> {
  return apiFetch<DailyChallenge>("/api/challenge/daily");
}

export function submitSolution(
  challengeId: string,
  code: string
): Promise<{ success: boolean; testCases: ChallengeTestCase[] }> {
  return apiFetch(`/api/challenge/${challengeId}/submit`, {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export function runTests(
  challengeId: string,
  code: string
): Promise<{ testCases: ChallengeTestCase[] }> {
  return apiFetch(`/api/challenge/${challengeId}/run`, {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

// ─── Community Feed ───────────────────────────────────────────────────────────

export function getCommunityFeed(): Promise<CommunityFeedItem[]> {
  return apiFetch<CommunityFeedItem[]>("/api/community/feed");
}
