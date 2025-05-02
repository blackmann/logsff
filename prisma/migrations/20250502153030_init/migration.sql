-- CreateEnum
CREATE TYPE "AppLogLevel" AS ENUM ('info', 'warn', 'error');

-- CreateTable
CREATE TABLE "App" (
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "RequestLog" (
    "id" SERIAL NOT NULL,
    "appId" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "sessionId" TEXT,
    "meta" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppLog" (
    "id" SERIAL NOT NULL,
    "appId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "level" "AppLogLevel" NOT NULL,
    "duration" INTEGER,
    "sessionId" TEXT,
    "meta" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "App_slug_key" ON "App"("slug");

-- AddForeignKey
ALTER TABLE "RequestLog" ADD CONSTRAINT "RequestLog_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppLog" ADD CONSTRAINT "AppLog_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;
