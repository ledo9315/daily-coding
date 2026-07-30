-- Nullable first, then backfilled, then made NOT NULL: an existing table cannot take a
-- NOT NULL column without a default, and a default would be wrong here (#107).
ALTER TABLE "User" ADD COLUMN "nameKey" TEXT;

-- Same normalisation as `nameKeyOf` in lib/display-name.ts: trimmed, inner whitespace
-- collapsed, lower-cased.
UPDATE "User" SET "nameKey" = lower(regexp_replace(btrim("name"), '\s+', ' ', 'g'));

-- Existing duplicates would break the unique index below. None exist today, but a
-- migration has to be replayable on any copy of the data, so they get a counter — the
-- same shape `uniqueDisplayName` produces.
WITH dupes AS (
  SELECT "id", "nameKey",
         row_number() OVER (PARTITION BY "nameKey" ORDER BY "createdAt", "id") AS rn
  FROM "User"
)
UPDATE "User" u
SET "nameKey" = d."nameKey" || ' ' || d.rn,
    "name" = u."name" || ' ' || d.rn
FROM dupes d
WHERE u."id" = d."id" AND d.rn > 1;

ALTER TABLE "User" ALTER COLUMN "nameKey" SET NOT NULL;
CREATE UNIQUE INDEX "User_nameKey_key" ON "User"("nameKey");
