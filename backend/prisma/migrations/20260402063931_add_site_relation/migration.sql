/*
  Warnings:

  - Added the required column `heritageSiteId` to the `DamageReport` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DamageReport" ADD COLUMN     "heritageSiteId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "DamageReport" ADD CONSTRAINT "DamageReport_heritageSiteId_fkey" FOREIGN KEY ("heritageSiteId") REFERENCES "HeritageSite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
