-- CreateEnum
CREATE TYPE "DocumentValidationStatus" AS ENUM ('PENDING', 'PASSED', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "ValidationCheckStatus" AS ENUM ('PASSED', 'FAILED', 'NOT_CHECKED');

-- CreateTable
CREATE TABLE "document_validation" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "status" "DocumentValidationStatus" NOT NULL DEFAULT 'PENDING',
    "fileTypeCheck" "ValidationCheckStatus" NOT NULL DEFAULT 'NOT_CHECKED',
    "fileSizeCheck" "ValidationCheckStatus" NOT NULL DEFAULT 'NOT_CHECKED',
    "requirementCheck" "ValidationCheckStatus" NOT NULL DEFAULT 'NOT_CHECKED',
    "taxYearCheck" "ValidationCheckStatus" NOT NULL DEFAULT 'NOT_CHECKED',
    "expectedTaxYear" INTEGER,
    "detectedTaxYear" INTEGER,
    "summary" TEXT,
    "validatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_validation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "document_validation_documentId_key" ON "document_validation"("documentId");

-- CreateIndex
CREATE INDEX "document_validation_status_idx" ON "document_validation"("status");

-- AddForeignKey
ALTER TABLE "document_validation" ADD CONSTRAINT "document_validation_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
