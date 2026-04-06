-- CreateEnum
CREATE TYPE "AchievementRarity" AS ENUM ('common', 'rare', 'epic', 'legendary');

-- AlterEnum
BEGIN;
CREATE TYPE "RankingPeriod_new" AS ENUM ('today', 'week', 'month');
ALTER TABLE "RankingEntry" ALTER COLUMN "period" TYPE "RankingPeriod_new" USING ("period"::text::"RankingPeriod_new");
ALTER TYPE "RankingPeriod" RENAME TO "RankingPeriod_old";
ALTER TYPE "RankingPeriod_new" RENAME TO "RankingPeriod";
DROP TYPE "public"."RankingPeriod_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Achievement" DROP CONSTRAINT "Achievement_userId_fkey";

-- DropForeignKey
ALTER TABLE "RankingEntry" DROP CONSTRAINT "RankingEntry_teamId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_teamId_fkey";

-- DropIndex
DROP INDEX "RankingEntry_teamId_period_periodDate_key";

-- AlterTable
ALTER TABLE "RankingEntry" DROP COLUMN "teamId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "teamId";

-- DropTable
DROP TABLE "Achievement";

-- DropTable
DROP TABLE "Team";

-- CreateTable
CREATE TABLE "AchievementDef" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconKey" TEXT NOT NULL,
    "rarity" "AchievementRarity" NOT NULL DEFAULT 'common',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AchievementDef_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("userId","achievementId")
);

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "AchievementDef"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
