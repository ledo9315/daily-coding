-- Staged hints replace the single `hint` column: one string cannot hold "the idea",
-- "the shape in code" and "where people trip up" as separately unfoldable steps.
ALTER TABLE "Challenge" ADD COLUMN "hints" JSONB NOT NULL DEFAULT '[]';

-- Carry every existing hint over as the first stage. Dropping the column without this
-- would silently strip the help from all 15 challenges.
UPDATE "Challenge"
SET "hints" = jsonb_build_array(jsonb_build_object('title', 'Ansatz', 'body', "hint"))
WHERE "hint" IS NOT NULL AND btrim("hint") <> '';

ALTER TABLE "Challenge" DROP COLUMN "hint";
