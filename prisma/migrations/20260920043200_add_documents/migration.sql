-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('UPLOADED', 'NEEDS_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DocumentSource" AS ENUM ('CLIENT_PORTAL', 'ADMIN');

-- CreateTable
CREATE TABLE "document" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientRequestId" TEXT,
    "clientRequirementId" TEXT,
    "fileName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "sha256Hash" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'UPLOADED',
    "source" "DocumentSource" NOT NULL DEFAULT 'CLIENT_PORTAL',
    "uploadedByUserId" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "document_storageKey_key" ON "document"("storageKey");

-- CreateIndex
CREATE INDEX "document_organizationId_idx" ON "document"("organizationId");

-- CreateIndex
CREATE INDEX "document_clientId_idx" ON "document"("clientId");

-- CreateIndex
CREATE INDEX "document_clientRequestId_idx" ON "document"("clientRequestId");

-- CreateIndex
CREATE INDEX "document_clientRequirementId_idx" ON "document"("clientRequirementId");

-- CreateIndex
CREATE INDEX "document_clientId_status_idx" ON "document"("clientId", "status");

-- CreateIndex
CREATE INDEX "document_clientId_sha256Hash_idx" ON "document"("clientId", "sha256Hash");

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_clientRequestId_fkey" FOREIGN KEY ("clientRequestId") REFERENCES "client_request"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_clientRequirementId_fkey" FOREIGN KEY ("clientRequirementId") REFERENCES "client_requirement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
