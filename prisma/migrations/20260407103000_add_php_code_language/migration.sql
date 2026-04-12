-- AlterEnum
-- This migration is not transactional
ALTER TYPE "CodeLanguage" ADD VALUE 'php';

-- Default für neue Challenges: alle vier Sprachen
ALTER TABLE "Challenge" ALTER COLUMN "supportedLanguages" SET DEFAULT ARRAY['javascript', 'typescript', 'python', 'php']::"CodeLanguage"[];
