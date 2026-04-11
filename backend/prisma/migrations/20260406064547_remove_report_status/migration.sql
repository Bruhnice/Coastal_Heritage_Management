/*
  Warnings:

  - You are about to drop the column `status` on the `DamageReport` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DamageReport" DROP COLUMN "status";

-- DropEnum
DROP TYPE "ReportStatus";
