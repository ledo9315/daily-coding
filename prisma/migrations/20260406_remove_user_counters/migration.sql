-- AlterTable: remove denormalized counter fields from User
ALTER TABLE "User"
  DROP COLUMN "points",
  DROP COLUMN "totalSolved",
  DROP COLUMN "badges";
