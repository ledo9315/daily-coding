-- AlterTable
ALTER TABLE "User" DROP COLUMN "department",
DROP COLUMN "joinDate",
DROP COLUMN "role",
DROP COLUMN "status";

-- DropEnum
DROP TYPE "UserStatus";
