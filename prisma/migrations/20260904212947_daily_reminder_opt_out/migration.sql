-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dailyReminderSentAt" TIMESTAMP(3),
ADD COLUMN     "notifyDailyReminder" BOOLEAN NOT NULL DEFAULT true;
