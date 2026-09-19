-- CreateEnum
CREATE TYPE "ClientResponseStatus" AS ENUM ('DRAFT', 'SUBMITTED');

-- CreateTable
CREATE TABLE "client_response" (
    "id" TEXT NOT NULL,
    "clientRequestId" TEXT NOT NULL,
    "status" "ClientResponseStatus" NOT NULL DEFAULT 'DRAFT',
    "informationText" TEXT,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_response_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "client_response_clientRequestId_idx" ON "client_response"("clientRequestId");

-- CreateIndex
CREATE INDEX "client_response_clientRequestId_status_idx" ON "client_response"("clientRequestId", "status");

-- AddForeignKey
ALTER TABLE "client_response" ADD CONSTRAINT "client_response_clientRequestId_fkey" FOREIGN KEY ("clientRequestId") REFERENCES "client_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;
