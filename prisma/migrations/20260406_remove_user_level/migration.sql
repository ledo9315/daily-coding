-- AlterTable: remove level field from User (now calculated from points)
ALTER TABLE "User" DROP COLUMN "level";
