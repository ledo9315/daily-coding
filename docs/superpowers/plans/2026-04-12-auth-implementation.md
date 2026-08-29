# Auth System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the existing NextAuth v5 + Prisma auth system with OAuth (GitHub/Google), email verification, password reset, and "Remember Me" - without migrating away from the current JWT strategy.

**Architecture:** Keep JWT strategy and Credentials provider intact. Add three new Prisma models (Account, EmailVerificationToken, PasswordResetToken) + `emailVerified` field on User. New `lib/server/auth-service.ts` owns all token CRUD. OAuth users are created/linked in the JWT callback via `lib/server/oauth-user.ts`. E-mail delivery goes through `lib/server/email-service.ts` (Resend).

**Tech Stack:** Next.js 16 App Router · NextAuth v5 beta · Prisma 7 · PostgreSQL · Resend · bcryptjs · Zod · shadcn/ui · Sonner · Vitest (Node env)

---

## File Map

| Status | Path | Responsibility |
|---|---|---|
| Modify | `prisma/schema.prisma` | Add Account, EmailVerificationToken, PasswordResetToken, emailVerified |
| Create | `lib/server/auth-service.ts` | Token generation, validation, expiry |
| Create | `lib/server/email-service.ts` | Resend wrapper, email templates |
| Create | `lib/server/rate-limiter.ts` | In-memory rate limiting |
| Create | `lib/server/oauth-user.ts` | Find-or-create DB user for OAuth sign-ins |
| Create | `lib/server/__tests__/auth-service.test.ts` | Unit tests for auth-service |
| Create | `lib/server/__tests__/email-service.test.ts` | Unit tests for email-service |
| Create | `lib/server/__tests__/rate-limiter.test.ts` | Unit tests for rate-limiter |
| Modify | `lib/auth-credentials.ts` | Add emailVerified gate + rememberMe passthrough |
| Modify | `lib/auth-callbacks.ts` | Add rememberMe → token.exp logic |
| Modify | `auth.ts` | Add OAuth providers + signIn/jwt callbacks for OAuth |
| Modify | `app/api/auth/register/route.ts` | Send verification email after creation |
| Create | `app/api/auth/verify-email/route.ts` | Validate token, set emailVerified |
| Create | `app/api/auth/forgot-password/route.ts` | Rate-limited, send reset email |
| Create | `app/api/auth/reset-password/route.ts` | Validate token, update password hash |
| Modify | `lib/__tests__/auth-credentials.test.ts` | New cases: emailVerified gate, rememberMe |
| Modify | `lib/__tests__/auth-callbacks.test.ts` | New cases: token.exp from rememberMe |
| Modify | `components/login-form.tsx` | Remember Me checkbox, OAuth buttons, fix link |
| Modify | `components/register-form.tsx` | No auto-login when REQUIRE_EMAIL_VERIFICATION=true |
| Create | `components/auth/oauth-buttons.tsx` | GitHub/Google sign-in buttons |
| Create | `app/auth/verify-email/page.tsx` | Server component: calls verifyEmailToken, redirects |
| Create | `app/auth/forgot-password/page.tsx` | Client form → forgot-password API |
| Create | `app/auth/reset-password/page.tsx` | Client form → reset-password API |

---

## Task 1: Install Resend + Prisma Schema Migration

**Files:**
- Modify: `prisma/schema.prisma`
- Run: `pnpm add resend`
- Run: `pnpm prisma migrate dev`

- [ ] **Step 1: Install the resend package**

```bash
pnpm add resend
```

Expected: `resend` added to `dependencies` in `package.json`.

- [ ] **Step 2: Update `prisma/schema.prisma`**

Add `emailVerified` field to `User` (after `passwordHash`):

```prisma
emailVerified Boolean      @default(false)
accounts      Account[]
emailVerificationTokens EmailVerificationToken[]
passwordResetTokens     PasswordResetToken[]
```

Add three new models at the end of the file (before the final closing line):

```prisma
model Account {
  id                String @id @default(cuid())
  userId            String
  provider          String
  providerAccountId String
  user              User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model EmailVerificationToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model PasswordResetToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  used      Boolean  @default(false)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

- [ ] **Step 3: Run the migration**

```bash
pnpm prisma migrate dev --name auth_extensions
```

Expected: migration created and applied, `prisma generate` runs automatically.

- [ ] **Step 4: Verify type-check passes**

```bash
pnpm exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add prisma/ package.json pnpm-lock.yaml
git commit -m "feat: add auth extension schema (Account, tokens, emailVerified)"
```

---

## Task 2: `lib/server/auth-service.ts` (TDD)

**Files:**
- Create: `lib/server/__tests__/auth-service.test.ts`
- Create: `lib/server/auth-service.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/server/__tests__/auth-service.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCreate = vi.fn();
const mockDeleteMany = vi.fn();
const mockFindUnique = vi.fn();
const mockDelete = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    emailVerificationToken: {
      create: (...a: unknown[]) => mockCreate(...a),
      deleteMany: (...a: unknown[]) => mockDeleteMany(...a),
      findUnique: (...a: unknown[]) => mockFindUnique(...a),
      delete: (...a: unknown[]) => mockDelete(...a),
    },
    passwordResetToken: {
      create: (...a: unknown[]) => mockCreate(...a),
      deleteMany: (...a: unknown[]) => mockDeleteMany(...a),
      findUnique: (...a: unknown[]) => mockFindUnique(...a),
      update: (...a: unknown[]) => mockUpdate(...a),
    },
    user: {
      update: (...a: unknown[]) => mockUpdate(...a),
    },
  },
}));

import {
  createEmailVerificationToken,
  verifyEmailToken,
  createPasswordResetToken,
  validatePasswordResetToken,
  markPasswordResetTokenUsed,
} from "@/lib/server/auth-service";

beforeEach(() => vi.clearAllMocks());

describe("createEmailVerificationToken", () => {
  it("deletes old tokens, creates new one, returns hex string", async () => {
    mockDeleteMany.mockResolvedValueOnce({ count: 0 });
    mockCreate.mockResolvedValueOnce({});
    const token = await createEmailVerificationToken("user-1");
    expect(typeof token).toBe("string");
    expect(token).toHaveLength(64); // 32 bytes = 64 hex chars
    expect(mockDeleteMany).toHaveBeenCalledWith({ where: { userId: "user-1" } });
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: "user-1", token }),
      })
    );
  });
});

describe("verifyEmailToken", () => {
  it("returns error when token not found", async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    const result = await verifyEmailToken("bad-token");
    expect(result).toEqual({ error: "Token ungültig." });
  });

  it("returns error and deletes when token is expired", async () => {
    mockFindUnique.mockResolvedValueOnce({
      token: "t",
      userId: "u1",
      expiresAt: new Date(Date.now() - 1000),
    });
    mockDelete.mockResolvedValueOnce({});
    const result = await verifyEmailToken("t");
    expect(result).toEqual({ error: "Token abgelaufen." });
    expect(mockDelete).toHaveBeenCalledWith({ where: { token: "t" } });
  });

  it("sets emailVerified and deletes token on success", async () => {
    mockFindUnique.mockResolvedValueOnce({
      token: "t",
      userId: "u1",
      expiresAt: new Date(Date.now() + 60_000),
    });
    mockUpdate.mockResolvedValueOnce({});
    mockDelete.mockResolvedValueOnce({});
    const result = await verifyEmailToken("t");
    expect(result).toEqual({ success: true });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { emailVerified: true },
    });
    expect(mockDelete).toHaveBeenCalledWith({ where: { token: "t" } });
  });
});

describe("createPasswordResetToken", () => {
  it("deletes old tokens, creates new one, returns hex string", async () => {
    mockDeleteMany.mockResolvedValueOnce({ count: 0 });
    mockCreate.mockResolvedValueOnce({});
    const token = await createPasswordResetToken("user-2");
    expect(typeof token).toBe("string");
    expect(token).toHaveLength(64);
    expect(mockDeleteMany).toHaveBeenCalledWith({ where: { userId: "user-2" } });
  });
});

describe("validatePasswordResetToken", () => {
  it("returns error when token not found", async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    expect(await validatePasswordResetToken("x")).toEqual({ error: "Token ungültig." });
  });

  it("returns error when token already used", async () => {
    mockFindUnique.mockResolvedValueOnce({
      token: "t",
      userId: "u1",
      used: true,
      expiresAt: new Date(Date.now() + 60_000),
    });
    expect(await validatePasswordResetToken("t")).toEqual({
      error: "Token wurde bereits verwendet.",
    });
  });

  it("returns error when token expired", async () => {
    mockFindUnique.mockResolvedValueOnce({
      token: "t",
      userId: "u1",
      used: false,
      expiresAt: new Date(Date.now() - 1000),
    });
    expect(await validatePasswordResetToken("t")).toEqual({ error: "Token abgelaufen." });
  });

  it("returns userId for valid token", async () => {
    mockFindUnique.mockResolvedValueOnce({
      token: "t",
      userId: "u1",
      used: false,
      expiresAt: new Date(Date.now() + 60_000),
    });
    expect(await validatePasswordResetToken("t")).toEqual({ userId: "u1" });
  });
});

describe("markPasswordResetTokenUsed", () => {
  it("calls prisma.passwordResetToken.update with used: true", async () => {
    mockUpdate.mockResolvedValueOnce({});
    await markPasswordResetTokenUsed("t");
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { token: "t" },
      data: { used: true },
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm vitest run lib/server/__tests__/auth-service.test.ts
```

Expected: FAIL - `Cannot find module '@/lib/server/auth-service'`

- [ ] **Step 3: Implement `lib/server/auth-service.ts`**

```typescript
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

export async function createEmailVerificationToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  await prisma.emailVerificationToken.deleteMany({ where: { userId } });
  await prisma.emailVerificationToken.create({
    data: {
      userId,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });
  return token;
}

export async function verifyEmailToken(
  token: string
): Promise<{ success: true } | { error: string }> {
  const record = await prisma.emailVerificationToken.findUnique({ where: { token } });
  if (!record) return { error: "Token ungültig." };
  if (record.expiresAt < new Date()) {
    await prisma.emailVerificationToken.delete({ where: { token } });
    return { error: "Token abgelaufen." };
  }
  await prisma.user.update({ where: { id: record.userId }, data: { emailVerified: true } });
  await prisma.emailVerificationToken.delete({ where: { token } });
  return { success: true };
}

export async function createPasswordResetToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  await prisma.passwordResetToken.deleteMany({ where: { userId } });
  await prisma.passwordResetToken.create({
    data: {
      userId,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });
  return token;
}

export async function validatePasswordResetToken(
  token: string
): Promise<{ userId: string } | { error: string }> {
  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!record) return { error: "Token ungültig." };
  if (record.used) return { error: "Token wurde bereits verwendet." };
  if (record.expiresAt < new Date()) return { error: "Token abgelaufen." };
  return { userId: record.userId };
}

export async function markPasswordResetTokenUsed(token: string): Promise<void> {
  await prisma.passwordResetToken.update({ where: { token }, data: { used: true } });
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm vitest run lib/server/__tests__/auth-service.test.ts
```

Expected: all 9 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/server/auth-service.ts lib/server/__tests__/auth-service.test.ts
git commit -m "feat: add auth-service (email verification + password reset tokens)"
```

---

## Task 3: `lib/server/email-service.ts` (TDD)

**Files:**
- Create: `lib/server/__tests__/email-service.test.ts`
- Create: `lib/server/email-service.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/server/__tests__/email-service.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSend = vi.fn();

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: (...a: unknown[]) => mockSend(...a) },
  })),
}));

// Set env before importing the module
process.env.RESEND_API_KEY = "re_test";
process.env.APP_URL = "https://app.example.com";
process.env.EMAIL_FROM = "noreply@example.com";

import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "@/lib/server/email-service";

beforeEach(() => vi.clearAllMocks());

describe("sendVerificationEmail", () => {
  it("calls resend.emails.send with correct to, subject, and verification link", async () => {
    mockSend.mockResolvedValueOnce({ data: { id: "e1" }, error: null });
    await sendVerificationEmail("user@test.com", "abc123");
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user@test.com",
        subject: expect.stringContaining("bestätigen"),
        html: expect.stringContaining("https://app.example.com/auth/verify-email?token=abc123"),
      })
    );
  });
});

describe("sendPasswordResetEmail", () => {
  it("calls resend.emails.send with correct to, subject, and reset link", async () => {
    mockSend.mockResolvedValueOnce({ data: { id: "e2" }, error: null });
    await sendPasswordResetEmail("user@test.com", "xyz789");
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user@test.com",
        subject: expect.stringContaining("Passwort"),
        html: expect.stringContaining("https://app.example.com/auth/reset-password?token=xyz789"),
      })
    );
  });
});

describe("sendWelcomeEmail", () => {
  it("calls resend.emails.send with correct to and name in body", async () => {
    mockSend.mockResolvedValueOnce({ data: { id: "e3" }, error: null });
    await sendWelcomeEmail("user@test.com", "Max");
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user@test.com",
        html: expect.stringContaining("Max"),
      })
    );
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm vitest run lib/server/__tests__/email-service.test.ts
```

Expected: FAIL - `Cannot find module '@/lib/server/email-service'`

- [ ] **Step 3: Implement `lib/server/email-service.ts`**

```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "noreply@example.com";
const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const url = `${APP_URL}/auth/verify-email?token=${token}`;
  await resend.emails.send({
    from: FROM,
    to,
    subject: "E-Mail Adresse bestätigen – Daily Dev",
    html: `<p>Klicke auf den folgenden Link um deine E-Mail zu bestätigen:</p>
<p><a href="${url}">${url}</a></p>
<p>Dieser Link ist 24 Stunden gültig.</p>`,
  });
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const url = `${APP_URL}/auth/reset-password?token=${token}`;
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Passwort zurücksetzen – Daily Dev",
    html: `<p>Klicke auf den folgenden Link um dein Passwort zurückzusetzen:</p>
<p><a href="${url}">${url}</a></p>
<p>Dieser Link ist 1 Stunde gültig. Wenn du kein Zurücksetzen beantragt hast, ignoriere diese E-Mail.</p>`,
  });
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Willkommen bei Daily Dev!",
    html: `<p>Hey ${name},</p>
<p>willkommen bei Daily Dev! Löse täglich Coding-Challenges und steige im Ranking auf.</p>`,
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm vitest run lib/server/__tests__/email-service.test.ts
```

Expected: all 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/server/email-service.ts lib/server/__tests__/email-service.test.ts
git commit -m "feat: add email-service (Resend wrapper for verification + reset emails)"
```

---

## Task 4: `lib/server/rate-limiter.ts` (TDD)

**Files:**
- Create: `lib/server/__tests__/rate-limiter.test.ts`
- Create: `lib/server/rate-limiter.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/server/__tests__/rate-limiter.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

// We need to reset the module between tests to clear the in-memory store
beforeEach(() => {
  vi.resetModules();
});

describe("checkRateLimit", () => {
  it("allows the first request", async () => {
    const { checkRateLimit } = await import("@/lib/server/rate-limiter");
    expect(checkRateLimit("key1", 3, 60_000)).toBe(true);
  });

  it("allows requests up to the limit", async () => {
    const { checkRateLimit } = await import("@/lib/server/rate-limiter");
    expect(checkRateLimit("key2", 3, 60_000)).toBe(true);
    expect(checkRateLimit("key2", 3, 60_000)).toBe(true);
    expect(checkRateLimit("key2", 3, 60_000)).toBe(true);
  });

  it("blocks the request when limit is exceeded", async () => {
    const { checkRateLimit } = await import("@/lib/server/rate-limiter");
    checkRateLimit("key3", 2, 60_000);
    checkRateLimit("key3", 2, 60_000);
    expect(checkRateLimit("key3", 2, 60_000)).toBe(false);
  });

  it("resets after the window expires", async () => {
    vi.useFakeTimers();
    const { checkRateLimit } = await import("@/lib/server/rate-limiter");
    checkRateLimit("key4", 1, 1_000);
    checkRateLimit("key4", 1, 1_000); // blocked
    vi.advanceTimersByTime(1_001);
    expect(checkRateLimit("key4", 1, 1_000)).toBe(true); // window reset
    vi.useRealTimers();
  });

  it("different keys have independent limits", async () => {
    const { checkRateLimit } = await import("@/lib/server/rate-limiter");
    checkRateLimit("a", 1, 60_000);
    checkRateLimit("a", 1, 60_000); // "a" is now blocked
    expect(checkRateLimit("b", 1, 60_000)).toBe(true); // "b" is unaffected
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm vitest run lib/server/__tests__/rate-limiter.test.ts
```

Expected: FAIL - `Cannot find module '@/lib/server/rate-limiter'`

- [ ] **Step 3: Implement `lib/server/rate-limiter.ts`**

```typescript
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm vitest run lib/server/__tests__/rate-limiter.test.ts
```

Expected: all 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/server/rate-limiter.ts lib/server/__tests__/rate-limiter.test.ts
git commit -m "feat: add in-memory rate limiter"
```

---

## Task 5: `lib/server/oauth-user.ts`

**Files:**
- Create: `lib/server/oauth-user.ts`

No unit tests for this file - it is a thin DB orchestration layer. Integration would require a real DB. The logic is verified through type-checking.

- [ ] **Step 1: Create `lib/server/oauth-user.ts`**

```typescript
import "server-only";
import { prisma } from "@/lib/prisma";

interface OAuthProfile {
  email: string;
  name: string | null | undefined;
  image: string | null | undefined;
}

interface OAuthAccount {
  provider: string;
  providerAccountId: string;
}

interface DbUser {
  id: string;
  role: "user" | "admin";
  avatar: string;
}

export async function findOrCreateOAuthUser(
  profile: OAuthProfile,
  account: OAuthAccount
): Promise<DbUser> {
  // 1. Returning user via same OAuth provider
  const existingAccount = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: account.provider,
        providerAccountId: account.providerAccountId,
      },
    },
    include: { user: true },
  });

  if (existingAccount) {
    return {
      id: existingAccount.user.id,
      role: existingAccount.user.role as "user" | "admin",
      avatar: existingAccount.user.avatar,
    };
  }

  // 2. Existing user by email (account linking)
  const existingUser = await prisma.user.findUnique({
    where: { email: profile.email },
  });

  if (existingUser) {
    await prisma.account.create({
      data: {
        userId: existingUser.id,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
      },
    });
    return {
      id: existingUser.id,
      role: existingUser.role as "user" | "admin",
      avatar: existingUser.avatar,
    };
  }

  // 3. Brand-new user via OAuth
  const name = profile.name ?? profile.email.split("@")[0];
  const initials = name
    .split(" ")
    .map((p: string) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const newUser = await prisma.user.create({
    data: {
      email: profile.email,
      name,
      initials,
      avatar: profile.image ?? "",
      emailVerified: true, // OAuth providers pre-verify emails
      accounts: {
        create: {
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        },
      },
    },
  });

  return { id: newUser.id, role: "user", avatar: newUser.avatar };
}
```

- [ ] **Step 2: Type-check**

```bash
pnpm exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/server/oauth-user.ts
git commit -m "feat: add oauth-user helper (find-or-create with account linking)"
```

---

## Task 6: Extend `authorizeCredentials` - emailVerified gate + rememberMe (TDD)

**Files:**
- Modify: `lib/auth-credentials.ts`
- Modify: `lib/__tests__/auth-credentials.test.ts`

- [ ] **Step 1: Add new failing tests to `lib/__tests__/auth-credentials.test.ts`**

Add these test cases inside the existing `describe("authorizeCredentials", ...)` block (after the last `it(...)` call):

```typescript
it("returns null when emailVerified is false and REQUIRE_EMAIL_VERIFICATION is true", async () => {
  const original = process.env.REQUIRE_EMAIL_VERIFICATION;
  process.env.REQUIRE_EMAIL_VERIFICATION = "true";

  mockFindUnique.mockResolvedValueOnce({
    id: "u1",
    email: "a@b.de",
    name: "A",
    avatar: "",
    passwordHash: "hashed",
    role: "user",
    emailVerified: false,
  });
  mockCompare.mockResolvedValueOnce(true);

  const result = await authorizeCredentials({ email: "a@b.de", password: "secret1234" });
  expect(result).toBeNull();

  process.env.REQUIRE_EMAIL_VERIFICATION = original;
});

it("returns user when emailVerified is false but REQUIRE_EMAIL_VERIFICATION is false", async () => {
  const original = process.env.REQUIRE_EMAIL_VERIFICATION;
  process.env.REQUIRE_EMAIL_VERIFICATION = "false";

  mockFindUnique.mockResolvedValueOnce({
    id: "u1",
    email: "a@b.de",
    name: "A",
    avatar: "",
    passwordHash: "hashed",
    role: "user",
    emailVerified: false,
  });
  mockCompare.mockResolvedValueOnce(true);

  const result = await authorizeCredentials({ email: "a@b.de", password: "secret1234" });
  expect(result).not.toBeNull();

  process.env.REQUIRE_EMAIL_VERIFICATION = original;
});

it("passes rememberMe=true through to the returned user object", async () => {
  mockFindUnique.mockResolvedValueOnce({
    id: "u1",
    email: "a@b.de",
    name: "A",
    avatar: "",
    passwordHash: "hashed",
    role: "user",
    emailVerified: true,
  });
  mockCompare.mockResolvedValueOnce(true);

  const result = await authorizeCredentials({
    email: "a@b.de",
    password: "secret1234",
    rememberMe: "true",
  });
  expect((result as { rememberMe?: boolean } | null)?.rememberMe).toBe(true);
});
```

- [ ] **Step 2: Run tests to see new ones fail**

```bash
pnpm vitest run lib/__tests__/auth-credentials.test.ts
```

Expected: 3 new tests FAIL, existing tests still PASS.

- [ ] **Step 3: Update `lib/auth-credentials.ts`**

Replace the entire file content:

```typescript
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function authorizeCredentials(
  credentials: Partial<Record<"email" | "password" | "rememberMe", unknown>> | undefined
): Promise<{
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: "user" | "admin";
  rememberMe: boolean;
} | null> {
  const email = credentials?.email as string | undefined;
  const password = credentials?.password as string | undefined;
  const rememberMe = credentials?.rememberMe === "true";

  if (!email || !password) return null;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  if (
    process.env.REQUIRE_EMAIL_VERIFICATION === "true" &&
    !user.emailVerified
  ) {
    return null;
  }

  const role: "user" | "admin" = user.role === "admin" ? "admin" : "user";

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.avatar,
    role,
    rememberMe,
  };
}
```

- [ ] **Step 4: Run all auth-credentials tests**

```bash
pnpm vitest run lib/__tests__/auth-credentials.test.ts
```

Expected: all 9 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/auth-credentials.ts lib/__tests__/auth-credentials.test.ts
git commit -m "feat: add emailVerified gate and rememberMe passthrough to authorizeCredentials"
```

---

## Task 7: Extend `authJwtCallback` - rememberMe → token.exp (TDD)

**Files:**
- Modify: `lib/auth-callbacks.ts`
- Modify: `lib/__tests__/auth-callbacks.test.ts`

- [ ] **Step 1: Add new failing tests to `lib/__tests__/auth-callbacks.test.ts`**

Add these inside the existing `describe("authJwtCallback", ...)` block:

```typescript
it("sets token.exp to 24h when rememberMe is false", () => {
  const now = Math.floor(Date.now() / 1000);
  const token = {} as JWT;
  const out = authJwtCallback({
    token,
    user: { id: "u1", role: "user", rememberMe: false } as Parameters<typeof authJwtCallback>[0]["user"],
  });
  expect(out.exp).toBeGreaterThanOrEqual(now + 24 * 60 * 60 - 5);
  expect(out.exp).toBeLessThanOrEqual(now + 24 * 60 * 60 + 5);
});

it("sets token.exp to 30 days when rememberMe is true", () => {
  const now = Math.floor(Date.now() / 1000);
  const token = {} as JWT;
  const out = authJwtCallback({
    token,
    user: { id: "u1", role: "user", rememberMe: true } as Parameters<typeof authJwtCallback>[0]["user"],
  });
  expect(out.exp).toBeGreaterThanOrEqual(now + 30 * 24 * 60 * 60 - 5);
  expect(out.exp).toBeLessThanOrEqual(now + 30 * 24 * 60 * 60 + 5);
});
```

- [ ] **Step 2: Run tests to see new ones fail**

```bash
pnpm vitest run lib/__tests__/auth-callbacks.test.ts
```

Expected: 2 new tests FAIL, existing pass.

- [ ] **Step 3: Update `lib/auth-callbacks.ts`**

Replace the entire file content:

```typescript
import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";

export function authJwtCallback({
  token,
  user,
  trigger,
  session,
}: {
  token: JWT;
  user?: User | null;
  trigger?: "signIn" | "signUp" | "update";
  session?: unknown;
}): JWT {
  if (user) {
    token.id = user.id;
    const u = user as { role?: string; image?: string | null; rememberMe?: boolean };
    if (typeof u.role === "string") {
      token.role = u.role;
    }
    if (typeof u.image === "string") {
      token.picture = u.image;
    }
    const rememberMe = u.rememberMe ?? false;
    token.exp = rememberMe
      ? Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
      : Math.floor(Date.now() / 1000) + 24 * 60 * 60;
  }
  if (trigger === "update" && session && typeof session === "object") {
    const s = session as { user?: { image?: string | null } };
    if (s.user && "image" in s.user) {
      const img = s.user.image;
      if (typeof img === "string") {
        token.picture = img;
      }
    }
  }
  return token;
}

export function authSessionCallback({
  session,
  token,
}: {
  session: Session;
  token: JWT;
}): Session {
  if (token.id) {
    session.user.id = token.id as string;
  }
  if (typeof token.picture === "string") {
    session.user.image = token.picture;
  }
  session.user.role =
    typeof token.role === "string" && (token.role === "admin" || token.role === "user")
      ? token.role
      : "user";
  return session;
}
```

- [ ] **Step 4: Run all auth-callbacks tests**

```bash
pnpm vitest run lib/__tests__/auth-callbacks.test.ts
```

Expected: all 8 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/auth-callbacks.ts lib/__tests__/auth-callbacks.test.ts
git commit -m "feat: add rememberMe → token.exp logic to authJwtCallback"
```

---

## Task 8: Extend `auth.ts` - OAuth providers + JWT callback wiring

**Files:**
- Modify: `auth.ts`

No new unit tests - this wires together already-tested functions. Type-check verifies correctness.

- [ ] **Step 1: Replace `auth.ts` with the extended version**

```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { authJwtCallback, authSessionCallback } from "@/lib/auth-callbacks";
import { authorizeCredentials } from "@/lib/auth-credentials";
import { findOrCreateOAuthUser } from "@/lib/server/oauth-user";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days max; per-user exp is set in jwt callback
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-Mail", type: "email" },
        password: { label: "Passwort", type: "password" },
        rememberMe: { label: "Angemeldet bleiben", type: "text" },
      },
      authorize: authorizeCredentials,
    }),
    ...(process.env.GITHUB_CLIENT_ID
      ? [
          GitHub({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
          }),
        ]
      : []),
    ...(process.env.GOOGLE_CLIENT_ID
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt: async ({ token, user, account, trigger, session }) => {
      // OAuth sign-in: find/create DB user and set DB-based token fields
      if (account?.type === "oauth" && user?.email) {
        const dbUser = await findOrCreateOAuthUser(
          { email: user.email, name: user.name, image: user.image },
          { provider: account.provider, providerAccountId: account.providerAccountId }
        );
        token.id = dbUser.id;
        token.role = dbUser.role;
        token.picture = dbUser.avatar;
        // OAuth sessions always use the full 30-day window
        token.exp = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
        return token;
      }
      // Credentials + session update
      return authJwtCallback({ token, user, trigger, session });
    },
    session: authSessionCallback,
  },
});
```

- [ ] **Step 2: Type-check**

```bash
pnpm exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add auth.ts
git commit -m "feat: add OAuth providers (GitHub/Google) and JWT wiring to auth.ts"
```

---

## Task 9: Extend register route + new API routes (TDD)

**Files:**
- Modify: `app/api/auth/register/route.ts`
- Create: `app/api/auth/verify-email/route.ts`
- Create: `app/api/auth/forgot-password/route.ts`
- Create: `app/api/auth/reset-password/route.ts`

There are no pre-existing route unit tests for these. We add integration-style tests (Prisma mocked).

- [ ] **Step 1: Create `app/api/auth/__tests__/register.test.ts`**

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindUnique = vi.fn();
const mockCreate = vi.fn();
const mockSendVerificationEmail = vi.fn();
const mockCreateEmailVerificationToken = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...a: unknown[]) => mockFindUnique(...a),
      create: (...a: unknown[]) => mockCreate(...a),
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: { hash: vi.fn().mockResolvedValue("hashed") },
}));

vi.mock("@/lib/server/auth-service", () => ({
  createEmailVerificationToken: (...a: unknown[]) =>
    mockCreateEmailVerificationToken(...a),
}));

vi.mock("@/lib/server/email-service", () => ({
  sendVerificationEmail: (...a: unknown[]) => mockSendVerificationEmail(...a),
}));

import { POST } from "@/app/api/auth/register/route";
import { NextRequest } from "next/server";

function makeRequest(body: object) {
  return new NextRequest("http://localhost/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => vi.clearAllMocks());

describe("POST /api/auth/register", () => {
  it("returns 400 when fields are missing", async () => {
    const res = await POST(makeRequest({ email: "a@b.de" }));
    expect(res.status).toBe(400);
  });

  it("returns 409 when email already exists", async () => {
    mockFindUnique.mockResolvedValueOnce({ id: "existing" });
    const res = await POST(makeRequest({ email: "a@b.de", password: "secret1234", name: "A" }));
    expect(res.status).toBe(409);
  });

  it("creates user and sends verification email on success", async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    mockCreate.mockResolvedValueOnce({ id: "new-user" });
    mockCreateEmailVerificationToken.mockResolvedValueOnce("tok123");
    mockSendVerificationEmail.mockResolvedValueOnce(undefined);

    const res = await POST(
      makeRequest({ email: "new@b.de", password: "secret1234", name: "New User" })
    );
    expect(res.status).toBe(201);
    expect(mockCreateEmailVerificationToken).toHaveBeenCalledWith("new-user");
    expect(mockSendVerificationEmail).toHaveBeenCalledWith("new@b.de", "tok123");
  });
});
```

- [ ] **Step 2: Run test to see it fail**

```bash
pnpm vitest run app/api/auth/__tests__/register.test.ts
```

Expected: FAIL (route doesn't call email service yet).

- [ ] **Step 3: Update `app/api/auth/register/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createEmailVerificationToken } from "@/lib/server/auth-service";
import { sendVerificationEmail } from "@/lib/server/email-service";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password, name } = body as {
    email?: string;
    password?: string;
    name?: string;
  };

  if (!email || !password || !name) {
    return NextResponse.json(
      { error: "E-Mail, Passwort und Name sind erforderlich." },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Passwort muss mindestens 8 Zeichen lang sein." },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Diese E-Mail-Adresse wird bereits verwendet." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const initials = name
    .split(" ")
    .map((part: string) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const user = await prisma.user.create({
    data: { email, passwordHash, name, initials, avatar: "" },
  });

  try {
    const token = await createEmailVerificationToken(user.id);
    await sendVerificationEmail(email, token);
  } catch {
    // Non-fatal: user is created, email sending is best-effort
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
```

- [ ] **Step 4: Run register test to verify it passes**

```bash
pnpm vitest run app/api/auth/__tests__/register.test.ts
```

Expected: all 3 tests PASS.

- [ ] **Step 5: Create `app/api/auth/__tests__/verify-email.test.ts`**

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockVerifyEmailToken = vi.fn();

vi.mock("@/lib/server/auth-service", () => ({
  verifyEmailToken: (...a: unknown[]) => mockVerifyEmailToken(...a),
}));

import { GET } from "@/app/api/auth/verify-email/route";
import { NextRequest } from "next/server";

beforeEach(() => vi.clearAllMocks());

describe("GET /api/auth/verify-email", () => {
  it("returns 400 when token is missing", async () => {
    const req = new NextRequest("http://localhost/api/auth/verify-email");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when token is invalid", async () => {
    mockVerifyEmailToken.mockResolvedValueOnce({ error: "Token ungültig." });
    const req = new NextRequest("http://localhost/api/auth/verify-email?token=bad");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 200 when token is valid", async () => {
    mockVerifyEmailToken.mockResolvedValueOnce({ success: true });
    const req = new NextRequest("http://localhost/api/auth/verify-email?token=good");
    const res = await GET(req);
    expect(res.status).toBe(200);
  });
});
```

- [ ] **Step 6: Create `app/api/auth/verify-email/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyEmailToken } from "@/lib/server/auth-service";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token fehlt." }, { status: 400 });
  }

  const result = await verifyEmailToken(token);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 7: Run verify-email test**

```bash
pnpm vitest run app/api/auth/__tests__/verify-email.test.ts
```

Expected: all 3 tests PASS.

- [ ] **Step 8: Create `app/api/auth/__tests__/forgot-password.test.ts`**

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindUnique = vi.fn();
const mockCreatePasswordResetToken = vi.fn();
const mockSendPasswordResetEmail = vi.fn();
const mockCheckRateLimit = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: (...a: unknown[]) => mockFindUnique(...a) } },
}));
vi.mock("@/lib/server/auth-service", () => ({
  createPasswordResetToken: (...a: unknown[]) => mockCreatePasswordResetToken(...a),
}));
vi.mock("@/lib/server/email-service", () => ({
  sendPasswordResetEmail: (...a: unknown[]) => mockSendPasswordResetEmail(...a),
}));
vi.mock("@/lib/server/rate-limiter", () => ({
  checkRateLimit: (...a: unknown[]) => mockCheckRateLimit(...a),
}));

import { POST } from "@/app/api/auth/forgot-password/route";
import { NextRequest } from "next/server";

function makeRequest(body: object) {
  return new NextRequest("http://localhost/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => vi.clearAllMocks());

describe("POST /api/auth/forgot-password", () => {
  it("returns 400 for missing email", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it("returns 429 when rate limit exceeded", async () => {
    mockCheckRateLimit.mockReturnValueOnce(false);
    const res = await POST(makeRequest({ email: "a@b.de" }));
    expect(res.status).toBe(429);
  });

  it("returns 200 even when user is not found (no enumeration)", async () => {
    mockCheckRateLimit.mockReturnValueOnce(true);
    mockFindUnique.mockResolvedValueOnce(null);
    const res = await POST(makeRequest({ email: "nobody@b.de" }));
    expect(res.status).toBe(200);
    expect(mockCreatePasswordResetToken).not.toHaveBeenCalled();
  });

  it("sends reset email when user exists", async () => {
    mockCheckRateLimit.mockReturnValueOnce(true);
    mockFindUnique.mockResolvedValueOnce({ id: "u1", email: "a@b.de" });
    mockCreatePasswordResetToken.mockResolvedValueOnce("resettoken");
    mockSendPasswordResetEmail.mockResolvedValueOnce(undefined);

    const res = await POST(makeRequest({ email: "a@b.de" }));
    expect(res.status).toBe(200);
    expect(mockSendPasswordResetEmail).toHaveBeenCalledWith("a@b.de", "resettoken");
  });
});
```

- [ ] **Step 9: Create `app/api/auth/forgot-password/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createPasswordResetToken } from "@/lib/server/auth-service";
import { sendPasswordResetEmail } from "@/lib/server/email-service";
import { checkRateLimit } from "@/lib/server/rate-limiter";

const schema = z.object({ email: z.string().email() });

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige E-Mail." }, { status: 400 });
  }
  const { email } = parsed.data;

  if (!checkRateLimit(`forgot:${email}`, 3, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte warte 15 Minuten." },
      { status: 429 }
    );
  }

  // Always return 200 to prevent user enumeration
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    try {
      const token = await createPasswordResetToken(user.id);
      await sendPasswordResetEmail(email, token);
    } catch {
      // Best-effort
    }
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 10: Run forgot-password test**

```bash
pnpm vitest run app/api/auth/__tests__/forgot-password.test.ts
```

Expected: all 4 tests PASS.

- [ ] **Step 11: Create `app/api/auth/__tests__/reset-password.test.ts`**

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockValidatePasswordResetToken = vi.fn();
const mockMarkPasswordResetTokenUsed = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/lib/server/auth-service", () => ({
  validatePasswordResetToken: (...a: unknown[]) => mockValidatePasswordResetToken(...a),
  markPasswordResetTokenUsed: (...a: unknown[]) => mockMarkPasswordResetTokenUsed(...a),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: { user: { update: (...a: unknown[]) => mockUpdate(...a) } },
}));
vi.mock("bcryptjs", () => ({
  default: { hash: vi.fn().mockResolvedValue("newhash") },
}));

import { POST } from "@/app/api/auth/reset-password/route";
import { NextRequest } from "next/server";

function makeRequest(body: object) {
  return new NextRequest("http://localhost/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => vi.clearAllMocks());

describe("POST /api/auth/reset-password", () => {
  it("returns 400 for missing fields", async () => {
    const res = await POST(makeRequest({ token: "t" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for password shorter than 8 chars", async () => {
    const res = await POST(makeRequest({ token: "t", password: "short" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when token is invalid", async () => {
    mockValidatePasswordResetToken.mockResolvedValueOnce({ error: "Token ungültig." });
    const res = await POST(makeRequest({ token: "bad", password: "newpassword1" }));
    expect(res.status).toBe(400);
  });

  it("updates password hash and marks token used on success", async () => {
    mockValidatePasswordResetToken.mockResolvedValueOnce({ userId: "u1" });
    mockMarkPasswordResetTokenUsed.mockResolvedValueOnce(undefined);
    mockUpdate.mockResolvedValueOnce({});

    const res = await POST(makeRequest({ token: "good", password: "newpassword1" }));
    expect(res.status).toBe(200);
    expect(mockMarkPasswordResetTokenUsed).toHaveBeenCalledWith("good");
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { passwordHash: "newhash" },
    });
  });
});
```

- [ ] **Step 12: Create `app/api/auth/reset-password/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  validatePasswordResetToken,
  markPasswordResetTokenUsed,
} from "@/lib/server/auth-service";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Token und Passwort (min. 8 Zeichen) erforderlich." },
      { status: 400 }
    );
  }
  const { token, password } = parsed.data;

  const result = await validatePasswordResetToken(token);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await markPasswordResetTokenUsed(token);
  await prisma.user.update({
    where: { id: result.userId },
    data: { passwordHash },
  });

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 13: Run reset-password test**

```bash
pnpm vitest run app/api/auth/__tests__/reset-password.test.ts
```

Expected: all 4 tests PASS.

- [ ] **Step 14: Run full test suite to verify nothing broke**

```bash
pnpm test
```

Expected: all tests PASS.

- [ ] **Step 15: Commit**

```bash
git add app/api/auth/
git commit -m "feat: add verify-email, forgot-password, reset-password API routes"
```

---

## Task 10: UI - `components/auth/oauth-buttons.tsx`

**Files:**
- Create: `components/auth/oauth-buttons.tsx`

No unit tests - pure presentational component. Verified by `tsc`.

- [ ] **Step 1: Create `components/auth/oauth-buttons.tsx`**

```tsx
"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface OAuthButtonsProps {
  githubEnabled: boolean;
  googleEnabled: boolean;
}

export function OAuthButtons({ githubEnabled, googleEnabled }: OAuthButtonsProps) {
  if (!githubEnabled && !googleEnabled) return null;

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Oder weitermachen mit</span>
        </div>
      </div>
      <div className="grid gap-2">
        {githubEnabled && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => signIn("github", { callbackUrl: "/" })}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </Button>
        )}
        {googleEnabled && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </Button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
pnpm exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/auth/oauth-buttons.tsx
git commit -m "feat: add OAuthButtons component (GitHub + Google)"
```

---

## Task 11: UI - Extend `LoginForm` + `RegisterForm`

**Files:**
- Modify: `components/login-form.tsx`
- Modify: `components/register-form.tsx`

- [ ] **Step 1: Update `components/login-form.tsx`**

Replace the entire file:

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowRight, Lock, Mail } from "@nsmr/pixelart-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

interface LoginFormProps {
  githubEnabled?: boolean;
  googleEnabled?: boolean;
}

export function LoginForm({ githubEnabled = false, googleEnabled = false }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      rememberMe: rememberMe ? "true" : "false",
      redirect: false,
    });

    if (result?.error) {
      toast.error("Anmeldung fehlgeschlagen", {
        description: "E-Mail oder Passwort ist falsch.",
      });
      setIsLoading(false);
      return;
    }

    toast.success("Willkommen zurück!", {
      description: "Du hast dich erfolgreich eingeloggt.",
    });

    const callbackUrl = searchParams.get("callbackUrl") ?? "/";
    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-Mail Adresse</Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="deine@email.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background pl-9"
            />
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Passwort</Label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Passwort vergessen?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background pl-9"
            />
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember-me"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)}
          />
          <Label
            htmlFor="remember-me"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            Angemeldet bleiben (30 Tage)
          </Label>
        </div>

        <Button
          type="submit"
          className="pixel-btn w-full gap-2 mt-6 cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? "WIRD ANGEMELDET..." : "LOGIN"}
          {!isLoading && <ArrowRight className="h-4 w-4" />}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Noch kein Konto?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Registrieren
          </Link>
        </p>
      </form>

      <OAuthButtons githubEnabled={githubEnabled} googleEnabled={googleEnabled} />
    </div>
  );
}
```

- [ ] **Step 2: Update `app/login/page.tsx`** to pass OAuth props to `LoginForm`

Replace the `<LoginForm />` usage (the `LoginPageContent` function):

```tsx
"use client";

import { LoginForm } from "@/components/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EncryptedText } from "@/components/ui/encrypted-text";
import { Suspense } from "react";

const githubEnabled = Boolean(process.env.NEXT_PUBLIC_GITHUB_ENABLED === "true");
const googleEnabled = Boolean(process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "true");

function LoginPageContent() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] h-150 w-150 bg-primary/15 blur-[120px] rounded-full opacity-50 mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-5%] h-125 w-125 bg-chart-5/15 blur-[100px] rounded-full opacity-50 mix-blend-screen" />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <h1 className="text-2xl font-pixel mb-2 tracking-tighter">
            <span className="text-xl font-pixel tracking-tighter text-primary">
              {">_"}
            </span>{" "}
            DAILY DEV
          </h1>
          <EncryptedText
            text="Logge dich ein um fortzufahren"
            className="text-lg text-muted-foreground uppercase tracking-wide"
          />
        </div>

        <Card className="pixel-box bg-card">
          <CardHeader>
            <CardTitle className="text-xl font-sans uppercase tracking-wide">
              Willkommen zurück
            </CardTitle>
            <CardDescription>Gib deine Zugangsdaten ein.</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm
              githubEnabled={githubEnabled}
              googleEnabled={googleEnabled}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          Laden...
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
```

Also add the public env vars to `.env.local` (or `.env`):

```env
NEXT_PUBLIC_GITHUB_ENABLED=false
NEXT_PUBLIC_GOOGLE_ENABLED=false
```

Set to `true` when `GITHUB_CLIENT_ID` / `GOOGLE_CLIENT_ID` are configured.

- [ ] **Step 3: Update `components/register-form.tsx`** - stop auto-logging in when email verification is required

In `handleSubmit`, replace the `signIn` call block (after `if (!res.ok) { ... }`) with:

```tsx
// After successful registration, don't auto-login - wait for email verification
toast.success("Konto erstellt!", {
  description:
    "Bitte bestätige deine E-Mail-Adresse. Wir haben dir eine Verifizierungs-E-Mail gesendet.",
});
router.push("/login?pending=1");
```

The full updated `handleSubmit` (replace from `if (!res.ok)` to end of try):

```tsx
if (!res.ok) {
  setFormError(message);
  toast.error("Registrierung fehlgeschlagen", { description: message });
  return;
}

toast.success("Konto erstellt!", {
  description:
    "Bitte bestätige deine E-Mail-Adresse. Wir haben dir eine Verifizierungs-E-Mail gesendet.",
});
router.push("/login?pending=1");
```

- [ ] **Step 4: Type-check**

```bash
pnpm exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/login-form.tsx components/register-form.tsx app/login/page.tsx
git commit -m "feat: add Remember Me, OAuth buttons, and verification notice to auth forms"
```

---

## Task 12: Auth Pages - verify-email, forgot-password, reset-password

**Files:**
- Create: `app/auth/verify-email/page.tsx`
- Create: `app/auth/forgot-password/page.tsx`
- Create: `app/auth/reset-password/page.tsx`

- [ ] **Step 1: Create `app/auth/verify-email/page.tsx`**

This is a Server Component - it calls `verifyEmailToken` directly and redirects.

```tsx
import { verifyEmailToken } from "@/lib/server/auth-service";
import { redirect } from "next/navigation";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    redirect("/login?error=missing-token");
  }

  const result = await verifyEmailToken(token);

  if ("error" in result) {
    redirect("/login?error=verification-failed");
  }

  redirect("/login?verified=1");
}
```

- [ ] **Step 2: Create `app/auth/forgot-password/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, ArrowRight } from "@nsmr/pixelart-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.status === 429) {
        toast.error("Zu viele Anfragen", {
          description: "Bitte warte 15 Minuten und versuche es erneut.",
        });
        return;
      }
      setSent(true);
    } catch {
      toast.error("Fehler", { description: "Netzwerkfehler. Bitte versuche es erneut." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] h-150 w-150 bg-primary/15 blur-[120px] rounded-full opacity-50 mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-5%] h-125 w-125 bg-chart-5/15 blur-[100px] rounded-full opacity-50 mix-blend-screen" />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <h1 className="text-2xl font-pixel mb-2 tracking-tighter">
            <span className="text-xl font-pixel tracking-tighter text-primary">{">_"}</span>{" "}
            DAILY DEV
          </h1>
        </div>

        <Card className="pixel-box bg-card">
          <CardHeader>
            <CardTitle className="text-xl font-sans uppercase tracking-wide">
              Passwort vergessen
            </CardTitle>
            <CardDescription>
              {sent
                ? "Falls ein Konto existiert, haben wir dir einen Reset-Link gesendet."
                : "Gib deine E-Mail ein. Wir senden dir einen Reset-Link."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Prüfe deinen Posteingang (und Spam-Ordner).
                </p>
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Zurück zum Login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail Adresse</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="deine@email.de"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-background pl-9"
                    />
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="pixel-btn w-full gap-2 mt-2 cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? "WIRD GESENDET..." : "RESET-LINK SENDEN"}
                  {!isLoading && <ArrowRight className="h-4 w-4" />}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  <Link href="/login" className="text-primary hover:underline">
                    Zurück zum Login
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `app/auth/reset-password/page.tsx`**

```tsx
"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, ArrowRight } from "@nsmr/pixelart-react";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!token) {
    return (
      <p className="text-sm text-destructive">
        Ungültiger Link. Bitte fordere einen neuen Reset-Link an.
      </p>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwörter stimmen nicht überein.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error("Fehler", {
          description: data.error ?? "Reset fehlgeschlagen.",
        });
        return;
      }
      toast.success("Passwort geändert!", {
        description: "Du kannst dich jetzt mit deinem neuen Passwort einloggen.",
      });
      router.push("/login");
    } catch {
      toast.error("Netzwerkfehler");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Neues Passwort</Label>
        <div className="relative">
          <Input
            id="password"
            type="password"
            placeholder="Mindestens 8 Zeichen"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
            className="bg-background pl-9"
          />
          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm">Passwort bestätigen</Label>
        <div className="relative">
          <Input
            id="confirm"
            type="password"
            placeholder="Passwort wiederholen"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="bg-background pl-9"
          />
          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <Button
        type="submit"
        className="pixel-btn w-full gap-2 mt-2 cursor-pointer"
        disabled={isLoading}
      >
        {isLoading ? "WIRD GESPEICHERT..." : "PASSWORT ÄNDERN"}
        {!isLoading && <ArrowRight className="h-4 w-4" />}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline">
          Zurück zum Login
        </Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] h-150 w-150 bg-primary/15 blur-[120px] rounded-full opacity-50 mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-5%] h-125 w-125 bg-chart-5/15 blur-[100px] rounded-full opacity-50 mix-blend-screen" />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <h1 className="text-2xl font-pixel mb-2 tracking-tighter">
            <span className="text-xl font-pixel tracking-tighter text-primary">{">_"}</span>{" "}
            DAILY DEV
          </h1>
        </div>

        <Card className="pixel-box bg-card">
          <CardHeader>
            <CardTitle className="text-xl font-sans uppercase tracking-wide">
              Neues Passwort
            </CardTitle>
            <CardDescription>Gib dein neues Passwort ein.</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<p className="text-sm text-muted-foreground">Laden...</p>}>
              <ResetPasswordForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Type-check**

```bash
pnpm exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Run full test suite**

```bash
pnpm test
```

Expected: all tests PASS.

- [ ] **Step 6: Lint check**

```bash
pnpm lint
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add app/auth/
git commit -m "feat: add verify-email, forgot-password, reset-password pages"
```

---

## Task 13: Final wiring - `.env.local` + middleware guard for `/auth/*`

**Files:**
- No code changes needed - `/auth/*` paths are not in `middleware.ts` protected list, so they're public by default.
- Add env vars documentation to `.env.local`.

- [ ] **Step 1: Verify `/auth/*` routes are unprotected**

Open `middleware.ts` and confirm that `/auth` is NOT listed in `PROTECTED_PATHS` or `ADMIN_PREFIX`. Expected: correct - auth pages are already public.

- [ ] **Step 2: Add env vars to `.env.local`**

```env
# Email
RESEND_API_KEY=re_your_key_here
APP_URL=http://localhost:3000
EMAIL_FROM=noreply@yourdomain.com

# OAuth (leave empty or omit to disable)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Feature flags
REQUIRE_EMAIL_VERIFICATION=false
NEXT_PUBLIC_GITHUB_ENABLED=false
NEXT_PUBLIC_GOOGLE_ENABLED=false
```

- [ ] **Step 3: Final full test suite + type-check + lint**

```bash
pnpm test && pnpm exec tsc --noEmit && pnpm lint
```

Expected: all pass, zero errors.

- [ ] **Step 4: Final commit**

```bash
git add .env.local
git commit -m "chore: add auth env vars to .env.local"
```

---

## Self-Review Checklist

- [x] OAuth plug-in-ready via env vars → Task 8
- [x] OAuth account linking → Task 5 (oauth-user.ts)
- [x] Email verification token → Task 2 (auth-service) + Task 9 (register route)
- [x] REQUIRE_EMAIL_VERIFICATION gate → Task 6 (authorizeCredentials)
- [x] Password reset flow (token, email, endpoint) → Task 2 + Task 9
- [x] Rate limiting on forgot-password + register → Task 4 + Task 9
- [x] Remember Me (JWT maxAge via token.exp) → Task 7
- [x] Resend email service → Task 3
- [x] All new API routes tested → Task 9
- [x] No user enumeration on forgot-password → Task 9 (always 200)
- [x] Single-use reset tokens → auth-service `used: true`
- [x] UI pages: verify-email, forgot-password, reset-password → Task 12
- [x] LoginForm updated (Remember Me, OAuth, fixed link) → Task 11
- [x] RegisterForm updated (no auto-login) → Task 11
