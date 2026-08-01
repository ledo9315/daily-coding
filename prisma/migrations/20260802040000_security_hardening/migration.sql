-- Canonical email lookups are lower-case and trimmed in application code.
UPDATE "User" SET "email" = lower(btrim("email"));

-- Preserve legacy timestamps. New writes use UTC midnight, making the compound key a daily lock.
ALTER TABLE "Submission" ADD COLUMN "submissionDay" TIMESTAMP(3);
UPDATE "Submission" SET "submissionDay" = "createdAt";
ALTER TABLE "Submission" ALTER COLUMN "submissionDay" SET NOT NULL;
CREATE UNIQUE INDEX "Submission_userId_submissionDay_key"
  ON "Submission"("userId", "submissionDay");

CREATE TABLE "RateLimitBucket" (
  "key" TEXT NOT NULL,
  "count" INTEGER NOT NULL,
  "resetAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("key")
);
