// API abstraction layer for daily coding challenge platform

import type { CodeLanguageId, StarterCodesMap } from "@/lib/challenge-languages";

export type { CodeLanguageId, StarterCodesMap };

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RankingEntry {
  rank: number;
  previousRank?: number;
  name: string;
  initials: string;
  points: number;
  time?: string;
  avatar: string;
  level?: number;
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
  /** Abgeschlossene Challenges im laufenden UTC-Monat (siehe `monthlyChallengeGoal`). */
  monthlyChallengesSolved: number;
  /** Festes Soll für den Monats-Fortschrittsbalken (z. B. 30 Challenges). */
  monthlyChallengeGoal: number;
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
  status: "pending" | "completed" | "failed" | "skipped";
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
  /** Languages accepted for this challenge (run + submit). */
  supportedLanguages: CodeLanguageId[];
  /** Suggested starting language from API. */
  defaultLanguage: CodeLanguageId;
  /** Starter template per language. */
  starterCodes: StarterCodesMap;
  /** Single-string fallback (same as starterCodes[defaultLanguage]). */
  starterCode: string;
  /**
   * Wenn eingeloggt und für diese Challenge heute (UTC) bereits eine Submission existiert.
   * Sonst null (auch wenn nicht eingeloggt).
   */
  todaySubmission: {
    status: "completed" | "failed" | "pending";
    submittedAt: string;
  } | null;
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

/** Base URL for server-side fetches (SSR). Vercel sets VERCEL_URL automatically. */
export function getServerApiBaseUrl(): string {
  const trim = (u: string) => u.replace(/\/$/, "");
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return trim(process.env.NEXT_PUBLIC_APP_URL);
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NEXTAUTH_URL) {
    return trim(process.env.NEXTAUTH_URL);
  }
  const port = process.env.PORT ?? "3000";
  return `http://localhost:${port}`;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = typeof window === "undefined" ? getServerApiBaseUrl() : "";
  const res = await fetch(`${base}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const raw = await res.text();
    let message = `API error ${res.status}: ${path}`;
    try {
      const parsed = JSON.parse(raw) as { error?: unknown };
      if (typeof parsed.error === "string" && parsed.error.length > 0) {
        message = parsed.error;
      }
    } catch {
      /* Body ist kein JSON — Fallback bleibt */
    }
    throw new Error(message);
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
  code: string,
  language: CodeLanguageId,
  /** Wandzeit seit Challenge-Anzeige (Sekunden); optional, sonst Fallback Server. */
  solveDurationSeconds?: number
): Promise<{
    success: boolean;
    testCases: ChallengeTestCase[];
    language?: CodeLanguageId;
    /** Ob Laufzeit/Kompilierung (Piston) erfolgreich war; bei Stub immer true. */
    runtimeOk?: boolean;
  }> {
  const body: Record<string, unknown> = { code, language };
  if (typeof solveDurationSeconds === "number" && Number.isFinite(solveDurationSeconds)) {
    body.solveDurationSeconds = Math.max(0, Math.floor(solveDurationSeconds));
  }
  return apiFetch(`/api/challenge/${challengeId}/submit`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function runTests(
  challengeId: string,
  code: string,
  language: CodeLanguageId
): Promise<{
    testCases: ChallengeTestCase[];
    language?: CodeLanguageId;
    /** Ob Laufzeit/Kompilierung erfolgreich; bei Stub immer true. */
    runtimeOk?: boolean;
  }> {
  return apiFetch(`/api/challenge/${challengeId}/run`, {
    method: "POST",
    body: JSON.stringify({ code, language }),
  });
}

// ─── Community Feed ───────────────────────────────────────────────────────────

export function getCommunityFeed(): Promise<CommunityFeedItem[]> {
  return apiFetch<CommunityFeedItem[]>("/api/community/feed");
}
