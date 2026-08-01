-- The daily becomes an explicit, reorderable ring.

ALTER TABLE "Challenge" ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0;

-- Backfill from the order the admin table showed until now: scheduled dates first, ascending,
-- undated last, id as the tie-break. Without this every row would sit at position 0 and the ring
-- order would be pure id order, which has nothing to do with what was planned.
WITH ranked AS (
  SELECT "id", (ROW_NUMBER() OVER (ORDER BY "date" ASC NULLS LAST, "id" ASC) - 1) AS rn
  FROM "Challenge"
)
UPDATE "Challenge" c SET "position" = ranked.rn FROM ranked WHERE c."id" = ranked."id";

CREATE TABLE "RotationState" (
  "id" TEXT NOT NULL DEFAULT 'current',
  "challengeId" TEXT,
  "position" INTEGER NOT NULL DEFAULT 0,
  "day" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RotationState_pkey" PRIMARY KEY ("id")
);

-- Start the ring on the challenge that is live today, so the switch is invisible to users: a
-- date on today wins, otherwise the lowest position among the active ones.
INSERT INTO "RotationState" ("id", "challengeId", "position", "day", "updatedAt")
SELECT
  'current',
  c."id",
  c."position",
  date_trunc('day', NOW() AT TIME ZONE 'UTC'),
  NOW()
FROM "Challenge" c
WHERE c."isActive" = true
-- `IS TRUE`, not a bare comparison: for an undated row the condition is NULL, and NULL sorts
-- first under DESC, so the ring would have started on a challenge nobody scheduled.
ORDER BY (c."date" >= date_trunc('day', NOW() AT TIME ZONE 'UTC')
      AND c."date" <  date_trunc('day', NOW() AT TIME ZONE 'UTC') + INTERVAL '1 day') IS TRUE DESC,
         c."position" ASC
LIMIT 1;

-- No active challenge at all: the ring still needs its row, it fills in on the first advance.
INSERT INTO "RotationState" ("id", "position", "day", "updatedAt")
SELECT 'current', 0, date_trunc('day', NOW() AT TIME ZONE 'UTC'), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "RotationState");
