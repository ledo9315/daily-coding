// API abstraction layer for daily coding challenge platform

import type { CodeLanguageId, StarterCodesMap } from "@/lib/challenge-languages";
import type { MonthlyActivity } from "@/lib/monthly-activity";
import type { ChallengeHint } from "@/lib/challenge-hints";

export type { CodeLanguageId, StarterCodesMap };
export type { ChallengeHint };
export type { MonthlyActivity, MonthlyActivityDayCell } from "@/lib/monthly-activity";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RankingEntry {
  rank: number;
  previousRank?: number;
  name: string;
  initials: string;
  points: number;
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
   * Status of the signed-in user's submission for today (UTC); null when not
   * signed in or nothing submitted yet.
   */
  todayStatus: "completed" | "failed" | "pending" | null;
}

export interface UserStats {
  rank: string;
  points: string;
  /** Rank change against last week, in percent (positive = better). */
  rankTrendPercent: number;
  /** Rank change against last week, in places (positive = better). */
  rankTrendPlaces: number;
  /** Points change against last month, in percent. */
  pointsTrendPercent: number;
  streak: number;
  streakRecord: number;
  totalSolved: number;
  /** Total number of registered users (for "rank X of N"). */
  totalUsers: number;
  level: number;
  levelMax: number;
  badges: number;
  badgesTotal: number;
  /** Challenges completed in the running UTC month (see `monthlyChallengeGoal`). */
  monthlyChallengesSolved: number;
  /** Target = number of days in the running UTC month (one challenge per calendar day). */
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
  /**
   * How far along a locked achievement is. Absent once unlocked, and absent for targets
   * of one, where a bar would say nothing (#96). `label` prefixes the numbers when the
   * value is not a plain count — the streak achievements measure a record.
   */
  progress?: { current: number; target: number; label?: string };
}

export interface ChallengeHistoryEntry {
  id: string;
  /** The challenge behind the submission — `id` above is the submission itself. */
  challengeId: string;
  title: string;
  date: string;
  difficulty: "easy" | "medium" | "hard";
  status: "pending" | "completed" | "failed" | "skipped";
  points: number;
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
  /** UTC month calendar: completions per day plus the running streak marked. */
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

/** An achievement this very submission unlocked, for the one-off toast on the result page. */
export interface UnlockedAchievement {
  id: string;
  title: string;
  description: string;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  category: string;
  /** Staged help, unfolded one step at a time. Empty when the challenge offers none. */
  hints: ChallengeHint[];
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
   * Set when signed in and a submission for this challenge already exists today
   * (UTC). Otherwise null — including when not signed in.
   */
  todaySubmission: {
    status: "completed" | "failed" | "pending";
    submittedAt: string;
    code: string;
    language: string;
    /**
     * Graded test cases of this submission. null for legacy rows without stored
     * results — the challenge's template is used instead.
     */
    testResults: ChallengeTestCase[] | null;
  } | null;
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
  /** Set when this submission triggered a level-up. */
  levelUp?: {
    previousLevel: number;
    newLevel: number;
  };
}

export interface SolutionAuthor {
  name: string;
  initials: string;
  avatar: string;
  level: number;
}

/**
 * All submissions of a challenge that carry byte-identical code, as one card (#223).
 *
 * A popular one-liner is submitted by hundreds of people; listing each of them separately
 * makes the page unreadable, so the code appears once and the authors are listed under it.
 */
export interface ChallengeSolutionGroup {
  codeHash: string;
  /** The oldest submission of the group — it carries the code shown and the comment thread. */
  submissionId: string;
  language: CodeLanguageId;
  code: string;
  /** ISO string of the oldest submission in the group. */
  createdAt: string;
  /** Whether the representative row was rewritten after it was first solved. */
  revised: boolean;
  /** The first few authors; `submissionCount` says how many there are in total. */
  authors: SolutionAuthor[];
  submissionCount: number;
}

export interface ChallengeSolutionsPage {
  groups: ChallengeSolutionGroup[];
  nextCursor: string | null;
}

/** One remark under a submission. */
export interface SubmissionComment {
  id: string;
  author: {
    name: string;
    initials: string;
    avatar: string;
  };
  body: string;
  createdAt: string;
  /** True when the signed-in user wrote it and may therefore delete it. */
  own: boolean;
}

export interface SubmissionCommentsPage {
  comments: SubmissionComment[];
  nextCursor: string | null;
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
      /* Body is not JSON — keep the fallback message */
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

// ─── Ranking ──────────────────────────────────────────────────────────────────

export function getRanking(
  period: "week" | "month" | "all"
): Promise<RankingEntry[]> {
  return apiFetch<RankingEntry[]>(`/api/ranking?period=${period}`);
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function getTodayChallenge(): Promise<TodayChallenge> {
  return apiFetch<TodayChallenge>("/api/challenge/today");
}

export function getDashboardRankingPreview(): Promise<{
  week: RankingEntry[];
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
    /** Stored status of today's submission after this attempt. */
    status: "completed" | "failed";
    /** Row that now holds today's attempt — the result page is addressed through it. */
    submissionId: string;
    /** True only for the attempt that turns the day green. */
    firstSolveToday: boolean;
    unlockedAchievements: UnlockedAchievement[];
    testCases: ChallengeTestCase[];
    language?: CodeLanguageId;
    /** Whether runtime/compilation (Piston) succeeded; always true for the stub. */
    runtimeOk?: boolean;
    /** Set when the compiler rejected the program, so no test ever ran. */
    compileError?: string;
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
    /** Whether runtime/compilation succeeded; always true for the stub. */
    runtimeOk?: boolean;
    /** Set when the compiler rejected the program, so no test ever ran. */
    compileError?: string;
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

// ─── Challenge Solutions ──────────────────────────────────────────────────────

export function getChallengeSolutions(
  challengeId: string,
  params?: { cursor?: string | null; limit?: number }
): Promise<ChallengeSolutionsPage> {
  const sp = new URLSearchParams();
  if (params?.cursor) sp.set("cursor", params.cursor);
  if (params?.limit != null) sp.set("limit", String(params.limit));
  const q = sp.toString();
  const base = `/api/challenge/${challengeId}/solutions`;
  return apiFetch<ChallengeSolutionsPage>(q ? `${base}?${q}` : base);
}

// ─── Submission Comments ──────────────────────────────────────────────────────

export function getSubmissionComments(
  submissionId: string,
  params?: { cursor?: string | null; limit?: number }
): Promise<SubmissionCommentsPage> {
  const sp = new URLSearchParams();
  if (params?.cursor) sp.set("cursor", params.cursor);
  if (params?.limit != null) sp.set("limit", String(params.limit));
  const q = sp.toString();
  const base = `/api/submission/${submissionId}/comments`;
  return apiFetch<SubmissionCommentsPage>(q ? `${base}?${q}` : base);
}

export function createSubmissionComment(
  submissionId: string,
  body: string
): Promise<SubmissionComment> {
  return apiFetch(`/api/submission/${submissionId}/comments`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}

export function deleteSubmissionComment(
  submissionId: string,
  commentId: string
): Promise<{ success: true }> {
  return apiFetch(`/api/submission/${submissionId}/comments/${commentId}`, {
    method: "DELETE",
  });
}
