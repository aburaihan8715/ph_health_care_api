/*
Warnings:
- You are about to drop the `doctor_specialities` table. If the table is not empty, all the data it contains will be lost.
- You are about to drop the `specialities` table. If the table is not empty, all the data it contains will be lost.
*/
-- DropForeignKey
ALTER TABLE "doctor_specialities"
DROP CONSTRAINT "doctor_specialities_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "doctor_specialities"
DROP CONSTRAINT "doctor_specialities_specialitiesId_fkey";

-- DropTable
DROP TABLE "doctor_specialities";

-- DropTable
DROP TABLE "specialities";

-- CreateTable
CREATE TABLE "specialities" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "icon" TEXT NOT NULL,


CONSTRAINT "specialities_pkey" PRIMARY KEY ("id") );

-- CreateTable
CREATE TABLE "doctor_specialities" (
    "specialitiesId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,


    CONSTRAINT "doctor_specialities_pkey" PRIMARY KEY ("specialitiesId","doctorId")
);

-- AddForeignKey
ALTER TABLE "doctor_specialities"
ADD CONSTRAINT "doctor_specialities_specialitiesId_fkey" FOREIGN KEY ("specialitiesId") REFERENCES "specialities" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_specialities"
ADD CONSTRAINT "doctor_specialities_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;