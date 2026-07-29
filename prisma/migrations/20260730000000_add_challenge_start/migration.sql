-- CreateTable
CREATE TABLE "ChallengeStart" (
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChallengeStart_pkey" PRIMARY KEY ("userId","challengeId")
);

-- AddForeignKey
ALTER TABLE "ChallengeStart" ADD CONSTRAINT "ChallengeStart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeStart" ADD CONSTRAINT "ChallengeStart_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
