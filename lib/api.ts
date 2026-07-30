// API abstraction layer for daily coding challenge platform

import type { CodeLanguageId, StarterCodesMap } from "@/lib/challenge-languages";
import type { MonthlyActivity } from "@/lib/monthly-activity";

export type { CodeLanguageId, StarterCodesMap };
export type { MonthlyActivity, MonthlyActivityDayCell } from "@/lib/monthly-activity";

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
  /**
   * Status der heutigen (UTC) Abgabe des eingeloggten Nutzers; null wenn nicht
   * eingeloggt oder noch nicht abgegeben.
   */
  todayStatus: "completed" | "failed" | "pending" | null;
}

export interface UserStats {
  rank: string;
  points: string;
  /** Prozentuale Rangentwicklung ggü. der Vorwoche (positiv = besser). */
  rankTrendPercent: number;
  /** Rangentwicklung in Plätzen ggü. der Vorwoche (positiv = besser). */
  rankTrendPlaces: number;
  /** Prozentuale Punkteentwicklung ggü. dem Vormonat. */
  pointsTrendPercent: number;
  streak: number;
  streakRecord: number;
  totalSolved: number;
  /** Gesamtzahl registrierter Nutzer (für "Rang X von N"). */
  totalUsers: number;
  level: number;
  levelMax: number;
  badges: number;
  badgesTotal: number;
  /** Abgeschlossene Challenges im laufenden UTC-Monat (siehe `monthlyChallengeGoal`). */
  monthlyChallengesSolved: number;
  /** Soll = Anzahl Tage im laufenden UTC-Monat (ein Challenge-Ziel pro Kalendertag). */
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
  /** UTC-Monatskalender: Abschlüsse pro Tag + Markierung der laufenden Streak-Serie. */
  monthlyActivity: MonthlyActivity;
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

/** Zusatzinfos für die Erfolgs-UI nach erfolgreicher Abgabe. */
export interface SubmitCelebration {
  timeTakenSeconds: number;
  streak: number;
  streakRecord: number;
  /** Ø Lösezeit (Sek.) aller heutigen Abgaben zu dieser Challenge (UTC-Tag), nur mit timeTaken. */
  avgSolveTimeTodaySeconds: number | null;
  /** Anzahl abgeschlossener Abgaben zu dieser Challenge am heutigen UTC-Tag. */
  completionsToday: number;
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
    code: string;
    language: string;
    /**
     * Bewertete Testfälle dieser Abgabe. null bei Altdaten ohne gespeicherte
     * Ergebnisse — dann greift die Vorlage der Challenge.
     */
    testResults: ChallengeTestCase[] | null;
  } | null;
  /**
   * Serverseitiger Start der Bearbeitung (ISO). Quelle für die angezeigte
   * verstrichene Zeit; null wenn nicht eingeloggt.
   */
  startedAt: string | null;
}

export interface CommunityFeedItem {
  id: string;
  kind: "challenge-solved";
  user: {
    name: string;
    initials: string;
    avatar: string;
    level: number;
  };
  username: string;
  action: string;
  challenge: string;
  points: number;
  time: string;
  createdAt: string;
  /** Gesetzt, wenn diese Abgabe einen Levelaufstieg ausgelöst hat. */
  levelUp?: {
    previousLevel: number;
    newLevel: number;
  };
}

export interface CommunityFeedPage {
  items: CommunityFeedItem[];
  nextCursor: string | null;
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
  language: CodeLanguageId
): Promise<{
    success: boolean;
    testCases: ChallengeTestCase[];
    language?: CodeLanguageId;
    /** Ob Laufzeit/Kompilierung (Piston) erfolgreich war; bei Stub immer true. */
    runtimeOk?: boolean;
    celebration?: SubmitCelebration;
  }> {
  return apiFetch(`/api/challenge/${challengeId}/submit`, {
    method: "POST",
    body: JSON.stringify({ code, language }),
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

export function getCommunityFeed(params?: {
  cursor?: string | null;
  limit?: number;
}): Promise<CommunityFeedPage> {
  const sp = new URLSearchParams();
  if (params?.cursor) sp.set("cursor", params.cursor);
  if (params?.limit != null) sp.set("limit", String(params.limit));
  const q = sp.toString();
  return apiFetch<CommunityFeedPage>(
    q ? `/api/community/feed?${q}` : "/api/community/feed"
  );
}
