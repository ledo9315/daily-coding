-- Rust as a tenth value of CodeLanguage, completing the set from #128.
--
-- Value only, as with the others — Postgres forbids using a freshly added enum value in the same
-- transaction, and Prisma wraps every migration in one.
ALTER TYPE "CodeLanguage" ADD VALUE IF NOT EXISTS 'rust';
