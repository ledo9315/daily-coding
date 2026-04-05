-- Delete team ranking entries first (has FK to Team)
DELETE FROM "RankingEntry" WHERE "teamId" IS NOT NULL;

-- Drop FK from RankingEntry to Team
ALTER TABLE "RankingEntry" DROP CONSTRAINT IF EXISTS "RankingEntry_teamId_fkey";

-- Drop FK from User to Team
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_teamId_fkey";

-- Drop teamId unique index on RankingEntry
DROP INDEX IF EXISTS "RankingEntry_teamId_period_periodDate_key";

-- Drop teamId columns
ALTER TABLE "RankingEntry" DROP COLUMN IF EXISTS "teamId";
ALTER TABLE "User" DROP COLUMN IF EXISTS "teamId";

-- Drop Team table
DROP TABLE IF EXISTS "Team";

-- Remove 'team' from RankingPeriod enum
-- PostgreSQL doesn't support removing enum values directly, so we recreate the type
ALTER TYPE "RankingPeriod" RENAME TO "RankingPeriod_old";
CREATE TYPE "RankingPeriod" AS ENUM ('today', 'week', 'month');
ALTER TABLE "RankingEntry" ALTER COLUMN "period" TYPE "RankingPeriod" USING "period"::text::"RankingPeriod";
DROP TYPE "RankingPeriod_old";
