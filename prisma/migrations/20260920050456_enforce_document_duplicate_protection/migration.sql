/*
  Warnings:

  - A unique constraint covering the columns `[clientId,sha256Hash]` on the table `document` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "document_clientId_sha256Hash_idx";

-- CreateIndex
CREATE UNIQUE INDEX "document_clientId_sha256Hash_key" ON "document"("clientId", "sha256Hash");
