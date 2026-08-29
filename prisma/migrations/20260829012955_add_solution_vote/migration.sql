-- CreateEnum
CREATE TYPE "SolutionVoteKind" AS ENUM ('best_practices', 'clever');

-- CreateTable
CREATE TABLE "SolutionVote" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "SolutionVoteKind" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SolutionVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SolutionVote_challengeId_codeHash_idx" ON "SolutionVote"("challengeId", "codeHash");

-- CreateIndex
CREATE UNIQUE INDEX "SolutionVote_challengeId_codeHash_userId_kind_key" ON "SolutionVote"("challengeId", "codeHash", "userId", "kind");

-- AddForeignKey
ALTER TABLE "SolutionVote" ADD CONSTRAINT "SolutionVote_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolutionVote" ADD CONSTRAINT "SolutionVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
