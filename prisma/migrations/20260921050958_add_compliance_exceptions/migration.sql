-- CreateEnum
CREATE TYPE "ExceptionStatus" AS ENUM ('OPEN', 'WAITING_CLIENT', 'UNDER_REVIEW', 'RESOLVED', 'WAIVED');

-- CreateEnum
CREATE TYPE "ExceptionSeverity" AS ENUM ('INFO', 'WARNING', 'BLOCKING');

-- CreateEnum
CREATE TYPE "ExceptionSource" AS ENUM ('DOCUMENT_REVIEW', 'VALIDATION', 'RECONCILIATION', 'MANUAL');

-- CreateTable
CREATE TABLE "compliance_exception" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientRequirementId" TEXT,
    "documentId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ExceptionStatus" NOT NULL DEFAULT 'OPEN',
    "severity" "ExceptionSeverity" NOT NULL DEFAULT 'WARNING',
    "source" "ExceptionSource" NOT NULL,
    "resolutionNote" TEXT,
    "createdByUserId" TEXT,
    "resolvedByUserId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_exception_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "compliance_exception_organizationId_idx" ON "compliance_exception"("organizationId");

-- CreateIndex
CREATE INDEX "compliance_exception_clientId_idx" ON "compliance_exception"("clientId");

-- CreateIndex
CREATE INDEX "compliance_exception_clientRequirementId_idx" ON "compliance_exception"("clientRequirementId");

-- CreateIndex
CREATE INDEX "compliance_exception_documentId_idx" ON "compliance_exception"("documentId");

-- CreateIndex
CREATE INDEX "compliance_exception_organizationId_status_idx" ON "compliance_exception"("organizationId", "status");

-- CreateIndex
CREATE INDEX "compliance_exception_clientId_status_idx" ON "compliance_exception"("clientId", "status");

-- AddForeignKey
ALTER TABLE "compliance_exception" ADD CONSTRAINT "compliance_exception_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_exception" ADD CONSTRAINT "compliance_exception_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_exception" ADD CONSTRAINT "compliance_exception_clientRequirementId_fkey" FOREIGN KEY ("clientRequirementId") REFERENCES "client_requirement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_exception" ADD CONSTRAINT "compliance_exception_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "document"("id") ON DELETE SET NULL ON UPDATE CASCADE;
