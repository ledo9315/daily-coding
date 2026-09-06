-- Swift as the eleventh value of CodeLanguage.
--
-- Value only, as with the others - Postgres forbids using a freshly added enum value in the same
-- transaction, and Prisma wraps every migration in one.
ALTER TYPE "CodeLanguage" ADD VALUE IF NOT EXISTS 'swift';
