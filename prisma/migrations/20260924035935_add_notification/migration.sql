-- CreateEnum
CREATE TYPE "NotificationAudience" AS ENUM ('ADMIN', 'CLIENT');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'ACTION_REQUIRED', 'WARNING', 'SUCCESS');

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "clientId" TEXT,
    "userId" TEXT,
    "audience" "NotificationAudience" NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'INFO',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "href" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_organizationId_audience_idx" ON "notification"("organizationId", "audience");

-- CreateIndex
CREATE INDEX "notification_clientId_audience_idx" ON "notification"("clientId", "audience");

-- CreateIndex
CREATE INDEX "notification_userId_idx" ON "notification"("userId");

-- CreateIndex
CREATE INDEX "notification_readAt_idx" ON "notification"("readAt");

-- CreateIndex
CREATE INDEX "notification_createdAt_idx" ON "notification"("createdAt");
