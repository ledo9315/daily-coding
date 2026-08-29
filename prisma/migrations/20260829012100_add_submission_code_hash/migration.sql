-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "codeHash" TEXT;

-- CreateIndex
CREATE INDEX "Submission_challengeId_codeHash_idx" ON "Submission"("challengeId", "codeHash");
