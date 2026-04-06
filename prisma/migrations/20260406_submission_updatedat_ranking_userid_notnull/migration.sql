-- Add updatedAt to Submission
ALTER TABLE "Submission" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Make RankingEntry.userId NOT NULL (no entries without user exist)
ALTER TABLE "RankingEntry" ALTER COLUMN "userId" SET NOT NULL;
