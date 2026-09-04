-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('de', 'en');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "locale" "Locale" NOT NULL DEFAULT 'de';
