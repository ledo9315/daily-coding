-- The daily ranking is gone, and with it the measurement of solve time (#91).
-- Week and month rank by the number of challenges solved and never read a duration.

-- Rows using the enum value must go before the value itself can be dropped;
-- otherwise the cast below fails with "invalid input value for enum".
DELETE FROM "RankingEntry" WHERE "period" = 'today';

-- AlterEnum
BEGIN;
CREATE TYPE "RankingPeriod_new" AS ENUM ('week', 'month');
ALTER TABLE "RankingEntry" ALTER COLUMN "period" TYPE "RankingPeriod_new" USING ("period"::text::"RankingPeriod_new");
ALTER TYPE "RankingPeriod" RENAME TO "RankingPeriod_old";
ALTER TYPE "RankingPeriod_new" RENAME TO "RankingPeriod";
DROP TYPE "public"."RankingPeriod_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "ChallengeStart" DROP CONSTRAINT "ChallengeStart_challengeId_fkey";

-- DropForeignKey
ALTER TABLE "ChallengeStart" DROP CONSTRAINT "ChallengeStart_userId_fkey";

-- AlterTable
ALTER TABLE "RankingEntry" DROP COLUMN "timeTaken";

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "timeTaken";

-- DropTable
DROP TABLE "ChallengeStart";
