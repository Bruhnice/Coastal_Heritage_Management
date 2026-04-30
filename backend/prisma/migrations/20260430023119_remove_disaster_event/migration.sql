/*
  Warnings:

  - You are about to drop the `DisasterEvent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DisasterEvent" DROP CONSTRAINT "DisasterEvent_locationId_fkey";

-- DropTable
DROP TABLE "DisasterEvent";
