-- Ruby as a sixth value of CodeLanguage.
--
-- Only the value is added. Postgres allows ALTER TYPE … ADD VALUE inside the transaction Prisma
-- wraps every migration in, but the new value must not be *used* there — so the default of
-- Challenge.supportedLanguages stays untouched and the seed writes Ruby per challenge.
ALTER TYPE "CodeLanguage" ADD VALUE IF NOT EXISTS 'ruby';
