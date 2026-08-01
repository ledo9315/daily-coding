-- Java as a fifth value of CodeLanguage.
--
-- Only the value is added here. Postgres allows ALTER TYPE … ADD VALUE inside a transaction —
-- which is what Prisma wraps every migration in — but the new value must not be *used* in that
-- same transaction. Challenge.supportedLanguages keeps its four-language default for exactly
-- that reason; per-challenge Java support is set from the seed, not from a default.
ALTER TYPE "CodeLanguage" ADD VALUE IF NOT EXISTS 'java';
