/*
  Warnings:

  - You are about to drop the column `endDateTime` on the `schedules` table. All the data in the column will be lost.
  - You are about to drop the column `startDateTime` on the `schedules` table. All the data in the column will be lost.
  - Added the required column `endDate` to the `schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `schedules` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "schedules" DROP COLUMN "endDateTime",
DROP COLUMN "startDateTime",
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;
