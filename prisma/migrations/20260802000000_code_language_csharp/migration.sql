-- C# as a ninth value of CodeLanguage.
--
-- Spelled `csharp`, which is also what Piston's Mono runtime and Monaco call it. The .NET
-- runtime Piston also offers (`csharp.net`) is deliberately not used: it scaffolds a project on
-- every execution, which costs ten seconds and prints its own progress onto stdout.
--
-- Value only, as with the others — Postgres forbids using a freshly added enum value in the same
-- transaction, and Prisma wraps every migration in one.
ALTER TYPE "CodeLanguage" ADD VALUE IF NOT EXISTS 'csharp';
