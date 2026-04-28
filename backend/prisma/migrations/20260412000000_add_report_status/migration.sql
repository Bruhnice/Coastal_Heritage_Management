-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "DamageReport" ADD COLUMN "status" "ReportStatus" NOT NULL DEFAULT 'PENDING';
