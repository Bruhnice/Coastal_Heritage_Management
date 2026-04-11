-- DropForeignKey
ALTER TABLE "SiteSuggestion" DROP CONSTRAINT "SiteSuggestion_siteId_fkey";

-- AddForeignKey
ALTER TABLE "SiteSuggestion" ADD CONSTRAINT "SiteSuggestion_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "HeritageSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;
