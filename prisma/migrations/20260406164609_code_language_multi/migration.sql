-- CreateEnum
CREATE TYPE "CodeLanguage" AS ENUM ('javascript', 'typescript', 'python');

-- DropForeignKey
ALTER TABLE "RankingEntry" DROP CONSTRAINT "RankingEntry_userId_fkey";

-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "starterCodes" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "supportedLanguages" "CodeLanguage"[] DEFAULT ARRAY['javascript', 'typescript', 'python']::"CodeLanguage"[];

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "language" "CodeLanguage" NOT NULL DEFAULT 'javascript',
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "RankingEntry" ADD CONSTRAINT "RankingEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
