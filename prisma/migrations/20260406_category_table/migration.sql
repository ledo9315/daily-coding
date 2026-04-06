-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- Insert known categories
INSERT INTO "Category" ("id", "name") VALUES
  ('cat-algorithmen',     'Algorithmen'),
  ('cat-baeume',          'Bäume'),
  ('cat-datenstrukturen', 'Datenstrukturen'),
  ('cat-strings',         'Strings');

-- AddColumn categoryId (nullable first)
ALTER TABLE "Challenge" ADD COLUMN "categoryId" TEXT;

-- Backfill: extract category name before " •"
UPDATE "Challenge"
SET "categoryId" = (
    SELECT "id" FROM "Category"
    WHERE "Category"."name" = SPLIT_PART("Challenge"."category", ' •', 1)
);

-- Make categoryId NOT NULL
ALTER TABLE "Challenge" ALTER COLUMN "categoryId" SET NOT NULL;

-- Drop old category column
ALTER TABLE "Challenge" DROP COLUMN "category";

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
