-- DropForeignKey
ALTER TABLE "AppLog" DROP CONSTRAINT "AppLog_appId_fkey";

-- DropForeignKey
ALTER TABLE "RequestLog" DROP CONSTRAINT "RequestLog_appId_fkey";

-- AddForeignKey
ALTER TABLE "RequestLog" ADD CONSTRAINT "RequestLog_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppLog" ADD CONSTRAINT "AppLog_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("slug") ON DELETE CASCADE ON UPDATE CASCADE;
