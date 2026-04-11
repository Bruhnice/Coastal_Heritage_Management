/*
  Warnings:

  - You are about to drop the column `description` on the `DamageReport` table. All the data in the column will be lost.
  - You are about to drop the column `disasterId` on the `DamageReport` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `DamageReport` table. All the data in the column will be lost.
  - Added the required column `category` to the `DamageReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `details` to the `DamageReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `DamageReport` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ReportCategory" AS ENUM ('FLOOD', 'TYPHOON', 'EARTHQUAKE', 'STORM_SURGE', 'LANDSLIDE', 'FIRE', 'OTHER');

-- DropForeignKey
ALTER TABLE "DamageReport" DROP CONSTRAINT "DamageReport_disasterId_fkey";

-- AlterTable
ALTER TABLE "DamageReport" DROP COLUMN "description",
DROP COLUMN "disasterId",
DROP COLUMN "status",
ADD COLUMN     "category" "ReportCategory" NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "details" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "DamageReport_heritageSiteId_idx" ON "DamageReport"("heritageSiteId");

-- CreateIndex
CREATE INDEX "DamageReport_category_idx" ON "DamageReport"("category");
