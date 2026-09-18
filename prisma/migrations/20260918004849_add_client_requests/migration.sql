-- CreateEnum
CREATE TYPE "ClientRequestStatus" AS ENUM ('DRAFT', 'SENT', 'VIEWED', 'SUBMITTED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "client_request" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientRequirementId" TEXT NOT NULL,
    "status" "ClientRequestStatus" NOT NULL DEFAULT 'DRAFT',
    "subject" TEXT NOT NULL,
    "message" TEXT,
    "dueAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "viewedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "client_request_clientId_idx" ON "client_request"("clientId");

-- CreateIndex
CREATE INDEX "client_request_clientId_status_idx" ON "client_request"("clientId", "status");

-- CreateIndex
CREATE INDEX "client_request_clientRequirementId_idx" ON "client_request"("clientRequirementId");

-- CreateIndex
CREATE INDEX "client_request_dueAt_idx" ON "client_request"("dueAt");

-- AddForeignKey
ALTER TABLE "client_request" ADD CONSTRAINT "client_request_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_request" ADD CONSTRAINT "client_request_clientRequirementId_fkey" FOREIGN KEY ("clientRequirementId") REFERENCES "client_requirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
