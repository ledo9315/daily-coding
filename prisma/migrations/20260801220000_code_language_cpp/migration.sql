-- C++ as an eighth value of CodeLanguage, spelled `cpp`.
--
-- Not `c++`: Prisma enum members are identifiers and a plus sign is not one. Piston calls the
-- runtime `c++` and Monaco calls it `cpp`; the language registry maps between all three.
--
-- Value only, as with the others — Postgres forbids using a freshly added enum value in the same
-- transaction, and Prisma wraps every migration in one.
ALTER TYPE "CodeLanguage" ADD VALUE IF NOT EXISTS 'cpp';
