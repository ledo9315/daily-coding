# Auth System Design — daily-coding-challenge

**Date:** 2026-04-12  
**Status:** Approved  
**Approach:** Option B — JWT-Strategie beibehalten, Custom Service Layer

---

## Kontext

Die App nutzt bereits NextAuth v5 (beta) mit JWT-Strategie und einem Credentials-Provider (E-Mail/Passwort). bcryptjs (SALT 12) ist im Einsatz. Das bestehende System wird erweitert — keine Migration auf PrismaAdapter.

**Scope dieser Erweiterung:**
- OAuth Login (GitHub + Google, plug-in-ready via Env-Vars)
- E-Mail-Verifikation bei Registrierung (konfigurierbar via `REQUIRE_EMAIL_VERIFICATION`)
- Passwort-Reset Flow
- "Remember Me" (JWT maxAge: 24h ohne, 30 Tage mit)
- E-Mail-Versand via Resend API

---

## Datenbankschema

Drei neue Prisma-Modelle, eine Erweiterung des `User`-Models.

### Neue Modelle

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  provider          String          // "github" | "google"
  providerAccountId String          // ID beim OAuth-Provider
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model EmailVerificationToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime                // now + 24h
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model PasswordResetToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime                // now + 1h
  used      Boolean  @default(false)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### User-Model-Erweiterung

```prisma
emailVerified Boolean @default(false)
```

### Token-Sicherheit

Tokens werden als `crypto.randomBytes(32).toString('hex')` generiert (256 Bit Entropie, nicht rateable). Kein JWT für Verification/Reset-Tokens — direktes DB-Lookup ermöglicht sofortige Invalidierung.

---

## Service Layer

### `lib/server/auth-service.ts`

Zentrales Modul für alle Token-Operationen. API-Routes rufen ausschließlich diesen Service auf — nie direkt Prisma für Auth-Tokens.

```
createEmailVerificationToken(userId)  → token string
verifyEmailToken(token)               → { success } | { error }
createPasswordResetToken(userId)      → token string
validatePasswordResetToken(token)     → { userId } | { error }
markPasswordResetTokenUsed(token)     → void
```

### `lib/server/email-service.ts`

Resend-Wrapper. Links werden als `${APP_URL}/auth/...?token=...` konstruiert.

```
sendVerificationEmail(to, token)
sendPasswordResetEmail(to, token)
sendWelcomeEmail(to, name)   // optional
```

Env-Vars: `RESEND_API_KEY`, `APP_URL`, `EMAIL_FROM`.

### `lib/server/rate-limiter.ts`

In-Memory-Rate-Limiting (keine externe Dependency):
- `POST /api/auth/forgot-password` → 3 Requests / 15min pro E-Mail
- `POST /api/auth/register` → 5 Requests / 1h pro IP

### `auth.ts` — Erweiterungen

**OAuth Provider (plug-in-ready):**
```typescript
providers: [
  Credentials({ ... }),  // unverändert
  ...(process.env.GITHUB_CLIENT_ID ? [GitHub({ ... })] : []),
  ...(process.env.GOOGLE_CLIENT_ID ? [Google({ ... })] : []),
]
```

**JWT maxAge (Remember Me):**
- `rememberMe` wird als Custom-Credential beim Sign-in übergeben und im JWT-Callback in `token.rememberMe` gespeichert
- Im JWT-Callback bei `trigger === "signIn"`: wenn `rememberMe: false`, wird `token.exp` explizit auf `now + 24h` gesetzt; bei `rememberMe: true` bleibt das Standard-Cookie-Expiry (30 Tage, global in `session.maxAge` konfiguriert)
- NextAuth v5 respektiert das `exp`-Feld im JWT — kurzlebige Sessions werden dadurch serverseitig erzwungen, auch wenn der Cookie länger lebt

**OAuth Account Linking:**
Im `signIn`-Callback: wenn ein User mit gleicher E-Mail bereits existiert, wird der OAuth-Account in der `Account`-Tabelle verknüpft — kein Duplikat.

**Email-Verifikations-Gate:**
In `authorizeCredentials`: wenn `REQUIRE_EMAIL_VERIFICATION=true` und `user.emailVerified === false` → `null` (Login verweigert).

---

## API Routes

Alle Routes unter `app/api/auth/`. Input-Validierung via Zod.

| Route | Method | Zweck |
|---|---|---|
| `/api/auth/register` | POST | Erweitert: Token generieren + Verifikations-Mail senden |
| `/api/auth/verify-email` | GET | Token validieren, `emailVerified: true` setzen, Token löschen |
| `/api/auth/forgot-password` | POST | Reset-Token generieren + Mail senden |
| `/api/auth/reset-password` | POST | Token + neues Passwort validieren, Hash updaten |

### Sicherheits-Details

- `forgot-password` antwortet immer `200 OK` — unabhängig davon ob die E-Mail existiert (verhindert User Enumeration)
- `reset-password` setzt `used: true` sofort nach Nutzung (Single-Use)
- `verify-email` löscht den Token nach Erfolg
- Alle sensiblen Fehler (abgelaufener Token, bereits genutzter Token) geben generische `400`-Responses

---

## UI-Seiten & Komponenten

### Neue Seiten

| Route | Zweck |
|---|---|
| `/auth/verify-email` | Token aus URL, API-Call, Erfolg/Fehler anzeigen |
| `/auth/forgot-password` | E-Mail-Formular |
| `/auth/reset-password` | Token aus URL + neues Passwort |

### Erweiterungen bestehender Seiten

- `/login`: OAuth-Buttons (nur wenn Provider aktiv), "Remember Me" Checkbox, "Passwort vergessen?"-Link
- `/register`: Nach Registrierung → kein Auto-Login, Toast + Redirect auf `/login` mit Hinweis

### Neue Komponenten

- `components/auth/oauth-buttons.tsx` — GitHub + Google Buttons, rendern nur wenn Provider konfiguriert
- `components/auth/remember-me-checkbox.tsx` — Checkbox für persistente Session

### UI-Verhalten

- Nach Registrierung: Redirect `/login` + Sonner-Toast "Verifizierungs-E-Mail gesendet"
- Nach `verify-email`: Auto-Login wenn `REQUIRE_EMAIL_VERIFICATION=false`, sonst Redirect `/login` + Erfolgs-Toast
- Nach `reset-password`: Redirect `/login` + Erfolgs-Toast
- OAuth bei bekannter E-Mail: transparentes Account-Linking, User landet direkt in der App

**Bestehende Patterns:** shadcn/ui, react-hook-form + Zod, Sonner, Tailwind CSS v4.

---

## Testing-Strategie

Vitest, Node-Environment, colocated `__tests__/`.

### Neue Unit Tests

- `lib/server/__tests__/auth-service.test.ts` — Token-Generierung, Validierung, Expiry, Single-Use-Enforcement (Prisma gemockt)
- `lib/server/__tests__/email-service.test.ts` — Resend-Aufrufe gemockt, korrekte Template-Parameter
- `lib/server/__tests__/rate-limiter.test.ts` — Limit-Logik, Reset nach Zeitfenster

### Erweiterungen bestehender Tests

- `lib/__tests__/auth-credentials.test.ts` — unverifizierter User mit Flag `true`, OAuth-User ohne `passwordHash`
- `lib/__tests__/auth-callbacks.test.ts` — `rememberMe`-Flag im JWT, `maxAge`-Setzung

### API-Route-Tests (Prisma gemockt)

- `forgot-password`: User nicht gefunden → 200, Rate-Limit-Hit → 429
- `reset-password`: abgelaufener Token → 400, already-used Token → 400
- `verify-email`: gültiger Token → 200 + `emailVerified: true`

### Bewusst ausgeschlossen

- OAuth-Flow end-to-end (erfordert echte Provider-Credentials)
- E-Mail-Rendering (Resend-Templates visuell)

---

## Environment Variables

```env
# Bestehend
AUTH_SECRET=...

# Neu — E-Mail
RESEND_API_KEY=...
APP_URL=https://...
EMAIL_FROM=noreply@yourdomain.com

# Neu — OAuth (optional, Provider nur aktiv wenn gesetzt)
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Neu — Feature Flag
REQUIRE_EMAIL_VERIFICATION=true   # oder false
```

---

## Migrations-Strategie

1. Prisma-Migration für neue Modelle + `emailVerified`-Feld
2. Bestehende User: `emailVerified: false` als Default (non-breaking)
3. Kein Downtime — alle neuen Felder sind optional oder haben Defaults
