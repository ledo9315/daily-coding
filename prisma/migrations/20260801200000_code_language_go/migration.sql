-- Go as a seventh value of CodeLanguage.
--
-- Value only. Postgres forbids *using* a freshly added enum value in the same transaction, and
-- Prisma wraps every migration in one — so the default of Challenge.supportedLanguages stays as
-- it is and the seed decides per challenge. Go is opt-in like Java: its harness needs typed
-- input, which two of the seeded challenges cannot express.
ALTER TYPE "CodeLanguage" ADD VALUE IF NOT EXISTS 'go';
