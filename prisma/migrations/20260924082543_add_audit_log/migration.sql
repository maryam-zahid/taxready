-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CLIENT_CREATED', 'REQUEST_SENT', 'INFORMATION_SUBMITTED', 'DOCUMENT_SUBMITTED', 'DOCUMENT_APPROVED', 'DOCUMENT_REJECTED', 'DOCUMENT_NEEDS_REVIEW', 'EXCEPTION_RESOLVED', 'CLIENT_MARKED_TAX_READY');

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "clientId" TEXT,
    "userId" TEXT,
    "action" "AuditAction" NOT NULL,
    "description" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_log_organizationId_idx" ON "audit_log"("organizationId");

-- CreateIndex
CREATE INDEX "audit_log_clientId_idx" ON "audit_log"("clientId");

-- CreateIndex
CREATE INDEX "audit_log_userId_idx" ON "audit_log"("userId");

-- CreateIndex
CREATE INDEX "audit_log_createdAt_idx" ON "audit_log"("createdAt");
