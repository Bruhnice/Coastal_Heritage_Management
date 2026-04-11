-- DropForeignKey
ALTER TABLE "DamageReport" DROP CONSTRAINT "DamageReport_heritageSiteId_fkey";

-- AddForeignKey
ALTER TABLE "DamageReport" ADD CONSTRAINT "DamageReport_heritageSiteId_fkey" FOREIGN KEY ("heritageSiteId") REFERENCES "HeritageSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;
