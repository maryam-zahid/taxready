-- CreateEnum
CREATE TYPE "DocumentExtractionStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "ExtractedFieldType" AS ENUM ('TEXT', 'NUMBER', 'MONEY', 'DATE', 'TAX_YEAR');

-- CreateTable
CREATE TABLE "document_extraction" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "status" "DocumentExtractionStatus" NOT NULL DEFAULT 'PENDING',
    "extractorVersion" TEXT,
    "rawText" TEXT,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_extraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extracted_field" (
    "id" TEXT NOT NULL,
    "extractionId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "ExtractedFieldType" NOT NULL,
    "textValue" TEXT,
    "numericValue" DECIMAL(18,2),
    "sourceText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "extracted_field_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "document_extraction_documentId_key" ON "document_extraction"("documentId");

-- CreateIndex
CREATE INDEX "document_extraction_status_idx" ON "document_extraction"("status");

-- CreateIndex
CREATE INDEX "extracted_field_extractionId_idx" ON "extracted_field"("extractionId");

-- CreateIndex
CREATE UNIQUE INDEX "extracted_field_extractionId_key_key" ON "extracted_field"("extractionId", "key");

-- AddForeignKey
ALTER TABLE "document_extraction" ADD CONSTRAINT "document_extraction_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracted_field" ADD CONSTRAINT "extracted_field_extractionId_fkey" FOREIGN KEY ("extractionId") REFERENCES "document_extraction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
